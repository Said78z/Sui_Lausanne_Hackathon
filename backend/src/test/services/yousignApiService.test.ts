import { describe, expect, test } from '@jest/globals';

import { yousignApiService } from '@/services/yousignApiService';

describe("YousignApiService - Tests d'intégration", () => {
    let signatureRequestId: string;
    let signerId: string;
    let signerDocumentId: string;

    describe('createSignatureRequest', () => {
        test('devrait créer une demande de signature pour le purchase offer avec succès', async () => {
            const body = {
                name: 'Test Signature Request',
                delivery_mode: 'email',
                reminder_settings: {
                    interval_in_days: 1,
                    max_occurrences: 5,
                },
                signers_allowed_to_decline: false,
                email_notification: {
                    sender: {
                        type: 'custom',
                        custom_name: 'Cash Flow Positif',
                    },
                },
                template_placeholders: {
                    signers: [
                        {
                            info: {
                                locale: 'fr',
                                first_name: 'John',
                                last_name: 'Doe',
                                email: 'john.doe@example.com',
                            },
                            label: 'Investisseur',
                            signature_level: 'electronic_signature',
                            signature_authentication_mode: 'otp_email',
                            delivery_mode: 'email',
                        },
                    ],
                    read_only_text_fields: [
                        {
                            label: 'type',
                            text: 'Appartement',
                        },
                        {
                            label: 'investor_name',
                            text: 'John Doe',
                        },
                        {
                            label: 'investor_address',
                            text: '123 rue de test',
                        },
                        {
                            label: 'investor_city',
                            text: 'Paris',
                        },
                        {
                            label: 'recipient_name',
                            text: 'Agence Test',
                        },
                        {
                            label: 'recipient_address',
                            text: "456 rue de l'agence",
                        },
                        {
                            label: 'recipient_city',
                            text: 'Lyon',
                        },
                        {
                            label: 'product_city',
                            text: 'Marseille',
                        },
                        {
                            label: 'product_price',
                            text: '200000',
                        },
                        {
                            label: 'expire_at',
                            text: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(
                                'fr-FR'
                            ),
                        },
                        {
                            label: 'send_date',
                            text: new Date().toLocaleDateString('fr-FR'),
                        },
                        {
                            label: 'additional_information',
                            text: "Test d'intégration",
                        },
                        {
                            label: 'destination_agency',
                            text: 'Agence Test',
                        },
                    ],
                },
                ordered_signers: true,
                template_id: process.env.OPPORTUNITY_PURCHASE_OFFER,
                audit_trail_locale: 'fr',
            };

            const metadata = {
                type: 'test_integration',
                cfp_app_dossier_id: 'test-dossier-123',
                cfp_app_po_id: 'test-po-123',
            };

            const result = await yousignApiService.createSignatureRequest(body, metadata);

            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.status).toBeDefined();
            expect(result.name).toBeDefined();
            expect(result.name).toBe('Test Signature Request');

            // Sauvegarde de les IDs pour les tests suivants
            signatureRequestId = result.id;
            signerId = result.signers[0].id;
        }, 30000); // Timeout augmenté pour l'appel API
    });

    describe('getMetadataFromSignatureRequest', () => {
        test('devrait récupérer les métadonnées de la demande créée', async () => {
            expect(signatureRequestId).toBeDefined();

            const metadata =
                await yousignApiService.getMetadataFromSignatureRequest(signatureRequestId);

            expect(metadata).toBeDefined();
            expect(metadata.type).toBe('test_integration');
            expect(metadata.cfp_app_dossier_id).toBe('test-dossier-123');
            expect(metadata.cfp_app_po_id).toBe('test-po-123');
        }, 30000);
    });

    //TODO : à implémenter correctement
    describe('getListOfSignerDocumentsForSigner', () => {
        test('devrait récupérer la liste des documents du signataire', async () => {
            expect(signatureRequestId).toBeDefined();

            // On récupère d'abord les signataires de la demande
            const listOfDocument = await yousignApiService.getListOfSignerDocumentsForSigner(
                signatureRequestId,
                signerId
            );
            expect(listOfDocument).toBeDefined();
            expect(Array.isArray(listOfDocument)).toBe(true);
            if (listOfDocument && listOfDocument.length > 0) {
                signerDocumentId = listOfDocument[0].id;
            }
        }, 30000);
    });

    describe('downloadDocument', () => {
        test('devrait télécharger le document de la demande', async () => {
            //TODO : à implémenter correctement quand on aura le pipedriveManager
            expect(signatureRequestId).toBeDefined();

            const document = await yousignApiService.downloadDocument(signatureRequestId);
            expect(document).toBeDefined();
            expect(document).toBeInstanceOf(ArrayBuffer);
        }, 30000);

        //TODO : A voir s'il y a un moyen de tester ça
        // test('devrait télécharger le document du signataire', async () => {
        //     expect(signatureRequestId).toBeDefined();
        //     expect(signerId).toBeDefined();
        //     expect(signerDocumentId).toBeDefined();

        //     const document = await yousignApiService.downloadSignerDocument(signatureRequestId, signerId, signerDocumentId);
        //     expect(document).toBeDefined();
        //     expect(document).toBeInstanceOf(ArrayBuffer);
        // }, 30000);
    });

    describe('createSignatureRequest - Test avec le body du DossierService', () => {
        const dossierBody = {
            delivery_mode: 'email',
            reminder_settings: {
                interval_in_days: 1,
                max_occurrences: 5,
            },
            signers_allowed_to_decline: false,
            email_notification: {
                sender: {
                    type: 'custom',
                    custom_name: 'Cash Flow Positif',
                },
            },
            template_placeholders: {
                signers: [
                    {
                        info: {
                            locale: 'fr',
                            first_name: 'John',
                            last_name: 'Doe',
                            email: 'john.doe@example.com',
                        },
                        label: 'Customer 1',
                        signature_level: 'electronic_signature',
                        signature_authentication_mode: 'otp_email',
                        delivery_mode: 'email',
                    },
                ],
                read_only_text_fields: [
                    {
                        label: 'cfp_app_dossier_id',
                        text: 'test-dossier-123',
                    },
                    {
                        label: 'mandat_reference',
                        text: 'MANDAT-test-dossier-123-1234567890',
                    },
                    {
                        label: 'min_rental_yield',
                        text: '5 %',
                    },
                    {
                        label: 'max_budget',
                        text: '200000 €',
                    },
                ],
            },
            name: 'Mandat de recherche',
            ordered_signers: true,
            audit_trail_locale: 'fr',
        };

        const dossierMetadata = {
            type: 'search_warrant',
            cfp_app_dossier_id: 'test-dossier-123',
            mandat_reference: 'MANDAT-test-dossier-123-1234567890',
            version: 1,
        };

        const testSignatureRequest = async (templateId: string) => {
            const body = {
                ...dossierBody,
                template_id: templateId,
            };

            const result = await yousignApiService.createSignatureRequest(body, dossierMetadata);

            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.status).toBeDefined();
            expect(result.name).toBe('Mandat de recherche');

            return result;
        };

        test('devrait créer une demande de signature EXCLUSIVE_SEARCH_WARRANT_ONE_PERSON', async () => {
            const result = await testSignatureRequest(
                process.env.EXCLUSIVE_SEARCH_WARRANT_ONE_PERSON || ''
            );
            signatureRequestId = result.id;
        }, 30000);

        test('devrait créer une demande de signature EXCLUSIVE_SEARCH_WARRANT_TWO_PERSON', async () => {
            await testSignatureRequest(process.env.EXCLUSIVE_SEARCH_WARRANT_TWO_PERSON || '');
        }, 30000);

        test('devrait créer une demande de signature EXCLUSIVE_SEARCH_WARRANT_THREE_PERSON', async () => {
            await testSignatureRequest(process.env.EXCLUSIVE_SEARCH_WARRANT_THREE_PERSON || '');
        }, 30000);

        test('devrait créer une demande de signature SIMPLE_SEARCH_WARRANT_ONE_PERSON', async () => {
            await testSignatureRequest(process.env.SIMPLE_SEARCH_WARRANT_ONE_PERSON || '');
        }, 30000);

        test('devrait créer une demande de signature SIMPLE_SEARCH_WARRANT_TWO_PERSON', async () => {
            await testSignatureRequest(process.env.SIMPLE_SEARCH_WARRANT_TWO_PERSON || '');
        }, 30000);

        test('devrait créer une demande de signature SIMPLE_SEARCH_WARRANT_THREE_PERSON', async () => {
            await testSignatureRequest(process.env.SIMPLE_SEARCH_WARRANT_THREE_PERSON || '');
        }, 30000);

        describe("Tests des cas d'erreur", () => {
            test('devrait retourner une erreur 400 avec un template_id invalide', async () => {
                const invalidBody = {
                    ...dossierBody,
                    template_id: 'invalid-template-id',
                };

                await expect(
                    yousignApiService.createSignatureRequest(invalidBody, dossierMetadata)
                ).rejects.toThrow('400');
            }, 30000);

            test('devrait retourner une erreur 400 avec des métadonnées invalides', async () => {
                const body = {
                    ...dossierBody,
                    template_id: process.env.EXCLUSIVE_SEARCH_WARRANT_ONE_PERSON || '',
                };

                const invalidMetadata = {
                    ...dossierMetadata,
                    type: '', // type vide invalide
                };

                await expect(
                    yousignApiService.createSignatureRequest(body, invalidMetadata)
                ).rejects.toThrow('400');
            }, 30000);

            test('devrait retourner une erreur 400 avec des signataires invalides', async () => {
                const invalidSignersBody = {
                    ...dossierBody,
                    template_placeholders: {
                        ...dossierBody.template_placeholders,
                        signers: [], // tableau de signataires vide invalide
                    },
                    template_id: process.env.EXCLUSIVE_SEARCH_WARRANT_ONE_PERSON || '',
                };

                await expect(
                    yousignApiService.createSignatureRequest(invalidSignersBody, dossierMetadata)
                ).rejects.toThrow('400');
            }, 30000);
        });
    });
});
