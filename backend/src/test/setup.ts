import { buildApp } from '@/index';
import { logger } from '@/utils/logger';

import { afterAll, afterEach, beforeAll } from '@jest/globals';
import dotenv from 'dotenv';

import prisma from '@/config/prisma';

// Charger explicitement les variables d'environnement de test
dotenv.config({ path: '.env.test' });

// Variable pour stocker l'application
let app: any = null;

// Fonction pour obtenir l'instance de l'application
export const getApp = async () => {
    if (!app) {
        app = await buildApp();
    }
    return app;
};

// Fonction pour réinitialiser l'application
export const resetApp = async () => {
    if (app) {
        await app.close();
        app = null;
    }
    return getApp();
};

beforeAll(async () => {
    // Vérifier que nous sommes bien en environnement de test
    if (process.env.NODE_ENV !== 'test') {
        throw new Error('Les tests doivent être exécutés avec NODE_ENV=test');
    }

    // Vérifier que nous utilisons bien la base de données de test
    if (!process.env.DATABASE_URL?.includes('SUI_test')) {
        throw new Error('Les tests doivent utiliser la base de données de test');
    }

    logger.info('Utilisation de la base de données:', process.env.DATABASE_URL);
    logger.info('Schéma de base de données de test créé');
});

afterEach(async () => {
    // Réinitialiser l'application après chaque test
    await resetApp();
}, 30000);

afterAll(async () => {
    // Fermer la connexion Prisma à la fin de tous les tests
    logger.info('Fermeture de la connexion à la base de données...');
    await prisma.$disconnect();
    if (app) {
        await app.close();
    }
});
