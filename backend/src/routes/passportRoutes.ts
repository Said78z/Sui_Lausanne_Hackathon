import { passportController } from '@/controllers/passportController';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export async function passportRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    // Mint a passport SBT for a user
    fastify.post('/mint', passportController.mintPassport);

    // Get passport information by ID
    fastify.get('/:passportId', passportController.getPassportInfo);

    // Check if user has valid passport for event
    fastify.get('/check/:userAddress/:eventId', passportController.checkPassportValidity);

    // Get all passports for a user
    fastify.get('/user/:userAddress', passportController.getUserPassports);
}
