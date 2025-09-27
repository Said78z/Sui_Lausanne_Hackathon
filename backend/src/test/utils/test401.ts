import { beforeAll, beforeEach, test } from '@jest/globals';
import { FastifyInstance } from 'fastify';

import { resetApp } from '../setup';
import { authHeaders, expectUnauthorizedResponse } from './testUtils';

enum Method {
    GET = 'GET',
    POST = 'POST',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
}

interface AuthTestOptions {
    baseUrl: string;
    bodyFor?: Partial<Record<Method, () => unknown>>;
    setupTestData: () => Promise<{ entityId: string }>;
}

export function testUnauthorizedRoutes(app: FastifyInstance, options: AuthTestOptions) {
    const { baseUrl, bodyFor = {}, setupTestData } = options;
    let entityId: string | undefined;

    beforeAll(async () => {
        const { entityId: id } = await setupTestData();
        entityId = id;
    }, 30000);

    const endpoints: Array<{ method: Method; url: string; hasBody: boolean }> = [
        { method: Method.GET, url: baseUrl, hasBody: false },
        { method: Method.GET, url: `${baseUrl}/${entityId}`, hasBody: false },
        { method: Method.POST, url: baseUrl, hasBody: true },
        { method: Method.PATCH, url: `${baseUrl}/${entityId}`, hasBody: true },
        { method: Method.DELETE, url: `${baseUrl}/${entityId}`, hasBody: false },
    ];

    for (const { method, url, hasBody } of endpoints) {
        beforeEach(async () => {
            // Réinitialiser l'application avant chaque test
            app = await resetApp();
        }, 30000);

        test(`should return 401 when no token is provided for ${method} ${url}`, async () => {
            const body = hasBody ? bodyFor[method]?.() : undefined;
            const response = await app.inject({
                method,
                url,
                ...(body ? { body } : {}),
            });
            expectUnauthorizedResponse(response);
        });

        test(`should return 401 when invalid token is provided for ${method} ${url}`, async () => {
            const body = hasBody ? bodyFor[method]?.() : undefined;
            const response = await app.inject({
                method,
                url,
                headers: authHeaders('invalid_token'),
                ...(body ? { payload: body } : {}),
            });
            expectUnauthorizedResponse(response);
        });
    }
}
