import { tokenRepository, userRepository } from '@/repositories';
import { authService, userService } from '@/services';
import { getLocationFromIp, parseUserAgent } from '@/utils';
import { asyncHandler } from '@/utils/asyncHandler';
import { authResponse, jsonResponse } from '@/utils/jsonResponse';
import { logger } from '@/utils/logger';
import { UserDto } from '@shared/dto';

interface ConnectWalletBody {
    suiAddress: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
}

class AuthController {
    private logger = logger.child({
        module: '[CFR][AUTH][CONTROLLER]',
    });

    constructor() { }


    /**
     * Connect wallet - Register/Login user with SUI address
     */
    public connectWallet = asyncHandler<unknown, unknown, ConnectWalletBody, UserDto>({
        logger: this.logger,
        handler: async (request, reply) => {
            try {
                const { suiAddress, email, firstName, lastName, avatar } = request.body;

                if (!suiAddress) {
                    return jsonResponse(reply, 'SUI address is required', {}, 400);
                }

                this.logger.info('Wallet connection request', { suiAddress: suiAddress.substring(0, 10) + '...' });

                // Get or create user by SUI address
                const user = await authService.connectWallet({
                    suiAddress,
                    email,
                    firstName,
                    lastName,
                    avatar,
                });

                return jsonResponse(
                    reply,
                    'Wallet connected successfully',
                    {
                        user: {
                            id: user.id,
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            suiAddress: user.suiAddress,
                            avatar: user.avatar,
                            roles: JSON.parse(user.roles as string),
                            isVerified: user.isVerified,
                            provider: user.provider,
                        },
                    },
                    200
                );
            } catch (error) {
                this.logger.error('Wallet connection error:', error);
                return jsonResponse(reply, 'Failed to connect wallet', {}, 500);
            }
        },
    });

    /**
     * Get user by SUI address
     */
    public getUserBySuiAddress = asyncHandler<unknown, { suiAddress: string }, unknown, UserDto>({
        logger: this.logger,
        handler: async (request, reply) => {
            try {
                const { suiAddress } = request.params;

                if (!suiAddress) {
                    return jsonResponse(reply, 'SUI address is required', {}, 400);
                }

                const user = await authService.getUserBySuiAddress(suiAddress);
                if (!user) {
                    return jsonResponse(reply, 'User not found', {}, 404);
                }

                return jsonResponse(
                    reply,
                    'User found',
                    {
                        user: {
                            id: user.id,
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            suiAddress: user.suiAddress,
                            avatar: user.avatar,
                            roles: JSON.parse(user.roles as string),
                            isVerified: user.isVerified,
                            provider: user.provider,
                        },
                    },
                    200
                );
            } catch (error) {
                this.logger.error('Get user by SUI address error:', error);
                return jsonResponse(reply, 'Failed to get user', {}, 500);
            }
        },
    });


    /**
     * Update user profile
     */
    public updateProfile = asyncHandler<unknown, { suiAddress: string }, ConnectWalletBody, UserDto>({
        logger: this.logger,
        handler: async (request, reply) => {
            try {
                const { suiAddress } = request.params;
                const { email, firstName, lastName, avatar } = request.body;

                if (!suiAddress) {
                    return jsonResponse(reply, 'SUI address is required', {}, 400);
                }

                const user = await authService.updateUserProfile(suiAddress, {
                    email,
                    firstName,
                    lastName,
                    avatar,
                });

                if (!user) {
                    return jsonResponse(reply, 'User not found', {}, 404);
                }

                return jsonResponse(
                    reply,
                    'Profile updated successfully',
                    {
                        user: {
                            id: user.id,
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            suiAddress: user.suiAddress,
                            avatar: user.avatar,
                            roles: JSON.parse(user.roles as string),
                            isVerified: user.isVerified,
                            provider: user.provider,
                        },
                    },
                    200
                );
            } catch (error) {
                this.logger.error('Update profile error:', error);
                return jsonResponse(reply, 'Failed to update profile', {}, 500);
            }
        },
    });
}

export const authController = new AuthController();
