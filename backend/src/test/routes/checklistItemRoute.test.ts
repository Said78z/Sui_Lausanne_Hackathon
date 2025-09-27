import { cleanDatabase, seedChecklistItems } from '@/helpers';

import { afterAll, beforeAll, beforeEach, describe, expect, test } from '@jest/globals';
import { ChecklistItem } from '@shared/dto';
import 'module-alias/register';

import prisma from '@/config/prisma';

import { disconnectPrisma, getUsersAndToken } from '../prismaTestUtils';
import { getApp, resetApp } from '../setup';
import { testUnauthorizedRoutes } from '../utils/test401';
import { authHeaders, expectToMatchSchema, expectUnauthorizedResponse } from '../utils/testUtils';

let authToken: string;
let entityId: string;
let users: any[];
let app: any;

const newTitle = 'Titre mis à jour';
const newStatus = 'URGENT';

const checklistItemPostBody = () => ({
    title: 'Nouvelle tâche',
    description: 'Description de la nouvelle tâche',
    deadline: new Date('2024-12-31').toISOString(),
    status: 'EN_ATTENTE',
    createdBy: users[0].id,
    assignedTo: users[1].id,
});

const checklistItemPatchBody = () => ({
    title: newTitle,
    status: newStatus,
    isDone: true,
    checkedAt: new Date().toISOString(),
    checkedBy: users[0].id,
});

async function setupTestData() {
    await cleanDatabase();
    app = await getApp();
    const { token, users: seededUsers } = await getUsersAndToken(app);
    authToken = token;
    users = seededUsers;

    // Créer les données nécessaires pour les tests
    const items = await seedChecklistItems(users);
    entityId = items[0].id; // Sauvegarder l'ID du premier élément
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

test('should get all checklist items', async () => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/checklist-items',
        headers: authHeaders(authToken),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual('Éléments de la checklist récupérés avec succès');
    expect(response.json().data).toBeDefined();
    expect(typeof response.json().data).toBe('object');
    expect(Object.keys(response.json().data).length).toBeGreaterThan(0);

    // Vérifier la structure d'un élément
    const firstItem = Object.values(response.json().data)[0];
    expectToMatchSchema(firstItem, ChecklistItem);
});

test('should create a checklist item', async () => {
    const response = await app.inject({
        method: 'POST',
        url: '/api/checklist-items',
        headers: authHeaders(authToken),
        body: checklistItemPostBody(),
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().message).toEqual('Élément de la checklist créé avec succès');

    // Vérification en base de données
    const createdItem = await prisma.checklistItem.findUnique({
        where: { id: response.json().data.id },
    });

    expect(createdItem).toBeDefined();
    expect(createdItem?.title).toBe('Nouvelle tâche');
    expect(createdItem?.description).toBe('Description de la nouvelle tâche');
    expect(createdItem?.status).toBe('EN_ATTENTE');
    expect(createdItem?.createdBy).toBe(users[0].id);
    expect(createdItem?.assignedTo).toBe(users[1].id);
});

test('should get checklist item by id', async () => {
    const response = await app.inject({
        method: 'GET',
        url: `/api/checklist-items/${entityId}`,
        headers: authHeaders(authToken),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual('Élément de la checklist récupéré avec succès');
    expect(response.json().data.id).toBe(entityId);
});

test('should update a checklist item', async () => {
    // Vérification avant la mise à jour
    const itemBeforeUpdate = await prisma.checklistItem.findUnique({
        where: { id: entityId },
    });
    expect(itemBeforeUpdate).toBeDefined();

    const response = await app.inject({
        method: 'PATCH',
        url: `/api/checklist-items/${entityId}`,
        headers: authHeaders(authToken),
        body: checklistItemPatchBody(),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual('Élément de la checklist mis à jour avec succès');

    // Vérification après la mise à jour
    const updatedItem = await prisma.checklistItem.findUnique({
        where: { id: entityId },
    });

    expect(updatedItem).toBeDefined();
    expect(updatedItem?.title).toBe(newTitle);
    expect(updatedItem?.status).toBe(newStatus);
    expect(updatedItem?.isDone).toBe(true);
    expect(updatedItem?.checkedBy).toBe(users[0].id);
});

test('should delete a checklist item', async () => {
    // Vérification avant la suppression
    const itemBeforeDelete = await prisma.checklistItem.findUnique({
        where: { id: entityId },
    });
    expect(itemBeforeDelete).toBeDefined();

    const response = await app.inject({
        method: 'DELETE',
        url: `/api/checklist-items/${entityId}`,
        headers: authHeaders(authToken),
    });

    expect(response.statusCode).toBe(204);

    // Vérification après la suppression
    const itemAfterDelete = await prisma.checklistItem.findUnique({
        where: { id: entityId },
    });
    expect(itemAfterDelete?.deletedAt).not.toBeNull();
});

// Test d'authentification
describe('Unauthorized routes', () => {
    testUnauthorizedRoutes(app, {
        baseUrl: '/api/checklist-items',
        bodyFor: {
            POST: () => checklistItemPostBody(),
            PATCH: () => checklistItemPatchBody(),
        },
        setupTestData: async () => {
            await setupTestData();
            return { entityId };
        },
    });
});
