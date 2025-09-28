import { checkInService } from '@/services/checkInService';
import { asyncHandler } from '@/utils/asyncHandler';
import { jsonResponse } from '@/utils/jsonResponse';
import { logger } from '@/utils/logger';
import {
    CreateMissionRequestDto,
    CreateMissionResponseDto,
    ValidateCheckInRequestDto,
    ValidateCheckInResponseDto,
} from '@shared/dto';

class CheckInController {
    private logger = logger.child({
        module: '[App][CheckInController]',
    });

    /**
     * Create a new mission
     */
    public createMission = asyncHandler<
        unknown,
        unknown,
        CreateMissionRequestDto,
        CreateMissionResponseDto
    >({
        logger: this.logger,
        handler: async (request, reply) => {
            try {
                const requestBody = request.body as CreateMissionRequestDto;
                const {
                    eventId,
                    missionName,
                    description,
                    rewardAmount,
                    maxParticipants,
                    startTime,
                    endTime,
                    network
                } = requestBody;

                this.logger.info('Create mission request received', {
                    eventId,
                    missionName,
                    rewardAmount,
                    network
                });

                // Validation
                if (!eventId || !missionName || !description || rewardAmount === undefined) {
                    return jsonResponse(
                        reply,
                        'Missing required fields: eventId, missionName, description, rewardAmount',
                        {},
                        400
                    );
                }

                const createRequest: CreateMissionRequestDto = {
                    eventId,
                    missionName,
                    description,
                    rewardAmount,
                    maxParticipants,
                    startTime,
                    endTime,
                    network,
                };

                const result = await checkInService.createMission(createRequest);

                if (result.success) {
                    return jsonResponse(reply, 'Mission created successfully', result, 200);
                } else {
                    return jsonResponse(
                        reply,
                        'Failed to create mission',
                        result,
                        400
                    );
                }
            } catch (error) {
                this.logger.error('Error creating mission:', error);
                return jsonResponse(
                    reply,
                    'Failed to create mission',
                    {
                        error: 'Failed to create mission',
                        details: error instanceof Error ? error.message : 'Unknown error',
                    },
                    500
                );
            }
        },
    });

    /**
     * Validate a check-in and mint attestation
     */
    public validateCheckIn = asyncHandler<
        unknown,
        unknown,
        ValidateCheckInRequestDto,
        ValidateCheckInResponseDto
    >({
        logger: this.logger,
        handler: async (request, reply) => {
            try {
                const requestBody = request.body as ValidateCheckInRequestDto;
                const { missionId, userAddress, qrSignature, location, network } = requestBody;

                this.logger.info('Validate check-in request received', {
                    missionId,
                    userAddress,
                    hasLocation: !!location,
                    network
                });

                // Validation
                if (!missionId || !userAddress || !qrSignature) {
                    return jsonResponse(
                        reply,
                        'Missing required fields: missionId, userAddress, qrSignature',
                        {},
                        400
                    );
                }

                const validateRequest: ValidateCheckInRequestDto = {
                    missionId,
                    userAddress,
                    qrSignature,
                    location,
                    network,
                };

                const result = await checkInService.validateCheckIn(validateRequest);

                if (result.success) {
                    return jsonResponse(reply, 'Check-in validated successfully', result, 200);
                } else {
                    return jsonResponse(
                        reply,
                        'Failed to validate check-in',
                        result,
                        400
                    );
                }
            } catch (error) {
                this.logger.error('Error validating check-in:', error);
                return jsonResponse(
                    reply,
                    'Failed to validate check-in',
                    {
                        error: 'Failed to validate check-in',
                        details: error instanceof Error ? error.message : 'Unknown error',
                    },
                    500
                );
            }
        },
    });

    /**
     * Generate QR signature for a mission
     */
    public generateQRSignature = asyncHandler<
        unknown,
        { missionId?: string; userAddress?: string },
        unknown,
        unknown
    >({
        logger: this.logger,
        handler: async (request, reply) => {
            try {
                const { missionId, userAddress } = request.query as { missionId?: string; userAddress?: string };

                this.logger.info('Generate QR signature request received', { missionId, userAddress });

                if (!missionId || !userAddress) {
                    return jsonResponse(
                        reply,
                        'Missing required query parameters: missionId, userAddress',
                        {},
                        400
                    );
                }

                const qrSignature = await checkInService.generateQRSignature(missionId, userAddress);

                return jsonResponse(
                    reply,
                    'QR signature generated successfully',
                    { qrSignature, missionId, userAddress },
                    200
                );
            } catch (error) {
                this.logger.error('Error generating QR signature:', error);
                return jsonResponse(
                    reply,
                    'Failed to generate QR signature',
                    {
                        error: 'Failed to generate QR signature',
                        details: error instanceof Error ? error.message : 'Unknown error',
                    },
                    500
                );
            }
        },
    });

    /**
     * Get mission information by ID
     */
    public getMissionInfo = asyncHandler<
        { missionId: string },
        unknown,
        unknown,
        unknown
    >({
        logger: this.logger,
        handler: async (request, reply) => {
            try {
                const { missionId } = request.params as { missionId: string };

                this.logger.info('Get mission info request received', { missionId });

                if (!missionId) {
                    return jsonResponse(
                        reply,
                        'Missing required parameter: missionId',
                        {},
                        400
                    );
                }

                const missionInfo = await checkInService.getMissionInfo(missionId);

                if (missionInfo) {
                    return jsonResponse(reply, 'Mission info retrieved successfully', missionInfo, 200);
                } else {
                    return jsonResponse(
                        reply,
                        'Mission not found',
                        {},
                        404
                    );
                }
            } catch (error) {
                this.logger.error('Error getting mission info:', error);
                return jsonResponse(
                    reply,
                    'Failed to get mission info',
                    {
                        error: 'Failed to get mission info',
                        details: error instanceof Error ? error.message : 'Unknown error',
                    },
                    500
                );
            }
        },
    });

    /**
     * Get user's attestations
     */
    public getUserAttestations = asyncHandler<
        { userAddress: string },
        unknown,
        unknown,
        unknown
    >({
        logger: this.logger,
        handler: async (request, reply) => {
            try {
                const { userAddress } = request.params as { userAddress: string };

                this.logger.info('Get user attestations request received', { userAddress });

                if (!userAddress) {
                    return jsonResponse(
                        reply,
                        'Missing required parameter: userAddress',
                        {},
                        400
                    );
                }

                const attestations = await checkInService.getUserAttestations(userAddress);

                return jsonResponse(
                    reply,
                    'User attestations retrieved successfully',
                    { attestations, userAddress },
                    200
                );
            } catch (error) {
                this.logger.error('Error getting user attestations:', error);
                return jsonResponse(
                    reply,
                    'Failed to get user attestations',
                    {
                        error: 'Failed to get user attestations',
                        details: error instanceof Error ? error.message : 'Unknown error',
                    },
                    500
                );
            }
        },
    });
}

export const checkInController = new CheckInController();
