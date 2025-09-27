import { UserSchema } from '@shared/dto';
import { FastifyRequest, RouteGenericInterface } from 'fastify';

// Basic

export interface Basic {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Interface pour une requête authentifiée avec un utilisateur
 */
export interface AuthenticatedRequest<T extends RouteGenericInterface = RouteGenericInterface>
    extends FastifyRequest<T> {
    user: UserSchema;
}

/**
 * Interface pour une réponse API standardisée
 */
export interface ApiResponse<T = any> {
    message: string;
    data: T;
    pagination?: PaginationMeta;
    status: number;
    timestamp: string;
}

export interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    nextPage: number;
    previousPage: number;
    perPage: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}

export interface Basic {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ErrorResponse {
    message: string;
    stack?: string;
    code?: string;
}
