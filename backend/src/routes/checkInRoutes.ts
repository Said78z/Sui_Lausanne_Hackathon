import { checkInController } from '@/controllers/checkInController';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export async function checkInRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    // Create a new mission
    fastify.post('/missions', checkInController.createMission);

    // Validate a check-in and mint attestation
    fastify.post('/validate', checkInController.validateCheckIn);

    // Generate QR signature for a mission
    fastify.get('/qr-signature', checkInController.generateQRSignature);

    // Get mission information by ID
    fastify.get('/missions/:missionId', checkInController.getMissionInfo);

    // Get user's attestations
    fastify.get('/attestations/:userAddress', checkInController.getUserAttestations);
}
