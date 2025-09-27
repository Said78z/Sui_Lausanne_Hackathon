import { logger } from '@/utils/logger';
import { EnokiClient } from '@mysten/enoki';
import {
    ExecuteTransactionRequestDto,
    ExecuteTransactionResponseDto,
    SponsorTransactionRequestDto,
    SponsorTransactionResponseDto,
} from '@shared/dto';

class EnokiService {
    private logger = logger.child({
        module: '[App][EnokiService]',
    });

    private enokiClient: EnokiClient;

    constructor() {
        if (!process.env.ENOKI_PRIVATE_KEY) {
            throw new Error('ENOKI_PRIVATE_KEY environment variable is not set');
        }

        this.enokiClient = new EnokiClient({
            apiKey: process.env.ENOKI_PRIVATE_KEY,
        });

        this.logger.info('EnokiService initialized successfully');
    }

    /**
     * Sponsor a transaction using Enoki
     * @param request - The sponsor transaction request
     * @returns The sponsored transaction response
     */
    async sponsorTransaction(
        request: SponsorTransactionRequestDto
    ): Promise<SponsorTransactionResponseDto> {
        try {
            const { transactionKindBytes, sender, allowedMoveCallTargets, allowedAddresses, network } = request;

            // Validation
            if (!transactionKindBytes || !sender) {
                throw new Error('Missing required fields: transactionKindBytes, sender');
            }

            // Default values
            const targetNetwork = network || 'testnet';
            const defaultAllowedAddresses = allowedAddresses || [sender];

            this.logger.info(`Sponsoring transaction for ${sender} on ${targetNetwork}`);

            // Create sponsored transaction
            const sponsored = await this.enokiClient.createSponsoredTransaction({
                network: targetNetwork,
                transactionKindBytes,
                sender,
                allowedMoveCallTargets,
                allowedAddresses: defaultAllowedAddresses,
            });

            this.logger.info('Transaction sponsored successfully', { digest: sponsored.digest });

            return {
                success: true,
                bytes: sponsored.bytes,
                digest: sponsored.digest,
            };
        } catch (error) {
            this.logger.error('Error sponsoring transaction:', error);
            throw error;
        }
    }

    /**
     * Execute a sponsored transaction using Enoki
     * @param request - The execute transaction request
     * @returns The execution result
     */
    async executeTransaction(
        request: ExecuteTransactionRequestDto
    ): Promise<ExecuteTransactionResponseDto> {
        try {
            const { digest, signature } = request;

            // Validation
            if (!digest || !signature) {
                throw new Error('Missing required fields: digest, signature');
            }

            this.logger.info(`Executing sponsored transaction with digest: ${digest}`);

            // Execute the sponsored transaction
            const result = await this.enokiClient.executeSponsoredTransaction({
                digest,
                signature,
            });

            this.logger.info('Transaction executed successfully', { digest });

            return {
                success: true,
                result,
            };
        } catch (error) {
            this.logger.error('Error executing transaction:', error);
            throw error;
        }
    }

    /**
     * Health check for Enoki service
     * @returns Service status
     */
    async healthCheck(): Promise<{ status: string; message: string }> {
        try {
            // Simple check to ensure the client is initialized
            if (!this.enokiClient) {
                throw new Error('Enoki client not initialized');
            }

            return {
                status: 'ok',
                message: 'Enoki sponsor service is running',
            };
        } catch (error) {
            this.logger.error('Health check failed:', error);
            throw error;
        }
    }
}

export const enokiService = new EnokiService();
