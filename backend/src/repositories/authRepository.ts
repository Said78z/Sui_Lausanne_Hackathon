import { User } from '@/config/client';
import prisma from '@/config/prisma';
import { logger } from '@/utils/logger';

interface EnokiUserData {
    enokiUserId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    suiAddress?: string;
    oauthProvider?: string;
    oauthId?: string;
}

class AuthRepository {
    private logger = logger.child({
        class: '[App][AuthRepository]',
    });

    /**
     * Find user by email
     * @param email - User email
     * @returns User or null
     */
    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email },
            include: {
                tokens: true,
            },
        });
    }

    /**
     * Find user by SUI address
     * @param suiAddress - SUI wallet address
     * @returns User or null
     */
    async findBySuiAddress(suiAddress: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { suiAddress },
            include: {
                tokens: true,
            },
        });
    }

    /**
     * Find user by Enoki user ID
     * @param enokiUserId - Enoki user ID
     * @returns User or null
     */
    async findByEnokiUserId(enokiUserId: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { enokiUserId },
            include: {
                tokens: true,
            },
        });
    }

    /**
     * Create a new user with Enoki authentication
     * @param data - Enoki user data
     * @returns Created user
     */
    async createEnokiUser(data: EnokiUserData): Promise<User> {
        return prisma.user.create({
            data: {
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                enokiUserId: data.enokiUserId,
                suiAddress: data.suiAddress,
                avatar: data.avatar,
                provider: 'enoki',
                oauthProvider: data.oauthProvider,
                oauthId: data.oauthId,
                roles: JSON.stringify(['user']), // Default role
                isVerified: true, // Enoki users are pre-verified
            },
        });
    }

    /**
     * Update user information
     * @param userId - User ID
     * @param data - User data to update
     * @returns Updated user
     */
    async updateUser(userId: string, data: Partial<EnokiUserData & { email?: string; firstName?: string; lastName?: string; avatar?: string }>): Promise<User> {
        return prisma.user.update({
            where: { id: userId },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });
    }


    /**
     * Find user by ID
     * @param id - User ID
     * @returns User or null
     */
    async findById(id: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id },
            include: {
                tokens: true,
            },
        });
    }

    /**
     * Check if email exists
     * @param email - Email to check
     * @returns True if email exists, false otherwise
     */
    async emailExists(email: string): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        return !!user;
    }

}

export const authRepository = new AuthRepository();
