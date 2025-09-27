import { seedAdresses, seedAutopilots, seedUsers } from '@/helpers';
import { logger } from '@/utils/logger';

import { jest } from '@jest/globals';
import { FastifyReply, FastifyRequest } from 'fastify';

import { User } from '@/config/client';
import prisma from '@/config/prisma';

export interface FastifyReplyTest extends FastifyReply {
    custom: {
        env: string;
    };
}

export const disconnectPrisma = async () => {
    try {
        await prisma.$disconnect();
        logger.info('Déconnexion de Prisma réussie');
    } catch (error) {
        logger.error('Erreur lors de la déconnexion de Prisma:', error);
        throw error;
    }
};

export const fakeRequest = {
    method: 'GET',
    url: '/users',
} as FastifyRequest;

export const fakeReply = {
    send: jest.fn(),
    status: jest.fn(),
    custom: {
        env: 'test',
    },
} as unknown as FastifyReplyTest;

export interface AuthData {
    token: string;
    users: User[];
}

/**
 * Récupère les utilisateurs et génère un token d'authentification
 * @param app - L'instance de l'application Fastify
 * @param ChooseUser - Le type d'utilisateur à connecter : 0 = admin, 1 = sdr
 * @returns Promise<AuthData> - Les données d'authentification avec le token et les utilisateurs
 */
export const getUsersAndToken = async (app: any, ChooseUser: number = 0): Promise<AuthData> => {
    let users: User[] = [];
    const usersAlreadyExist = await prisma.user.findMany({});
    const adminExists = usersAlreadyExist.some(user => user.email === 'kilian@cashflowpositif.fr');
    const sdrExists = usersAlreadyExist.some(user => user.email === 'sdr@app.com');

    if (adminExists && sdrExists) {
        users = usersAlreadyExist;
    } else {
        const autopilots = await seedAutopilots();
        const addresses = await seedAdresses();
        users = await seedUsers(addresses, autopilots);
    }
    let response;

    switch (ChooseUser) {
        case 0:
            response = await app.inject({
                method: 'POST',
                url: '/api/auth/login',
                body: {
                    email: 'kilian@cashflowpositif.fr',
                    password: 'adminPassword',
                },
            });
            break;
        case 1:
            response = await app.inject({
                method: 'POST',
                url: '/api/auth/login',
                body: {
                    email: 'sdr@app.com',
                    password: 'adminPassword',
                },
            });
            break;
        default:
            throw new Error(`Type d'utilisateur non reconnu: ${ChooseUser}. Utilisez 0 pour admin ou 1 pour sdr.`);
    }

    //TODO: Typer la réponse
    const responseData = response.json();

    return {
        token: responseData.accessToken,
        users,
    };
};
