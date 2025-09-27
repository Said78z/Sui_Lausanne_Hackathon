import { jsonResponse } from '@/utils/jsonResponse';

import { UserSchema } from '@shared/dto';
import dotenv from 'dotenv';
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import jwt from 'jsonwebtoken';

dotenv.config();

/**
 * Middleware to check if the user is authenticated
 * @param req - Fastify request
 * @param res - Fastify response
 * @param done - Fastify done function
 * @returns void
 */
export const isAuthenticated = (
    req: FastifyRequest,
    res: FastifyReply,
    done: HookHandlerDoneFunction
): void => {
    const token = req.headers.authorization?.split(' ')[1];
    // console.log(token);
    if (!token) {
        jsonResponse(res, 'Unauthorized', {}, 401);
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as UserSchema;

        // Désérialiser les rôles si ils sont stockés en tant que JSON string
        if (decoded.roles) {
            if (typeof decoded.roles === 'string') {
                try {
                    decoded.roles = JSON.parse(decoded.roles);
                } catch (error) {
                    console.error('Error parsing roles:', error);
                    decoded.roles = [];
                }
            }
        } else {
            decoded.roles = [];
        }

        req.user = decoded;
        done();
    } catch (error) {
        jsonResponse(res, 'Unauthorized', {}, 401);
    }
};

/**
 * Middleware to check if the token exists
 * @param req - Fastify request
 * @param res - Fastify response
 * @param done - Fastify done function
 * @returns void
 */
export const hasToken = (
    req: FastifyRequest,
    res: FastifyReply,
    done: HookHandlerDoneFunction
): void => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        jsonResponse(res, 'Unauthorized', {}, 401);
        return;
    } else {
        done();
    }
};

declare module 'fastify' {
    interface FastifyRequest {
        user: UserSchema;
    }
}
