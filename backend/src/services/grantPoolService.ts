import { logger } from '@/utils/logger';
import { Transaction } from '@mysten/sui/transactions';
import {
    CreateGrantPoolRequestDto,
    CreateGrantPoolResponseDto,
    DepositToPoolRequestDto,
    DepositToPoolResponseDto,
    DistributeGrantsRequestDto,
    DistributeGrantsResponseDto,
    GrantPoolInfoDto,
    RefundPoolRequestDto,
    RefundPoolResponseDto,
    SetPayoutsRequestDto,
    SetPayoutsResponseDto,
    SponsorTransactionRequestDto,
} from '@shared/dto';
import { enokiService } from './enokiService';

class GrantPoolService {
    private logger = logger.child({
        module: '[App][GrantPoolService]',
    });

    // Contract package ID - will be set after deployment
    private readonly GRANT_POOL_PACKAGE_ID = process.env.GRANT_POOL_PACKAGE_ID || '0x0';

    constructor() {
        this.logger.info('GrantPoolService initialized successfully');
    }

    /**
     * Create a new grant pool for an event
     * @param request - The create grant pool request
     * @returns The create grant pool response
     */
    async createGrantPool(request: CreateGrantPoolRequestDto): Promise<CreateGrantPoolResponseDto> {
        try {
            const { eventId, initialAmount, coinType = 'SUI', network = 'testnet' } = request;

            this.logger.info(`Creating grant pool for event ${eventId} with initial amount ${initialAmount}`);

            // Validate inputs
            if (!eventId || initialAmount === undefined || initialAmount <= 0) {
                throw new Error('Missing or invalid required fields: eventId, initialAmount');
            }

            if (this.GRANT_POOL_PACKAGE_ID === '0x0') {
                throw new Error('Grant Pool contract not deployed. Please set GRANT_POOL_PACKAGE_ID environment variable.');
            }

            // Create transaction to initialize grant pool
            const tx = new Transaction();

            // For simplicity, we'll assume the initial funds come from a coin object
            // In production, this would need to handle actual coin objects
            const coinObjectId = process.env.INITIAL_COIN_OBJECT_ID || '0x0';

            // Call the init_pool function from the grant pool contract
            tx.moveCall({
                target: `${this.GRANT_POOL_PACKAGE_ID}::grant_pool::init_pool`,
                typeArguments: [`0x2::sui::SUI`], // Using SUI as default coin type
                arguments: [
                    tx.pure.u64(eventId),
                    tx.object(coinObjectId), // This should be a real coin object
                ],
            });

            // Get transaction bytes
            const transactionKindBytes = await tx.build({ client: undefined });

            // Use admin address for pool creation
            const adminAddress = process.env.ADMIN_ADDRESS || '0x0';

            // Create sponsor transaction request
            const sponsorRequest: SponsorTransactionRequestDto = {
                transactionKindBytes: Buffer.from(transactionKindBytes).toString('base64'),
                sender: adminAddress,
                allowedMoveCallTargets: [`${this.GRANT_POOL_PACKAGE_ID}::grant_pool::init_pool`],
                allowedAddresses: [adminAddress],
                network,
            };

            // Sponsor the transaction
            const sponsorResult = await enokiService.sponsorTransaction(sponsorRequest);

            if (!sponsorResult.success) {
                throw new Error('Failed to sponsor grant pool creation transaction');
            }

            this.logger.info('Grant pool creation transaction sponsored successfully', {
                digest: sponsorResult.digest,
                eventId,
                initialAmount,
            });

            return {
                success: true,
                transactionDigest: sponsorResult.digest,
            };
        } catch (error) {
            this.logger.error('Error creating grant pool:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }

    /**
     * Deposit additional funds to a grant pool
     * @param request - The deposit to pool request
     * @returns The deposit to pool response
     */
    async depositToPool(request: DepositToPoolRequestDto): Promise<DepositToPoolResponseDto> {
        try {
            const { poolId, amount, coinType = 'SUI', network = 'testnet' } = request;

            this.logger.info(`Depositing ${amount} to pool ${poolId}`);

            // Validate inputs
            if (!poolId || amount === undefined || amount <= 0) {
                throw new Error('Missing or invalid required fields: poolId, amount');
            }

            if (this.GRANT_POOL_PACKAGE_ID === '0x0') {
                throw new Error('Grant Pool contract not deployed. Please set GRANT_POOL_PACKAGE_ID environment variable.');
            }

            // Create transaction to deposit to pool
            const tx = new Transaction();

            // This would need to handle actual coin objects in production
            const coinObjectId = process.env.DEPOSIT_COIN_OBJECT_ID || '0x0';

            // Call the deposit function from the grant pool contract
            tx.moveCall({
                target: `${this.GRANT_POOL_PACKAGE_ID}::grant_pool::deposit`,
                typeArguments: [`0x2::sui::SUI`],
                arguments: [
                    tx.object(poolId),
                    tx.object(coinObjectId),
                ],
            });

            // Get transaction bytes
            const transactionKindBytes = await tx.build({ client: undefined });

            // Use admin address for deposits
            const adminAddress = process.env.ADMIN_ADDRESS || '0x0';

            // Create sponsor transaction request
            const sponsorRequest: SponsorTransactionRequestDto = {
                transactionKindBytes: Buffer.from(transactionKindBytes).toString('base64'),
                sender: adminAddress,
                allowedMoveCallTargets: [`${this.GRANT_POOL_PACKAGE_ID}::grant_pool::deposit`],
                allowedAddresses: [adminAddress],
                network,
            };

            // Sponsor the transaction
            const sponsorResult = await enokiService.sponsorTransaction(sponsorRequest);

            if (!sponsorResult.success) {
                throw new Error('Failed to sponsor pool deposit transaction');
            }

            this.logger.info('Pool deposit transaction sponsored successfully', {
                digest: sponsorResult.digest,
                poolId,
                amount,
            });

            return {
                success: true,
                transactionDigest: sponsorResult.digest,
            };
        } catch (error) {
            this.logger.error('Error depositing to pool:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }

    /**
     * Set payout amounts for a grant pool
     * @param request - The set payouts request
     * @returns The set payouts response
     */
    async setPayouts(request: SetPayoutsRequestDto): Promise<SetPayoutsResponseDto> {
        try {
            const { poolId, payouts, network = 'testnet' } = request;

            this.logger.info(`Setting payouts for pool ${poolId}`, { payouts });

            // Validate inputs
            if (!poolId || !payouts || payouts.length === 0) {
                throw new Error('Missing or invalid required fields: poolId, payouts');
            }

            if (this.GRANT_POOL_PACKAGE_ID === '0x0') {
                throw new Error('Grant Pool contract not deployed. Please set GRANT_POOL_PACKAGE_ID environment variable.');
            }

            // Create transaction to set payouts
            const tx = new Transaction();

            // Call the set_payouts function from the grant pool contract
            tx.moveCall({
                target: `${this.GRANT_POOL_PACKAGE_ID}::grant_pool::set_payouts`,
                typeArguments: [`0x2::sui::SUI`],
                arguments: [
                    tx.object(poolId),
                    tx.pure(payouts, 'vector<u64>'),
                ],
            });

            // Get transaction bytes
            const transactionKindBytes = await tx.build({ client: undefined });

            // Use admin address for setting payouts
            const adminAddress = process.env.ADMIN_ADDRESS || '0x0';

            // Create sponsor transaction request
            const sponsorRequest: SponsorTransactionRequestDto = {
                transactionKindBytes: Buffer.from(transactionKindBytes).toString('base64'),
                sender: adminAddress,
                allowedMoveCallTargets: [`${this.GRANT_POOL_PACKAGE_ID}::grant_pool::set_payouts`],
                allowedAddresses: [adminAddress],
                network,
            };

            // Sponsor the transaction
            const sponsorResult = await enokiService.sponsorTransaction(sponsorRequest);

            if (!sponsorResult.success) {
                throw new Error('Failed to sponsor set payouts transaction');
            }

            this.logger.info('Set payouts transaction sponsored successfully', {
                digest: sponsorResult.digest,
                poolId,
                payouts,
            });

            return {
                success: true,
                transactionDigest: sponsorResult.digest,
            };
        } catch (error) {
            this.logger.error('Error setting payouts:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }

    /**
     * Distribute grants to winners
     * @param request - The distribute grants request
     * @returns The distribute grants response
     */
    async distributeGrants(request: DistributeGrantsRequestDto): Promise<DistributeGrantsResponseDto> {
        try {
            const { poolId, winners, network = 'testnet' } = request;

            this.logger.info(`Distributing grants from pool ${poolId} to ${winners.length} winners`);

            // Validate inputs
            if (!poolId || !winners || winners.length === 0) {
                throw new Error('Missing or invalid required fields: poolId, winners');
            }

            if (this.GRANT_POOL_PACKAGE_ID === '0x0') {
                throw new Error('Grant Pool contract not deployed. Please set GRANT_POOL_PACKAGE_ID environment variable.');
            }

            // Create transaction to distribute grants
            const tx = new Transaction();

            // Call the distribute function from the grant pool contract
            tx.moveCall({
                target: `${this.GRANT_POOL_PACKAGE_ID}::grant_pool::distribute`,
                typeArguments: [`0x2::sui::SUI`],
                arguments: [
                    tx.object(poolId),
                    tx.pure(winners, 'vector<address>'),
                ],
            });

            // Get transaction bytes
            const transactionKindBytes = await tx.build({ client: undefined });

            // Use admin address for distribution
            const adminAddress = process.env.ADMIN_ADDRESS || '0x0';

            // Create sponsor transaction request
            const sponsorRequest: SponsorTransactionRequestDto = {
                transactionKindBytes: Buffer.from(transactionKindBytes).toString('base64'),
                sender: adminAddress,
                allowedMoveCallTargets: [`${this.GRANT_POOL_PACKAGE_ID}::grant_pool::distribute`],
                allowedAddresses: [adminAddress],
                network,
            };

            // Sponsor the transaction
            const sponsorResult = await enokiService.sponsorTransaction(sponsorRequest);

            if (!sponsorResult.success) {
                throw new Error('Failed to sponsor grant distribution transaction');
            }

            this.logger.info('Grant distribution transaction sponsored successfully', {
                digest: sponsorResult.digest,
                poolId,
                winnersCount: winners.length,
            });

            return {
                success: true,
                transactionDigest: sponsorResult.digest,
            };
        } catch (error) {
            this.logger.error('Error distributing grants:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }

    /**
     * Refund remaining funds from a pool
     * @param request - The refund pool request
     * @returns The refund pool response
     */
    async refundPool(request: RefundPoolRequestDto): Promise<RefundPoolResponseDto> {
        try {
            const { poolId, network = 'testnet' } = request;

            this.logger.info(`Refunding pool ${poolId}`);

            // Validate inputs
            if (!poolId) {
                throw new Error('Missing required field: poolId');
            }

            if (this.GRANT_POOL_PACKAGE_ID === '0x0') {
                throw new Error('Grant Pool contract not deployed. Please set GRANT_POOL_PACKAGE_ID environment variable.');
            }

            // Create transaction to refund pool
            const tx = new Transaction();

            // Call the refund function from the grant pool contract
            tx.moveCall({
                target: `${this.GRANT_POOL_PACKAGE_ID}::grant_pool::refund`,
                typeArguments: [`0x2::sui::SUI`],
                arguments: [
                    tx.object(poolId),
                ],
            });

            // Get transaction bytes
            const transactionKindBytes = await tx.build({ client: undefined });

            // Use admin address for refunds
            const adminAddress = process.env.ADMIN_ADDRESS || '0x0';

            // Create sponsor transaction request
            const sponsorRequest: SponsorTransactionRequestDto = {
                transactionKindBytes: Buffer.from(transactionKindBytes).toString('base64'),
                sender: adminAddress,
                allowedMoveCallTargets: [`${this.GRANT_POOL_PACKAGE_ID}::grant_pool::refund`],
                allowedAddresses: [adminAddress],
                network,
            };

            // Sponsor the transaction
            const sponsorResult = await enokiService.sponsorTransaction(sponsorRequest);

            if (!sponsorResult.success) {
                throw new Error('Failed to sponsor pool refund transaction');
            }

            this.logger.info('Pool refund transaction sponsored successfully', {
                digest: sponsorResult.digest,
                poolId,
            });

            return {
                success: true,
                transactionDigest: sponsorResult.digest,
            };
        } catch (error) {
            this.logger.error('Error refunding pool:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }

    /**
     * Get grant pool information by ID
     * @param poolId - The pool ID
     * @returns Grant pool information
     */
    async getPoolInfo(poolId: string): Promise<GrantPoolInfoDto | null> {
        try {
            this.logger.info(`Fetching pool info for ID: ${poolId}`);

            // TODO: Implement using Sui client to query the pool object
            this.logger.warn('getPoolInfo not yet implemented - requires Sui client setup');

            return null;
        } catch (error) {
            this.logger.error('Error fetching pool info:', error);
            return null;
        }
    }

    /**
     * Get all pools for an event
     * @param eventId - The event ID
     * @returns Array of grant pool information
     */
    async getEventPools(eventId: number): Promise<GrantPoolInfoDto[]> {
        try {
            this.logger.info(`Fetching pools for event: ${eventId}`);

            // TODO: Implement using Sui client to query pools by event ID
            this.logger.warn('getEventPools not yet implemented - requires Sui client setup');

            return [];
        } catch (error) {
            this.logger.error('Error fetching event pools:', error);
            return [];
        }
    }
}

export const grantPoolService = new GrantPoolService();
