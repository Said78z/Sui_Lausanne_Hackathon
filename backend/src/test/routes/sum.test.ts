import { afterAll, beforeAll, expect, test } from '@jest/globals';
import 'module-alias/register';

import { getApp } from '../setup';

let app: any;

beforeAll(async () => {
    app = await getApp();
}, 30000);

afterAll(async () => {
    await app.close();
}, 30000);

test('should return sum of two numbers', () => {
    const a = 5;
    const b = 10;
    const expectedSum = 15;

    const sum = a + b;

    expect(sum).toBe(expectedSum);
});
