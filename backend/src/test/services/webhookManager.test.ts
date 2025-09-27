import { cleanDatabase } from '@/helpers';
import { seedFakerDossiers } from '@/helpers/seedDossier';
import { webhookManager, yousignApiService } from '@/services';

import { afterAll, beforeAll, beforeEach, describe, expect, jest, test } from '@jest/globals';
import 'module-alias/register';

import prisma from '@/config/prisma';

import { getUsersAndToken } from '../prismaTestUtils';
import { getApp, resetApp } from '../setup';
import { verifyAndCleanupMinioFile } from '../utils/minioTestUtils';

let app: any;
let authToken: string;
let testDossierId: string;

// Mock data
const mockSignatureRequestId = 'test-signature-request-id';
const mockSignerId = 'test-signer-id';
const mockDocumentId = 'test-document-id';
const mockDocumentName = 'test-document.pdf';
const mockDocumentContent = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');

const mockSignerDocuments = [
    {
        id: mockDocumentId,
        filename: mockDocumentName,
        type: 'application/pdf',
        title: 'Document de test',
    },
];

async function setupTestData() {
    app = await getApp();
    await cleanDatabase();
    const { token, users } = await getUsersAndToken(app);
    authToken = token;
    const dossiers = await seedFakerDossiers(users);
    testDossierId = dossiers[0].id;
}

beforeAll(async () => {
    await setupTestData();
}, 30000);

beforeEach(async () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    app = await resetApp();
});

afterAll(async () => {
    await prisma.$disconnect();
    if (app) {
        await app.close();
    }
}, 30000);

describe('WebhookManager - downloadCni', () => {
    test('should successfully download and store CNI document', async () => {
        // Mock des méthodes de yousignApiService
        jest.spyOn(yousignApiService, 'getListOfSignerDocumentsForSigner').mockResolvedValue(
            mockSignerDocuments
        );

        jest.spyOn(yousignApiService, 'downloadSignerDocument').mockResolvedValue(
            mockDocumentContent
        );

        // Exécuter la méthode downloadCni
        await webhookManager['downloadCni'](mockSignatureRequestId, mockSignerId, testDossierId);

        // Vérifier que les méthodes mockées ont été appelées
        expect(yousignApiService.getListOfSignerDocumentsForSigner).toHaveBeenCalledWith(
            mockSignatureRequestId,
            mockSignerId
        );
        expect(yousignApiService.downloadSignerDocument).toHaveBeenCalledWith(
            mockSignatureRequestId,
            mockSignerId,
            mockDocumentId
        );

        // Vérifier que le média a été créé dans la base de données
        const dossier = await prisma.dossier.findUnique({
            where: { id: testDossierId },
            include: { media: true },
        });

        expect(dossier).toBeDefined();
        expect(dossier?.media).toBeDefined();
        expect(dossier?.media.length).toBeGreaterThan(0);

        // Vérifier que le fichier a été créé
        const file = await prisma.file.findFirst({
            where: {
                media: {
                    id: dossier?.media[0].id,
                },
            },
        });

        expect(file).toBeDefined();
        expect(file?.name).toContain(mockSignerId);
        expect(file?.type).toBe('application/pdf');

        // Vérification et nettoyage dans MinIO
        await verifyAndCleanupMinioFile('cni', file!.name);
    });

    test('should handle case when no documents are found for signer', async () => {
        // Mock pour simuler qu'aucun document n'est trouvé
        jest.spyOn(yousignApiService, 'getListOfSignerDocumentsForSigner').mockResolvedValue([]);

        // Ajouter le mock pour downloadSignerDocument
        jest.spyOn(yousignApiService, 'downloadSignerDocument').mockResolvedValue(
            mockDocumentContent
        );

        // Exécuter la méthode downloadCni
        await webhookManager['downloadCni'](mockSignatureRequestId, mockSignerId, testDossierId);

        // Vérifier que downloadSignerDocument n'a pas été appelé
        expect(yousignApiService.downloadSignerDocument).not.toHaveBeenCalled();
    });

    test('should handle case when dossier is not found', async () => {
        // Mock des méthodes de yousignApiService
        jest.spyOn(yousignApiService, 'getListOfSignerDocumentsForSigner').mockResolvedValue(
            mockSignerDocuments
        );

        jest.spyOn(yousignApiService, 'downloadSignerDocument').mockResolvedValue(
            mockDocumentContent
        );

        // Exécuter la méthode downloadCni avec un ID de dossier invalide
        await webhookManager['downloadCni'](
            mockSignatureRequestId,
            mockSignerId,
            'invalid-dossier-id'
        );

        // Vérifier que downloadSignerDocument n'a pas été appelé
        expect(yousignApiService.downloadSignerDocument).not.toHaveBeenCalled();
    });

    test('should handle case when document download fails', async () => {
        // Mock des méthodes de yousignApiService
        jest.spyOn(yousignApiService, 'getListOfSignerDocumentsForSigner').mockResolvedValue(
            mockSignerDocuments
        );

        jest.spyOn(yousignApiService, 'downloadSignerDocument').mockResolvedValue(null);

        // Exécuter la méthode downloadCni
        await webhookManager['downloadCni'](mockSignatureRequestId, mockSignerId, testDossierId);
    });
});
