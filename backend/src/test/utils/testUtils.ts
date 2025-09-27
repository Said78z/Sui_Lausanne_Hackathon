import { expect } from '@jest/globals';
import { ZodSchema } from 'zod';

/**
 * Vérifie si une réponse est une réponse d'erreur d'authentification (401)
 * @param response - La réponse à vérifier
 */
export const expectUnauthorizedResponse = (response: any) => {
    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
        message: 'Unauthorized',
        status: 401,
        data: {},
        timestamp: expect.any(String),
    });
};
/**
 * Vérifie si un objet correspond à un schéma Zod
 * @param data - L'objet à vérifier
 * @param schema - Le schéma Zod à utiliser pour la validation
 */
export function expectToMatchSchema<T>(data: unknown, schema: ZodSchema<T>): asserts data is T {
    const result = schema.safeParse(data);
    if (!result.success) {
        console.error('Validation errors:', result.error.format());
    }
    expect(result.success).toBe(true);
}

/**
 * Retourne les headers d'authentification pour une requête
 * @param token - Le token d'authentification
 * @returns Les headers d'authentification "Authorization: `Bearer ${token}`"
 */
export const authHeaders = (token: string) => ({
    Authorization: `Bearer ${token}`,
});

/**
 * Omet les propriétés d'un objet
 * @param obj - L'objet à modifier
 * @param keys - Les propriétés à omettre
 * @returns L'objet sans les propriétés spécifiées
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const clone = { ...obj };
    for (const key of keys) {
      delete clone[key];
    }
    return clone;
  }
  