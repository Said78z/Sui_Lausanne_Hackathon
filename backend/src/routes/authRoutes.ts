import { authController } from '@/controllers';
import { createSwaggerSchema } from '@/utils/swaggerUtils';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';


export async function authRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    // Connect wallet - Register/Login with SUI address
    fastify.post('/connect-wallet', {
        schema: createSwaggerSchema(
            'Connect Enoki wallet - Register or login user',
            [
                { message: 'Wallet connected successfully', data: [], status: 200 },
                { message: 'SUI address is required', data: [], status: 400 },
                { message: 'Failed to connect wallet', data: [], status: 500 },
            ],
            null,
            false,
            null,
            ['Authentication', 'Wallet']
        ),
        handler: authController.connectWallet,
    });

    // Get user by SUI address
    fastify.get('/user/:suiAddress', {
        schema: createSwaggerSchema(
            'Get user by SUI address',
            [
                { message: 'User found', data: [], status: 200 },
                { message: 'SUI address is required', data: [], status: 400 },
                { message: 'User not found', data: [], status: 404 },
                { message: 'Failed to get user', data: [], status: 500 },
            ],
            null,
            false,
            null,
            ['Authentication', 'User']
        ),
        handler: authController.getUserBySuiAddress,
    });

    // Update user profile
    fastify.put('/user/:suiAddress', {
        schema: createSwaggerSchema(
            'Update user profile by SUI address',
            [
                { message: 'Profile updated successfully', data: [], status: 200 },
                { message: 'SUI address is required', data: [], status: 400 },
                { message: 'User not found', data: [], status: 404 },
                { message: 'Failed to update profile', data: [], status: 500 },
            ],
            null,
            false,
            null,
            ['Authentication', 'Profile']
        ),
        handler: authController.updateProfile,
    });
}
