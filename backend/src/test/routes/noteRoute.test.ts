import { cleanDatabase, seedFakerNotes } from '@/helpers';

import { afterAll, beforeAll, beforeEach, describe, expect, test } from '@jest/globals';
import 'module-alias/register';

import prisma from '@/config/prisma';

import { noteSchema } from '@shared/dto';
import { disconnectPrisma, getUsersAndToken } from '../prismaTestUtils';
import { getApp, resetApp } from '../setup';
import { testUnauthorizedRoutes } from '../utils/test401';
import { authHeaders, expectToMatchSchema } from '../utils/testUtils';

let authToken: string;
let entityId: string;
let users: any[];
let app: any;

const notePostBody = () => ({
    title: 'Nouvelle note de test',
    content: 'Contenu de la note de test',
});

const notePatchBody = () => ({
    title: 'Note mise à jour',
    content: 'Contenu mis à jour',
});

async function setupTestData() {
    await cleanDatabase();
    app = await getApp();
    const { token, users: seededUsers } = await getUsersAndToken(app);
    authToken = token;
    users = seededUsers;

    // Créer les données nécessaires pour les tests
    const notes = await seedFakerNotes(users);
    entityId = notes[0].id; // Sauvegarder l'ID de la première note
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

test('should get all notes', async () => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/notes',
        headers: authHeaders(authToken),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual('Notes récupérées avec succès');
    expect(response.json().data).toBeDefined();
    expect(typeof response.json().data).toBe('object');
    expect(Object.keys(response.json().data).length).toBeGreaterThan(0);

    // Vérifier la structure d'une note
    const firstNote = Object.values(response.json().data)[0];
    expectToMatchSchema(firstNote, noteSchema);
});

test('should create a note', async () => {
    const response = await app.inject({
        method: 'POST',
        url: '/api/notes',
        headers: authHeaders(authToken),
        body: notePostBody(),
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().message).toEqual('Note créée avec succès');

    // Vérification en base de données
    const createdNote = await prisma.note.findUnique({
        where: { id: response.json().data.id },
    });

    expect(createdNote).toBeDefined();
    expect(createdNote?.title).toBe('Nouvelle note de test');
    expect(createdNote?.content).toBe('Contenu de la note de test');
    expect(createdNote?.createdBy).toBe(users[0].id);
});

test('should get note by id', async () => {
    const response = await app.inject({
        method: 'GET',
        url: `/api/notes/${entityId}`,
        headers: authHeaders(authToken),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual('Note récupérée avec succès');
});

test('should update a note', async () => {
    // Vérification avant la mise à jour
    const noteBeforeUpdate = await prisma.note.findUnique({
        where: { id: entityId },
    });
    expect(noteBeforeUpdate).toBeDefined();

    const response = await app.inject({
        method: 'PATCH',
        url: `/api/notes/${entityId}`,
        headers: authHeaders(authToken),
        body: notePatchBody(),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual('Note mise à jour avec succès');

    // Vérification après la mise à jour
    const updatedNote = await prisma.note.findUnique({
        where: { id: entityId },
    });

    expect(updatedNote).toBeDefined();
    expect(updatedNote?.title).toBe('Note mise à jour');
    expect(updatedNote?.content).toBe('Contenu mis à jour');
});

test('should delete a note', async () => {
    // Vérification avant la suppression
    const noteBeforeDelete = await prisma.note.findUnique({
        where: { id: entityId },
    });
    expect(noteBeforeDelete).toBeDefined();

    const response = await app.inject({
        method: 'DELETE',
        url: `/api/notes/${entityId}`,
        headers: authHeaders(authToken),
    });

    expect(response.statusCode).toBe(204);

    // Vérification après la suppression
    const noteAfterDelete = await prisma.note.findUnique({
        where: { id: entityId },
    });
    expect(noteAfterDelete).toBeNull();
});

// Test d'authentification
describe('Unauthorized routes', () => {
    testUnauthorizedRoutes(app, {
        baseUrl: '/api/notes',
        bodyFor: {
            POST: () => notePostBody(),
            PATCH: () => notePatchBody(),
        },
        setupTestData: async () => {
            await setupTestData();
            return { entityId };
        },
    });
});
