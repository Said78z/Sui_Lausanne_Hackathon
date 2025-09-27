import { cleanDatabase, seedFakerDossiers } from '@/helpers';
import { yousignApiService } from '@/services';

import { afterAll, beforeAll, beforeEach, expect, jest, test } from '@jest/globals';
import { MandateTemplate } from '@shared/enums';

import prisma from '@/config/prisma';

import { dossierService } from '@/services/dossierService';

import { disconnectPrisma, getUsersAndToken } from '../prismaTestUtils';
import { getApp, resetApp } from '../setup';

let app: any;
let users: any[];
let testDossierId: string;

async function setupTestData() {
    app = await getApp();
    await cleanDatabase();
    const { users: seededUsers } = await getUsersAndToken(app);
    users = seededUsers;

    const dossiers = await seedFakerDossiers(users);
    testDossierId = dossiers[0].id;
}

beforeAll(async () => {
    await setupTestData();
    jest.spyOn(yousignApiService, 'createSignatureRequest').mockResolvedValue({
        id: '34c348a9-4975-4314-85b3-ee432ae347d4',
        status: 'draft',
        name: 'Test Signature Request',
        created_at: new Date().toISOString(),
    });
}, 30000);

beforeEach(async () => {
    app = await resetApp();
}, 30000);

afterAll(async () => {
    await disconnectPrisma();
    if (app) {
        await app.close();
    }
}, 30000);

test('devrait envoyer un mandat avec succès', async () => {
    const template = MandateTemplate.EXCLUSIVE_SEARCH_WARRANT_ONE_PERSON;
    await dossierService.sendMandat(testDossierId, template);

    // Vérification en base de données
    const updatedDossier = await prisma.dossier.findUnique({
        where: { id: testDossierId },
        include: {
            customers: true,
        },
    });

    expect(updatedDossier).toBeDefined();
    expect(updatedDossier?.mandateSentAt).toBeDefined();

    // Vérification du document Yousign créé
    const yousignDocument = await prisma.yousignDocument.findFirst({
        where: {
            dossierId: testDossierId,
        },
    });

    expect(yousignDocument).toBeDefined();
    expect(yousignDocument?.status).toBeDefined();
    expect(yousignDocument?.type).toBe('Mandat de recherche');
    expect(yousignDocument?.templateId).toBeDefined();
    expect(yousignDocument?.yousignId).toBeDefined();
    expect(yousignDocument?.dossierId).toBe(testDossierId);
});

test("devrait lever une erreur si le dossier n'existe pas", async () => {
    const template = MandateTemplate.EXCLUSIVE_SEARCH_WARRANT_ONE_PERSON;
    await expect(dossierService.sendMandat('non-existent-dossier', template)).rejects.toThrow(
        'Dossier non trouvé'
    );
});

test("devrait lever une erreur si le template n'existe pas", async () => {
    const invalidTemplate = 'INVALID_TEMPLATE' as MandateTemplate;
    await expect(dossierService.sendMandat(testDossierId, invalidTemplate)).rejects.toThrow(
        'Template non trouvé'
    );
});

test("devrait gérer correctement les erreurs de l'API Yousign", async () => {
    jest.spyOn(yousignApiService, 'createSignatureRequest').mockRejectedValueOnce(
        new Error('Erreur API Yousign')
    );

    const template = MandateTemplate.EXCLUSIVE_SEARCH_WARRANT_ONE_PERSON;
    await expect(dossierService.sendMandat(testDossierId, template)).rejects.toThrow(
        'Erreur API Yousign'
    );
});

test('devrait formater correctement les données du signataire', async () => {
    const template = MandateTemplate.EXCLUSIVE_SEARCH_WARRANT_ONE_PERSON;
    const spy = jest.spyOn(yousignApiService, 'createSignatureRequest');

    await dossierService.sendMandat(testDossierId, template);

    const callArgs = spy.mock.calls[0][0];
    expect(callArgs.template_placeholders.signers[0].info.first_name).not.toContain("'");
    expect(callArgs.template_placeholders.signers[0].info.last_name).not.toContain("'");
    expect(callArgs.template_placeholders.signers[0].info.locale).toBe('fr');
    expect(callArgs.template_placeholders.signers[0].signature_level).toBe('electronic_signature');
});
