import { enokiService } from '@/services';
import { asyncHandler } from '@/utils/asyncHandler';
import { jsonResponse } from '@/utils/jsonResponse';
import { logger } from '@/utils/logger';
import {
    ExecuteTransactionRequestDto,
    ExecuteTransactionResponseDto,
    SponsorTransactionRequestDto,
    SponsorTransactionResponseDto,
} from '@shared/dto';

class EnokiController {
    private logger = logger.child({
        module: '[SUI][ENOKI][CONTROLLER]',
    });

    constructor() { }

    /**
     * Health check endpoint for Enoki service
     */
    public healthCheck = asyncHandler<unknown, unknown, unknown, { status: string; message: string }>({
        logger: this.logger,
        handler: async (request, reply) => {
            try {
                const healthStatus = await enokiService.healthCheck();
                return jsonResponse(reply, 'Enoki service is healthy', healthStatus, 200);
            } catch (error) {
                this.logger.error('Health check failed:', error);
                return jsonResponse(reply, 'Enoki service health check failed', {}, 500);
            }
        },
    });

    /**
     * Sponsor a transaction using Enoki
     */
    public sponsorTransaction = asyncHandler<
        unknown,
        unknown,
        SponsorTransactionRequestDto,
        SponsorTransactionResponseDto
    >({
        logger: this.logger,
        handler: async (request, reply) => {
            try {
                const requestBody = request.body as SponsorTransactionRequestDto;
                const { transactionKindBytes, sender, allowedMoveCallTargets, allowedAddresses, network } =
                    requestBody;

                this.logger.info('Sponsoring transaction request received', { sender, network });

                // Validation
                if (!transactionKindBytes || !sender) {
                    return jsonResponse(
                        reply,
                        'Missing required fields: transactionKindBytes, sender',
                        {},
                        400
                    );
                }

                const sponsorRequest: SponsorTransactionRequestDto = {
                    transactionKindBytes,
                    sender,
                    allowedMoveCallTargets,
                    allowedAddresses,
                    network,
                };

                const result = await enokiService.sponsorTransaction(sponsorRequest);

                return jsonResponse(reply, 'Transaction sponsored successfully', result, 200);
            } catch (error) {
                this.logger.error('Error sponsoring transaction:', error);
                return jsonResponse(
                    reply,
                    'Failed to sponsor transaction',
                    {
                        error: 'Failed to sponsor transaction',
                        details: error instanceof Error ? error.message : 'Unknown error',
                    },
                    500
                );
            }
        },
    });

    /**
     * Execute a sponsored transaction using Enoki
     */
    public executeTransaction = asyncHandler<
        unknown,
        unknown,
        ExecuteTransactionRequestDto,
        ExecuteTransactionResponseDto
    >({
        logger: this.logger,
        handler: async (request, reply) => {
            try {
                const requestBody = request.body as ExecuteTransactionRequestDto;
                const { digest, signature } = requestBody;

                this.logger.info('Execute transaction request received', { digest });

                // Validation
                if (!digest || !signature) {
                    return jsonResponse(
                        reply,
                        'Missing required fields: digest, signature',
                        {},
                        400
                    );
                }

                const executeRequest: ExecuteTransactionRequestDto = {
                    digest,
                    signature,
                };

                const result = await enokiService.executeTransaction(executeRequest);

                return jsonResponse(reply, 'Transaction executed successfully', result, 200);
            } catch (error) {
                this.logger.error('Error executing transaction:', error);
                return jsonResponse(
                    reply,
                    'Failed to execute transaction',
                    {
                        error: 'Failed to execute transaction',
                        details: error instanceof Error ? error.message : 'Unknown error',
                    },
                    500
                );
            }
        },
    });

    // Note: User authentication with Enoki has been moved to userController.authenticateWithEnoki
    // This endpoint is deprecated and should use /api/users/authenticate-enoki instead
}

export const enokiController = new EnokiController();
