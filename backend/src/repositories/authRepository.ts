import { User } from '@/config/client';
import prisma from '@/config/prisma';
import { logger } from '@/utils/logger';

interface GoogleUserData {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
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
     * Find user by Google ID
     * @param googleId - Google ID
     * @returns User or null
     */
    async findByGoogleId(googleId: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { googleId },
            include: {
                tokens: true,
            },
        });
    }


    /**
     * Create a new user with Google OAuth
     * @param data - Google user data
     * @returns Created user
     */
    async createGoogleUser(data: GoogleUserData): Promise<User> {
        return prisma.user.create({
            data: {
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                googleId: data.googleId,
                avatar: data.avatar,
                provider: 'google',
                roles: JSON.stringify(['user']), // Default role
                isVerified: true, // Google users are pre-verified
            },
        });
    }

    /**
     * Update user's Google information
     * @param userId - User ID
     * @param data - Google user data to update
     * @returns Updated user
     */
    async updateGoogleUser(userId: string, data: Partial<GoogleUserData>): Promise<User> {
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
     * Update user's last login
     * @param userId - User ID
     * @returns Updated user
     */
    async updateLastLogin(userId: string): Promise<User> {
        return prisma.user.update({
            where: { id: userId },
            data: {
                updatedAt: new Date(),
            },
        });
    }

    /**
     * Update user data
     * @param userId - User ID
     * @param data - Data to update
     * @returns Updated user
     */
    async updateUser(userId: string, data: Partial<User>): Promise<User> {
        console.log('🔍 AuthRepository.updateUser called with:', { userId, data });
        try {
            const result = await prisma.user.update({
                where: { id: userId },
                data: {
                    ...data,
                    updatedAt: new Date(),
                },
            });
            console.log('✅ AuthRepository.updateUser successful:', result);
            return result;
        } catch (error) {
            console.error('❌ AuthRepository.updateUser failed:', error);
            throw error;
        }
    }

}

export const authRepository = new AuthRepository();
