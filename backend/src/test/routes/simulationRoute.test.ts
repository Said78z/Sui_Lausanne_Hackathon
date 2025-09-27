import { cleanDatabase, seedSimulations } from '@/helpers';

import { afterAll, beforeAll, beforeEach, describe, expect, test } from '@jest/globals';
import { Simulation } from '@shared/dto';
import 'module-alias/register';

import prisma from '@/config/prisma';

import { disconnectPrisma, getUsersAndToken } from '../prismaTestUtils';
import { getApp, resetApp } from '../setup';
import { testUnauthorizedRoutes } from '../utils/test401';
import { authHeaders, expectToMatchSchema } from '../utils/testUtils';

let authToken: string;
let entityId: string;
let app: any;

// Fonction utilitaire pour générer un nombre aléatoire entre min et max
const getRandomFloat = (min: number, max: number): number => {
    return Number((Math.random() * (max - min) + min).toFixed(2));
};

const randomCharges = getRandomFloat(1000, 5000);
const randomRevenus = getRandomFloat(6000, 10000);
const randomSaving = getRandomFloat(2000, 8000);

const simulationPostBody = () => ({
    reason: 'Test simulation',
    annualCharges: randomCharges,
    annualRevenus: randomRevenus,
    saving: randomSaving,
    ownsRealEstate: true,
});

const simulationPatchBody = () => ({
    reason: 'Updated test simulation',
    annualCharges: randomCharges,
    annualRevenus: randomRevenus,
    saving: randomSaving,
    ownsRealEstate: false,
});

async function setupTestData() {
    app = await getApp();
    await cleanDatabase();
    const { token } = await getUsersAndToken(app);
    authToken = token;

    // Créer les données nécessaires pour les tests
    const simulations = await seedSimulations();
    entityId = simulations[0].id; // Sauvegarder l'ID de la première simulation
}

beforeAll(async () => {
    await setupTestData();
}, 30000);

// Réinitialiser l'application avant chaque test
beforeEach(async () => {
    app = await resetApp();
});

afterAll(async () => {
    await disconnectPrisma();
    if (app) {
        await app.close();
    }
}, 30000);

test('should get all simulations', async () => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/simulations',
        headers: authHeaders(authToken),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual('Simulations récupérées avec succès');
    expect(response.json().data).toBeDefined();

    // Vérifier la structure d'une simulation
    const firstSimulation = response.json().data[0];
    expectToMatchSchema(firstSimulation, Simulation);
});

test('should create a simulation', async () => {
    const response = await app.inject({
        method: 'POST',
        url: '/api/simulations',
        headers: authHeaders(authToken),
        body: simulationPostBody(),
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().message).toEqual('Simulation créée avec succès');
    expect(response.json().data).toHaveProperty('id');
    expect(response.json().data.reason).toBe('Test simulation');
    expect(response.json().data.annualCharges).toBe(randomCharges);
    expect(response.json().data.annualRevenus).toBe(randomRevenus);
    expect(response.json().data.saving).toBe(randomSaving);
    expect(response.json().data.ownsRealEstate).toBe(true);

    // Vérification en base de données
    const createdSimulation = await prisma.simulation.findUnique({
        where: { id: response.json().data.id },
    });

    expect(createdSimulation).toBeDefined();
    expect(createdSimulation?.reason).toBe('Test simulation');
    expect(createdSimulation?.annualCharges).toBe(randomCharges);
    expect(createdSimulation?.annualRevenus).toBe(randomRevenus);
    expect(createdSimulation?.saving).toBe(randomSaving);
    expect(createdSimulation?.ownsRealEstate).toBe(true);
});

test('should get simulation by id', async () => {
    const response = await app.inject({
        method: 'GET',
        url: `/api/simulations/${entityId}`,
        headers: authHeaders(authToken),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual('Simulation récupérée avec succès');
    expect(response.json().data).toHaveProperty('id', entityId);
});

test('should update a simulation', async () => {
    // Vérification avant la mise à jour
    const simulationBeforeUpdate = await prisma.simulation.findUnique({
        where: { id: entityId },
    });
    expect(simulationBeforeUpdate).toBeDefined();

    const response = await app.inject({
        method: 'PATCH',
        url: `/api/simulations/${entityId}`,
        headers: authHeaders(authToken),
        body: simulationPatchBody(),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual('Simulation mise à jour avec succès');
    expect(response.json().data.reason).toBe('Updated test simulation');
    expect(response.json().data.annualCharges).toBe(randomCharges);
    expect(response.json().data.annualRevenus).toBe(randomRevenus);
    expect(response.json().data.saving).toBe(randomSaving);
    expect(response.json().data.ownsRealEstate).toBe(false);

    // Vérification après la mise à jour
    const updatedSimulation = await prisma.simulation.findUnique({
        where: { id: entityId },
    });

    expect(updatedSimulation).toBeDefined();
    expect(updatedSimulation?.reason).toBe('Updated test simulation');
    expect(updatedSimulation?.annualCharges).toBe(randomCharges);
    expect(updatedSimulation?.annualRevenus).toBe(randomRevenus);
    expect(updatedSimulation?.saving).toBe(randomSaving);
    expect(updatedSimulation?.ownsRealEstate).toBe(false);
});

test('should delete a simulation', async () => {
    // Vérification avant la suppression
    const simulationBeforeDelete = await prisma.simulation.findUnique({
        where: { id: entityId },
    });
    expect(simulationBeforeDelete).toBeDefined();

    const response = await app.inject({
        method: 'DELETE',
        url: `/api/simulations/${entityId}`,
        headers: authHeaders(authToken),
    });

    expect(response.statusCode).toBe(204);

    // Vérification après la suppression
    const simulationAfterDelete = await prisma.simulation.findUnique({
        where: { id: entityId },
    });
    expect(simulationAfterDelete).toBeNull();
});

// Tests de validation des données
test('should validate simulation data on creation', async () => {
    const response = await app.inject({
        method: 'POST',
        url: '/api/simulations',
        headers: authHeaders(authToken),
        body: {
            reason: '', // Raison vide
            annualCharges: -1000, // Charges négatives
            annualRevenus: -5000, // Revenus négatifs
            saving: -2000, // Épargne négative
            ownsRealEstate: true,
        },
    });

    expect(response.statusCode).toBe(400);
});

test('should validate simulation data on update', async () => {
    const response = await app.inject({
        method: 'PATCH',
        url: `/api/simulations/${entityId}`,
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
        body: {
            annualCharges: -1500, // Charges négatives
            annualRevenus: -6000, // Revenus négatifs
            saving: -2500, // Épargne négative
        },
    });

    expect(response.statusCode).toBe(400);
});

// Test d'authentification
describe('Unauthorized routes', () => {
    testUnauthorizedRoutes(app, {
        baseUrl: '/api/simulations',
        bodyFor: {
            POST: () => simulationPostBody(),
            PATCH: () => simulationPatchBody(),
        },
        setupTestData: async () => {
            await setupTestData();
            return { entityId };
        },
    });
});
