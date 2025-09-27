import { cleanDatabase, seedAlerts, seedCities, seedGeography } from '@/helpers';

import { afterAll, beforeAll, beforeEach, describe, expect, test } from '@jest/globals';
import { alertSchema } from '@shared/dto';
import 'module-alias/register';

import prisma from '@/config/prisma';

import { disconnectPrisma, getUsersAndToken } from '../prismaTestUtils';
import { getApp, resetApp } from '../setup';
import { testUnauthorizedRoutes } from '../utils/test401';
import { authHeaders, expectToMatchSchema } from '../utils/testUtils';

let authToken: string;
let testCityId: string;
let entityId: string;
let users: any[];
let app: any;

// Fonction utilitaire pour générer un nombre aléatoire entre min et max
const getRandomFloat = (min: number, max: number): number => {
    return Number((Math.random() * (max - min) + min).toFixed(2));
};

const randomMin = getRandomFloat(0, 1000);
const randomMax = getRandomFloat(randomMin + 1, 2000);

const alertPostBody = (cityId: string) => ({
    city_id: cityId,
    min: randomMin,
    max: randomMax,
});

const alertPatchBody = (cityId: string) => ({
    min: randomMin,
    max: randomMax,
});

async function setupTestData() {
    app = await getApp();
    await cleanDatabase();
    const { token, users: seededUsers } = await getUsersAndToken(app);
    authToken = token;
    users = seededUsers;

    // Créer les données nécessaires pour les tests
    const geographyData = await seedGeography();
    const cities = await seedCities(geographyData);
    testCityId = cities[0].id; // Sauvegarder l'ID de la première ville
    const alerts = await seedAlerts(cities, users);
    entityId = alerts[0].id; // Sauvegarder l'ID de la première alerte
}

beforeAll(async () => {
    await setupTestData();
}, 30000);

// Réinitialiser l'application avant chaque test
beforeEach(async () => {
    app = await resetApp();
}, 30000);

afterAll(async () => {
    await disconnectPrisma();
    if (app) {
        await app.close();
    }
}, 30000);

test('should get all alerts', async () => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/alerts',
        headers: authHeaders(authToken),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual('Alertes récupérées avec succès');
    expect(response.json().data).toBeDefined();
    expect(typeof response.json().data).toBe('object');
    expect(Object.keys(response.json().data).length).toBeGreaterThan(0);

    // Vérifier la structure d'une alerte
    const firstAlert = Object.values(response.json().data)[0];
    expectToMatchSchema(firstAlert, alertSchema);
});

test('should create an alert', async () => {
    const response = await app.inject({
        method: 'POST',
        url: '/api/alerts',
        headers: authHeaders(authToken),
        body: alertPostBody(testCityId),
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().message).toEqual('Alerte créée avec succès');

    // Vérification en base de données
    const createdAlert = await prisma.alert.findUnique({
        where: { id: response.json().data.id },
    });

    expect(createdAlert).toBeDefined();
    expect(createdAlert?.cityId).toBe(testCityId);
    expect(createdAlert?.min).toBe(randomMin);
    expect(createdAlert?.max).toBe(randomMax);
});

test('should get alert by id', async () => {
    const response = await app.inject({
        method: 'GET',
        url: `/api/alerts/${entityId}`,
        headers: authHeaders(authToken),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual('Alerte récupérée avec succès');
});

test('should update an alert', async () => {
    // Vérification avant la mise à jour
    const alertBeforeUpdate = await prisma.alert.findUnique({
        where: { id: entityId },
    });
    expect(alertBeforeUpdate).toBeDefined();

    const response = await app.inject({
        method: 'PATCH',
        url: `/api/alerts/${entityId}`,
        headers: authHeaders(authToken),
        body: alertPatchBody(testCityId),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual('Alerte mise à jour avec succès');

    // Vérification après la mise à jour
    const updatedAlert = await prisma.alert.findUnique({
        where: { id: entityId },
    });

    expect(updatedAlert).toBeDefined();
    expect(updatedAlert?.min).toBe(randomMin);
    expect(updatedAlert?.max).toBe(randomMax);
});

test('should delete an alert', async () => {
    // Vérification avant la suppression
    const alertBeforeDelete = await prisma.alert.findUnique({
        where: { id: entityId },
    });
    expect(alertBeforeDelete).toBeDefined();

    const response = await app.inject({
        method: 'DELETE',
        url: `/api/alerts/${entityId}`,
        headers: authHeaders(authToken),
    });

    expect(response.statusCode).toBe(204);

    // Vérification après la suppression
    const alertAfterDelete = await prisma.alert.findUnique({
        where: { id: entityId },
    });
    expect(alertAfterDelete).toBeNull();
});

// Test d'authentification
describe('Unauthorized routes', () => {
    testUnauthorizedRoutes(app, {
        baseUrl: '/api/alerts',
        bodyFor: {
            POST: () => alertPostBody(testCityId),
            PATCH: () => alertPatchBody(testCityId),
        },
        setupTestData: async () => {
            await setupTestData();
            return { entityId };
        },
    });
});
