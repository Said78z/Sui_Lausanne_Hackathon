import { enokiService } from '@/services/enokiService';
import { asyncHandler } from '@/utils/asyncHandler';
import { jsonResponse } from '@/utils/jsonResponse';
import { logger } from '@/utils/logger';

interface SponsorTransactionBody {
    transactionKindBytes: string;
    sender: string;
    allowedMoveCallTargets?: string[];
    allowedAddresses?: string[];
    network?: 'testnet' | 'mainnet' | 'devnet';
}

interface ExecuteTransactionBody {
    digest: string;
    signature: string;
}

class EnokiController {
    private logger = logger.child({
        module: '[CFR][ENOKI][CONTROLLER]',
    });

    constructor() { }

    /**
     * Health check endpoint
     */
    public health = asyncHandler<unknown, unknown, unknown, unknown>({
        logger: this.logger,
        handler: async (request, reply) => {
            const status = enokiService.getHealthStatus();
            return jsonResponse(reply, status.message, { status: status.status }, 200);
        },
    });

    /**
     * Sponsor a transaction
     */
    public sponsorTransaction = asyncHandler<unknown, unknown, SponsorTransactionBody, unknown>({
        logger: this.logger,
        handler: async (request, reply) => {
            try {
                const { transactionKindBytes, sender, allowedMoveCallTargets, allowedAddresses, network } = request.body as SponsorTransactionBody;

                this.logger.info('Sponsor transaction request', { sender, network: network || 'testnet' });

                // Validation
                if (!transactionKindBytes || !sender) {
                    return jsonResponse(reply, 'Missing required fields: transactionKindBytes, sender', {}, 400);
                }

                // Sponsor the transaction
                const result = await enokiService.sponsorTransaction({
                    transactionKindBytes,
                    sender,
                    allowedMoveCallTargets,
                    allowedAddresses,
                    network,
                });

                return jsonResponse(
                    reply,
                    'Transaction sponsored successfully',
                    {
                        success: result.success,
                        bytes: result.bytes,
                        digest: result.digest,
                    },
                    200
                );
            } catch (error) {
                this.logger.error('Sponsor transaction error:', error);
                return jsonResponse(
                    reply,
                    'Failed to sponsor transaction',
                    { details: error instanceof Error ? error.message : 'Unknown error' },
                    500
                );
            }
        },
    });

    /**
     * Execute a sponsored transaction
     */
    public executeTransaction = asyncHandler<unknown, unknown, ExecuteTransactionBody, unknown>({
        logger: this.logger,
        handler: async (request, reply) => {
            try {
                const { digest, signature } = request.body as ExecuteTransactionBody;

                this.logger.info('Execute transaction request', {
                    digest: digest?.substring(0, 10) + '...'
                });

                // Validation
                if (!digest || !signature) {
                    return jsonResponse(reply, 'Missing required fields: digest, signature', {}, 400);
                }

                // Execute the transaction
                const result = await enokiService.executeTransaction({
                    digest,
                    signature,
                });

                return jsonResponse(
                    reply,
                    'Transaction executed successfully',
                    {
                        success: result.success,
                        result: result.result,
                    },
                    200
                );
            } catch (error) {
                this.logger.error('Execute transaction error:', error);
                return jsonResponse(
                    reply,
                    'Failed to execute transaction',
                    { details: error instanceof Error ? error.message : 'Unknown error' },
                    500
                );
            }
        },
    });
}

export const enokiController = new EnokiController();
