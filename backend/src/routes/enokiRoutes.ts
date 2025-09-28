import { enokiController } from '@/controllers';
import { createSwaggerSchema } from '@/utils/swaggerUtils';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export async function enokiRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    // Health check endpoint
    fastify.get('/health', {
        schema: createSwaggerSchema(
            'Health check for Enoki service',
            [
                { message: 'Enoki service is healthy', data: [], status: 200 },
                { message: 'Enoki service health check failed', data: [], status: 500 },
            ],
            null,
            false,
            null,
            ['Enoki', 'Health']
        ),
        handler: enokiController.healthCheck,
    });

    // Sponsor transaction endpoint
    fastify.post('/sponsor-transaction', {
        schema: createSwaggerSchema(
            'Sponsor a transaction using Enoki',
            [
                { message: 'Transaction sponsored successfully', data: [], status: 200 },
                { message: 'Missing required fields: transactionKindBytes, sender', data: [], status: 400 },
                { message: 'Failed to sponsor transaction', data: [], status: 500 },
            ],
            null,
            false,
            null,
            ['Enoki', 'Transactions']
        ),
        handler: enokiController.sponsorTransaction,
    });

    // Execute sponsored transaction endpoint
    fastify.post('/execute-transaction', {
        schema: createSwaggerSchema(
            'Execute a sponsored transaction using Enoki',
            [
                { message: 'Transaction executed successfully', data: [], status: 200 },
                { message: 'Missing required fields: digest, signature', data: [], status: 400 },
                { message: 'Failed to execute transaction', data: [], status: 500 },
            ],
            null,
            false,
            null,
            ['Enoki', 'Transactions']
        ),
        handler: enokiController.executeTransaction,
    });

    // Note: User authentication with Enoki has been moved to /api/users/authenticate-enoki
    // This route is deprecated
}
