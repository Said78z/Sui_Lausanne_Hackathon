import { Prisma } from '@/config/client';
import { basicUserSelect, userInclude } from '@/repositories/userRepository';

export type UserWithAddress = Prisma.UserGetPayload<{
    include: typeof userInclude;
}>;

export type BasicUser = Prisma.UserGetPayload<{
    select: typeof basicUserSelect;
}>;

export enum Role {
    ROLE_USER = 'ROLE_USER',
    ROLE_ADMIN = 'ROLE_ADMIN',
    ROLE_MODERATOR = 'ROLE_MODERATOR',
    ROLE_CGP = 'ROLE_CGP',
    ROLE_AGENT = 'ROLE_AGENT',
    ROLE_EMPLOYEE = 'ROLE_EMPLOYEE'
}

export interface CreateUser {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    roles: Role[];
}

export interface User extends CreateUser {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
