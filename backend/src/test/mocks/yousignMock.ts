import { SignatureRequestMetadata, YousignWebhookSchema } from '@/types';

import { YousignDocument } from '@/config/client';

export const mockSign_ResqID = '3b752a07-9450-4323-968f-6bef4be83dbc';
export const mockSign_ResqIDForDone = '3b752a07-9450-4323-968f-6bef4be83db';
export const mockSign_ResqIDForOngoing = '3b752a07-9450-4323-968f-6bef4be83d';
export const dossierId = '06f11845-3d47-4bd7-af6a-130c81dd91f7';
export const signerId = '956722be-c524-4350-9806-b8c020ca5439';

export const mockYousignDocument: YousignDocument = {
    id: '223e5dfe-68d2-4e99-a227-a7f2a5e36468',
    createdAt: new Date('2025-06-03T12:40:06.810Z'),
    updatedAt: new Date('2025-06-03T12:40:06.810Z'),
    status: 'draft',
    type: 'Mandat de recherche',
    templateId: '8dacd3d4-03c3-4496-86bd-1890158dad07',
    yousignId: '44623df6-8ace-44c2-be9d-f2f06882533e',
    disableReminder: false,
    sentReminderCount: 0,
    purchaseOfferId: null,
    dossierId: '06f11845-3d47-4bd7-af6a-130c81dd91f7',
};

/**
 * Crée un payload de webhook pour une demande de signature
 * @param id - L'ID de la demande de signature (mockSign_ResqID par défaut)
 * @returns Le payload de webhook
 */
export function createWebhookYousignPayload(
    id: string = mockSign_ResqID,
    event: string = 'done'
): YousignWebhookSchema {
    return {
        event_name: `signature_request.${event}`,
        data: {
            signature_request: {
                id: id,
                name: 'Contrat de location',
                status: 'done',
                signers: [
                    {
                        id: signerId,
                    },
                ],
            },
        },
    };
}

/**
 * Génère une signature SHA-256 pour un payload
 * @param payload - Le payload à signer
 * @returns La signature SHA-256
 */
export function getSignatureSHA(payload: string) {
    const crypto = require('crypto');
    const calculatedSignature = crypto
        .createHmac('sha256', process.env.WEBHOOK_YOUSIGN_SECRET)
        .update(payload)
        .digest('hex');
    return `sha256=${calculatedSignature}`;
}

/**
 * Mock de la metadata d'une demande de signature
 * @param type - Le type de demande de signature (search_warrant par défaut ou purchase_offer)
 * @returns La metadata de la demande de signature
 */
export function mockSignReqMetadata(type: string = 'search_warrant'): SignatureRequestMetadata {
    return {
        type: type,
        cfp_app_dossier_id: dossierId,
        mandat_reference: 'MANDAT-00209e53-1baa-40ff-b7dc-efa29a504a85-1749037286195',
        version: 5,
    };
}
