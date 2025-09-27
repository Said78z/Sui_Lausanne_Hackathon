import { cleanDatabase, seedApplicationParameters } from '@/helpers';

import { afterAll, beforeAll, beforeEach, describe, expect, test } from '@jest/globals';
import { ApplicationParameter, UpdateApplicationParameter } from '@shared/dto';
import 'module-alias/register';

import prisma from '@/config/prisma';

import { disconnectPrisma, getUsersAndToken } from '../prismaTestUtils';
import { getApp, resetApp } from '../setup';
import { testUnauthorizedRoutes } from '../utils/test401';
import { authHeaders, expectToMatchSchema } from '../utils/testUtils';

let authToken: string;
let entityId: string;
let users: any[];
let app: any;
const newValue = 'updated_value';

const applicationParameterPostBody = () => ({
    name: 'TEST_PARAMETER',
    value: 'test_value',
    createdBy: users[0].id,
    updatedBy: users[0].id,
});

const applicationParameterPatchBody = (): UpdateApplicationParameter => ({
    value: newValue,
});

async function setupTestData() {
    await cleanDatabase();
    app = await getApp();
    const { token, users: seededUsers } = await getUsersAndToken(app);
    authToken = token;
    users = seededUsers;

    // Supprimer toutes les données existantes créé lors du init de l'app
    await prisma.applicationParameter.deleteMany();

    // Créer les données nécessaires pour les tests
    const parameters = await seedApplicationParameters();
    entityId = parameters[0].id; //
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

test('should get all parameters', async () => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/application-parameters',
        headers: authHeaders(authToken),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual('Paramètres récupérés avec succès');
    expect(response.json().data).toBeDefined();
    expect(typeof response.json().data).toBe('object');
    expect(Object.keys(response.json().data).length).toBeGreaterThan(0);

    // Vérifier la structure d'un paramètre
    const firstParameter = Object.values(response.json().data)[0];
    expectToMatchSchema(firstParameter, ApplicationParameter);
});

test('should create a parameter', async () => {
    const response = await app.inject({
        method: 'POST',
        url: '/api/application-parameters',
        headers: authHeaders(authToken),
        body: applicationParameterPostBody(),
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().message).toEqual('Paramètre créé avec succès');

    // Vérification en base de données
    const createdParameter = await prisma.applicationParameter.findUnique({
        where: { id: response.json().data.id },
    });

    expect(createdParameter).toBeDefined();
    expect(createdParameter?.name).toBe('TEST_PARAMETER');
    expect(createdParameter?.value).toBe('test_value');
});

test('should get parameter by id', async () => {
    const response = await app.inject({
        method: 'GET',
        url: `/api/application-parameters/${entityId}`,
        headers: authHeaders(authToken),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual('Paramètre récupéré avec succès');
    expect(response.json().data.id).toBe(entityId);
});

test('should update a parameter', async () => {
    // Vérification avant la mise à jour
    const parameterBeforeUpdate = await prisma.applicationParameter.findUnique({
        where: { id: entityId },
    });
    expect(parameterBeforeUpdate).toBeDefined();

    const response = await app.inject({
        method: 'PATCH',
        url: `/api/application-parameters/${entityId}`,
        headers: authHeaders(authToken),
        body: applicationParameterPatchBody(),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual('Paramètre mis à jour avec succès');

    // Vérification après la mise à jour
    const updatedParameter = await prisma.applicationParameter.findUnique({
        where: { id: entityId },
    });

    expect(updatedParameter).toBeDefined();
    expect(updatedParameter?.value).toBe(newValue);
});

test('should delete a parameter', async () => {
    // Vérification avant la suppression
    const parameterBeforeDelete = await prisma.applicationParameter.findUnique({
        where: { id: entityId },
    });
    expect(parameterBeforeDelete).toBeDefined();

    const response = await app.inject({
        method: 'DELETE',
        url: `/api/application-parameters/${entityId}`,
        headers: authHeaders(authToken),
    });

    expect(response.statusCode).toBe(204);

    // Vérification après la suppression
    const parameterAfterDelete = await prisma.applicationParameter.findUnique({
        where: { id: entityId },
    });
    expect(parameterAfterDelete).toBeNull();
});

// Test d'authentification
describe('Unauthorized routes', () => {
    testUnauthorizedRoutes(app, {
        baseUrl: '/api/application-parameters',
        bodyFor: {
            POST: () => applicationParameterPostBody(),
            PATCH: () => applicationParameterPatchBody(),
        },
        setupTestData: async () => {
            await setupTestData();
            return { entityId };
        },
    });
});
