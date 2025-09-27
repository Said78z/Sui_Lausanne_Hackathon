import {
    cleanDatabase,
} from '@/helpers';
import { prospectingQueueRepository, prospectRepository } from '@/repositories';

import { afterAll, beforeAll, beforeEach, describe, expect, jest, test } from '@jest/globals';

import { seedApplicationParameters, seedFakerEmployees, seedFakerProspectingQueues, seedFakerProspects } from '@/helpers';
import { disconnectPrisma, getUsersAndToken } from '../prismaTestUtils';
import { getApp, resetApp } from '../setup';
import { authHeaders, expectToMatchSchema } from '../utils/testUtils';
import { mockProspectingQueue, mockProspectingQueueList } from '../mocks/prospectingQueueMock';
import { prospectingQueueSchema } from '@shared/dto';
import { testUnauthorizedRoutes } from '../utils';

let authToken: string;
let testProspectingQueueId: string;
let testProspectId: string;
let testLockedBySdrId: string;
let app: any;
const lockExpiration24 = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // +24h
const lockExpiration48 = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // +48h

function getProspectingQueuePostBody(): any {
    const prospectingQueuePostBody = {
        prospectId: testProspectId,
        lockedBySdrId: testLockedBySdrId,
        lockExpiration: lockExpiration24,
    };
    return prospectingQueuePostBody;
}

function getProspectingQueuePatchBody() {
    return {
        lockExpiration: lockExpiration48,
    };
}

async function setupTestData() {
    app = await getApp();
    await cleanDatabase();
    const { token, users } = await getUsersAndToken(app);
    const employees = await seedFakerEmployees(users);
    const prospects = await seedFakerProspects(employees);
    const prospectingQueues = await seedFakerProspectingQueues(prospects, employees);
    await seedApplicationParameters();

    authToken = token;
    testProspectId = prospects[0].id;
    testLockedBySdrId = users[1].id;
    testProspectingQueueId = prospectingQueues[0].id;
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
    test('should create a prospecting queue', async () => {
        jest.spyOn(prospectingQueueRepository, 'create').mockResolvedValue(mockProspectingQueue);
        jest.spyOn(prospectingQueueRepository, 'findBy').mockResolvedValue(null); // Pas de conflit

        const response = await app.inject({
            method: 'POST',
            url: `/api/prospecting-queues`,
            headers: authHeaders(authToken),
            body: getProspectingQueuePostBody(),
        });

        expect(response.statusCode).toBe(201);
        expect(response.json().message).toEqual('File de prospection créée avec succès');
        expect(response.json().data).toBeDefined();

        expect(prospectingQueueRepository.create).toHaveBeenCalledWith(
            getProspectingQueuePostBody()
        );
    });

    test('should get all prospecting queues', async () => {
        jest.spyOn(prospectingQueueRepository, 'findAll').mockResolvedValue({
            data: mockProspectingQueueList,
            pagination: {
                currentPage: 1,
                totalPages: 1,
                totalItems: mockProspectingQueueList.length,
                nextPage: 1,
                previousPage: 1,
                perPage: 10,
            },
        });

        const response = await app.inject({
            method: 'GET',
            url: '/api/prospecting-queues',
            headers: authHeaders(authToken),
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().message).toEqual('Files de prospection récupérées avec succès');
        expect(response.json().data).toBeDefined();
    });

    test('should get prospecting queue by id', async () => {
        jest.spyOn(prospectingQueueRepository, 'findBy').mockResolvedValue(mockProspectingQueue);

        const response = await app.inject({
            method: 'GET',
            url: `/api/prospecting-queues/${testProspectingQueueId}`,
            headers: authHeaders(authToken),
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().message).toEqual('File de prospection récupérée avec succès');
        expect(response.json().data).toBeDefined();
        expectToMatchSchema(response.json().data, prospectingQueueSchema);
    });

    test('should update a prospecting queue', async () => {
        jest.spyOn(prospectingQueueRepository, 'findBy').mockResolvedValue(mockProspectingQueue);
        jest.spyOn(prospectingQueueRepository, 'update').mockResolvedValue(mockProspectingQueue);

        const response = await app.inject({
            method: 'PATCH',
            url: `/api/prospecting-queues/${testProspectingQueueId}`,
            headers: authHeaders(authToken),
            body: getProspectingQueuePatchBody(),
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().message).toEqual('File de prospection mise à jour avec succès');
        expectToMatchSchema(response.json().data, prospectingQueueSchema);
    });

    test('should delete a prospecting queue', async () => {
        jest.spyOn(prospectingQueueRepository, 'findBy').mockResolvedValue(mockProspectingQueue);
        jest.spyOn(prospectingQueueRepository, 'delete').mockResolvedValue(mockProspectingQueue);

        const response = await app.inject({
            method: 'DELETE',
            url: `/api/prospecting-queues/${testProspectingQueueId}`,
            headers: authHeaders(authToken),
        });

        expect(response.statusCode).toBe(204);
    });

    test('should handle conflict when creating duplicate prospecting queue', async () => {
        jest.spyOn(prospectingQueueRepository, 'findBy').mockResolvedValue(mockProspectingQueue); // Déjà existant

        const response = await app.inject({
            method: 'POST',
            url: `/api/prospecting-queues`,
            headers: authHeaders(authToken),
            body: getProspectingQueuePostBody(),
        });

        expect(response.statusCode).toBe(409);
        expect(response.json().message).toEqual('Ce prospect est déjà dans la file de prospection');
    });

    test('should not create automatic queues for admin users', async () => {
        // Supprimer toutes les files existantes
        await prospectingQueueRepository.deleteMany({});
        
        const prospects = await prospectRepository.findAll({});
        expect(prospects.data.length).toBeGreaterThan(3);

        // Appeler getAllProspectingQueues avec un token admin
        const response = await app.inject({
            method: 'GET',
            url: '/api/prospecting-queues',
            headers: authHeaders(authToken), // Token admin
        });

        expect(response.statusCode).toBe(200);

        // Vérifier qu'il n'y a toujours qu'une seule file (pas de création automatique pour les admins)
        const finalQueues = await prospectingQueueRepository.findAll({});
        expect(finalQueues.data.length).toBe(0);
    });
});

// Tests d'authentification
describe('Unauthorized routes', () => {
    testUnauthorizedRoutes(app, {
        baseUrl: '/api/prospecting-queues',
        bodyFor: {
            POST: () => getProspectingQueuePostBody(),
            PATCH: () => getProspectingQueuePatchBody(),
        },
        setupTestData: async () => {
            await setupTestData();
            return { entityId: testProspectingQueueId || 'test-id' };
        },
    });
});

// // TEST Complet sans mock
describe('Tests CRUD complets sans mocks', () => {
    test('should create a prospecting queue without mock', async () => {
        await prospectingQueueRepository.deleteByProspectId(testProspectId);

        const response = await app.inject({
            method: 'POST',
            url: '/api/prospecting-queues',
            headers: authHeaders(authToken),
            body: getProspectingQueuePostBody(),
        });

        expect(response.statusCode).toBe(201);
        expect(response.json().message).toEqual('File de prospection créée avec succès');
        expect(response.json().data).toBeDefined();
        expectToMatchSchema(response.json().data, prospectingQueueSchema);
        expect(response.json().data).toMatchObject(expect.objectContaining({
            prospectId: testProspectId,
            lockedBySdrId: testLockedBySdrId,
        }));

        testProspectingQueueId = response.json().data.id;
    });

    test('should get all prospecting queues without mock', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/prospecting-queues',
            headers: authHeaders(authToken),
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().message).toEqual('Files de prospection récupérées avec succès');
        expect(response.json().data).toBeDefined();
        expect(Array.isArray(response.json().data)).toBe(true);
        expect(response.json().data.length).toBeGreaterThan(0);
        expectToMatchSchema(response.json().data[0], prospectingQueueSchema);

        // Vérifier que la file créée précédemment est dans la liste
        const createdQueue = response.json().data.find((queue: any) => queue.id === testProspectingQueueId);
        expect(createdQueue).toBeDefined();
        expect(createdQueue).toMatchObject(expect.objectContaining({
            prospectId: testProspectId,
            lockedBySdrId: testLockedBySdrId,
        }));
    });

    test('should get prospecting queue by id without mock', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/prospecting-queues/${testProspectingQueueId}`,
            headers: authHeaders(authToken),
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().message).toEqual('File de prospection récupérée avec succès');
        expect(response.json().data).toBeDefined();
        expectToMatchSchema(response.json().data, prospectingQueueSchema);
        expect(response.json().data).toMatchObject(expect.objectContaining({
            prospectId: testProspectId,
            lockedBySdrId: testLockedBySdrId,
        }));
    });

    test('should update a prospecting queue without mock', async () => {
        const response = await app.inject({
            method: 'PATCH',
            url: `/api/prospecting-queues/${testProspectingQueueId}`,
            headers: authHeaders(authToken),
            body: getProspectingQueuePatchBody(),
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().message).toEqual('File de prospection mise à jour avec succès');
        expect(response.json().data).toBeDefined();
        expectToMatchSchema(response.json().data, prospectingQueueSchema);
        expect(response.json().data).toMatchObject(expect.objectContaining({
            lockExpiration: getProspectingQueuePatchBody().lockExpiration,
        }));
    });

    test('should delete a prospecting queue without mock', async () => {
        const queue = await prospectingQueueRepository.findBy('id', testProspectingQueueId);
        expect(queue).toBeDefined();

        const response = await app.inject({
            method: 'DELETE',
            url: `/api/prospecting-queues/${testProspectingQueueId}`,
            headers: authHeaders(authToken),
        });

        expect(response.statusCode).toBe(204);

        const queueDeleted = await prospectingQueueRepository.findBy('id', testProspectingQueueId);
        expect(queueDeleted).toBeNull();
    });

    test('should handle pagination in get all prospecting queues', async () => {

        const response = await app.inject({
            method: 'GET',
            url: '/api/prospecting-queues?page=1&limit=3',
            headers: authHeaders(authToken),
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().data).toBeDefined();
        expect(response.json().data.length).toBeLessThanOrEqual(3);
        expect(response.json().pagination).toBeDefined();
    });

    test('should handle filtering by prospectId', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/prospecting-queues?prospectId=${testProspectId}`,
            headers: authHeaders(authToken),
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().data).toBeDefined();

        // Vérifier que toutes les files retournées ont le bon prospectId
        response.json().data.forEach((queue: any) => {
            expect(queue.prospectId).toBe(testProspectId);
        });
    });

    test('should handle filtering by lockedBySdrId', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/prospecting-queues?lockedBySdrId=${testLockedBySdrId}`,
            headers: authHeaders(authToken),
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().data).toBeDefined();

        // Vérifier que toutes les files retournées ont le bon SDR
        response.json().data.forEach((queue: any) => {
            expect(queue.lockedBySdrId).toBe(testLockedBySdrId);
        });
    });


    test('should handle not found prospecting queue', async () => {
        const nonExistentId = 'non-existent-id';

        const response = await app.inject({
            method: 'GET',
            url: `/api/prospecting-queues/${nonExistentId}`,
            headers: authHeaders(authToken),
        });

        expect(response.statusCode).toBe(404);
        expect(response.json().message).toEqual('File de prospection non trouvée');
    });
});

// Tests pour la création automatique des files de prospection
describe('Tests pour la création automatique des files de prospection', () => {
    let nonAdminToken: string;
    let nonAdminUserId: string;

    beforeEach(async () => {
        // Nettoyer toutes les files de prospection existantes
        await prospectingQueueRepository.deleteMany({});

        // Créer un utilisateur non-admin pour les tests
        const { token, users } = await getUsersAndToken(app, 1); // 1 = SDR
        const sdr = users.find(user => user.email === 'sdr@app.com');
        if (!sdr) {
            throw new Error('SDR not found');
        }
        nonAdminUserId = sdr.id;
        nonAdminToken = token;
    }, 30000);

    test('should automatically create missing prospecting queues for non-admin user with less than 3 prospects', async () => {

        // Vérifier qu'il n'y a qu'une seule file
        const initialQueues = await prospectingQueueRepository.findAll(
            { lockedBySdrId: nonAdminUserId },
        );
        expect(initialQueues.data.length).toBe(0);

        // Appeler getAllProspectingQueues
        const response = await app.inject({
            method: 'GET',
            url: '/api/prospecting-queues',
            headers: authHeaders(nonAdminToken),
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().message).toEqual('Files de prospection récupérées avec succès');

        // Vérifier qu'il y a maintenant 3 files (ou plus si des prospects sont disponibles)
        const finalQueues = await prospectingQueueRepository.findAll(
            { lockedBySdrId: nonAdminUserId },
        );

        // Le nombre devrait être au moins 3, ou le nombre de prospects disponibles si moins de 3
        expect(finalQueues.data.length).toBeGreaterThanOrEqual(1);

        // Vérifier que toutes les nouvelles files appartiennent à l'utilisateur
        finalQueues.data.forEach((queue: any) => {
            expect(queue.lockedBySdrId).toBe(nonAdminUserId);
        });
    });

    // test('should not create additional queues when non-admin user already has 3 or more prospects', async () => {
    //     // Supprimer toutes les files existantes pour cet utilisateur
    //     await prospectingQueueRepository.deleteMany({
    //        lockedBySdrId: nonAdminUserId 
    //     });

    //     // Créer exactement 3 files pour cet utilisateur
    //     const prospects = await seedFakerProspects([]);
    //     await Promise.all(
    //         prospects.slice(0, 3).map(prospect =>
    //             prospectingQueueRepository.create({
    //                 prospectId: prospect.id,
    //                 lockedBySdrId: nonAdminUserId,
    //                 lockExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    //             })
    //         )
    //     );

    //     // Vérifier qu'il y a exactement 3 files
    //     const initialQueues = await prospectingQueueRepository.findAll(
    //         { lockedBySdrId: nonAdminUserId },
    //     );
    //     expect(initialQueues.data.length).toBe(3);

    //     // Appeler getAllProspectingQueues
    //     const response = await app.inject({
    //         method: 'GET',
    //         url: '/api/prospecting-queues',
    //         headers: authHeaders(nonAdminToken),
    //     });

    //     expect(response.statusCode).toBe(200);

    //     // Vérifier qu'il y a toujours exactement 3 files (pas de création supplémentaire)
    //     const finalQueues = await prospectingQueueRepository.findAll(
    //         { lockedBySdrId: nonAdminUserId },
    //     );
    //     expect(finalQueues.data.length).toBe(3);
    // });

    // test('should handle case when there are not enough available prospects', async () => {
    //     // Supprimer toutes les files existantes pour cet utilisateur
    //     await prospectingQueueRepository.deleteMany({
    //       lockedBySdrId: nonAdminUserId 
    //     });

    //     // Supprimer tous les prospects disponibles
    //     await prospectRepository.deleteMany({});
    //     const prospects = await seedFakerProspects([], 1);
    //     testProspectId = prospects[0].id;
    //     // Créer seulement 1 file pour cet utilisateur
    //     await prospectingQueueRepository.create({
    //         prospectId: testProspectId,
    //         lockedBySdrId: nonAdminUserId,
    //         lockExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    //     });

    //     // Vérifier qu'il n'y a qu'une seule file
    //     const initialQueues = await prospectingQueueRepository.findAll(
    //         { lockedBySdrId: nonAdminUserId },
    //     );
    //     expect(initialQueues.data.length).toBe(1);

    //     // Appeler getAllProspectingQueues
    //     const response = await app.inject({
    //         method: 'GET',
    //         url: '/api/prospecting-queues',
    //         headers: authHeaders(nonAdminToken),
    //     });

    //     expect(response.statusCode).toBe(200);
    //     expect(response.json().message).toEqual('Files de prospection récupérées avec succès');

    //     // Vérifier qu'il n'y a toujours qu'une seule file (pas de prospects disponibles)
    //     const finalQueues = await prospectingQueueRepository.findAll(
    //         { lockedBySdrId: nonAdminUserId },
    //     );
    //     expect(finalQueues.data.length).toBe(1);
    // });
}); 