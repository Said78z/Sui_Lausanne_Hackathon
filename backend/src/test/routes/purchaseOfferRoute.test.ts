import {
    cleanDatabase,
    seedAdresses,
    seedFakerDossiers,
    seedFakerPurchaseOffers,
    seedGeography,
    seedOpportunitiesWithNotesAndAdresses,
} from '@/helpers';
import { purchaseOfferService } from '@/services';

import { afterAll, beforeAll, beforeEach, describe, expect, jest, test } from '@jest/globals';
import {
    CreatePurchaseOffer,
    PurchaseOffer,
    PurchaseOfferList,
    ResponseUpdatePurchaseOffer,
} from '@shared/dto';

import { mockPurchaseOffer } from '../mocks/purchaseOfferMock';
import { disconnectPrisma, getUsersAndToken } from '../prismaTestUtils';
import { getApp, resetApp } from '../setup';
import { testUnauthorizedRoutes } from '../utils/test401';
import { authHeaders, expectToMatchSchema } from '../utils/testUtils';

let authToken: string;
let testOpportunityId: string;
let testDossierId: string;
let testPurchaseOfferId: string;
let users: any[];
let app: any;

function getPurchaseOfferPostBody(): CreatePurchaseOffer {
    const purchaseOfferPostBody: CreatePurchaseOffer = {
        dossierId: testDossierId,
        opportunityId: testOpportunityId,
        // TODO: Ajouter la possibilité de créer une note a la création de l'offre d'achat
        // note: [
        //     {
        //         title: 'Test note',
        //         content: 'Test note content',
        //     },
        // ],
    };
    return purchaseOfferPostBody;
}

function getPurchaseOfferPatchBody() {
    return {
        status: 'ACCEPTED',
    };
}

async function setupTestData() {
    app = await getApp();
    await cleanDatabase();
    const { token, users: seededUsers } = await getUsersAndToken(app);
    authToken = token;
    users = seededUsers;
    const seededDossier = await seedFakerDossiers(users);
    testDossierId = seededDossier[0].id;
    const geographyData = await seedGeography();
    const adresses = await seedAdresses();
    const seededOpportunity = await seedOpportunitiesWithNotesAndAdresses(
        geographyData.departments,
        [],
        adresses
    );
    testOpportunityId = seededOpportunity[0].id;
    // Créer une offre d'achat de test
    const purchaseOffer = await seedFakerPurchaseOffers(seededOpportunity, seededDossier);
    testPurchaseOfferId = purchaseOffer[0].id;
}

beforeAll(async () => {
    jest.spyOn(purchaseOfferService, 'createFromOpportunity').mockResolvedValue(mockPurchaseOffer);
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

// Tests existants
test('should create a purchase offer from opportunity', async () => {
    jest.spyOn(purchaseOfferService, 'createFromOpportunity').mockResolvedValue(mockPurchaseOffer);

    const response = await app.inject({
        method: 'POST',
        url: `/api/purchase-offers`,
        headers: authHeaders(authToken),
        body: getPurchaseOfferPostBody(),
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().message).toEqual("Offre d'achat créée avec succès");
    expect(response.json().data).toBeDefined();

    expect(purchaseOfferService.createFromOpportunity).toHaveBeenCalledWith(
        getPurchaseOfferPostBody()
    );
});

test('should return 400 when opportunity does not exist', async () => {
    const nonExistentOpportunityId = '';
    const response = await app.inject({
        method: 'POST',
        url: `/api/purchase-offers`,
        headers: authHeaders(authToken),
        body: {
            dossierId: 'f3e58dfa-8857-414d-befd-acb7c36bfceb',
            opportunityId: nonExistentOpportunityId,
        },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().message).toEqual('Invalid body data');
});

// Nouveaux tests
test('should get all purchase offers', async () => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/purchase-offers',
        headers: authHeaders(authToken),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual("Offres d'achat récupérées avec succès");
    expect(response.json().data).toBeDefined();

    // Vérifier la structure d'une offre d'achat
    if (response.json().data.length > 0) {
        expectToMatchSchema(response.json().data[0], PurchaseOfferList);
    }
});

test('should get purchase offer by id', async () => {
    const response = await app.inject({
        method: 'GET',
        url: `/api/purchase-offers/${testPurchaseOfferId}`,
        headers: authHeaders(authToken),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual("Offre d'achat récupérée avec succès");
    expect(response.json().data).toBeDefined();
    expectToMatchSchema(response.json().data, PurchaseOffer);
});

test('should update a purchase offer', async () => {
    const response = await app.inject({
        method: 'PATCH',
        url: `/api/purchase-offers/${testPurchaseOfferId}`,
        headers: authHeaders(authToken),
        body: getPurchaseOfferPatchBody(),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual("Offre d'achat mise à jour avec succès");
    expectToMatchSchema(response.json().data, ResponseUpdatePurchaseOffer);
});

test('should delete a purchase offer', async () => {
    const response = await app.inject({
        method: 'DELETE',
        url: `/api/purchase-offers/${testPurchaseOfferId}`,
        headers: authHeaders(authToken),
    });

    expect(response.statusCode).toBe(204);

    // Vérifier que l'offre a bien été supprimée
    const getResponse = await app.inject({
        method: 'GET',
        url: `/api/purchase-offers/${testPurchaseOfferId}`,
        headers: authHeaders(authToken),
    });

    expect(getResponse.statusCode).toBe(404);
});

// Tests d'authentification
describe('Unauthorized routes', () => {
    testUnauthorizedRoutes(app, {
        baseUrl: '/api/purchase-offers',
        bodyFor: {
            POST: () => getPurchaseOfferPostBody(),
            PATCH: () => getPurchaseOfferPatchBody(),
        },
        setupTestData: async () => {
            await setupTestData();
            return { entityId: testPurchaseOfferId };
        },
    });
});
