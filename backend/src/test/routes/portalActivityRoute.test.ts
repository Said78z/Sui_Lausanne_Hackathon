import { afterAll, beforeAll, beforeEach, describe, expect, test } from '@jest/globals';
import { CreatePortalActivity, PortalActivity, UpdatePortalActivity } from '@shared/dto';
import 'module-alias/register';

import { ActivityType } from '@/config/client';
import prisma from '@/config/prisma';

import { cleanDatabase, seedCities, seedGeography, seedPortalActivities } from '../../helpers';
import { disconnectPrisma, getUsersAndToken } from '../prismaTestUtils';
import { getApp, resetApp } from '../setup';
import { testUnauthorizedRoutes } from '../utils/test401';
import { authHeaders, expectToMatchSchema } from '../utils/testUtils';

let authToken: string;
let testCityId: string;
let entityId: string;
let users: any[];
let app: any;

// Variables communes pour les tests

const viewCityBody = (cityId: string): CreatePortalActivity => ({
    type: ActivityType.VIEW_CITY,
    cityId: cityId,
});

const likeBody = (cityId: string): UpdatePortalActivity => ({
    type: ActivityType.LIKE,
    cityId: cityId,
});

async function setupTestData() {
    await cleanDatabase();
    app = await getApp();
    const { token, users: seededUsers } = await getUsersAndToken(app);
    authToken = token;
    users = seededUsers;

    // Créer les données nécessaires pour les tests
    const geographyData = await seedGeography();
    const cities = await seedCities(geographyData);
    testCityId = cities[0].id; // Sauvegarder l'ID de la première ville
    const activities = await seedPortalActivities(cities, users);
    entityId = activities[0].id;
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

test('should get all portal activities', async () => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/portal-activities',
        headers: authHeaders(authToken),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual('Activités récupérées avec succès');
    expect(response.json().data).toBeDefined();

    // Vérifier la structure d'une activité
    const firstActivity = response.json().data[0];
    expectToMatchSchema(firstActivity, PortalActivity);
});

test('should create a portal activity', async () => {
    const response = await app.inject({
        method: 'POST',
        url: '/api/portal-activities',
        headers: authHeaders(authToken),
        body: viewCityBody(testCityId),
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().message).toEqual('Activité créée avec succès');
    expect(response.json().data).toHaveProperty('id');
    expect(response.json().data.type).toBe('VIEW_CITY');
    expect(response.json().data.cityId).toBe(testCityId);

    // Vérification en base de données
    const createdActivity = await prisma.portalActivity.findUnique({
        where: { id: response.json().data.id },
    });

    expect(createdActivity).toBeDefined();
    expect(createdActivity?.type).toBe('VIEW_CITY');
    expect(createdActivity?.cityId).toBe(testCityId);
    expect(createdActivity?.userId).toBe(users[0].id); // Vérifie que l'activité est liée au bon utilisateur
});

test('should get portal activity by id', async () => {
    const response = await app.inject({
        method: 'GET',
        url: `/api/portal-activities/${entityId}`,
        headers: authHeaders(authToken),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual('Activité récupérée avec succès');
    expect(response.json().data).toHaveProperty('id', entityId);
});

test('should update a portal activity', async () => {
    // Vérification avant la mise à jour
    const activityBeforeUpdate = await prisma.portalActivity.findUnique({
        where: { id: entityId },
    });
    expect(activityBeforeUpdate).toBeDefined();

    const response = await app.inject({
        method: 'PATCH',
        url: `/api/portal-activities/${entityId}`,
        headers: authHeaders(authToken),
        body: likeBody(testCityId),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual('Activité mise à jour avec succès');
    expect(response.json().data.type).toBe('LIKE');

    // Vérification après la mise à jour
    const updatedActivity = await prisma.portalActivity.findUnique({
        where: { id: entityId },
    });

    expect(updatedActivity).toBeDefined();
    expect(updatedActivity?.type).toBe('LIKE');
    expect(updatedActivity?.cityId).toBe(testCityId);
});

test('should delete a portal activity', async () => {
    // Vérification avant la suppression
    const activityBeforeDelete = await prisma.portalActivity.findUnique({
        where: { id: entityId },
    });
    expect(activityBeforeDelete).toBeDefined();

    const response = await app.inject({
        method: 'DELETE',
        url: `/api/portal-activities/${entityId}`,
        headers: authHeaders(authToken),
    });

    expect(response.statusCode).toBe(204);

    // Vérification après la suppression
    const activityAfterDelete = await prisma.portalActivity.findUnique({
        where: { id: entityId },
    });
    expect(activityAfterDelete).toBeNull();
});
// Test d'authentification
describe('Unauthorized routes', () => {
    testUnauthorizedRoutes(app, {
        baseUrl: '/api/portal-activities',
        bodyFor: {
            POST: () => viewCityBody(testCityId),
            PATCH: () => likeBody(testCityId),
        },
        setupTestData: async () => {
            await setupTestData();
            return { entityId };
        },
    });
});
