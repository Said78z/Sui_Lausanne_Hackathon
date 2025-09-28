import { grantPoolService } from '@/services/grantPoolService';
import { asyncHandler } from '@/utils/asyncHandler';
import { jsonResponse } from '@/utils/jsonResponse';
import { logger } from '@/utils/logger';
import {
    CreateGrantPoolRequestDto,
    CreateGrantPoolResponseDto,
    DepositToPoolRequestDto,
    DepositToPoolResponseDto,
    DistributeGrantsRequestDto,
    DistributeGrantsResponseDto,
    RefundPoolRequestDto,
    RefundPoolResponseDto,
    SetPayoutsRequestDto,
    SetPayoutsResponseDto,
} from '@shared/dto';

class GrantPoolController {
    private logger = logger.child({
        module: '[App][GrantPoolController]',
    });

    /**
     * Create a new grant pool
     */
    public createGrantPool = asyncHandler<
        unknown,
        unknown,
        CreateGrantPoolRequestDto,
        CreateGrantPoolResponseDto
    >({
        logger: this.logger,
        handler: async (request, reply) => {
            try {
                const requestBody = request.body as CreateGrantPoolRequestDto;
                const { eventId, initialAmount, coinType, network } = requestBody;

                this.logger.info('Create grant pool request received', {
                    eventId,
                    initialAmount,
                    coinType,
                    network
                });

                // Validation
                if (!eventId || initialAmount === undefined || initialAmount <= 0) {
                    return jsonResponse(
                        reply,
                        'Missing or invalid required fields: eventId, initialAmount (must be > 0)',
                        {},
                        400
                    );
                }

                const createRequest: CreateGrantPoolRequestDto = {
                    eventId,
                    initialAmount,
                    coinType,
                    network,
                };

                const result = await grantPoolService.createGrantPool(createRequest);

                if (result.success) {
                    return jsonResponse(reply, 'Grant pool created successfully', result, 200);
                } else {
                    return jsonResponse(
                        reply,
                        'Failed to create grant pool',
                        result,
                        400
                    );
                }
            } catch (error) {
                this.logger.error('Error creating grant pool:', error);
                return jsonResponse(
                    reply,
                    'Failed to create grant pool',
                    {
                        error: 'Failed to create grant pool',
                        details: error instanceof Error ? error.message : 'Unknown error',
                    },
                    500
                );
            }
        },
    });

    /**
     * Deposit funds to a grant pool
     */
    public depositToPool = asyncHandler<
        unknown,
        unknown,
        DepositToPoolRequestDto,
        DepositToPoolResponseDto
    >({
        logger: this.logger,
        handler: async (request, reply) => {
            try {
                const requestBody = request.body as DepositToPoolRequestDto;
                const { poolId, amount, coinType, network } = requestBody;

                this.logger.info('Deposit to pool request received', {
                    poolId,
                    amount,
                    coinType,
                    network
                });

                // Validation
                if (!poolId || amount === undefined || amount <= 0) {
                    return jsonResponse(
                        reply,
                        'Missing or invalid required fields: poolId, amount (must be > 0)',
                        {},
                        400
                    );
                }

                const depositRequest: DepositToPoolRequestDto = {
                    poolId,
                    amount,
                    coinType,
                    network,
                };

                const result = await grantPoolService.depositToPool(depositRequest);

                if (result.success) {
                    return jsonResponse(reply, 'Deposit to pool successful', result, 200);
                } else {
                    return jsonResponse(
                        reply,
                        'Failed to deposit to pool',
                        result,
                        400
                    );
                }
            } catch (error) {
                this.logger.error('Error depositing to pool:', error);
                return jsonResponse(
                    reply,
                    'Failed to deposit to pool',
                    {
                        error: 'Failed to deposit to pool',
                        details: error instanceof Error ? error.message : 'Unknown error',
                    },
                    500
                );
            }
        },
    });

    /**
     * Set payout amounts for a grant pool
     */
    public setPayouts = asyncHandler<
        unknown,
        unknown,
        SetPayoutsRequestDto,
        SetPayoutsResponseDto
    >({
        logger: this.logger,
        handler: async (request, reply) => {
            try {
                const requestBody = request.body as SetPayoutsRequestDto;
                const { poolId, payouts, network } = requestBody;

                this.logger.info('Set payouts request received', {
                    poolId,
                    payoutsCount: payouts?.length,
                    network
                });

                // Validation
                if (!poolId || !payouts || payouts.length === 0) {
                    return jsonResponse(
                        reply,
                        'Missing or invalid required fields: poolId, payouts (must be non-empty array)',
                        {},
                        400
                    );
                }

                // Validate that all payouts are positive numbers
                if (payouts.some(payout => payout <= 0)) {
                    return jsonResponse(
                        reply,
                        'All payout amounts must be greater than 0',
                        {},
                        400
                    );
                }

                const setPayoutsRequest: SetPayoutsRequestDto = {
                    poolId,
                    payouts,
                    network,
                };

                const result = await grantPoolService.setPayouts(setPayoutsRequest);

                if (result.success) {
                    return jsonResponse(reply, 'Payouts set successfully', result, 200);
                } else {
                    return jsonResponse(
                        reply,
                        'Failed to set payouts',
                        result,
                        400
                    );
                }
            } catch (error) {
                this.logger.error('Error setting payouts:', error);
                return jsonResponse(
                    reply,
                    'Failed to set payouts',
                    {
                        error: 'Failed to set payouts',
                        details: error instanceof Error ? error.message : 'Unknown error',
                    },
                    500
                );
            }
        },
    });

    /**
     * Distribute grants to winners
     */
    public distributeGrants = asyncHandler<
        unknown,
        unknown,
        DistributeGrantsRequestDto,
        DistributeGrantsResponseDto
    >({
        logger: this.logger,
        handler: async (request, reply) => {
            try {
                const requestBody = request.body as DistributeGrantsRequestDto;
                const { poolId, winners, network } = requestBody;

                this.logger.info('Distribute grants request received', {
                    poolId,
                    winnersCount: winners?.length,
                    network
                });

                // Validation
                if (!poolId || !winners || winners.length === 0) {
                    return jsonResponse(
                        reply,
                        'Missing or invalid required fields: poolId, winners (must be non-empty array)',
                        {},
                        400
                    );
                }

                // Validate addresses format (basic check)
                const invalidAddresses = winners.filter(address => !address || address.length < 10);
                if (invalidAddresses.length > 0) {
                    return jsonResponse(
                        reply,
                        'Invalid winner addresses provided',
                        { invalidAddresses },
                        400
                    );
                }

                const distributeRequest: DistributeGrantsRequestDto = {
                    poolId,
                    winners,
                    network,
                };

                const result = await grantPoolService.distributeGrants(distributeRequest);

                if (result.success) {
                    return jsonResponse(reply, 'Grants distributed successfully', result, 200);
                } else {
                    return jsonResponse(
                        reply,
                        'Failed to distribute grants',
                        result,
                        400
                    );
                }
            } catch (error) {
                this.logger.error('Error distributing grants:', error);
                return jsonResponse(
                    reply,
                    'Failed to distribute grants',
                    {
                        error: 'Failed to distribute grants',
                        details: error instanceof Error ? error.message : 'Unknown error',
                    },
                    500
                );
            }
        },
    });

    /**
     * Refund remaining funds from a pool
     */
    public refundPool = asyncHandler<
        unknown,
        unknown,
        RefundPoolRequestDto,
        RefundPoolResponseDto
    >({
        logger: this.logger,
        handler: async (request, reply) => {
            try {
                const requestBody = request.body as RefundPoolRequestDto;
                const { poolId, network } = requestBody;

                this.logger.info('Refund pool request received', { poolId, network });

                // Validation
                if (!poolId) {
                    return jsonResponse(
                        reply,
                        'Missing required field: poolId',
                        {},
                        400
                    );
                }

                const refundRequest: RefundPoolRequestDto = {
                    poolId,
                    network,
                };

                const result = await grantPoolService.refundPool(refundRequest);

                if (result.success) {
                    return jsonResponse(reply, 'Pool refunded successfully', result, 200);
                } else {
                    return jsonResponse(
                        reply,
                        'Failed to refund pool',
                        result,
                        400
                    );
                }
            } catch (error) {
                this.logger.error('Error refunding pool:', error);
                return jsonResponse(
                    reply,
                    'Failed to refund pool',
                    {
                        error: 'Failed to refund pool',
                        details: error instanceof Error ? error.message : 'Unknown error',
                    },
                    500
                );
            }
        },
    });

    /**
     * Get grant pool information by ID
     */
    public getPoolInfo = asyncHandler<
        { poolId: string },
        unknown,
        unknown,
        unknown
    >({
        logger: this.logger,
        handler: async (request, reply) => {
            try {
                const { poolId } = request.params as { poolId: string };

                this.logger.info('Get pool info request received', { poolId });

                if (!poolId) {
                    return jsonResponse(
                        reply,
                        'Missing required parameter: poolId',
                        {},
                        400
                    );
                }

                const poolInfo = await grantPoolService.getPoolInfo(poolId);

                if (poolInfo) {
                    return jsonResponse(reply, 'Pool info retrieved successfully', poolInfo, 200);
                } else {
                    return jsonResponse(
                        reply,
                        'Pool not found',
                        {},
                        404
                    );
                }
            } catch (error) {
                this.logger.error('Error getting pool info:', error);
                return jsonResponse(
                    reply,
                    'Failed to get pool info',
                    {
                        error: 'Failed to get pool info',
                        details: error instanceof Error ? error.message : 'Unknown error',
                    },
                    500
                );
            }
        },
    });

    /**
     * Get all pools for an event
     */
    public getEventPools = asyncHandler<
        { eventId: string },
        unknown,
        unknown,
        unknown
    >({
        logger: this.logger,
        handler: async (request, reply) => {
            try {
                const { eventId } = request.params as { eventId: string };

                this.logger.info('Get event pools request received', { eventId });

                if (!eventId) {
                    return jsonResponse(
                        reply,
                        'Missing required parameter: eventId',
                        {},
                        400
                    );
                }

                const pools = await grantPoolService.getEventPools(parseInt(eventId));

                return jsonResponse(
                    reply,
                    'Event pools retrieved successfully',
                    { pools, eventId: parseInt(eventId) },
                    200
                );
            } catch (error) {
                this.logger.error('Error getting event pools:', error);
                return jsonResponse(
                    reply,
                    'Failed to get event pools',
                    {
                        error: 'Failed to get event pools',
                        details: error instanceof Error ? error.message : 'Unknown error',
                    },
                    500
                );
            }
        },
    });
}

export const grantPoolController = new GrantPoolController();
