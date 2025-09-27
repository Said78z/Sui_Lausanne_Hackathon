import {
    cleanDatabase,
    seedAdresses,
    seedCities,
    seedFakerDossiers,
    seedFakerNotes,
    seedFakerRealEstateAgencies,
    seedFakerSuggestions,
    seedGeography,
    seedOpportunitiesWithNotesAndAdresses,
} from '@/helpers';
import { yousignApiService } from '@/services';

import { afterAll, beforeAll, beforeEach, expect, jest, test } from '@jest/globals';
import { CreatePurchaseOffer } from '@shared/dto';

import prisma from '@/config/prisma';

import { purchaseOfferService } from '@/services/purchaseOfferService';

import { disconnectPrisma, getUsersAndToken } from '../prismaTestUtils';
import { getApp, resetApp } from '../setup';

let app: any;
let users: any[];
let testOpportunityId: string;
let testDossierId: string;

function getPurchaseOfferPostBody(): CreatePurchaseOffer {
    const purchaseOfferPostBody: CreatePurchaseOffer = {
        opportunityId: testOpportunityId,
        dossierId: testDossierId,
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

async function setupTestData() {
    app = await getApp();
    await cleanDatabase();
    const { users: seededUsers } = await getUsersAndToken(app);
    users = seededUsers;

    // Créer les données nécessaires pour les tests
    const geographyData = await seedGeography();
    const cities = await seedCities(geographyData);
    const adresses = await seedAdresses();
    const notes = await seedFakerNotes(users);
    const dossiers = await seedFakerDossiers(users);
    testDossierId = dossiers[0].id;
    const opportunities = await seedOpportunitiesWithNotesAndAdresses(
        geographyData.departments,
        notes,
        adresses
    );
    await seedFakerSuggestions(opportunities, dossiers, users);
    await seedFakerRealEstateAgencies(cities, adresses, opportunities);
    testOpportunityId = opportunities[0].id; // Sauvegarder l'ID de la première opportunité
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

test("devrait créer une offre d'achat avec succès", async () => {
    const result = await purchaseOfferService.createFromOpportunity(getPurchaseOfferPostBody());

    expect(result).toBeDefined();
    expect(yousignApiService.createSignatureRequest).toHaveBeenCalled();

    // Vérification en base de données
    const createdPurchaseOffer = await prisma.purchaseOffer.findFirst({
        where: { opportunityId: testOpportunityId },
        include: {
            note: true,
            opportunity: true,
            dossier: true,
        },
    });

    expect(createdPurchaseOffer).toBeDefined();
    expect(createdPurchaseOffer?.note).toBeDefined();

    // Vérification que le dossier et l'opportunité sont bien liés
    expect(createdPurchaseOffer?.opportunity).toBeDefined();
    expect(createdPurchaseOffer?.opportunity?.id).toBe(testOpportunityId);
    expect(createdPurchaseOffer?.dossier).toBeDefined();
    expect(createdPurchaseOffer?.dossier?.id).toBe(testDossierId);
    expect(createdPurchaseOffer?.id).toBeDefined();

    // Vérification du document Yousign créé
    const yousignDocument = await prisma.yousignDocument.findFirst({
        where: {
            purchaseOfferId: createdPurchaseOffer?.id,
        },
    });

    expect(yousignDocument).toBeDefined();
    expect(yousignDocument?.status).toBeDefined();
    expect(yousignDocument?.type).toBe("Offre d'achat");
    expect(yousignDocument?.templateId).toBeDefined();
    expect(yousignDocument?.yousignId).toBeDefined();
    expect(yousignDocument?.purchaseOfferId).toBe(createdPurchaseOffer?.id);
});

test("devrait lever une erreur si l'opportunité n'existe pas", async () => {
    await expect(
        purchaseOfferService.createFromOpportunity({
            opportunityId: 'non-existent-opportunity',
            dossierId: testDossierId,
        })
    ).rejects.toThrow('Opportunité non trouvée');
});

test("devrait lever une erreur si le dossier n'existe pas", async () => {
    await expect(
        purchaseOfferService.createFromOpportunity({
            opportunityId: testOpportunityId,
            dossierId: 'non-existent-dossier',
        })
    ).rejects.toThrow('Dossier non trouvé');
});

test("devrait valider les données d'entrée requises", async () => {
    const invalidBody = {} as CreatePurchaseOffer;

    await expect(purchaseOfferService.createFromOpportunity(invalidBody)).rejects.toThrow();
});
