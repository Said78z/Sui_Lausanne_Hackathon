import { isAuthenticated, verifyAccess } from '@/middleware';
import { createSwaggerSchema } from '@/utils/swaggerUtils';

import { GetAllUsers, GetChatContacts, UpdateUser, UserRole } from '@shared/dto';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

import { userController } from '@/controllers/userController';

export async function userRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    // Récupérer tous les utilisateurs
    fastify.get('/', {
        schema: createSwaggerSchema(
            'Récupère tous les utilisateurs.',
            [
                { message: 'Utilisateurs récupérés avec succès', data: [], status: 200 },
                { message: 'Non autorisé', data: [], status: 401 },
                {
                    message: 'Erreur lors de la récupération des utilisateurs',
                    data: [],
                    status: 500,
                },
            ],
            null,
            true,
            GetAllUsers,
            ['Users']
        ),
        preHandler: [isAuthenticated, verifyAccess(UserRole.Admin)],
        handler: userController.getAllUsers,
    });

}
