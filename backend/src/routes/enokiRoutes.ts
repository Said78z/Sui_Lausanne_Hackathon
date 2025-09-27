import { enokiController } from '@/controllers/enokiController';
import { createSwaggerSchema } from '@/utils/swaggerUtils';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export async function enokiRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    // Health check endpoint
    fastify.get('/health', {
        schema: createSwaggerSchema(
            'Health check for Enoki sponsor service',
            [
                { message: 'Enoki sponsor service is running', data: [], status: 200 },
            ],
            null,
            false,
            null,
            ['Enoki', 'Health']
        ),
        handler: enokiController.health,
    });

    // Sponsor transaction endpoint (matches video demo)
    fastify.post('/sponsor-transaction', {
        schema: createSwaggerSchema(
            'Sponsor a SUI transaction using Enoki',
            [
                { message: 'Transaction sponsored successfully', data: [], status: 200 },
                { message: 'Missing required fields', data: [], status: 400 },
                { message: 'Failed to sponsor transaction', data: [], status: 500 },
            ],
            null,
            false,
            null,
            ['Enoki', 'Transactions']
        ),
        handler: enokiController.sponsorTransaction,
    });

    // Execute transaction endpoint (matches video demo)
    fastify.post('/execute-transaction', {
        schema: createSwaggerSchema(
            'Execute a sponsored SUI transaction',
            [
                { message: 'Transaction executed successfully', data: [], status: 200 },
                { message: 'Missing required fields', data: [], status: 400 },
                { message: 'Failed to execute transaction', data: [], status: 500 },
            ],
            null,
            false,
            null,
            ['Enoki', 'Transactions']
        ),
        handler: enokiController.executeTransaction,
    });
}
