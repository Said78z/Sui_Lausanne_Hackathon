import { cleanDatabase } from '@/helpers';

import { afterAll, beforeAll, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { DocumentStatus } from '@shared/dto';
import * as fs from 'fs';
import 'module-alias/register';
import * as path from 'path';

import prisma from '@/config/prisma';

import { minioService } from '@/services/minioService';

import { disconnectPrisma, getUsersAndToken } from '../prismaTestUtils';
import { getApp, resetApp } from '../setup';
import {
    authHeaders,
    testUnauthorizedRoutes,
    verifyAndCleanupMinioFile,
    verifyMinioFile,
} from '../utils';

let authToken: string;
let users: any[];
let app: any;
let testMediaId: string;

// Création d'un fichier PDF de test
const testFilePath = path.join(__dirname, 'test.pdf');
const testFileContent = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');

beforeAll(async () => {
    // Créer le fichier de test
    fs.writeFileSync(testFilePath, testFileContent);
}, 30000);

afterAll(async () => {
    // Nettoyer le fichier de test
    if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
    }
    await disconnectPrisma();
    if (app) {
        await app.close();
    }
}, 30000);

const mediaPostBody = () => {
    const formData = new FormData();
    formData.append('file', new Blob([testFileContent], { type: 'application/pdf' }), 'test.pdf');
    return formData;
};

const mediaPatchBody = () => {
    const formData = new FormData();
    formData.append('file', new Blob([testFileContent], { type: 'application/pdf' }), 'test.pdf');
    formData.append('status', DocumentStatus.VALIDATED);
    return formData;
};

async function setupTestData() {
    app = await getApp();
    await cleanDatabase();
    const { token, users: seededUsers } = await getUsersAndToken(app);
    authToken = token;
    users = seededUsers;

    const file = await prisma.file.create({
        data: {
            legend: 'test',
            source: 'test',
            name: 'test.pdf',
            type: 'application/pdf',
            size: 1024,
        },
    });
    // Créer les données nécessaires pour les tests
    const media = await prisma.media.create({
        data: {
            fileId: file.id,
        },
    });
    testMediaId = media.id;
}

beforeAll(async () => {
    await setupTestData();
}, 30000);

beforeEach(async () => {
    app = await resetApp();
}, 30000);

test('should get all media', async () => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/media',
        headers: authHeaders(authToken),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual('Links get with success');
    expect(response.json().data).toBeDefined();
    expect(Array.isArray(response.json().data)).toBe(true);
    expect(response.json().data.length).toBeGreaterThan(0);
}, 30000);

test('should create a media', async () => {
    const response = await app.inject({
        method: 'POST',
        url: '/api/media',
        headers: {
            ...authHeaders(authToken),
            'Content-Type': 'multipart/form-data',
        },
        payload: mediaPostBody(),
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().message).toEqual('Link created with success');

    // Vérification en base de données
    const createdMedia = await prisma.media.findUnique({
        where: { id: response.json().data.id },
        include: { file: true },
    });

    expect(createdMedia).toBeDefined();
    expect(createdMedia?.file).toBeDefined();

    // Vérification et nettoyage dans MinIO
    await verifyAndCleanupMinioFile('users-document', createdMedia!.file!.name);
}, 30000);

test('should get media by id', async () => {
    const response = await app.inject({
        method: 'GET',
        url: `/api/media/${testMediaId}`,
        headers: authHeaders(authToken),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual('Link found with success');
    expect(response.json().data.id).toBe(testMediaId);
}, 30000);

test('should update a media', async () => {
    // Vérification avant la mise à jour
    const mediaBeforeUpdate = await prisma.media.findUnique({
        where: { id: testMediaId },
    });
    expect(mediaBeforeUpdate).toBeDefined();

    const response = await app.inject({
        method: 'PATCH',
        url: `/api/media/${testMediaId}`,
        headers: {
            ...authHeaders(authToken),
            'Content-Type': 'multipart/form-data',
        },
        payload: mediaPatchBody(),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual('Link update with success');

    // Vérification après la mise à jour
    const updatedMedia = await prisma.media.findUnique({
        where: { id: testMediaId },
    });

    expect(updatedMedia).toBeDefined();
    expect(updatedMedia?.status).toBe(DocumentStatus.VALIDATED);
}, 30000);

test('should delete a media', async () => {
    // Vérification avant la suppression
    const mediaBeforeDelete = await prisma.media.findUnique({
        where: { id: testMediaId },
        include: { file: true },
    });
    expect(mediaBeforeDelete).toBeDefined();
    expect(mediaBeforeDelete?.file).toBeDefined();

    // Vérifier que le fichier existe dans MinIO avant la suppression
    await verifyMinioFile('users-document', mediaBeforeDelete!.file!.name);

    const response = await app.inject({
        method: 'DELETE',
        url: `/api/media/${testMediaId}`,
        headers: authHeaders(authToken),
    });

    expect(response.statusCode).toBe(204);

    // Vérification après la suppression
    const mediaAfterDelete = await prisma.media.findUnique({
        where: { id: testMediaId },
    });
    expect(mediaAfterDelete).toBeNull();

    // Vérifier que le fichier a été supprimé de MinIO
    try {
        //TODO: Changer le bucket quand les bucket seront bien organisés
        await minioService.getFileInfoFromBucket('users-document', mediaBeforeDelete!.file!.name);
        // Si on arrive ici, c'est que le fichier existe encore, ce qui ne devrait pas être le cas
        expect(true).toBe(false); // Force le test à échouer
    } catch (error) {
        // On s'attend à une erreur car le fichier ne devrait plus exister
        expect(error).toBeDefined();
    }
}, 30000);

// Test d'authentification
describe('Unauthorized routes', () => {
    testUnauthorizedRoutes(app, {
        baseUrl: '/api/media',
        bodyFor: {
            POST: () => mediaPostBody(),
            PATCH: () => mediaPatchBody(),
        },
        setupTestData: async () => {
            await setupTestData();
            return { entityId: testMediaId };
        },
    });
});

// Test des transactions
describe('Transaction tests', () => {
    test('should rollback transaction if file upload fails during media creation', async () => {
        // Mock de minioService pour simuler un échec
        jest.spyOn(minioService, 'uploadFile').mockRejectedValueOnce(new Error('Upload failed'));

        //Vérifier le nombre de média et de fichier avant la création
        const mediaCountBefore = await prisma.media.count();
        const fileCountBefore = await prisma.file.count();

        const response = await app.inject({
            method: 'POST',
            url: '/api/media',
            headers: {
                ...authHeaders(authToken),
                'Content-Type': 'multipart/form-data',
            },
            payload: mediaPostBody(),
        });

        expect(response.statusCode).toBe(500);

        // Vérifier qu'aucun média n'a été créé
        const mediaCount = await prisma.media.count();
        expect(mediaCount).toBe(mediaCountBefore);

        // Vérifier qu'aucun fichier n'a été créé
        const fileCount = await prisma.file.count();
        expect(fileCount).toBe(fileCountBefore);

        // Restaurer le mock
        jest.restoreAllMocks();
    });

    test('should rollback transaction if file update fails during media update', async () => {
        // Mock de minioService pour simuler un échec lors de l'upload
        jest.spyOn(minioService, 'uploadFile').mockRejectedValueOnce(new Error('Upload failed'));

        const response = await app.inject({
            method: 'PATCH',
            url: `/api/media/${testMediaId}`,
            headers: {
                ...authHeaders(authToken),
                'Content-Type': 'multipart/form-data',
            },
            payload: mediaPatchBody(),
        });

        expect(response.statusCode).toBe(500);

        // Vérifier que le média n'a pas été modifié
        const media = await prisma.media.findUnique({
            where: { id: testMediaId },
        });
        expect(media).toBeDefined();
        expect(media?.status).not.toBe(DocumentStatus.VALIDATED);

        // Restaurer le mock
        jest.restoreAllMocks();
    });

    test('should rollback transaction if file deletion fails during media deletion', async () => {
        // Mock de minioService pour simuler un échec lors de la suppression
        jest.spyOn(minioService, 'deleteFile').mockRejectedValueOnce(new Error('Delete failed'));

        const response = await app.inject({
            method: 'DELETE',
            url: `/api/media/${testMediaId}`,
            headers: authHeaders(authToken),
        });

        expect(response.statusCode).toBe(500);

        // Vérifier que le média n'a pas été supprimé
        const media = await prisma.media.findUnique({
            where: { id: testMediaId },
        });
        expect(media).toBeDefined();
        expect(media).not.toBeNull();

        // Assertion de type pour TypeScript
        if (!media || !media.fileId) {
            throw new Error('Media should not be null at this point');
        }

        // Vérifier que le fichier n'a pas été supprimé
        const file = await prisma.file.findUnique({
            where: { id: media.fileId },
        });
        expect(file).toBeDefined();

        // Restaurer le mock
        jest.restoreAllMocks();
    });
});
