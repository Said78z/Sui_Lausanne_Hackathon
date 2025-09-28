import { passportService } from '@/services/passportService';
import { asyncHandler } from '@/utils/asyncHandler';
import { jsonResponse } from '@/utils/jsonResponse';
import { logger } from '@/utils/logger';
import {
    MintPassportRequestDto,
    MintPassportResponseDto,
} from '@shared/dto';

class PassportController {
    private logger = logger.child({
        module: '[App][PassportController]',
    });

    /**
     * Mint a passport SBT for a user
     */
    public mintPassport = asyncHandler<
        unknown,
        unknown,
        MintPassportRequestDto,
        MintPassportResponseDto
    >({
        logger: this.logger,
        handler: async (request, reply) => {
            try {
                const requestBody = request.body as MintPassportRequestDto;
                const { eventId, userAddress, network } = requestBody;

                this.logger.info('Mint passport request received', { eventId, userAddress, network });

                // Validation
                if (!eventId || !userAddress) {
                    return jsonResponse(
                        reply,
                        'Missing required fields: eventId, userAddress',
                        {},
                        400
                    );
                }

                const mintRequest: MintPassportRequestDto = {
                    eventId,
                    userAddress,
                    network,
                };

                const result = await passportService.mintPassport(mintRequest);

                if (result.success) {
                    return jsonResponse(reply, 'Passport minted successfully', result, 200);
                } else {
                    return jsonResponse(
                        reply,
                        'Failed to mint passport',
                        result,
                        400
                    );
                }
            } catch (error) {
                this.logger.error('Error minting passport:', error);
                return jsonResponse(
                    reply,
                    'Failed to mint passport',
                    {
                        error: 'Failed to mint passport',
                        details: error instanceof Error ? error.message : 'Unknown error',
                    },
                    500
                );
            }
        },
    });

    /**
     * Get passport information by ID
     */
    public getPassportInfo = asyncHandler<
        { passportId: string },
        unknown,
        unknown,
        unknown
    >({
        logger: this.logger,
        handler: async (request, reply) => {
            try {
                const { passportId } = request.params as { passportId: string };

                this.logger.info('Get passport info request received', { passportId });

                if (!passportId) {
                    return jsonResponse(
                        reply,
                        'Missing required parameter: passportId',
                        {},
                        400
                    );
                }

                const passportInfo = await passportService.getPassportInfo(passportId);

                if (passportInfo) {
                    return jsonResponse(reply, 'Passport info retrieved successfully', passportInfo, 200);
                } else {
                    return jsonResponse(
                        reply,
                        'Passport not found',
                        {},
                        404
                    );
                }
            } catch (error) {
                this.logger.error('Error getting passport info:', error);
                return jsonResponse(
                    reply,
                    'Failed to get passport info',
                    {
                        error: 'Failed to get passport info',
                        details: error instanceof Error ? error.message : 'Unknown error',
                    },
                    500
                );
            }
        },
    });

    /**
     * Check if user has valid passport for event
     */
    public checkPassportValidity = asyncHandler<
        { userAddress: string; eventId: string },
        unknown,
        unknown,
        unknown
    >({
        logger: this.logger,
        handler: async (request, reply) => {
            try {
                const { userAddress, eventId } = request.params as { userAddress: string; eventId: string };

                this.logger.info('Check passport validity request received', { userAddress, eventId });

                if (!userAddress || !eventId) {
                    return jsonResponse(
                        reply,
                        'Missing required parameters: userAddress, eventId',
                        {},
                        400
                    );
                }

                const hasValidPassport = await passportService.hasValidPassport(
                    userAddress,
                    parseInt(eventId)
                );

                return jsonResponse(
                    reply,
                    'Passport validity checked successfully',
                    { hasValidPassport, userAddress, eventId: parseInt(eventId) },
                    200
                );
            } catch (error) {
                this.logger.error('Error checking passport validity:', error);
                return jsonResponse(
                    reply,
                    'Failed to check passport validity',
                    {
                        error: 'Failed to check passport validity',
                        details: error instanceof Error ? error.message : 'Unknown error',
                    },
                    500
                );
            }
        },
    });

    /**
     * Get all passports for a user
     */
    public getUserPassports = asyncHandler<
        { userAddress: string },
        unknown,
        unknown,
        unknown
    >({
        logger: this.logger,
        handler: async (request, reply) => {
            try {
                const { userAddress } = request.params as { userAddress: string };

                this.logger.info('Get user passports request received', { userAddress });

                if (!userAddress) {
                    return jsonResponse(
                        reply,
                        'Missing required parameter: userAddress',
                        {},
                        400
                    );
                }

                const passports = await passportService.getUserPassports(userAddress);

                return jsonResponse(
                    reply,
                    'User passports retrieved successfully',
                    { passports, userAddress },
                    200
                );
            } catch (error) {
                this.logger.error('Error getting user passports:', error);
                return jsonResponse(
                    reply,
                    'Failed to get user passports',
                    {
                        error: 'Failed to get user passports',
                        details: error instanceof Error ? error.message : 'Unknown error',
                    },
                    500
                );
            }
        },
    });
}

export const passportController = new PassportController();
