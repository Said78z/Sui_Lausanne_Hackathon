import { logger } from '@/utils/logger';
import { Transaction } from '@mysten/sui/transactions';
import {
    AttestationInfoDto,
    CreateMissionRequestDto,
    CreateMissionResponseDto,
    MissionInfoDto,
    SponsorTransactionRequestDto,
    ValidateCheckInRequestDto,
    ValidateCheckInResponseDto,
} from '@shared/dto';
import crypto from 'crypto';
import { enokiService } from './enokiService';

class CheckInService {
    private logger = logger.child({
        module: '[App][CheckInService]',
    });

    // Contract package ID - will be set after deployment
    private readonly CHECKIN_PACKAGE_ID = process.env.CHECKIN_PACKAGE_ID || '0x0';

    // ECDSA private key for QR signature verification
    private readonly QR_PRIVATE_KEY = process.env.QR_PRIVATE_KEY;

    constructor() {
        if (!this.QR_PRIVATE_KEY) {
            this.logger.warn('QR_PRIVATE_KEY not set - QR signature verification will not work');
        }
        this.logger.info('CheckInService initialized successfully');
    }

    /**
     * Create a new mission
     * @param request - The create mission request
     * @returns The create mission response
     */
    async createMission(request: CreateMissionRequestDto): Promise<CreateMissionResponseDto> {
        try {
            const {
                eventId,
                missionName,
                description,
                rewardAmount,
                maxParticipants = 1000,
                startTime,
                endTime,
                network = 'testnet'
            } = request;

            this.logger.info(`Creating mission: ${missionName} for event ${eventId}`);

            // Validate inputs
            if (!eventId || !missionName || !description || rewardAmount === undefined) {
                throw new Error('Missing required fields: eventId, missionName, description, rewardAmount');
            }

            if (this.CHECKIN_PACKAGE_ID === '0x0') {
                throw new Error('CheckIn contract not deployed. Please set CHECKIN_PACKAGE_ID environment variable.');
            }

            // Create transaction to create mission
            const tx = new Transaction();

            // Convert timestamps to milliseconds if provided
            const startTimeMs = startTime ? new Date(startTime).getTime() : Date.now();
            const endTimeMs = endTime ? new Date(endTime).getTime() : (Date.now() + 7 * 24 * 60 * 60 * 1000); // Default: 7 days

            // Call the create_mission function from the checkin contract
            tx.moveCall({
                target: `${this.CHECKIN_PACKAGE_ID}::checkin::create_mission`,
                arguments: [
                    tx.pure.u64(eventId),
                    tx.pure.string(missionName),
                    tx.pure.string(description),
                    tx.pure.u64(rewardAmount),
                    tx.pure.u64(maxParticipants),
                    tx.pure.u64(startTimeMs),
                    tx.pure.u64(endTimeMs),
                ],
            });

            // Get transaction bytes
            const transactionKindBytes = await tx.build({ client: undefined });

            // For mission creation, we'll use a default admin address
            // In production, this should be the event organizer's address
            const adminAddress = process.env.ADMIN_ADDRESS || request.userAddress || '0x0';

            // Create sponsor transaction request
            const sponsorRequest: SponsorTransactionRequestDto = {
                transactionKindBytes: Buffer.from(transactionKindBytes).toString('base64'),
                sender: adminAddress,
                allowedMoveCallTargets: [`${this.CHECKIN_PACKAGE_ID}::checkin::create_mission`],
                allowedAddresses: [adminAddress],
                network,
            };

            // Sponsor the transaction
            const sponsorResult = await enokiService.sponsorTransaction(sponsorRequest);

            if (!sponsorResult.success) {
                throw new Error('Failed to sponsor mission creation transaction');
            }

            this.logger.info('Mission creation transaction sponsored successfully', {
                digest: sponsorResult.digest,
                missionName,
                eventId,
            });

            return {
                success: true,
                transactionDigest: sponsorResult.digest,
            };
        } catch (error) {
            this.logger.error('Error creating mission:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }

    /**
     * Validate a check-in and mint attestation
     * @param request - The validate check-in request
     * @returns The validate check-in response
     */
    async validateCheckIn(request: ValidateCheckInRequestDto): Promise<ValidateCheckInResponseDto> {
        try {
            const { missionId, userAddress, qrSignature, location, network = 'testnet' } = request;

            this.logger.info(`Validating check-in for user ${userAddress} and mission ${missionId}`);

            // Validate inputs
            if (!missionId || !userAddress || !qrSignature) {
                throw new Error('Missing required fields: missionId, userAddress, qrSignature');
            }

            if (this.CHECKIN_PACKAGE_ID === '0x0') {
                throw new Error('CheckIn contract not deployed. Please set CHECKIN_PACKAGE_ID environment variable.');
            }

            // Verify QR signature
            const isValidSignature = await this.verifyQRSignature(missionId, userAddress, qrSignature);
            if (!isValidSignature) {
                throw new Error('Invalid QR signature');
            }

            // Create transaction to validate check-in
            const tx = new Transaction();

            // Call the validate_checkin function from the checkin contract
            tx.moveCall({
                target: `${this.CHECKIN_PACKAGE_ID}::checkin::validate_checkin`,
                arguments: [
                    tx.pure.string(missionId),
                    tx.pure.address(userAddress),
                    tx.pure.string(qrSignature),
                    tx.pure.u64(Date.now()), // Current timestamp
                ],
            });

            // Get transaction bytes
            const transactionKindBytes = await tx.build({ client: undefined });

            // Create sponsor transaction request
            const sponsorRequest: SponsorTransactionRequestDto = {
                transactionKindBytes: Buffer.from(transactionKindBytes).toString('base64'),
                sender: userAddress,
                allowedMoveCallTargets: [`${this.CHECKIN_PACKAGE_ID}::checkin::validate_checkin`],
                allowedAddresses: [userAddress],
                network,
            };

            // Sponsor the transaction
            const sponsorResult = await enokiService.sponsorTransaction(sponsorRequest);

            if (!sponsorResult.success) {
                throw new Error('Failed to sponsor check-in validation transaction');
            }

            this.logger.info('Check-in validation transaction sponsored successfully', {
                digest: sponsorResult.digest,
                userAddress,
                missionId,
            });

            return {
                success: true,
                transactionDigest: sponsorResult.digest,
                rewardClaimed: true,
            };
        } catch (error) {
            this.logger.error('Error validating check-in:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }

    /**
     * Generate a QR code signature for a mission
     * @param missionId - The mission ID
     * @param userAddress - The user's address
     * @returns The QR signature
     */
    async generateQRSignature(missionId: string, userAddress: string): Promise<string> {
        try {
            if (!this.QR_PRIVATE_KEY) {
                throw new Error('QR_PRIVATE_KEY not configured');
            }

            // Create the data to sign
            const timestamp = Date.now();
            const dataToSign = `${missionId}:${userAddress}:${timestamp}`;

            // Create ECDSA signature
            const sign = crypto.createSign('SHA256');
            sign.update(dataToSign);
            const signature = sign.sign(this.QR_PRIVATE_KEY, 'hex');

            // Combine timestamp and signature
            const qrSignature = `${timestamp}:${signature}`;

            this.logger.info('QR signature generated successfully', { missionId, userAddress });

            return qrSignature;
        } catch (error) {
            this.logger.error('Error generating QR signature:', error);
            throw error;
        }
    }

    /**
     * Verify a QR code signature
     * @param missionId - The mission ID
     * @param userAddress - The user's address
     * @param qrSignature - The QR signature to verify
     * @returns True if signature is valid
     */
    private async verifyQRSignature(
        missionId: string,
        userAddress: string,
        qrSignature: string
    ): Promise<boolean> {
        try {
            if (!this.QR_PRIVATE_KEY) {
                this.logger.warn('QR_PRIVATE_KEY not configured - skipping signature verification');
                return true; // Allow for development without QR verification
            }

            // Parse the QR signature
            const [timestampStr, signature] = qrSignature.split(':');
            if (!timestampStr || !signature) {
                return false;
            }

            const timestamp = parseInt(timestampStr);

            // Check if signature is not too old (e.g., 1 hour)
            const maxAge = 60 * 60 * 1000; // 1 hour in milliseconds
            if (Date.now() - timestamp > maxAge) {
                this.logger.warn('QR signature expired', { missionId, userAddress, age: Date.now() - timestamp });
                return false;
            }

            // Recreate the data that was signed
            const dataToSign = `${missionId}:${userAddress}:${timestamp}`;

            // Verify the signature
            const verify = crypto.createVerify('SHA256');
            verify.update(dataToSign);

            // Extract public key from private key for verification
            // In production, you should store the public key separately
            const publicKey = crypto.createPublicKey(this.QR_PRIVATE_KEY);
            const isValid = verify.verify(publicKey, signature, 'hex');

            this.logger.info('QR signature verification result', { missionId, userAddress, isValid });

            return isValid;
        } catch (error) {
            this.logger.error('Error verifying QR signature:', error);
            return false;
        }
    }

    /**
     * Get mission information by ID
     * @param missionId - The mission ID
     * @returns Mission information
     */
    async getMissionInfo(missionId: string): Promise<MissionInfoDto | null> {
        try {
            this.logger.info(`Fetching mission info for ID: ${missionId}`);

            // TODO: Implement using Sui client to query the mission object
            this.logger.warn('getMissionInfo not yet implemented - requires Sui client setup');

            return null;
        } catch (error) {
            this.logger.error('Error fetching mission info:', error);
            return null;
        }
    }

    /**
     * Get user's attestations
     * @param userAddress - The user's address
     * @returns Array of attestation information
     */
    async getUserAttestations(userAddress: string): Promise<AttestationInfoDto[]> {
        try {
            this.logger.info(`Fetching attestations for user: ${userAddress}`);

            // TODO: Implement using Sui client to query user's attestations
            this.logger.warn('getUserAttestations not yet implemented - requires Sui client setup');

            return [];
        } catch (error) {
            this.logger.error('Error fetching user attestations:', error);
            return [];
        }
    }
}

export const checkInService = new CheckInService();
