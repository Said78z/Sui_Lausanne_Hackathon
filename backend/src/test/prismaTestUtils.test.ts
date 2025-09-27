import { cleanDatabase } from '@/helpers';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';

import { disconnectPrisma, getUsersAndToken } from './prismaTestUtils';
import { getApp, resetApp } from './setup';

describe('getUsersAndToken', () => {
    let app: any;

    beforeAll(async () => {
        app = await getApp();
    }, 30000);

    afterAll(async () => {
        await disconnectPrisma();
        await app.close();
    }, 30000);

    beforeEach(async () => {
        await cleanDatabase();
        app = await resetApp();
    }, 30000);

    it("devrait retourner un token et une liste d'utilisateurs", async () => {
        // Act
        const result = await getUsersAndToken(app);

        // Assert
        expect(result).toHaveProperty('token');
        expect(result).toHaveProperty('users');
        expect(result.token).toBeTruthy();
        expect(Array.isArray(result.users)).toBe(true);
        expect(result.users.length).toBeGreaterThan(0);
    }, 30000);

    it('devrait créer les utilisateurs', async () => {
        // Act
        const { users } = await getUsersAndToken(app);

        // Assert
        for (const user of users) {
            expect(user).toHaveProperty('id');
            expect(user).toHaveProperty('email');
        }
    }, 30000);
});
