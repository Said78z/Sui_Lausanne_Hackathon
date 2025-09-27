import { authService } from '@/services';
import { asyncHandler } from '@/utils/asyncHandler';
import { jsonResponse } from '@/utils/jsonResponse';
import { logger } from '@/utils/logger';
import { UserDto } from '@shared/dto';


class AuthController {
    private logger = logger.child({
        module: '[CFR][AUTH][CONTROLLER]',
    });

    constructor() { }


    /**
     * Initiate Google OAuth authentication
     */
    public googleAuth = asyncHandler<unknown, unknown, unknown, unknown>({
        logger: this.logger,
        handler: async (request, reply) => {
            try {
                const clientId = process.env.GOOGLE_CLIENT_ID;
                const redirectUri = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';

                if (!clientId) {
                    return jsonResponse(reply, 'Google OAuth not configured', {}, 500);
                }

                const scope = 'openid profile email';
                const responseType = 'code';
                const state = 'random-state-string'; // In production, use a secure random string

                const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
                    `client_id=${encodeURIComponent(clientId)}&` +
                    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
                    `scope=${encodeURIComponent(scope)}&` +
                    `response_type=${responseType}&` +
                    `state=${state}`;

                return reply.redirect(googleAuthUrl);
            } catch (error) {
                this.logger.error('Google auth initiation error:', error);
                return jsonResponse(reply, 'Failed to initiate Google authentication', {}, 500);
            }
        },
    });

    /**
     * Google OAuth callback handler
     */
    public googleCallback = asyncHandler<unknown, { code?: string; state?: string; error?: string }, unknown, UserDto>({
        logger: this.logger,
        handler: async (request, reply) => {
            try {
                const { code, error } = request.query;

                if (error) {
                    this.logger.warn('Google OAuth error:', error);
                    return jsonResponse(reply, 'Google authentication failed', { error }, 401);
                }

                if (!code) {
                    return jsonResponse(reply, 'No authorization code received', {}, 400);
                }

                // Exchange code for access token
                const tokenResponse = await this.exchangeCodeForToken(code);
                if (!tokenResponse) {
                    return jsonResponse(reply, 'Failed to exchange code for token', {}, 500);
                }

                // Get user profile from Google
                const profile = await this.getGoogleProfile(tokenResponse.access_token);
                if (!profile) {
                    return jsonResponse(reply, 'Failed to get user profile', {}, 500);
                }

                // Authenticate or create user
                const user = await authService.authenticateGoogleUser(profile);

                // Generate tokens
                const tokens = await authService.generateTokens(user, request);
                if (!tokens) {
                    return jsonResponse(reply, 'Failed to generate tokens', {}, 500);
                }

                // In a real app, you might want to redirect to frontend with tokens
                // For now, return JSON response
                return jsonResponse(
                    reply,
                    'Google authentication successful',
                    {
                        user: {
                            id: user.id,
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            roles: JSON.parse(user.roles as string),
                            isVerified: user.isVerified,
                            provider: user.provider,
                            avatar: user.avatar,
                        },
                        accessToken: tokens.accessToken.token,
                        refreshToken: tokens.refreshToken.token,
                    },
                    200
                );
            } catch (error) {
                this.logger.error('Google callback error:', error);
                return jsonResponse(reply, 'Google authentication failed', {}, 500);
            }
        },
    });

    /**
     * Exchange authorization code for access token
     */
    private async exchangeCodeForToken(code: string): Promise<any | null> {
        try {
            const clientId = process.env.GOOGLE_CLIENT_ID;
            const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
            const redirectUri = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';

            if (!clientId || !clientSecret) {
                this.logger.error('Google OAuth credentials not configured');
                return null;
            }

            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    client_id: clientId,
                    client_secret: clientSecret,
                    code,
                    grant_type: 'authorization_code',
                    redirect_uri: redirectUri,
                }),
            });

            if (!response.ok) {
                this.logger.error('Failed to exchange code for token:', response.statusText);
                return null;
            }

            return await response.json();
        } catch (error) {
            this.logger.error('Error exchanging code for token:', error);
            return null;
        }
    }

    /**
     * Get user profile from Google
     */
    private async getGoogleProfile(accessToken: string): Promise<any | null> {
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                this.logger.error('Failed to get Google profile:', response.statusText);
                return null;
            }

            const profile: any = await response.json();

            // Transform to our expected format
            return {
                id: profile.id,
                emails: [{ value: profile.email, verified: profile.verified_email }],
                name: {
                    givenName: profile.given_name,
                    familyName: profile.family_name,
                },
                photos: profile.picture ? [{ value: profile.picture }] : [],
            };
        } catch (error) {
            this.logger.error('Error getting Google profile:', error);
            return null;
        }
    }


    /**
     * Get current user profile
     */
    public getProfile = asyncHandler<unknown, unknown, unknown, UserDto>({
        logger: this.logger,
        handler: async (request, reply) => {
            try {
                const userId = (request as any).user?.id;
                if (!userId) {
                    return jsonResponse(reply, 'User not authenticated', {}, 401);
                }

                const user = await authService.getUserById(userId);
                if (!user) {
                    return jsonResponse(reply, 'User not found', {}, 404);
                }

                return jsonResponse(
                    reply,
                    'Profile retrieved successfully',
                    {
                        user: {
                            id: user.id,
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            roles: JSON.parse(user.roles as string),
                            isVerified: user.isVerified,
                            provider: user.provider,
                            avatar: user.avatar,
                            phone: user.phone,
                            civility: user.civility,
                            birthDate: user.birthDate,
                        },
                    },
                    200
                );
            } catch (error) {
                this.logger.error('Get profile error:', error);
                return jsonResponse(reply, 'Failed to get profile', {}, 500);
            }
        },
    });
}

export const authController = new AuthController();
