import { FastifyReply } from 'fastify';

import { ApiResponse, PaginationMeta } from '@/types/apiTypes';

export interface FastifyReplyTest extends FastifyReply {
    custom: {
        env: string;
    };
}

/**
 * Respond to the request with a message, data and a status
 * @param reply - The Fastify response
 * @param message - The message to send
 * @param data - The data to send
 * @param status - The status to send
 * @param pagination - The pagination information (optional)
 * @returns The API response or void in production
 */
export function jsonResponse<T = any>(
    reply: FastifyReply | FastifyReplyTest,
    message: string,
    data: T,
    status: number,
    pagination?: PaginationMeta
): ApiResponse<T> | FastifyReply {
    let finalData = data;

    if (Array.isArray(finalData)) {
        finalData = [...finalData] as unknown as T;
    }

    const response: ApiResponse<T> = {
        message,
        data: finalData,
        status,
        timestamp: new Date().toISOString(),
    };

    if (pagination) {
        response.pagination = pagination;
    }

    if (process.env.NODE_ENV === 'test' && reply.constructor.name === 'FastifyReplyTest') {
        return response;
    }

    // Essayez d'utiliser une sérialisation explicite
    const jsonString = JSON.stringify(response);
    return reply.status(status).type('application/json').send(jsonString);
}

/**
 * Respond with a 400 Bad Request response
 * @param reply - The Fastify response
 * @param message - The error message to send
 * @returns The API response
 */
export function badRequestResponse(
    reply: FastifyReply | FastifyReplyTest,
    message: string = 'Bad request.',
    error?: any
): ApiResponse<undefined> | FastifyReply {
    return reply.status(400).type('application/json').send({
        status: 400,
        timestamp: new Date().toISOString(),
        message,
        error,
    });
}


/**
 * Respond with a 404 Not Found response
 * @param reply - The Fastify response
 * @param message - The error message to send
 * @returns The API response
 */
export function notFoundResponse(
    reply: FastifyReply | FastifyReplyTest,
    message: string = 'Not found.',
    error?: any
): ApiResponse<undefined> | FastifyReply {
    return reply.status(404).type('application/json').send({
        status: 404,
        timestamp: new Date().toISOString(),
        message,
        error,
    });
}

/**
 * Respond with a 401 Unauthorized response
 * @param reply - The Fastify response
 * @param message - The error message to send
 * @returns The API response
 */
export function unauthorizedResponse(
    reply: FastifyReply | FastifyReplyTest,
    message: string = 'Unauthorized.',
    error?: any
): ApiResponse<undefined> | FastifyReply {
    return reply.status(401).type('application/json').send({
        status: 401,
        timestamp: new Date().toISOString(),
        message,
        error,
    });
}

/**
 * Respond with a 403 Forbidden response
 * @param reply - The Fastify response
 * @param message - The error message to send
 * @returns The API response
 */
export function forbiddenResponse(
    reply: FastifyReply | FastifyReplyTest,
    message: string = 'Forbidden.',
    error?: any
): ApiResponse<undefined> | FastifyReply {
    return reply.status(403).type('application/json').send({
        status: 403,
        timestamp: new Date().toISOString(),
        message,
        error,
    });
}

/**
 * Respond with a 500 Internal Server Error response
 * @param reply - The Fastify response
 * @param message - The error message to send
 * @returns The API response
 */
export function internalServerError(
    reply: FastifyReply | FastifyReplyTest,
    message: string = 'Internal server error.',
    error?: any
): ApiResponse<undefined> | FastifyReply {
    return reply.status(500).type('application/json').send({
        status: 500,
        timestamp: new Date().toISOString(),
        message,
        error,
    });
}

/**
 * Respond to the request with a message, accessToken and refreshToken
 * @param reply - The Fastify response
 * @param accessToken - The access token to send
 * @param refreshToken - The refresh token to send
 */
export function authResponse(
    reply: FastifyReply | FastifyReplyTest,
    accessToken: string,
    refreshToken: string
): FastifyReply {
    return reply.status(200).type('application/json').send({
        accessToken,
        refreshToken,
    });
}


/**
 * Generate the response schema for the API
 * @param message - The message to send
 * @param data - The data to send
 * @param status - The status to send
 * @returns The response schema
 */
export const responseSchema = (message: string, data: any, status: number) => {
    return {
        type: 'object',
        properties: {
            message: { type: 'string', example: message },
            data: { type: 'object', example: data },
            timestamp: { type: 'string', example: new Date().toISOString() },
            status: { type: 'number', example: status },
            pagination: {
                type: 'object',
                properties: {
                    currentPage: { type: 'number' },
                    totalPages: { type: 'number' },
                    totalItems: { type: 'number' },
                    nextPage: { type: 'number' },
                    previousPage: { type: 'number' },
                    perPage: { type: 'number' },
                },
            },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
        },
    };
};

export type responseSchemaType = {
    message: string;
    data: any;
    status: number;
    pagination?: boolean;
    accessToken?: boolean;
    refreshToken?: boolean;
};
