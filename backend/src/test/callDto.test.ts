import { describe, expect, it } from '@jest/globals';
import { updateCallSchema } from '@shared/dto/callDto';
import { CallResult, CallStatus } from '@shared/enums/callEnums';

describe('updateCallSchema - callbackDate et callbackTime', () => {
    describe('callbackDate validation', () => {
        it('devrait accepter une date future', () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(12, 0, 0, 0);

            const data = {
                callbackDate: tomorrow.toISOString(),
            };

            const result = updateCallSchema.safeParse(data);
            expect(result.success).toBe(true);
        });

        it('devrait rejeter une date passée', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(12, 0, 0, 0);

            const data = {
                callbackDate: yesterday.toISOString(),
            };

            const result = updateCallSchema.safeParse(data);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("La date de recontact doit être supérieure à aujourd'hui");
            }
        });

        it('devrait rejeter la date d\'aujourd\'hui', () => {
            const today = new Date();
            today.setHours(12, 0, 0, 0);

            const data = {
                callbackDate: today.toISOString(),
            };

            const result = updateCallSchema.safeParse(data);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("La date de recontact doit être supérieure à aujourd'hui");
            }
        });

        it('devrait accepter une date future même à minuit', () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const data = {
                callbackDate: tomorrow.toISOString(),
            };

            const result = updateCallSchema.safeParse(data);
            expect(result.success).toBe(true);
        });
    });

    describe('callbackTime validation', () => {
        it('devrait accepter une heure future', () => {
            const now = new Date();
            const futureHour = (now.getHours() + 1) % 24;
            const futureTime = `${futureHour.toString().padStart(2, '0')}:30`;

            const data = {
                callbackTime: futureTime,
            };

            const result = updateCallSchema.safeParse(data);
            expect(result.success).toBe(true);
        });

        it('devrait accepter l\'heure actuelle', () => {
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

            const data = {
                callbackTime: currentTime,
            };

            const result = updateCallSchema.safeParse(data);
            expect(result.success).toBe(true);
        });

        it('devrait rejeter une heure passée', () => {
            const now = new Date();
            const pastHour = (now.getHours() - 1 + 24) % 24;
            const pastTime = `${pastHour.toString().padStart(2, '0')}:30`;

            const data = {
                callbackTime: pastTime,
            };

            const result = updateCallSchema.safeParse(data);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("L'heure de recontact doit être à l'heure actuelle ou dans le futur");
            }
        });

        it('devrait rejeter un format d\'heure invalide', () => {
            const data = {
                callbackTime: '25:00',
            };

            const result = updateCallSchema.safeParse(data);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Format d\'heure invalide (HH:MM)');
            }
        });

        it('devrait rejeter un format d\'heure invalide avec des minutes', () => {
            const data = {
                callbackTime: '12:60',
            };

            const result = updateCallSchema.safeParse(data);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Format d\'heure invalide (HH:MM)');
            }
        });
    });

    describe('Combinaison callbackDate et callbackTime', () => {
        it('devrait accepter une date et heure futures', () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(14, 30, 0, 0);

            const data = {
                callbackDate: tomorrow.toISOString(),
                callbackTime: '15:00',
            };

            const result = updateCallSchema.safeParse(data);
            expect(result.success).toBe(true);
        });

        it('devrait accepter callbackDate seul', () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(12, 0, 0, 0);

            const data = {
                callbackDate: tomorrow.toISOString(),
            };

            const result = updateCallSchema.safeParse(data);
            expect(result.success).toBe(true);
        });

        it('devrait accepter callbackTime seul', () => {
            const now = new Date();
            const futureTime = `${(now.getHours() + 1) % 24}:30`;

            const data = {
                callbackTime: futureTime,
            };

            const result = updateCallSchema.safeParse(data);
            expect(result.success).toBe(true);
        });
    });

    describe('Autres champs du schéma', () => {
        it('devrait accepter tous les champs optionnels', () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(12, 0, 0, 0);

            const data = {
                status: CallStatus.ANSWERED,
                calledAt: new Date().toISOString(),
                callResult: CallResult.CALLBACK_TODAY,
                notes: 'Test notes',
                duration: 300,
                callbackDate: tomorrow.toISOString(),
                callbackTime: '14:30',
            };

            const result = updateCallSchema.safeParse(data);
            expect(result.success).toBe(true);
        });

        it('devrait accepter un objet vide', () => {
            const data = {};

            const result = updateCallSchema.safeParse(data);
            expect(result.success).toBe(true);
        });
    });
}); 