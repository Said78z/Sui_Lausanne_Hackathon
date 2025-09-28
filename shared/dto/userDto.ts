import { Serialize } from '@shared/types/Serialize';
import { z } from 'zod';

// User roles enum
export enum UserRole {
    Admin = 'ROLE_ADMIN',
    Moderator = 'ROLE_MODERATOR',
    User = 'ROLE_USER',
}

// Provider types for OAuth authentication
export enum AuthProvider {
    Google = 'google',
    EnokiGoogle = 'enoki-google',
}

// Core user interfaces
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: UserRole[];
    createdAt: Date;
    updatedAt: Date;
    isVerified: boolean;
    // OAuth fields
    googleId: string;
    avatar?: string;
    provider: AuthProvider;
}

export interface CreateUserData {
    email: string;
    firstName: string;
    lastName: string;
    googleId: string;
    avatar?: string;
    provider?: AuthProvider;
    roles?: UserRole[];
    isVerified?: boolean;
}

export interface UpdateUserData {
    email?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
}

// Zod schemas for validation
export const userSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    roles: z.array(z.nativeEnum(UserRole)),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    isVerified: z.boolean(),
    // OAuth fields
    googleId: z.string(),
    avatar: z.string().optional(),
    provider: z.nativeEnum(AuthProvider),
});

export const createUserSchema = z.object({
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    googleId: z.string(),
    avatar: z.string().optional(),
    provider: z.nativeEnum(AuthProvider).optional(),
    roles: z.array(z.nativeEnum(UserRole)).optional(),
    isVerified: z.boolean().optional(),
});

export const updateUserSchema = z.object({
    email: z.string().email().optional(),
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    avatar: z.string().optional(),
});

export type UserSchema = z.infer<typeof userSchema>;
export type CreateUserSchema = z.infer<typeof createUserSchema>;
export type UpdateUserSchema = z.infer<typeof updateUserSchema>;

export type UserDto = Serialize<UserSchema>;
export type CreateUserDto = Serialize<CreateUserSchema>;
export type UpdateUserDto = Serialize<UpdateUserSchema>;

// Query schemas
export const queryUsersSchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    roles: z.array(z.nativeEnum(UserRole)).optional(),
});

export type QueryUsersSchema = z.infer<typeof queryUsersSchema>;
export type QueryUsersDto = Serialize<QueryUsersSchema>;

// Basic user schema for public data
export const basicUserSchema = z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    avatar: z.string().optional(),
});

export type BasicUserSchema = z.infer<typeof basicUserSchema>;
export type BasicUserDto = Serialize<BasicUserSchema>;

// Enoki authentication interfaces and schemas
export interface EnokiAuthRequest {
    token: string;
}

export interface EnokiAuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export const enokiAuthRequestSchema = z.object({
    token: z.string().min(1, 'JWT token is required'),
});

export const enokiAuthResponseSchema = z.object({
    user: userSchema,
    accessToken: z.string(),
    refreshToken: z.string(),
});

export type EnokiAuthRequestSchema = z.infer<typeof enokiAuthRequestSchema>;
export type EnokiAuthResponseSchema = z.infer<typeof enokiAuthResponseSchema>;

export type EnokiAuthRequestDto = Serialize<EnokiAuthRequestSchema>;
export type EnokiAuthResponseDto = Serialize<EnokiAuthResponseSchema>;

// Backward compatibility exports
export const GetAllUsers = queryUsersSchema;
export type GetAllUsers = QueryUsersSchema;
export type GetAllUsersDto = QueryUsersDto;