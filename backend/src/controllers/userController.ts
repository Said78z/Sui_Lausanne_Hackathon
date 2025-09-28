import { userRepository } from "@/repositories";
import { userService } from "@/services";
import { userTransform } from "@/transform";
import { ApiResponse } from "@/types";
import { asyncHandler, badRequestResponse, jsonResponse, logger } from "@/utils";
import {
    BasicUserDto,
    EnokiAuthRequest,
    enokiAuthRequestSchema,
    EnokiAuthResponse,
    QueryUsersDto,
    queryUsersSchema
} from '@shared/dto';


class UserController {
    private logger = logger.child({
        module: '[template][Auth]',
    });

    public getAllUsers = asyncHandler<unknown, QueryUsersDto, unknown, BasicUserDto[]>({
        querySchema: queryUsersSchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<BasicUserDto[] | void> | void> => {

            const results = await userRepository.findAll(request.query);

            if (!results.data.length) {
                return badRequestResponse(
                    reply,
                    'No users found',
                    400,
                )
            }

            const users = results.data.map((user) => userTransform.toBasicUserDto(user));

            return jsonResponse(
                reply,
                'Users fetched successfully',
                users,
                200,
                results.pagination
            )
        }
    });

    /**
     * Authenticate user with Enoki JWT token
     */
    public authenticateWithEnoki = asyncHandler<
        unknown,
        unknown,
        EnokiAuthRequest,
        EnokiAuthResponse
    >({
        bodySchema: enokiAuthRequestSchema,
        logger: this.logger,
        handler: async (request, reply) => {
            try {
                const { token } = request.body as EnokiAuthRequest;

                this.logger.info('Enoki user authentication request received');

                // Authenticate user with Enoki token
                const authResult = await userService.authenticateWithEnoki(token);

                // Transform user data for response
                const userDto = userTransform.toUserDto(authResult.user);

                return jsonResponse(
                    reply,
                    'User authenticated successfully',
                    {
                        user: userDto,
                        accessToken: authResult.accessToken,
                        refreshToken: authResult.refreshToken,
                    },
                    200
                );
            } catch (error) {
                this.logger.error('Error authenticating Enoki user:', error);
                return jsonResponse(
                    reply,
                    'Failed to authenticate user',
                    {
                        error: 'Failed to authenticate user',
                        details: error instanceof Error ? error.message : 'Unknown error',
                    },
                    500
                );
            }
        },
    });

    /**
     * Get user profile statistics
     */
    public getUserProfileStats = asyncHandler(async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request as any).user?.id;

            if (!userId) {
                return jsonResponse(reply, 'User not authenticated', null, 401);
            }

            this.logger.info('Getting profile stats for user:', userId);
            const stats = await userService.getUserProfileStats(userId);

            return jsonResponse(
                reply,
                'Profile statistics retrieved successfully',
                { stats },
                200
            );
        } catch (error) {
            this.logger.error('Error getting profile stats:', error);
            return jsonResponse(
                reply,
                'Failed to get profile statistics',
                {
                    error: 'Failed to get profile statistics',
                    details: error instanceof Error ? error.message : 'Unknown error',
                },
                500
            );
        }
    });
}

export const userController = new UserController();