import { User } from '@/config/client';
import { userRepository } from '@/repositories/userRepository';
import { enokiService } from '@/services/enokiService';
import { sign } from 'jsonwebtoken';

import { logger } from '../utils/logger';

class UserService {
    private logger;

    constructor() {
        this.logger = logger.child({
            module: '[SUI][UserService]',
        });
    }

    /**
     * Met à jour le mot de passe d'un utilisateur
     * @param userId - L'id de l'utilisateur
     * @param hashedPassword - Le mot de passe hashé
     * @returns L'utilisateur mis à jour
     */
    async updatePassword(userId: string, hashedPassword: string): Promise<any> {
        const user = await userRepository.findById(userId);

        if (!user) {
            this.logger.error('Utilisateur non trouvé');
            throw new Error('Utilisateur non trouvé');
        }

        return userRepository.update(userId, { password: hashedPassword });
    }

    /**
     * Désérialise les rôles d'un utilisateur
     * @param user - L'utilisateur à désérialiser
     * @returns L'utilisateur désérialisé
     */
    deserializeRoles(user: User): User {
        if (user && user.roles) {
            if (typeof user.roles === 'string') {
                try {
                    user.roles = JSON.parse(user.roles);
                } catch (error) {
                    console.error('Error parsing roles:', error);
                    user.roles = [];
                }
            }
        } else if (user) {
            user.roles = [];
        }
        return user;
    }

    /**
     * Désérialise seulement les rôles d'un array JSON
     * @param rolesJson - Les rôles à désérialiser
     * @returns Les rôles désérialisés
     */
    parseRoles(rolesJson: string): string[] {
        if (!rolesJson) return [];
        if (Array.isArray(rolesJson)) return rolesJson;
        if (typeof rolesJson === 'string') {
            try {
                const parsed = JSON.parse(rolesJson);
                return Array.isArray(parsed) ? parsed : [];
            } catch (error) {
                console.error('Error parsing roles:', error);
                return [];
            }
        }
        return [];
    }

    /**
     * Authenticate user with Enoki JWT token
     * @param token - The JWT token from Enoki authentication
     * @returns Authentication response with user data and tokens
     */
    async authenticateWithEnoki(token: string): Promise<{
        user: User;
        accessToken: string;
        refreshToken: string;
    }> {
        try {
            this.logger.info('Authenticating user with Enoki JWT token');

            // Extract and verify user information from Enoki token
            const enokiUserData = await enokiService.verifyEnokiToken(token);

            // Transform Enoki user data to our format
            const transformedUserData = enokiService.transformEnokiUserData(enokiUserData);

            this.logger.info('Enoki user data extracted', {
                email: transformedUserData.email,
                googleId: transformedUserData.googleId
            });

            // Check if user exists or create new user
            let user = await userRepository.findByGoogleId(transformedUserData.googleId);

            if (user) {
                // Update existing user with latest information
                user = await userRepository.updateGoogleUser(user.id, {
                    email: transformedUserData.email,
                    firstName: transformedUserData.firstName,
                    lastName: transformedUserData.lastName,
                    avatar: transformedUserData.avatar,
                });
                this.logger.info('Existing user updated from Enoki data', { userId: user.id });
            } else {
                // Create new user from Enoki data
                user = await userRepository.createGoogleUser({
                    googleId: transformedUserData.googleId,
                    email: transformedUserData.email,
                    firstName: transformedUserData.firstName,
                    lastName: transformedUserData.lastName,
                    avatar: transformedUserData.avatar,
                });
                this.logger.info('New user created from Enoki data', { userId: user.id });
            }

            // Generate our own JWT tokens for the user
            const accessToken = sign(
                {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    roles: JSON.parse(user.roles as string),
                    googleId: user.googleId,
                    avatar: user.avatar,
                    provider: user.provider,
                    isVerified: user.isVerified,
                },
                process.env.JWT_SECRET as string,
                { expiresIn: '1h' }
            );

            const refreshToken = sign(
                { id: user.id },
                process.env.JWT_SECRET as string,
                { expiresIn: '30d' }
            );

            this.logger.info('User authenticated successfully with Enoki', { userId: user.id });

            return {
                user,
                accessToken,
                refreshToken,
            };
        } catch (error) {
            this.logger.error('Error authenticating user with Enoki:', error);
            throw error;
        }
    }

    /**
     * Find user by Google ID
     * @param googleId - Google ID
     * @returns User or null
     */
    async findUserByGoogleId(googleId: string): Promise<User | null> {
        try {
            return await userRepository.findByGoogleId(googleId);
        } catch (error) {
            this.logger.error('Error finding user by Google ID:', error);
            return null;
        }
    }

    /**
     * Get user by ID
     * @param userId - User ID
     * @returns User or null
     */
    async getUserById(userId: string): Promise<User | null> {
        try {
            return await userRepository.findById(userId);
        } catch (error) {
            this.logger.error('Error getting user by ID:', error);
            return null;
        }
    }

}

export const userService = new UserService();
