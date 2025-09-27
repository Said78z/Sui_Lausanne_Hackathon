import {
    cleanDatabase,
} from '@/helpers';
import { callRepository } from '@/repositories';

import { afterAll, beforeAll, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { callEnumsSchema, callSchema, callStatSchema, callWithRelationsSchema, CreateCallSchema } from '@shared/dto';
import { CallResult, CallStatus } from '@shared/enums';

import { seedFakerCalls, seedFakerEmployees, seedFakerProspects } from '@/helpers';
import { mockCall, mockCallList, mockCallStats } from '../mocks/callMock';
import { disconnectPrisma, getUsersAndToken } from '../prismaTestUtils';
import { getApp, resetApp } from '../setup';
import { testUnauthorizedRoutes } from '../utils/test401';
import { authHeaders, expectToMatchSchema, omit } from '../utils/testUtils';

let authToken: string;
let testCallId: string;
let testProspectId: string;
let testCalledById: string;
let app: any;
const DateNow = new Date().toISOString();

function getCallPostBody(): CreateCallSchema {
    const callPostBody: CreateCallSchema = {
        status: CallStatus.ANSWERED,
        calledAt: DateNow,
        callResult: CallResult.CALLBACK_TODAY,
        notes: 'Test call notes',
        duration: 180,
        prospect: testProspectId,
        calledBy: testCalledById,
    };
    return callPostBody;
}

function getCallPatchBody() {
    return {
        status: CallStatus.ABSENT,
        callResult: CallResult.NO_ANSWER,
        notes: 'Updated call notes',
        duration: 120,
    };
}

async function setupTestData() {
    app = await getApp();
    await cleanDatabase();
    const { token, users } = await getUsersAndToken(app);
    const employees = await seedFakerEmployees(users);
    const prospects = await seedFakerProspects(employees);
    const calls = await seedFakerCalls(prospects, employees);

    authToken = token;
    testCallId = calls[0].id;

    // Créer des utilisateurs de test pour prospect et SDR
    testProspectId = prospects[0].id;
    testCalledById = users[1].id;
}

beforeAll(async () => {

    await setupTestData();
}, 30000);

// Réinitialiser l'application avant chaque test
beforeEach(async () => {
    app = await resetApp();
    jest.clearAllMocks();
    jest.restoreAllMocks();
}, 30000);

afterAll(async () => {
    jest.restoreAllMocks();
    await disconnectPrisma();
    if (app) {
        await app.close();
    }
}, 30000);

describe('Tests CRUD complets avec mocks', () => {
    // Tests existants
    test('should create a call', async () => {
        jest.spyOn(callRepository, 'createCall').mockResolvedValue(mockCall);

        const response = await app.inject({
            method: 'POST',
            url: `/api/calls`,
            headers: authHeaders(authToken),
            body: getCallPostBody(),
        });

        expect(response.statusCode).toBe(201);
        expect(response.json().message).toEqual('Appel créé avec succès');
        expect(response.json().data).toBeDefined();

        expect(callRepository.createCall).toHaveBeenCalledWith(
            getCallPostBody()
        );
    });

    // Nouveaux tests
    test('should get all calls', async () => {
        jest.spyOn(callRepository, 'findAll').mockResolvedValue({
            data: mockCallList,
            pagination: {
                currentPage: 1,
                totalPages: 1,
                totalItems: mockCallList.length,
                nextPage: 1,
                previousPage: 1,
                perPage: 10,
            },
        });
        const response = await app.inject({
            method: 'GET',
            url: '/api/calls',
            headers: authHeaders(authToken),
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().message).toEqual('Appels récupérés avec succès');
        expect(response.json().data).toBeDefined();
    });

    test('should get call by id', async () => {
        jest.spyOn(callRepository, 'findByIdWithRelations').mockResolvedValue(mockCall);
        const response = await app.inject({
            method: 'GET',
            url: `/api/calls/${testCallId}`,
            headers: authHeaders(authToken),
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().message).toEqual('Appel récupéré avec succès');
        expect(response.json().data).toBeDefined();
        expectToMatchSchema(response.json().data, callWithRelationsSchema);
    });

    test('should update a call', async () => {
        jest.spyOn(callRepository, 'updateCall').mockResolvedValue(mockCall);
        const response = await app.inject({
            method: 'PATCH',
            url: `/api/calls/${testCallId}`,
            headers: authHeaders(authToken),
            body: getCallPatchBody(),
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().message).toEqual('Appel mis à jour avec succès');
        expectToMatchSchema(response.json().data, callWithRelationsSchema);
    });

    test('should delete a call', async () => {
        jest.spyOn(callRepository, 'deleteCall').mockResolvedValue();
        const response = await app.inject({
            method: 'DELETE',
            url: `/api/calls/${testCallId}`,
            headers: authHeaders(authToken),
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().message).toEqual('Appel supprimé avec succès');
    });

    test('should get call stats', async () => {
        jest.spyOn(callRepository, 'getCallStats').mockResolvedValue(mockCallStats);
        const response = await app.inject({
            method: 'GET',
            url: '/api/calls/stats',
            headers: authHeaders(authToken),
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().message).toEqual('Statistiques d\'appels récupérées avec succès');
        expect(response.json().data).toBeDefined();
        expectToMatchSchema(response.json().data, callStatSchema);
    });

    test('should get call enums', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/calls/enums',
            headers: authHeaders(authToken),
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().message).toEqual('Enums récupérés avec succès');
        expect(response.json().data).toBeDefined();
        expect(response.json().data.callStatus).toBeDefined();
        expect(response.json().data.callResult).toBeDefined();
        expectToMatchSchema(response.json().data, callEnumsSchema);
    });
})

// Tests d'authentification
describe('Unauthorized routes', () => {
    testUnauthorizedRoutes(app, {
        baseUrl: '/api/calls',
        bodyFor: {
            POST: () => getCallPostBody(),
            PATCH: () => getCallPatchBody(),
        },
        setupTestData: async () => {
            await setupTestData();
            return { entityId: testCallId };
        },
    });
});

// TEST Complet sans mock

describe('Tests CRUD complets sans mocks', () => {

    test('should create a call without mock', async () => {

        const response = await app.inject({
            method: 'POST',
            url: '/api/calls',
            headers: authHeaders(authToken),
            body: getCallPostBody(),
        });

        expect(response.statusCode).toBe(201);
        expect(response.json().message).toEqual('Appel créé avec succès');
        expect(response.json().data).toBeDefined();
        expectToMatchSchema(response.json().data, callWithRelationsSchema);
        expect(response.json().data).toMatchObject(expect.objectContaining(omit(getCallPostBody(), ['prospect', 'calledBy'])));


        testCallId = response.json().data.id;
    });

    test('should get all calls without mock', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/calls',
            headers: authHeaders(authToken),
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().message).toEqual('Appels récupérés avec succès');
        expect(response.json().data).toBeDefined();
        expect(Array.isArray(response.json().data)).toBe(true);
        expect(response.json().data.length).toBeGreaterThan(0);
        expectToMatchSchema(response.json().data[0], callSchema);

        // Vérifier que l'appel créé précédemment est dans la liste
        const createdCall = response.json().data.find((call: any) => call.id === testCallId);
        expect(createdCall).toBeDefined();
        expect(createdCall).toMatchObject(expect.objectContaining(omit(getCallPostBody(), ['prospect', 'calledBy'])));

    });

    test('should get call by id without mock', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/calls/${testCallId}`,
            headers: authHeaders(authToken),
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().message).toEqual('Appel récupéré avec succès');
        expect(response.json().data).toBeDefined();
        expectToMatchSchema(response.json().data, callWithRelationsSchema);
        expect(response.json().data).toMatchObject(expect.objectContaining(omit(getCallPostBody(), ['prospect', 'calledBy'])));
    });

    test('should update a call without mock', async () => {

        const response = await app.inject({
            method: 'PATCH',
            url: `/api/calls/${testCallId}`,
            headers: authHeaders(authToken),
            body: getCallPatchBody(),
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().message).toEqual('Appel mis à jour avec succès');
        expect(response.json().data).toBeDefined();
        expectToMatchSchema(response.json().data, callWithRelationsSchema);
        expect(response.json().data).toMatchObject(expect.objectContaining(getCallPatchBody()));
    });


    test('should get call stats without mock', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/calls/stats',
            headers: authHeaders(authToken),
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().message).toEqual('Statistiques d\'appels récupérées avec succès');
        expect(response.json().data).toBeDefined();
        expectToMatchSchema(response.json().data, callStatSchema);
    });

    test('should delete a call without mock', async () => {

        const call = await callRepository.findById(testCallId);
        expect(call).toBeDefined();
        const response = await app.inject({
            method: 'DELETE',
            url: `/api/calls/${testCallId}`,
            headers: authHeaders(authToken),
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().message).toEqual('Appel supprimé avec succès');

        const callDeleted = await callRepository.findById(testCallId);
        expect(callDeleted).toBeNull();
    });

    test('should handle pagination in get all calls', async () => {
        // Tester la pagination
        const response = await app.inject({
            method: 'GET',
            url: '/api/calls?page=1&limit=3',
            headers: authHeaders(authToken),
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().data).toBeDefined();
        expect(response.json().data.length).toBeLessThanOrEqual(3);
    });

    test('should handle filtering calls by status', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/calls?status=${CallStatus.ANSWERED}`,
            headers: authHeaders(authToken),
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().data).toBeDefined();

        // Vérifier que tous les appels retournés ont le bon statut
        response.json().data.forEach((call: any) => {
            expect(call.status).toBe(CallStatus.ANSWERED);
        });
    });

    test('should handle filtering calls by date range', async () => {
        const today = new Date().toISOString().split('T')[0];
        const response = await app.inject({
            method: 'GET',
            url: `/api/calls?startDate=${today}&endDate=${today}`,
            headers: authHeaders(authToken),
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().data).toBeDefined();
    });
});
