import { grantPoolController } from '@/controllers/grantPoolController';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export async function grantPoolRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    // Create a new grant pool
    fastify.post('/create', grantPoolController.createGrantPool);

    // Deposit funds to a grant pool
    fastify.post('/deposit', grantPoolController.depositToPool);

    // Set payout amounts for a grant pool
    fastify.post('/payouts', grantPoolController.setPayouts);

    // Distribute grants to winners
    fastify.post('/distribute', grantPoolController.distributeGrants);

    // Refund remaining funds from a pool
    fastify.post('/refund', grantPoolController.refundPool);

    // Get grant pool information by ID
    fastify.get('/:poolId', grantPoolController.getPoolInfo);

    // Get all pools for an event
    fastify.get('/event/:eventId', grantPoolController.getEventPools);
}
