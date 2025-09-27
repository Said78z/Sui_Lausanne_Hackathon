import { Serialize } from '@shared/types/Serialize';
import { z } from 'zod';

export enum UserRole {
    Admin = 'ROLE_ADMIN',
    Moderator = 'ROLE_MODERATOR',
    User = 'ROLE_USER',
    Lead = 'ROLE_LEAD',
    CGP = 'ROLE_CGP',
    Agent = 'ROLE_AGENT',
    Client = 'ROLE_CLIENT',
    Consultant = 'ROLE_CONSULTANT',
    SDR = 'ROLE_SDR',
    Customer = 'ROLE_CUSTOMER',
    SourcingManager = 'ROLE_SOURCING_MANAGER',
    Employee = 'ROLE_EMPLOYEE',
    CGPManager = 'ROLE_CGP_MANAGER',
    ConsultantManager = 'ROLE_CONSULTANT_MANAGER',
}

export enum ContactType {
    CGP = 'cgp',
    Agent = 'agent',
    Client = 'client',
    Prospect = 'prospect',
    Admin = 'admin',
}

/**
 * Règles dynamiques pour les permissions de chat
 * Ces règles sont utilisées pour déterminer les contacts avec lesquels un utilisateur peut communiquer
 * en fonction de relations spécifiques dans le système (clients, consultants, etc.)
 */
export enum ChatDynamicRule {
    OWN_CUSTOMERS = 'OWN_CUSTOMERS',           // Clients appartenant à l'utilisateur
    OWN_CONSULTANT = 'OWN_CONSULTANT',         // Consultant attribué à l'utilisateur
    OWN_SOURCING_MANAGER = 'OWN_SOURCING_MANAGER', // Manager de sourcing de l'agent
    CALLED_LEADS = 'CALLED_LEADS',             // Leads appelés par le SDR
    CGP_CUSTOMERS = 'CGP_CUSTOMERS',           // Clients des CGPs gérés
    TEAM_CUSTOMERS = 'TEAM_CUSTOMERS',         // Clients de l'équipe
    MANAGED_CONSULTANTS = 'MANAGED_CONSULTANTS', // Consultants gérés
}

export const userSchema = z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    password: z.string().optional(),
    phone: z.string().optional(),
    civility: z.string().optional(),
    roles: z.array(z.nativeEnum(UserRole)).optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    isVerified: z.boolean().optional(),
    linkedinProfile: z.string().optional(),
    emailReminders: z.boolean().optional(),
});

export type UserSchema = z.infer<typeof userSchema>;
export type UserDto = Serialize<UserSchema>;

export const restrictedUserSchema = z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    civility: z.string().optional(),
    roles: z.array(z.nativeEnum(UserRole)).optional(),
});

export type RestrictedUserSchema = z.infer<typeof restrictedUserSchema>;
export type RestrictedUserDto = Serialize<RestrictedUserSchema>;

export const queryUsersSchema = z.object({
    page: z.string().min(1, 'Le numéro de page doit être supérieur à 0').optional(),
    limit: z.string().min(1, "Le nombre d'éléments par page doit être supérieur à 0").optional(),
    search: z.string().optional(),
    roles: z.array(z.nativeEnum(UserRole)).optional(),
    type: z.nativeEnum(ContactType).optional(),
});

export type QueryUsersSchema = z.infer<typeof queryUsersSchema>;
export type QueryUsersDto = Serialize<QueryUsersSchema>;

export const queryChatContactsSchema = z.object({
    page: z.string().min(1, 'Le numéro de page doit être supérieur à 0').optional(),
    limit: z.string().min(1, "Le nombre d'éléments par page doit être supérieur à 0").optional(),
    search: z.string().optional(),
    type: z.nativeEnum(ContactType).optional(),
    onlineOnly: z.string().optional(),
});

export type QueryChatContactsSchema = z.infer<typeof queryChatContactsSchema>;
export type QueryChatContactsDto = Serialize<QueryChatContactsSchema>;

export const updateUserSchema = z.object({
    email: z.string().email("Format d'email invalide"),
    firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
    lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    phone: z.string().optional(),
    civility: z.string().optional(),
    roles: z.array(z.nativeEnum(UserRole)).optional(),
    isVerified: z.boolean().optional(),
    linkedinProfile: z.string().optional(),
    emailReminders: z.boolean().optional(),
});

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
export type UpdateUserDto = Serialize<UpdateUserSchema>;

// Backward compatibility exports
export const GetAllUsers = queryUsersSchema;
export type GetAllUsers = QueryUsersSchema;
export type GetAllUsersDto = QueryUsersDto;

export const GetChatContacts = queryChatContactsSchema;
export type GetChatContacts = QueryChatContactsSchema;
export type GetChatContactsDto = QueryChatContactsDto;

export const UpdateUser = updateUserSchema;
export type UpdateUser = UpdateUserSchema;

export const contactFiltersSchema = z.object({
    search: z.string().optional(),
    type: z.nativeEnum(ContactType).optional(),
    onlineOnly: z.boolean().optional(),
});

export type ContactFiltersSchema = z.infer<typeof contactFiltersSchema>;
export type ContactFilters = Serialize<ContactFiltersSchema>;

export const basicUserSchema = z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    civility: z.string().optional(),
});

export type BasicUserSchema = z.infer<typeof basicUserSchema>;
export type BasicUserDto = Serialize<BasicUserSchema>;

export const contactUserSchema = basicUserSchema.extend({
    roles: z.array(z.nativeEnum(UserRole)).optional(),
    isOnline: z.boolean().optional(),
    lastSeen: z.string().optional(),
    unreadCount: z.number().optional(),
});

export type ContactUserSchema = z.infer<typeof contactUserSchema>;
export type ContactUserDto = Serialize<ContactUserSchema>;

export const contactsResponseSchema = z.object({
    contacts: z.array(contactUserSchema),
    pagination: z.object({
        currentPage: z.number(),
        totalPages: z.number(),
        totalItems: z.number(),
        nextPage: z.number(),
        previousPage: z.number(),
        perPage: z.number(),
    }),
});

export type ContactsResponseSchema = z.infer<typeof contactsResponseSchema>;
export type ContactsResponse = Serialize<ContactsResponseSchema>;