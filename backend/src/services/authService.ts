import { User } from '@/config/client';
import { authRepository } from '@/repositories/authRepository';
import { logger } from '@/utils/logger';

interface ConnectWalletData {
    suiAddress: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
}

interface UpdateProfileData {
    email?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
}

class AuthService {
    private logger = logger;

    constructor() { }

    /**
     * Connect wallet - Get or create user by SUI address
     * @param data - Wallet connection data
     * @returns User
     */
    async connectWallet(data: ConnectWalletData): Promise<User> {
        try {
            const { suiAddress, email, firstName, lastName, avatar } = data;

            this.logger.info('Connecting wallet', { suiAddress: suiAddress.substring(0, 10) + '...' });

            // Check if user exists by SUI address
            let user = await authRepository.findBySuiAddress(suiAddress);

            if (user) {
                // Update existing user with any new data
                if (email || firstName || lastName || avatar) {
                    user = await authRepository.updateUser(user.id, {
                        ...(email && { email }),
                        ...(firstName && { firstName }),
                        ...(lastName && { lastName }),
                        ...(avatar && { avatar }),
                    });
                }

                this.logger.info('Existing user found and updated', { userId: user.id });
                return user;
            }

            // Create new user
            user = await authRepository.createEnokiUser({
                enokiUserId: suiAddress, // Use SUI address as Enoki user ID
                email: email || `${suiAddress}@sui.wallet`,
                firstName: firstName || 'SUI',
                lastName: lastName || 'User',
                avatar,
                suiAddress,
                oauthProvider: 'enoki',
                oauthId: suiAddress,
            });

            this.logger.info('New user created', { userId: user.id });
            return user;

        } catch (error) {
            this.logger.error('Error connecting wallet:', error);
            throw error;
        }
    }

    /**
     * Get user by SUI address
     * @param suiAddress - SUI wallet address
     * @returns User or null
     */
    async getUserBySuiAddress(suiAddress: string): Promise<User | null> {
        try {
            return await authRepository.findBySuiAddress(suiAddress);
        } catch (error) {
            this.logger.error('Error getting user by SUI address:', error);
            throw error;
        }
    }

    /**
     * Update user profile
     * @param suiAddress - SUI wallet address
     * @param data - Profile data to update
     * @returns Updated user or null
     */
    async updateUserProfile(suiAddress: string, data: UpdateProfileData): Promise<User | null> {
        try {
            const user = await authRepository.findBySuiAddress(suiAddress);
            if (!user) {
                return null;
            }

            const updatedUser = await authRepository.updateUser(user.id, data);
            this.logger.info('User profile updated', { userId: user.id });
            return updatedUser;

        } catch (error) {
            this.logger.error('Error updating user profile:', error);
            throw error;
        }
    }
}

export const authService = new AuthService();
