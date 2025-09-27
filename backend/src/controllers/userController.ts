import { userRepository } from "@/repositories";
import { userTransform } from "@/transform";
import { ApiResponse } from "@/types";
import { asyncHandler, badRequestResponse, jsonResponse, logger } from "@/utils";
import {
    QueryUsersDto,
    RestrictedUserDto,
    queryUsersSchema
} from '@shared/dto';


class UserController {
    private logger = logger.child({
        module: '[template][Auth]',
    });

    public getAllUsers = asyncHandler<unknown, QueryUsersDto, unknown, RestrictedUserDto[]>({
        querySchema: queryUsersSchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<RestrictedUserDto[] | void> | void> => {

            const results = await userRepository.findAll(request.query);

            if (!results.data.length) {
                return badRequestResponse(
                    reply,
                    'No users found',
                    400,
                )
            }

            const users = results.data.map((user) => userTransform.toRestrictedUserDto(user));

            return jsonResponse(
                reply,
                'Users fetched successfully',
                users,
                200,
                results.pagination
            )
        }
    });
}

export const userController = new UserController();