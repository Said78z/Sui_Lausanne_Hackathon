import { logger } from '@/utils/logger';
import { Transaction } from '@mysten/sui/transactions';
import {
    MintPassportRequestDto,
    MintPassportResponseDto,
    PassportInfoDto,
    SponsorTransactionRequestDto,
} from '@shared/dto';
import { enokiService } from './enokiService';

class PassportService {
    private logger = logger.child({
        module: '[App][PassportService]',
    });

    // Contract package ID - will be set after deployment
    private readonly PASSPORT_PACKAGE_ID = process.env.PASSPORT_PACKAGE_ID || '0x0';

    constructor() {
        this.logger.info('PassportService initialized successfully');
    }

    /**
     * Mint a passport SBT for a user
     * @param request - The mint passport request
     * @returns The mint passport response
     */
    async mintPassport(request: MintPassportRequestDto): Promise<MintPassportResponseDto> {
        try {
            const { eventId, userAddress, network = 'testnet' } = request;

            this.logger.info(`Minting passport for user ${userAddress} for event ${eventId}`);

            // Validate inputs
            if (!eventId || !userAddress) {
                throw new Error('Missing required fields: eventId, userAddress');
            }

            if (this.PASSPORT_PACKAGE_ID === '0x0') {
                throw new Error('Passport contract not deployed. Please set PASSPORT_PACKAGE_ID environment variable.');
            }

            // Create transaction to mint passport
            const tx = new Transaction();

            // Call the mint_passport function from the passport contract
            tx.moveCall({
                target: `${this.PASSPORT_PACKAGE_ID}::passports::mint_passport`,
                arguments: [
                    tx.pure.u64(eventId),
                    tx.pure.address(userAddress),
                ],
            });

            // Get transaction bytes
            const transactionKindBytes = await tx.build({ client: undefined }); // Will be handled by Enoki

            // Create sponsor transaction request
            const sponsorRequest: SponsorTransactionRequestDto = {
                transactionKindBytes: Buffer.from(transactionKindBytes).toString('base64'),
                sender: userAddress,
                allowedMoveCallTargets: [`${this.PASSPORT_PACKAGE_ID}::passports::mint_passport`],
                allowedAddresses: [userAddress],
                network,
            };

            // Sponsor the transaction
            const sponsorResult = await enokiService.sponsorTransaction(sponsorRequest);

            if (!sponsorResult.success) {
                throw new Error('Failed to sponsor passport minting transaction');
            }

            this.logger.info('Passport minting transaction sponsored successfully', {
                digest: sponsorResult.digest,
                userAddress,
                eventId,
            });

            return {
                success: true,
                transactionDigest: sponsorResult.digest,
            };
        } catch (error) {
            this.logger.error('Error minting passport:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }

    /**
     * Get passport information by ID
     * @param passportId - The passport object ID
     * @returns Passport information
     */
    async getPassportInfo(passportId: string): Promise<PassportInfoDto | null> {
        try {
            this.logger.info(`Fetching passport info for ID: ${passportId}`);

            // TODO: Implement using Sui client to query the passport object
            // This would require setting up a Sui client and querying the object
            // For now, return a placeholder

            this.logger.warn('getPassportInfo not yet implemented - requires Sui client setup');

            return null;
        } catch (error) {
            this.logger.error('Error fetching passport info:', error);
            return null;
        }
    }

    /**
     * Check if a user has a valid passport for an event
     * @param userAddress - The user's address
     * @param eventId - The event ID
     * @returns True if user has a valid passport
     */
    async hasValidPassport(userAddress: string, eventId: number): Promise<boolean> {
        try {
            this.logger.info(`Checking passport validity for user ${userAddress} and event ${eventId}`);

            // TODO: Implement using Sui client to query user's passports
            // This would involve querying objects owned by the user and filtering by event ID

            this.logger.warn('hasValidPassport not yet implemented - requires Sui client setup');

            return false;
        } catch (error) {
            this.logger.error('Error checking passport validity:', error);
            return false;
        }
    }

    /**
     * Get all passports owned by a user
     * @param userAddress - The user's address
     * @returns Array of passport information
     */
    async getUserPassports(userAddress: string): Promise<PassportInfoDto[]> {
        try {
            this.logger.info(`Fetching passports for user: ${userAddress}`);

            // TODO: Implement using Sui client to query user's passports
            // This would involve querying all passport objects owned by the user

            this.logger.warn('getUserPassports not yet implemented - requires Sui client setup');

            return [];
        } catch (error) {
            this.logger.error('Error fetching user passports:', error);
            return [];
        }
    }
}

export const passportService = new PassportService();
