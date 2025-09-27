import { cleanDatabase, seedFakerCalls, seedFakerEmployees, seedFakerProspects } from '@/helpers';
import { applicationParameterRepository, callRepository, prospectRepository } from '@/repositories';
import { callService } from '@/services/callService';
import { afterAll, beforeAll, beforeEach, describe, expect, test } from '@jest/globals';
import { UpdateCallSchema } from '@shared/dto/callDto';
import { ApplicationParameterName, CallResult, CallStatus, ProspectStatus } from '@shared/enums';
import { disconnectPrisma, getUsersAndToken } from '../prismaTestUtils';
import { getApp, resetApp } from '../setup';

let app: any;
// Types pour les tests
interface TestSetup {
    app: any;
    users: any[];
    employees: any[];
    prospects: any[];
    calls: any[];
    testCallId: string;
    testProspectId: string;
    testCalledById: string;
}

let testSetup: TestSetup;

// Données de test
const testUpdateData: UpdateCallSchema = {
    status: CallStatus.ABSENT,
    callResult: CallResult.NO_ANSWER,
    notes: 'Test update notes',
    duration: 120,
};

const testCallbackTodayData: UpdateCallSchema = {
    callResult: CallResult.CALLBACK_TODAY,
    callbackTime: '15:30',
};

const testCallbackFutureData: UpdateCallSchema = {
    callResult: CallResult.CALLBACK_FUTURE,
    callbackDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 jours
    callbackTime: '14:00',
};

const testAbandonData: UpdateCallSchema = {
    callResult: CallResult.ABANDON,
};

async function setupTestData(): Promise<TestSetup> {
    const app = await getApp();
    await cleanDatabase();

    const { users } = await getUsersAndToken(app);
    const employees = await seedFakerEmployees(users);
    const prospects = await seedFakerProspects(employees);
    const calls = await seedFakerCalls(prospects, employees);

    return {
        app,
        users,
        employees,
        prospects,
        calls,
        testCallId: calls[0].id,
        testProspectId: prospects[0].id,
        testCalledById: users[1].id,
    };
}

beforeEach(async () => {
    app = await resetApp();
}, 30000);

afterAll(async () => {
    await disconnectPrisma();
    if (app) {
        await app.close();
    }
}, 30000);

beforeAll(async () => {
    testSetup = await setupTestData();
}, 30000);


afterAll(async () => {
    await cleanDatabase();
});

describe('CallService - Tests d\'intégration sans mocks', () => {

    describe('updateCall - Cas d\'erreur', () => {
        test('devrait lever une erreur si l\'appel n\'existe pas', async () => {
            // Act & Assert
            await expect(callService.updateCall('non-existent-id', testUpdateData))
                .rejects.toThrow('Appel non trouvé');
        });
    });

    describe('updateCall - Cas de base (sans logique métier)', () => {
        test('devrait mettre à jour un appel avec succès sans logique métier', async () => {
            // Act
            const result = await callService.updateCall(testSetup.testCallId, testUpdateData);

            // Assert
            expect(result).toBeDefined();
            expect(result.id).toBe(testSetup.testCallId);
            expect(result.status).toBe(CallStatus.ABSENT);
            expect(result.callResult).toBe(CallResult.NO_ANSWER);
            expect(result.notes).toBe('Test update notes');
            expect(result.duration).toBe(120);
        });
    });

    describe('updateCall - Logique métier CALLBACK_TODAY', () => {
        test('devrait appliquer la logique métier pour CALLBACK_TODAY', async () => {
            // Act
            await callService.updateCall(testSetup.testCallId, testCallbackTodayData);

            // Assert - Vérifier que le prospect a été mis à jour
            const updatedProspect = await prospectRepository.findById(testSetup.testProspectId);
            expect(updatedProspect).toBeDefined();
            expect(updatedProspect?.doNotCallBefore).toBeDefined();

            // Vérifier que doNotCallBefore est fixé à la fin de la journée
            const doNotCallBefore = new Date(updatedProspect!.doNotCallBefore!);
            const today = new Date();
            expect(doNotCallBefore.getDate()).toBe(today.getDate());
            expect(doNotCallBefore.getMonth()).toBe(today.getMonth());
            expect(doNotCallBefore.getFullYear()).toBe(today.getFullYear());
            expect(doNotCallBefore.getHours()).toBe(23);
            expect(doNotCallBefore.getMinutes()).toBe(59);
        });

        test('devrait programmer un rappel si l\'heure n\'est pas passée', async () => {
            // Arrange
            const futureTime = new Date();
            futureTime.setHours(futureTime.getHours() + 1);
            const callbackTime = `${futureTime.getHours().toString().padStart(2, '0')}:${futureTime.getMinutes().toString().padStart(2, '0')}`;

            // Act
            await callService.updateCall(testSetup.testCallId, {
                callResult: CallResult.CALLBACK_TODAY,
                callbackTime,
            });

            // Assert
            const updatedProspect = await prospectRepository.findById(testSetup.testProspectId);
            expect(updatedProspect).toBeDefined();
            expect(updatedProspect?.reminderTime).toBeDefined();

            // Vérifier que reminderTime correspond à l'heure spécifiée
            const reminderTime = new Date(updatedProspect!.reminderTime!);
            expect(reminderTime.getHours()).toBe(futureTime.getHours());
            expect(reminderTime.getMinutes()).toBe(futureTime.getMinutes());
        });

        test('ne devrait pas programmer de rappel si l\'heure est passée', async () => {
            // Arrange - Créer une heure qui est clairement passée (hier)
            const pastTime = new Date();
            pastTime.setHours(0, 0, 0, 1); 
            const callbackTime = `${pastTime.getHours().toString().padStart(2, '0')}:${pastTime.getMinutes().toString().padStart(2, '0')}`;

            // Act
            await callService.updateCall(testSetup.testCallId, {
                callResult: CallResult.CALLBACK_TODAY,
                callbackTime,
            });

            // Assert
            const updatedProspect = await prospectRepository.findById(testSetup.testProspectId);
            expect(updatedProspect).toBeDefined();
            expect(updatedProspect?.doNotCallBefore).toBeDefined();
            expect(updatedProspect?.reminderTime).toBeNull(); // Pas de rappel si l'heure est passée
        });

        test('devrait valider le format de l\'heure de rappel', async () => {
            // Act
            const result = await callService.updateCall(testSetup.testCallId, {
                callResult: CallResult.CALLBACK_TODAY,
                callbackTime: '14:30',
            });

            // Assert
            expect(result).toBeDefined();
            const updatedProspect = await prospectRepository.findById(testSetup.testProspectId);
            expect(updatedProspect?.doNotCallBefore).toBeDefined();
        });
    });

    describe('updateCall - Logique métier CALLBACK_FUTURE', () => {
        test('devrait appliquer la logique métier pour CALLBACK_FUTURE', async () => {
            // Act
            await callService.updateCall(testSetup.testCallId, testCallbackFutureData);

            // Assert
            const updatedProspect = await prospectRepository.findById(testSetup.testProspectId);
            expect(updatedProspect).toBeDefined();
            expect(updatedProspect?.doNotCallBefore).toBeDefined();
            expect(updatedProspect?.reminderTime).toBeDefined();

            // Vérifier que doNotCallBefore correspond à la date spécifiée
            const doNotCallBefore = new Date(updatedProspect!.doNotCallBefore!);
            const expectedDate = new Date(testCallbackFutureData.callbackDate!);
            expect(doNotCallBefore.getDate()).toBe(expectedDate.getDate());
            expect(doNotCallBefore.getMonth()).toBe(expectedDate.getMonth());
            expect(doNotCallBefore.getFullYear()).toBe(expectedDate.getFullYear());
        });

        test('devrait utiliser la date spécifiée si fournie', async () => {
            // Arrange
            const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // +5 jours

            // Act
            await callService.updateCall(testSetup.testCallId, {
                callResult: CallResult.CALLBACK_FUTURE,
                callbackDate: futureDate.toISOString(),
            });

            // Assert
            const updatedProspect = await prospectRepository.findById(testSetup.testProspectId);
            expect(updatedProspect).toBeDefined();
            expect(updatedProspect?.doNotCallBefore).toBeDefined();

            const doNotCallBefore = new Date(updatedProspect!.doNotCallBefore!);
            expect(doNotCallBefore.getDate()).toBe(futureDate.getDate());
            expect(doNotCallBefore.getMonth()).toBe(futureDate.getMonth());
            expect(doNotCallBefore.getFullYear()).toBe(futureDate.getFullYear());
        });

        test('devrait utiliser la date par défaut (+7 jours) si aucune date n\'est spécifiée', async () => {
            // Act
            await callService.updateCall(testSetup.testCallId, {
                callResult: CallResult.CALLBACK_FUTURE,
            });

            // Assert
            const updatedProspect = await prospectRepository.findById(testSetup.testProspectId);
            expect(updatedProspect).toBeDefined();
            expect(updatedProspect?.doNotCallBefore).toBeDefined();

            const doNotCallBefore = new Date(updatedProspect!.doNotCallBefore!);
            const expectedDate = new Date();
            expectedDate.setDate(expectedDate.getDate() + 7);

            expect(doNotCallBefore.getDate()).toBe(expectedDate.getDate());
            expect(doNotCallBefore.getMonth()).toBe(expectedDate.getMonth());
            expect(doNotCallBefore.getFullYear()).toBe(expectedDate.getFullYear());
        });
    });

    describe('updateCall - Logique métier NO_ANSWER', () => {
        test('devrait utiliser le délai par défaut si le paramètre n\'existe pas pour NO_ANSWER', async () => {
            // Act
            await callService.updateCall(testSetup.testCallId, {
                callResult: CallResult.NO_ANSWER,
            });

            // Assert
            const updatedProspect = await prospectRepository.findById(testSetup.testProspectId);
            expect(updatedProspect).toBeDefined();
            expect(updatedProspect?.doNotCallBefore).toBeDefined();

            // Vérifier que doNotCallBefore est fixé à +24 heures (délai par défaut)
            const doNotCallBefore = new Date(updatedProspect!.doNotCallBefore!);
            const expectedDate = new Date();
            expectedDate.setHours(expectedDate.getHours() + 24);

            // Tolérance de 1 minute pour les différences de timing
            const timeDiff = Math.abs(doNotCallBefore.getTime() - expectedDate.getTime());
            expect(timeDiff).toBeLessThan(60000); // 1 minute en millisecondes
        });

        test('devrait appliquer la logique métier pour NO_ANSWER avec paramètre personnalisé', async () => {
            // Arrange - Créer un paramètre d'application personnalisé
            await applicationParameterRepository.create({
                name: ApplicationParameterName.CALL_ABSENT_DELAY_HOURS,
                value: '48',
            });

            // Act
            await callService.updateCall(testSetup.testCallId, {
                callResult: CallResult.NO_ANSWER,
            });

            // Assert
            const updatedProspect = await prospectRepository.findById(testSetup.testProspectId);
            expect(updatedProspect).toBeDefined();
            expect(updatedProspect?.doNotCallBefore).toBeDefined();

            // Vérifier que doNotCallBefore est fixé à +48 heures
            const doNotCallBefore = new Date(updatedProspect!.doNotCallBefore!);
            const expectedDate = new Date();
            expectedDate.setHours(expectedDate.getHours() + 48);

            // Tolérance de 1 minute pour les différences de timing
            const timeDiff = Math.abs(doNotCallBefore.getTime() - expectedDate.getTime());
            expect(timeDiff).toBeLessThan(60000); // 1 minute en millisecondes
        });


    });

    describe('updateCall - Logique métier ABANDON', () => {
        test('devrait appliquer la logique métier pour ABANDON', async () => {
            // Act
            await callService.updateCall(testSetup.testCallId, testAbandonData);

            // Assert
            const updatedProspect = await prospectRepository.findById(testSetup.testProspectId);
            expect(updatedProspect).toBeDefined();

            // Vérifier que doNotCallBefore est une date très éloignée dans le futur
            const doNotCallBefore = new Date(updatedProspect!.doNotCallBefore!);
            const expectedDate = new Date('2099-12-31T23:59:59.999Z');
            expect(doNotCallBefore.getTime()).toBe(expectedDate.getTime());

            expect(updatedProspect?.isArchived).toBe(true);
        });
    });

    describe('Tests de persistance des données', () => {
        test('devrait persister correctement les mises à jour en base de données', async () => {
            // Arrange
            const originalCall = await callRepository.findByIdWithRelations(testSetup.testCallId);
            const originalProspect = await prospectRepository.findById(testSetup.testProspectId);

            expect(originalCall).toBeDefined();
            expect(originalProspect).toBeDefined();

            // Act
            const updatedCall = await callService.updateCall(testSetup.testCallId, {
                callResult: CallResult.CALLBACK_TODAY,
                callbackTime: '16:00',
                notes: 'Test de persistance',
                duration: 180,
            });

            // Assert
            expect(updatedCall).toBeDefined();
            expect(updatedCall.notes).toBe('Test de persistance');
            expect(updatedCall.duration).toBe(180);
            expect(updatedCall.callResult).toBe(CallResult.CALLBACK_TODAY);

            // Vérifier que les changements sont persistés en base
            const persistedCall = await callRepository.findByIdWithRelations(testSetup.testCallId);
            const persistedProspect = await prospectRepository.findById(testSetup.testProspectId);

            expect(persistedCall?.notes).toBe('Test de persistance');
            expect(persistedCall?.duration).toBe(180);
            expect(persistedCall?.callResult).toBe(CallResult.CALLBACK_TODAY);
            expect(persistedProspect?.doNotCallBefore).toBeDefined();
            expect(persistedProspect?.reminderTime).toBeDefined();
        });

        test('devrait gérer plusieurs mises à jour consécutives', async () => {
            // Première mise à jour
            await callService.updateCall(testSetup.testCallId, {
                callResult: CallResult.CALLBACK_TODAY,
                callbackTime: '14:00',
            });

            // Deuxième mise à jour
            await callService.updateCall(testSetup.testCallId, {
                callResult: CallResult.ABANDON,
            });

            // Assert
            const finalCall = await callRepository.findByIdWithRelations(testSetup.testCallId);
            const finalProspect = await prospectRepository.findById(testSetup.testProspectId);

            expect(finalCall?.callResult).toBe(CallResult.ABANDON);
            expect(finalProspect?.isArchived).toBe(true);

            // Vérifier que doNotCallBefore est une date très éloignée dans le futur
            const doNotCallBefore = new Date(finalProspect!.doNotCallBefore!);
            const expectedDate = new Date('2099-12-31T23:59:59.999Z');
            expect(doNotCallBefore.getTime()).toBe(expectedDate.getTime());
        });
    });
});
