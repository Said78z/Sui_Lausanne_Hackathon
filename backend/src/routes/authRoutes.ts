
import { authController } from '@/controllers';
import { isAuthenticated } from '@/middleware/auth';
import { createSwaggerSchema } from '@/utils/swaggerUtils';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export async function authRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    // Google OAuth Routes (Only authentication method)
    fastify.get('/google', {
        schema: createSwaggerSchema(
            'Initiate Google OAuth authentication',
            [
                { message: 'Redirects to Google OAuth', data: [], status: 302 },
            ],
            null,
            false,
            null,
            ['Authentication', 'OAuth']
        ),
        handler: authController.googleAuth,
    });

    fastify.get('/google/callback', {
        schema: createSwaggerSchema(
            'Google OAuth callback endpoint',
            [
                { message: 'Google authentication successful', data: [], status: 200 },
                { message: 'Google authentication failed', data: [], status: 401 },
                { message: 'Authentication error', data: [], status: 500 },
            ],
            null,
            false,
            null,
            ['Authentication', 'OAuth']
        ),
        handler: authController.googleCallback,
    });

    // JWT Authentication Route (for frontend OAuth)
    fastify.post('/jwt', {
        schema: createSwaggerSchema(
            'Authenticate with Google JWT token from frontend',
            [
                { message: 'Authentication successful', data: [], status: 200 },
                { message: 'JWT token is required', data: [], status: 400 },
                { message: 'Authentication failed', data: [], status: 401 },
                { message: 'Authentication error', data: [], status: 500 },
            ],
            {
                type: 'object',
                required: ['jwtToken'],
                properties: {
                    jwtToken: { type: 'string', description: 'Google JWT token from OAuth' },
                    walletAddress: { type: 'string', description: 'Optional wallet address from Enoki' },
                },
            },
            false,
            null,
            ['Authentication', 'JWT']
        ),
        handler: authController.authenticateWithJWT,
    });

    // Protected Routes
    fastify.get('/profile', {
        schema: createSwaggerSchema(
            'Get current user profile',
            [
                { message: 'Profile retrieved successfully', data: [], status: 200 },
                { message: 'User not authenticated', data: [], status: 401 },
                { message: 'User not found', data: [], status: 404 },
                { message: 'Failed to get profile', data: [], status: 500 },
            ],
            null,
            true,
            null,
            ['Authentication', 'Profile']
        ),
        preHandler: [isAuthenticated],
        handler: authController.getProfile,
    });

}
