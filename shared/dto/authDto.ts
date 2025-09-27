import { z } from 'zod';
import { CivilityEnum } from "../enums";
import { Serialize } from '../types/Serialize';

export const registerSchema = z
    .object({
        email: z.string().min(1, "L'email est requis").email("Format d'email invalide"),
        terms: z.boolean().refine((data) => data === true, {
            message: "Vous devez accepter les conditions d'utilisation",
            path: ['terms'],
        }),
        privacy: z.boolean().refine((data) => data === true, {
            message: 'Vous devez accepter la politique de confidentialité',
            path: ['privacy'],
        }),
        rememberMe: z.boolean().optional(),
        acceptNewsletter: z.boolean().optional(),
        password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
        confirmPassword: z.string().min(1, 'La confirmation du mot de passe est requise'),
        firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
        lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
        phone: z.string().optional().nullable(),
        civility: z.nativeEnum(CivilityEnum).optional().nullable(),
        birthDate: z.date().optional().nullable(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Les mots de passe ne correspond ent pas',
        path: ['confirmPassword'],
    });
export type RegisterSchema = z.infer<typeof registerSchema>;
export type RegisterDto = Serialize<RegisterSchema>;

export const loginSchema = z.object({
    email: z.string().min(1, "L'email est requis").email("Format d'email invalide"),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    rememberMe: z.boolean().optional(),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type LoginDto = Serialize<LoginSchema>;

export const logoutSchema = z.object({
    token: z.string().min(1),
});

export type LogoutSchema = z.infer<typeof logoutSchema>;
export type LogoutDto = Serialize<LogoutSchema>;

export const requestPasswordResetSchema = z.object({
    email: z.string().email(),
});

export type RequestPasswordResetSchema = z.infer<typeof requestPasswordResetSchema>;
export type RequestPasswordResetDto = Serialize<RequestPasswordResetSchema>;

export const resetPasswordSchema = z
    .object({
        currentPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
        newPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
        confirmPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
        token: z.string().min(1),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Les mots de passe ne correspondent pas',
        path: ['confirmPassword'],
    });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordDto = Serialize<ResetPasswordSchema>;

export const updatePasswordSchema = z.object({
    currentPassword: z
        .string()
        .min(6)
        .max(255, { message: 'Le mot de passe doit contenir au moins 6 caractères' }),
    newPassword: z
        .string()
        .min(6)
        .max(255, { message: 'Le mot de passe doit contenir au moins 6 caractères' }),
    confirmPassword: z
        .string()
        .min(6)
        .max(255, { message: 'Le mot de passe doit contenir au moins 6 caractères' }),
});

export type UpdatePasswordSchema = z.infer<typeof updatePasswordSchema>;
export type UpdatePasswordDto = Serialize<UpdatePasswordSchema>;

export const tokenSchema = z.object({
    token: z.string().min(1),
});

export type TokenSchema = z.infer<typeof tokenSchema>;
export type TokenDto = Serialize<TokenSchema>;

export const successAuthResponseSchema = z.object({
    accessToken: z.string().min(1),
    refreshToken: z.string().min(1),
});

export type SuccessAuthResponseSchema = z.infer<typeof successAuthResponseSchema>;
export type SuccessAuthResponseDto = Serialize<SuccessAuthResponseSchema>;

export const userResponseSchema = z.object({
    id: z.string().min(1),
    email: z.string().email(),
    firstName: z.string().min(2).max(255),
    lastName: z.string().min(2).max(255),
});

export type UserResponseSchema = z.infer<typeof userResponseSchema>;
export type UserResponseDto = Serialize<UserResponseSchema>;

export const querySessionsSchema = z.object({
    userId: z.string().min(1),
});

export type QuerySessionsSchema = z.infer<typeof querySessionsSchema>;
export type QuerySessionsDto = Serialize<QuerySessionsSchema>;
