import { logger } from '@/utils/logger';

import { FastifyReply, FastifyRequest } from 'fastify';

declare module 'fastify' {
    interface FastifyRequest {
        startTime: number;
    }
}

/**
 * Middleware to log HTTP requests
 */
export function httpLoggerMiddleware(
    request: FastifyRequest,
    reply: FastifyReply,
    done: () => void
) {
    // Log the start time of the request
    request.startTime = Date.now();

    // Add a unique identifier to the request
    const requestId = request.id || crypto.randomUUID();
    request.log = logger.child({ requestId });
    // Log the incoming request synchronously
    process.nextTick(() => {
        logger.info({
            msg: 'Incoming request',
            method: request.method,
            url: request.url,
            ip: request.ip,
            userAgent: request.headers['user-agent'],
        });
    });

    // Hook to log the response
    reply.raw.on('finish', () => {
        const responseTime = Date.now() - request.startTime;
        logger.info({
            msg: 'Request finished',
            method: request.method,
            url: request.url,
            ip: request.ip,
            userAgent: request.headers['user-agent'],
            statusCode: reply.statusCode,
            responseTime: `${responseTime}ms`,
        });
    });

    done();
}
