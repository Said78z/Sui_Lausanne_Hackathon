import { applicationParameterController } from '@/controllers';
import { isAuthenticated } from '@/middleware';
import { createSwaggerSchema } from '@/utils/swaggerUtils';

import { CreateApplicationParameter, UpdateApplicationParameter } from '@shared/dto';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export async function applicationParameterRoutes(
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) {
    // Récupérer tous les paramètres
    fastify.get('/', {
        schema: createSwaggerSchema(
            'Récupère tous les paramètres.',
            [
                { message: 'Paramètres récupérés avec succès', data: [], status: 200 },
                { message: 'Non autorisé', data: [], status: 401 },
                {
                    message: 'Erreur lors de la récupération des paramètres',
                    data: [],
                    status: 500,
                },
            ],
            null,
            true,
            null,
            ['ApplicationParameters']
        ),
        preHandler: [isAuthenticated],
        handler: applicationParameterController.getAllParameters,
    });

    // Récupérer un paramètre par ID
    fastify.get('/:id', {
        schema: createSwaggerSchema(
            'Récupère un paramètre par ID.',
            [
                { message: 'Paramètre récupéré avec succès', data: [], status: 200 },
                { message: 'Non autorisé', data: [], status: 401 },
                { message: 'Paramètre non trouvé', data: [], status: 404 },
                {
                    message: 'Erreur lors de la récupération du paramètre',
                    data: [],
                    status: 500,
                },
            ],
            null,
            true,
            null,
            ['ApplicationParameters']
        ),
        preHandler: [isAuthenticated],
        handler: applicationParameterController.getParameterById,
    });

    // Créer un nouveau paramètre
    fastify.post('/', {
        schema: createSwaggerSchema(
            'Crée un nouveau paramètre.',
            [
                { message: 'Paramètre créé avec succès', data: [], status: 201 },
                { message: 'Non autorisé', data: [], status: 401 },
                {
                    message: 'Erreur lors de la création du paramètre',
                    data: [],
                    status: 500,
                },
            ],
            CreateApplicationParameter,
            true,
            null,
            ['ApplicationParameters']
        ),
        preHandler: [isAuthenticated],
        handler: applicationParameterController.createParameter,
    });

    // Mettre à jour un paramètre
    fastify.patch('/:id', {
        schema: createSwaggerSchema(
            'Met à jour un paramètre.',
            [
                { message: 'Paramètre mis à jour avec succès', data: [], status: 200 },
                { message: 'Non autorisé', data: [], status: 401 },
                { message: 'Paramètre non trouvé', data: [], status: 404 },
                {
                    message: 'Erreur lors de la mise à jour du paramètre',
                    data: [],
                    status: 500,
                },
            ],
            UpdateApplicationParameter,
            true,
            null,
            ['ApplicationParameters']
        ),
        preHandler: [isAuthenticated],
        handler: applicationParameterController.updateParameter,
    });

    // Supprimer un paramètre
    fastify.delete('/:id', {
        schema: createSwaggerSchema(
            'Supprime un paramètre.',
            [
                { message: 'Paramètre supprimé avec succès', data: [], status: 200 },
                { message: 'Non autorisé', data: [], status: 401 },
                { message: 'Paramètre non trouvé', data: [], status: 404 },
                {
                    message: 'Erreur lors de la suppression du paramètre',
                    data: [],
                    status: 500,
                },
            ],
            null,
            true,
            null,
            ['ApplicationParameters']
        ),
        preHandler: [isAuthenticated],
        handler: applicationParameterController.deleteParameter,
    });
}
