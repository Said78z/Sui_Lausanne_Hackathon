export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    civility: string;
    roles: string;
    birthDate: string;
    createdAt: Date;
    updatedAt: Date;
    isVerified?: boolean;
}

export enum UserRole {
    Admin = 'ROLE_ADMIN',
    Moderator = 'ROLE_MODERATOR',
    User = 'ROLE_USER',
}

export interface RegisterUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    civility: string;
    birthDate: string;
}
