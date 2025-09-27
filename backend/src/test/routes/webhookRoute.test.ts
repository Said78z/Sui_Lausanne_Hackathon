import { cleanDatabase } from '@/helpers';
import { webhookManager, yousignApiService } from '@/services';

import { afterAll, beforeAll, beforeEach, expect, jest, test } from '@jest/globals';
import 'module-alias/register';

import prisma from '@/config/prisma';

import {
    createWebhookYousignPayload,
    dossierId,
    getSignatureSHA,
    mockSignReqMetadata,
    mockSign_ResqID,
    mockSign_ResqIDForDone,
    mockSign_ResqIDForOngoing,
} from '../mocks';
import { getUsersAndToken } from '../prismaTestUtils';
import { getApp, resetApp } from '../setup';
import { authHeaders } from '../utils';

let app: any;
let authToken: string;

async function setupTestData() {
    app = await getApp();
    await cleanDatabase();
    const { token } = await getUsersAndToken(app);
    authToken = token;

    await prisma.yousignDocument.createMany({
        data: [
            {
                yousignId: mockSign_ResqID,
                status: '',
                type: 'contract',
            },
            {
                yousignId: mockSign_ResqIDForDone,
                status: 'done',
                type: 'contract',
            },
            {
                yousignId: mockSign_ResqIDForOngoing,
                status: 'ongoing',
                type: 'contract',
            },
        ],
    });

    const user = await prisma.user.create({
        data: {
            email: 'test@test.com',
            password: 'test',
            firstName: 'test',
            lastName: 'test',
            phone: 'test',
            civility: 'test',
            birthDate: '1990-01-01',
            roles: "TEST"
        },
    });

    await prisma.dossier.create({
        data: {
            id: dossierId,
            name: 'dossierName',
            ownerId: user.id,
        },
    });
}

beforeAll(async () => {
    await setupTestData();
}, 30000);

beforeEach(async () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    app = await resetApp();
}, 30000);

afterAll(async () => {
    await prisma.$disconnect();
});

test('should handle yousign webhook with valid payload for signature_request.done and search warrant type', async () => {
    jest.spyOn(yousignApiService, 'getMetadataFromSignatureRequest').mockResolvedValue(
        mockSignReqMetadata()
    );
    jest.spyOn(webhookManager as any, 'downloadCni').mockImplementation(() => Promise.resolve());
    const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks/yousign',
        headers: {
            ...authHeaders(authToken),
            'x-yousign-signature-256': getSignatureSHA(
                JSON.stringify(createWebhookYousignPayload())
            ),
        },
        body: createWebhookYousignPayload(),
    });
    expect(yousignApiService.getMetadataFromSignatureRequest).toBeCalled();

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual('Success');
}, 30000);

test('should not call webhookManager with  signature_request.done and status already done', async () => {
    jest.spyOn(yousignApiService, 'getMetadataFromSignatureRequest').mockResolvedValue(
        mockSignReqMetadata()
    );
    jest.spyOn(webhookManager, 'handleSignatureRequestDone').mockResolvedValue();

    const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks/yousign',
        headers: {
            ...authHeaders(authToken),
            'x-yousign-signature-256': getSignatureSHA(
                JSON.stringify(createWebhookYousignPayload())
            ),
        },
        body: createWebhookYousignPayload(),
    });

    const yousignDocument = await prisma.yousignDocument.findFirst({
        where: {
            yousignId: mockSign_ResqID,
        },
    });

    expect(yousignDocument?.status).toBe('done');
    expect(webhookManager.handleSignatureRequestDone).not.toBeCalled();
    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual('Success');
}, 30000);

test('should handle yousign webhook with invalid signature', async () => {
    const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks/yousign',
        headers: {
            ...authHeaders(authToken),
            'x-yousign-signature-256': 'sha256=invalid-signature',
        },
        body: createWebhookYousignPayload(),
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().message).toEqual('Invalid signature');
}, 30000);

test('should handle yousign webhook with missing signature header', async () => {
    const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks/yousign',
        headers: authHeaders(authToken),
        body: createWebhookYousignPayload(),
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().message).toEqual('Invalid signature');
}, 30000);

test('should not call webhookManager with signature_request.activated and status already ongoing', async () => {
    jest.spyOn(yousignApiService, 'getMetadataFromSignatureRequest').mockResolvedValue(
        mockSignReqMetadata()
    );
    jest.spyOn(webhookManager, 'handleSignatureRequestActivated').mockResolvedValue();
    const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks/yousign',
        headers: {
            ...authHeaders(authToken),
            'x-yousign-signature-256': getSignatureSHA(
                JSON.stringify(createWebhookYousignPayload(mockSign_ResqIDForOngoing, 'activated'))
            ),
        },
        body: createWebhookYousignPayload(mockSign_ResqIDForOngoing, 'activated'),
    });

    expect(webhookManager.handleSignatureRequestActivated).not.toBeCalled();
    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual('Success');
}, 30000);

test('should call webhookManager with signature_request.activated and purchase offer type', async () => {
    jest.spyOn(yousignApiService, 'getMetadataFromSignatureRequest').mockResolvedValue(
        mockSignReqMetadata('purchase_offer')
    );
    const handlePurchaseOfferActivationSpy = jest.spyOn(
        webhookManager as any,
        'handlePurchaseOfferActivation'
    );
    const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks/yousign',
        headers: {
            ...authHeaders(authToken),
            'x-yousign-signature-256': getSignatureSHA(
                JSON.stringify(createWebhookYousignPayload(undefined, 'activated'))
            ),
        },
        body: createWebhookYousignPayload(undefined, 'activated'),
    });

    expect(handlePurchaseOfferActivationSpy).toBeCalled();
    expect(yousignApiService.getMetadataFromSignatureRequest).toBeCalled();
    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual('Success');
}, 30000);

test('should call webhookManager with signature_request.activated and search warrant type', async () => {
    jest.spyOn(yousignApiService, 'getMetadataFromSignatureRequest').mockResolvedValue(
        mockSignReqMetadata()
    );
    const handleSearchWarrantActivationSpy = jest.spyOn(
        webhookManager as any,
        'handleSearchWarrantActivation'
    );
    const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks/yousign',
        headers: {
            ...authHeaders(authToken),
            'x-yousign-signature-256': getSignatureSHA(
                JSON.stringify(createWebhookYousignPayload(undefined, 'activated'))
            ),
        },
        body: createWebhookYousignPayload(undefined, 'activated'),
    });

    expect(handleSearchWarrantActivationSpy).toBeCalled();
    expect(yousignApiService.getMetadataFromSignatureRequest).toBeCalled();
    expect(response.statusCode).toBe(200);
    expect(response.json().message).toEqual('Success');
}, 30000);
