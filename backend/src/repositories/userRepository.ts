import { Prisma, User } from '@/config/client';
import prisma from '@/config/prisma';
import { userService } from '@/services/userService';
import { CreateUserData, QueryUsersDto, UpdateUserData } from '@shared/dto/userDto';

const MAX_RECORDS_LIMIT = 100;

export const basicUserSelect = Prisma.validator<Prisma.UserSelect>()({
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    googleId: true,
    avatar: true,
    provider: true,
});

class UserRepository {

    async findAll(query: QueryUsersDto = {}): Promise<{
        data: User[],
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            nextPage: number;
            previousPage: number;
            perPage: number;
        };
    }> {

        // Convert string parameters to appropriate types
        const page = query.page ? parseInt(query.page, 10) : 1;
        const limit = query.limit ? parseInt(query.limit, 10) : MAX_RECORDS_LIMIT;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.UserWhereInput = {};

        if (query.search) {
            where.OR = [
                { firstName: { contains: query.search } },
                { lastName: { contains: query.search } },
                { email: { contains: query.search } },
            ];
        }

        const [data, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },

            }),
            prisma.user.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data: data.map(userService.deserializeRoles),
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                nextPage: page < totalPages ? page + 1 : 0,
                previousPage: page > 1 ? page - 1 : 0,
                perPage: limit,
            },
        };

    }
    async create(data: Prisma.UserCreateInput): Promise<User> {
        const user = await prisma.user.create({
            data
        });
        return user;
    }

    async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        const updated = await prisma.user.update({
            where: { id },
            data,
        });
        return userService.deserializeRoles(updated);
    }

    async findById(id: string): Promise<User | null> {
        const user = await prisma.user.findFirst({
            where: { id },
        });
        return user ? userService.deserializeRoles(user) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await prisma.user.findFirst({
            where: { email },
        });
        return user ? userService.deserializeRoles(user) : null;
    }

    async delete(id: string): Promise<User> {
        const deleted = await prisma.user.delete({
            where: { id },
        });
        return deleted;
    }

    /**
     * Find user by Google ID
     * @param googleId - Google ID
     * @returns User or null
     */
    async findByGoogleId(googleId: string): Promise<User | null> {
        const user = await prisma.user.findFirst({
            where: { googleId },
        });
        return user ? userService.deserializeRoles(user) : null;
    }

    /**
     * Create a new user with Google OAuth data
     * @param data - Google user data
     * @returns Created user
     */
    async createGoogleUser(data: CreateUserData): Promise<User> {
        const user = await prisma.user.create({
            data: {
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                googleId: data.googleId,
                avatar: data.avatar,
                provider: data.provider || 'enoki-google',
                roles: JSON.stringify(data.roles || ['ROLE_USER']),
                isVerified: data.isVerified ?? true,
            },
        });
        return userService.deserializeRoles(user);
    }

    /**
     * Update user's Google information
     * @param userId - User ID
     * @param data - Google user data to update
     * @returns Updated user
     */
    async updateGoogleUser(userId: string, data: UpdateUserData): Promise<User> {
        const updated = await prisma.user.update({
            where: { id: userId },
            data: {
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                avatar: data.avatar,
            },
        });
        return userService.deserializeRoles(updated);
    }

}

export const userRepository = new UserRepository();