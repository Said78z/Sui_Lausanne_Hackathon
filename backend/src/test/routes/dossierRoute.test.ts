import { cleanDatabase, seedFakerDossiers } from '@/helpers';

import { afterAll, beforeAll, beforeEach, expect, jest, test } from '@jest/globals';
import { SendMandat, YousignDocument, YousignDocumentDto } from '@shared/dto';
import { MandateTemplate } from '@shared/enums';

import { dossierService } from '@/services/dossierService';

import { mockYousignDocument } from '../mocks';
import { disconnectPrisma, getUsersAndToken } from '../prismaTestUtils';
import { getApp, resetApp } from '../setup';
import { authHeaders, expectToMatchSchema } from '../utils/testUtils';

let authToken: string;
let entityId: string;
let users: any[];
let app: any;

const sendMandatBody: SendMandat = {
    template: MandateTemplate.EXCLUSIVE_SEARCH_WARRANT_ONE_PERSON,
};

async function setupTestData() {
    app = await getApp();
    await cleanDatabase();
    const { token, users: seededUsers } = await getUsersAndToken(app);
    authToken = token;
    users = seededUsers;

    // Créer les données nécessaires pour les tests
    const seededDossier = await seedFakerDossiers(users);
    entityId = seededDossier[0].id; // Sauvegarder l'ID du premier dossier
}

beforeAll(async () => {
    jest.spyOn(dossierService, 'sendMandat').mockResolvedValue(mockYousignDocument);
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

test('should get all dossiers', async () => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/dossiers',
        headers: authHeaders(authToken),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual('Dossiers récupérés avec succès');
    expect(response.json().data).toBeDefined();
    expect(Array.isArray(response.json().data)).toBe(true);
});

test('should get dossier by id', async () => {
    const response = await app.inject({
        method: 'GET',
        url: `/api/dossiers/${entityId}`,
        headers: authHeaders(authToken),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual('Dossier récupéré avec succès');
});

test('should send mandat for a dossier', async () => {
    const response = await app.inject({
        method: 'POST',
        url: `/api/dossiers/${entityId}/send-mandat`,
        headers: authHeaders(authToken),
        body: sendMandatBody,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual('Le mandat a bien été envoyé avec succès.');
    expect(response.json().data).toBeDefined();
    expectToMatchSchema(response.json().data, YousignDocument);
});

test('should fail to send mandat with invalid template', async () => {
    const response = await app.inject({
        method: 'POST',
        url: `/api/dossiers/${entityId}/send-mandat`,
        headers: authHeaders(authToken),
        body: {
            template: 'invalid_template',
        },
    });

    expect(response.statusCode).toBe(400);
});
