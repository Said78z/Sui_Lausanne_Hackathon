import { logger } from '@/utils/logger';
import { EnokiClient } from '@mysten/enoki';

interface SponsorTransactionRequest {
    transactionKindBytes: string;
    sender: string;
    allowedMoveCallTargets?: string[];
    allowedAddresses?: string[];
    network?: 'testnet' | 'mainnet' | 'devnet';
}

interface ExecuteTransactionRequest {
    digest: string;
    signature: string;
}

interface SponsorTransactionResponse {
    success: boolean;
    bytes: string;
    digest: string;
}

interface ExecuteTransactionResponse {
    success: boolean;
    result: any;
}

class EnokiService {
    private enokiClient: EnokiClient;
    private logger = logger.child({
        module: '[App][EnokiService]',
    });

    constructor() {
        if (!process.env.ENOKI_PRIVATE_KEY) {
            this.logger.error('ENOKI_PRIVATE_KEY is required for sponsored transactions');
            throw new Error('ENOKI_PRIVATE_KEY environment variable is not set');
        }

        // Initialize Enoki Client for sponsored transactions
        this.enokiClient = new EnokiClient({
            apiKey: process.env.ENOKI_PRIVATE_KEY,
        });

        this.logger.info('Enoki client initialized for sponsored transactions');
    }

    /**
     * Sponsor a transaction for a user
     * @param request - Transaction sponsorship request
     * @returns Sponsored transaction response
     */
    async sponsorTransaction(request: SponsorTransactionRequest): Promise<SponsorTransactionResponse> {
        try {
            const { transactionKindBytes, sender, allowedMoveCallTargets, allowedAddresses, network } = request;

            this.logger.info('Sponsoring transaction', { sender, network: network || 'testnet' });

            // Validation
            if (!transactionKindBytes || !sender) {
                throw new Error('Missing required fields: transactionKindBytes, sender');
            }

            // Default values
            const targetNetwork = network || 'testnet';
            const defaultAllowedAddresses = allowedAddresses || [sender];

            // Create sponsored transaction using Enoki
            const sponsored = await this.enokiClient.createSponsoredTransaction({
                network: targetNetwork,
                transactionKindBytes,
                sender,
                allowedMoveCallTargets,
                allowedAddresses: defaultAllowedAddresses,
            });

            this.logger.info('Transaction sponsored successfully', {
                digest: sponsored.digest.substring(0, 10) + '...',
                sender: sender.substring(0, 10) + '...'
            });

            return {
                success: true,
                bytes: sponsored.bytes,
                digest: sponsored.digest,
            };

        } catch (error) {
            this.logger.error('Error sponsoring transaction:', error);
            throw new Error(`Failed to sponsor transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Execute a sponsored transaction
     * @param request - Transaction execution request
     * @returns Execution result
     */
    async executeTransaction(request: ExecuteTransactionRequest): Promise<ExecuteTransactionResponse> {
        try {
            const { digest, signature } = request;

            this.logger.info('Executing sponsored transaction', {
                digest: digest.substring(0, 10) + '...'
            });

            // Validation
            if (!digest || !signature) {
                throw new Error('Missing required fields: digest, signature');
            }

            // Execute the sponsored transaction using Enoki
            const result = await this.enokiClient.executeSponsoredTransaction({
                digest,
                signature,
            });

            this.logger.info('Transaction executed successfully', {
                digest: digest.substring(0, 10) + '...'
            });

            return {
                success: true,
                result,
            };

        } catch (error) {
            this.logger.error('Error executing transaction:', error);
            throw new Error(`Failed to execute transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Health check for Enoki service
     * @returns Service status
     */
    getHealthStatus(): { status: string; message: string } {
        return {
            status: 'ok',
            message: 'Enoki sponsor service is running'
        };
    }
}

export const enokiService = new EnokiService();
