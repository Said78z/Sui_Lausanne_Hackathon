import { authRepository } from '@/repositories/authRepository';
import { tokenRepository } from '@/repositories/tokenRepository';
import { jsonResponse } from '@/utils/jsonResponse';
import { getLocationFromIp } from '@/utils/locationFromIp';
import { logger } from '@/utils/logger';
import { parseUserAgent } from '@/utils/userAgentParser';

import { FastifyReply, FastifyRequest } from 'fastify';
import { sign, verify } from 'jsonwebtoken';

import { Token, User } from '@/config/client';

interface GoogleProfile {
    id: string;
    emails: Array<{ value: string; verified: boolean }>;
    name: { givenName: string; familyName: string };
    photos: Array<{ value: string }>;
}

class AuthService {
    private logger = logger.child({
        module: '[App][AuthService]',
    });

    constructor() { }

    /**
     * Génère un token d'accès pour un utilisateur
     * @param user - L'utilisateur à générer le token
     * @param type - Le type de token à générer
     * @param request - La requête Fastify
     * @returns Le token d'accès généré
     */
    async generateToken(
        user: User,
        type: 'access' | 'refresh',
        request: FastifyRequest
    ): Promise<Token | null> {
        const rawUserAgent = request.headers['user-agent'] || '';
        const parsedUserAgent = parseUserAgent(rawUserAgent);
        const location = await getLocationFromIp(request.ip);

        const expiresIn = type === 'access' ? '24h' : '7d';
        const tokenPayload = sign(user, process.env.JWT_SECRET as string, {
            expiresIn,
        });

        if (!user.id) {
            return null;
        }

        const token = await tokenRepository.create({
            deviceName:
                parsedUserAgent.device.model || parsedUserAgent.browser.name || 'Unknown device',
            deviceIp: location?.ip || '',
            userAgent: rawUserAgent,
            browserName: parsedUserAgent.browser.name,
            browserVersion: parsedUserAgent.browser.version,
            osName: parsedUserAgent.os.name,
            osVersion: parsedUserAgent.os.version,
            deviceType: parsedUserAgent.device.type,
            deviceVendor: parsedUserAgent.device.vendor,
            deviceModel: parsedUserAgent.device.model,
            locationCity: location?.city,
            locationCountry: location?.country,
            locationLat: location?.latitude,
            locationLon: location?.longitude,
            token: tokenPayload,
            type: type === 'access' ? 'access_token' : 'refresh_token',
            scopes: JSON.stringify(['read', 'write']),
            owner: {
                connect: {
                    id: user.id,
                },
            },
            expiresAt:
                type === 'access'
                    ? new Date(Date.now() + 24 * 60 * 60 * 1000)
                    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return token;
    }

    /**
     * Génère un token pour un utilisateur
     * @param user - L'utilisateur à générer le token
     * @param request - La requête Fastify
     * @returns Le token généré
     */
    async generateTokens(
        user: User,
        request: FastifyRequest
    ): Promise<{ accessToken: Token; refreshToken: Token } | null> {
        if (!user.id) return null;

        const accessToken = await this.generateToken(user, 'access', request);
        const refreshToken = await this.generateToken(user, 'refresh', request);

        return {
            accessToken: accessToken as Token,
            refreshToken: refreshToken as Token,
        };
    }

    /**
     *
     * Vérifie si un utilisateur est connecté avec un nouveau device
     *
     * @param user - L'utilisateur à vérifier
     * @param request - La requête Fastify
     * @returns true si l'utilisateur est connecté avec un nouveau device, false sinon
     */
    async isNewDevice(user: User, request: FastifyRequest): Promise<boolean> {
        const ip = request.ip;
        const userAgent = request.headers['user-agent'] || '';

        // Récupérer tous les tokens de l'utilisateur
        const tokens = await tokenRepository.findAllByUserId(user.id);

        // Si l'utilisateur n'a pas de tokens, c'est forcément un nouvel appareil
        if (tokens.length === 0) {
            return true;
        }

        // Vérifier si l'utilisateur a déjà un token avec cette IP et ce user-agent
        const existingDevice = tokens.some(
            (token) => token.deviceIp === ip && token.userAgent === userAgent
        );

        // Si aucun token ne correspond à l'appareil actuel, c'est un nouvel appareil
        return !existingDevice;
    }

    /**
     * Verify a token
     * @param request - The Fastify request
     * @param reply - The Fastify reply
     * @returns The decoded token or null if the token is invalid
     */
    async verifyToken(request: FastifyRequest, reply: FastifyReply): Promise<User | null> {
        try {
            const authorization = request.headers.authorization;
            const token = authorization?.split(' ')[1];
            if (!token) {
                jsonResponse(reply, 'Invalid token', {}, 401);
                return null;
            }
            const decoded = verify(token, process.env.JWT_SECRET as string) as User;
            return decoded;
        } catch (error) {
            jsonResponse(reply, 'Invalid token', {}, 401);
            return null;
        }
    }

    /**
     * Trouve un token par son token
     * @param token - Le token à trouver
     * @returns Le token trouvé ou null si aucun token n'est trouvé
     */
    async findByToken(token: string): Promise<Token | null> {
        return tokenRepository.findByToken(token);
    }

    /**
     * Supprime un token par son id
     * @param id - L'id du token à supprimer
     * @returns Le token supprimé ou null si aucun token n'est trouvé
     */
    async deleteToken(id: string): Promise<Token | null> {
        return tokenRepository.delete(id);
    }



    /**
     * Authenticate user with Google OAuth
     * @param profile - Google profile data
     * @returns User (existing or newly created)
     */
    async authenticateGoogleUser(profile: GoogleProfile): Promise<User> {
        try {
            this.logger.info('Authenticating Google user', { googleId: profile.id });
            console.log('🔍 AuthenticateGoogleUser called with profile:', profile);

            const email = profile.emails[0]?.value;
            if (!email) {
                console.error('❌ No email found in Google profile');
                throw new Error('No email found in Google profile');
            }
            console.log('✅ Email extracted:', email);

            // Check if user exists by Google ID
            console.log('🔍 Looking for existing user with Google ID:', profile.id);
            let user = await authRepository.findByGoogleId(profile.id);
            console.log('🔍 Existing user found:', user ? 'YES' : 'NO');

            if (user) {
                // Update user info in case it changed
                user = await authRepository.updateGoogleUser(user.id, {
                    email,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    avatar: profile.photos[0]?.value,
                });

                this.logger.info('Existing Google user authenticated', { userId: user.id });
                return user;
            }


            // Create new user with Google OAuth
            console.log('🔍 Creating new Google user with data:', {
                googleId: profile.id,
                email,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                avatar: profile.photos[0]?.value,
            });

            user = await authRepository.createGoogleUser({
                googleId: profile.id,
                email,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                avatar: profile.photos[0]?.value,
            });

            console.log('✅ New Google user created:', user);
            this.logger.info('New Google user created', { userId: user.id });
            return user;
        } catch (error) {
            this.logger.error('Error authenticating Google user:', error);
            throw error;
        }
    }



    /**
     * Get user by ID
     * @param userId - User ID
     * @returns User or null
     */
    async getUserById(userId: string): Promise<User | null> {
        try {
            return await authRepository.findById(userId);
        } catch (error) {
            this.logger.error('Error getting user by ID:', error);
            return null;
        }
    }

    /**
     * Process Google JWT token and extract user information
     * @param jwtToken - Google JWT token from OAuth
     * @returns Extracted user information
     */
    async processGoogleJWT(jwtToken: string): Promise<GoogleProfile | null> {
        try {
            this.logger.info('Processing Google JWT token');

            // Decode the JWT token (it's base64 encoded)
            const parts = jwtToken.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid JWT format');
            }

            // Decode the payload (second part of JWT)
            const payload = parts[1];
            const paddedPayload = payload + '='.repeat((4 - (payload.length % 4)) % 4);
            const decodedPayload = Buffer.from(
                paddedPayload.replace(/-/g, '+').replace(/_/g, '/'),
                'base64'
            ).toString('utf-8');
            const jwtData = JSON.parse(decodedPayload);

            this.logger.info('Successfully decoded Google JWT', {
                sub: jwtData.sub,
                email: jwtData.email,
                name: jwtData.name,
            });

            // Convert to GoogleProfile format
            const profile: GoogleProfile = {
                id: jwtData.sub,
                emails: [{ value: jwtData.email, verified: jwtData.email_verified || false }],
                name: {
                    givenName: jwtData.given_name || jwtData.name?.split(' ')[0] || '',
                    familyName: jwtData.family_name || jwtData.name?.split(' ').slice(1).join(' ') || '',
                },
                photos: jwtData.picture ? [{ value: jwtData.picture }] : [],
            };

            return profile;
        } catch (error) {
            this.logger.error('Error processing Google JWT:', error);
            console.error('❌ JWT Processing Error:', error.message);
            return null;
        }
    }

    /**
     * Authenticate user with Google JWT token
     * @param jwtToken - Google JWT token
     * @param walletAddress - Optional wallet address from Enoki
     * @returns User and authentication tokens
     */
    async authenticateWithGoogleJWT(
        jwtToken: string,
        walletAddress?: string
    ): Promise<{ user: User; accessToken: string; refreshToken: string } | null> {
        try {
            this.logger.info('Authenticating with Google JWT', { hasWallet: !!walletAddress });
            console.log('🔍 JWT Token received:', jwtToken.substring(0, 50) + '...');

            // Process the JWT token
            const profile = await this.processGoogleJWT(jwtToken);
            console.log('🔍 Processed profile:', profile);
            if (!profile) {
                console.error('❌ Failed to process Google JWT token');
                throw new Error('Failed to process Google JWT token');
            }

            // Authenticate or create user
            console.log('🔍 About to authenticate Google user with profile:', profile);
            let user = await this.authenticateGoogleUser(profile);
            console.log('✅ User authenticated/created:', user);

            // If wallet address is provided, update user with wallet info
            if (walletAddress && user.id) {
                console.log('🔍 Updating user with wallet address:', walletAddress);
                user = await authRepository.updateUser(user.id, {
                    suiAddress: walletAddress,
                });
                console.log('✅ User updated with wallet address:', user);
                this.logger.info('Updated user with wallet address', { userId: user.id, walletAddress });
            }

            this.logger.info('Google JWT authentication successful', { userId: user.id });
            return {
                user,
                accessToken: '', // Will be generated by controller
                refreshToken: '', // Will be generated by controller
            };
        } catch (error) {
            this.logger.error('Error authenticating with Google JWT:', error);
            return null;
        }
    }

    // Note: Enoki user methods have been moved to userService
    // Use userService.authenticateWithEnoki, userService.findUserByGoogleId, etc.

}

export const authService = new AuthService();
