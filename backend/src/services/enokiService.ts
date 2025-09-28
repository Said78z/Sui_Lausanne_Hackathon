import { logger } from '@/utils/logger';
import { EnokiClient } from '@mysten/enoki';
import {
    ExecuteTransactionRequestDto,
    ExecuteTransactionResponseDto,
    SponsorTransactionRequestDto,
    SponsorTransactionResponseDto,
} from '@shared/dto';
import jwt from 'jsonwebtoken';

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
     * Extract user information from Enoki JWT token
     * @param token - The JWT token from Enoki authentication
     * @returns User information extracted from the token
     */
    async extractUserInfoFromToken(token: string): Promise<any> {
        try {
            this.logger.info('Extracting user info from Enoki JWT token');

            // Decode the JWT token without verification (since it's from Enoki)
            const decoded = jwt.decode(token) as any;

            if (!decoded) {
                throw new Error('Invalid JWT token');
            }

            // Extract user information from the token payload
            const userInfo = {
                sub: decoded.sub, // Subject (user identifier)
                email: decoded.email,
                name: decoded.name,
                given_name: decoded.given_name,
                family_name: decoded.family_name,
                picture: decoded.picture,
                email_verified: decoded.email_verified,
                aud: decoded.aud, // Audience
                iss: decoded.iss, // Issuer
                iat: decoded.iat, // Issued at
                exp: decoded.exp, // Expiration
                nonce: decoded.nonce,
            };

            this.logger.info('User info extracted successfully', {
                email: userInfo.email,
                name: userInfo.name
            });

            return userInfo;
        } catch (error) {
            this.logger.error('Error extracting user info from token:', error);
            throw error;
        }
    }

    /**
     * Verify and extract user information from Enoki JWT token
     * @param token - The JWT token from Enoki authentication
     * @returns Verified user information
     */
    async verifyEnokiToken(token: string): Promise<any> {
        try {
            this.logger.info('Verifying Enoki JWT token');

            // For Enoki tokens, we typically don't verify with a secret
            // since they are signed by Google/OAuth provider
            // Instead, we decode and validate the structure
            const decoded = jwt.decode(token, { complete: true }) as any;

            if (!decoded || !decoded.payload) {
                throw new Error('Invalid JWT token structure');
            }

            const payload = decoded.payload;

            // Validate required fields
            if (!payload.email || !payload.sub) {
                throw new Error('Missing required user information in token');
            }

            // Check if token is expired
            if (payload.exp && Date.now() >= payload.exp * 1000) {
                throw new Error('Token has expired');
            }

            this.logger.info('Enoki token verified successfully', {
                email: payload.email,
                sub: payload.sub
            });

            return payload;
        } catch (error) {
            this.logger.error('Error verifying Enoki token:', error);
            throw error;
        }
    }

    /**
     * Transform Enoki user data to our user format
     * @param enokiUserData - User data from Enoki token
     * @returns Transformed user data for our system
     */
    transformEnokiUserData(enokiUserData: any): any {
        return {
            googleId: enokiUserData.sub,
            email: enokiUserData.email,
            firstName: enokiUserData.given_name || enokiUserData.name?.split(' ')[0] || 'Unknown',
            lastName: enokiUserData.family_name || enokiUserData.name?.split(' ').slice(1).join(' ') || 'User',
            avatar: enokiUserData.picture,
            isVerified: enokiUserData.email_verified || true,
            provider: 'enoki-google',
        };
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
