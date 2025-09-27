import { logger } from '@/utils/logger';

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

/**
 * Error handler for Fastify
 * @param app - Fastify instance
 */
export async function errorHandlerMiddleware(app: FastifyInstance): Promise<void> {
    app.setErrorHandler((error: Error, request: FastifyRequest, reply: FastifyReply) => {
        logger.error(error);

        if (error instanceof SyntaxError) {
            return reply.status(400).send({
                status: 400,
                error: 'Bad Request',
                message: 'Syntax error in the request',
            });
        }

        if (error instanceof ZodError) {
            return reply.status(400).send({
                status: 400,
                error: 'Bad Request',
                message: error.message,
                validation: error.flatten().fieldErrors,
            });
        }

        return reply.status(500).send({
            status: 500,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred',
        });
    });
}
