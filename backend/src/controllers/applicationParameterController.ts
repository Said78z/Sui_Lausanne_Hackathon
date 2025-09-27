import { applicationParameterRepository } from '@/repositories';
import { applicationParameterTransform } from '@/transform';
import { ApiResponse } from '@/types';
import { asyncHandler } from '@/utils/asyncHandler';
import { jsonResponse } from '@/utils/jsonResponse';
import { logger } from '@/utils/logger';

import {
    ApplicationParameterDto,
    CreateApplicationParameter,
    CreateApplicationParameterDto,
    GetAllApplicationParameters,
    GetAllApplicationParametersDto,
    IdParams,
    UpdateApplicationParameter,
    UpdateApplicationParameterDto,
    idSchema,
} from '@shared/dto';

class ApplicationParameterController {
    private logger = logger.child({
        module: '[App][ApplicationParameter]',
    });

    public getAllParameters = asyncHandler<unknown, GetAllApplicationParametersDto, unknown, ApplicationParameterDto[]>({
        querySchema: GetAllApplicationParameters,
        logger: this.logger,
        handler: async (
            request,
            reply
        ): Promise<ApiResponse<ApplicationParameterDto[] | void> | void> => {
            const { page, limit, name } = request.query;

            const filters = {
                name: name ? String(name) : undefined,
            };

            // If no pagination parameters provided, fetch all parameters
            let result;
            if (!page && !limit) {
                result = await applicationParameterRepository.findAllWithoutPagination(filters);
            } else {
                result = await applicationParameterRepository.findAll({
                    page,
                    limit,
                    name: filters.name
                });
            }

            const parameters = Array.isArray(result)
                ? result.map((parameter: any) => applicationParameterTransform.toApplicationParameterDto(parameter))
                : result.data.map((parameter: any) => applicationParameterTransform.toApplicationParameterDto(parameter));

            return jsonResponse(
                reply,
                'Paramètres récupérés avec succès',
                parameters,
                200,
                Array.isArray(result) ? undefined : result.pagination
            );
        },
    });

    public getParameterById = asyncHandler<unknown, unknown, IdParams, ApplicationParameterDto>({
        paramsSchema: idSchema,
        logger: this.logger,
        handler: async (
            request,
            reply
        ): Promise<ApiResponse<ApplicationParameterDto | void> | void> => {
            const { id } = request.params;
            const parameter = await applicationParameterRepository.findById(id);

            if (!parameter) {
                return jsonResponse(reply, 'Paramètre non trouvé', undefined, 404);
            }

            const parameterDto = applicationParameterTransform.toApplicationParameterDto(parameter);

            return jsonResponse(reply, 'Paramètre récupéré avec succès', parameterDto, 200);
        },
    });

    public createParameter = asyncHandler<CreateApplicationParameterDto, unknown, unknown, ApplicationParameterDto>({
        bodySchema: CreateApplicationParameter,
        logger: this.logger,
        handler: async (
            request,
            reply
        ): Promise<ApiResponse<ApplicationParameterDto | void> | void> => {
            const { name, value } = request.body;

            // First check if parameter already exists
            const existingParameter = await applicationParameterRepository.findByName(name);

            if (existingParameter) {
                // Parameter already exists, return it or update it
                const parameterDto = applicationParameterTransform.toApplicationParameterDto(existingParameter);
                return jsonResponse(reply, 'Paramètre existe déjà', parameterDto, 409);
            }

            const parameter = await applicationParameterRepository.create(request.body);

            const parameterDto = applicationParameterTransform.toApplicationParameterDto(parameter);

            return jsonResponse(reply, 'Paramètre créé avec succès', parameterDto, 201);
        },
    });

    public updateParameter = asyncHandler<UpdateApplicationParameterDto, unknown, IdParams, ApplicationParameterDto>({
        bodySchema: UpdateApplicationParameter,
        paramsSchema: idSchema,
        logger: this.logger,
        handler: async (
            request,
            reply
        ): Promise<ApiResponse<ApplicationParameterDto | void> | void> => {
            const { id } = request.params;
            const parameterExists = await applicationParameterRepository.findById(id);

            if (!parameterExists) {
                return jsonResponse(reply, 'Paramètre non trouvé', undefined, 404);
            }

            const parameter = await applicationParameterRepository.update(id, request.body);

            const parameterDto = applicationParameterTransform.toApplicationParameterDto(parameter);

            return jsonResponse(reply, 'Paramètre mis à jour avec succès', parameterDto, 200);
        },
    });

    public deleteParameter = asyncHandler<unknown, unknown, IdParams, void>({
        paramsSchema: idSchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<void> | void> => {
            const { id } = request.params;
            const parameterExists = await applicationParameterRepository.findById(id);

            if (!parameterExists) {
                return jsonResponse(reply, 'Paramètre non trouvé', undefined, 404);
            }

            await applicationParameterRepository.delete(id);

            return jsonResponse(reply, 'Paramètre supprimé avec succès', undefined, 204);
        },
    });
}

export const applicationParameterController = new ApplicationParameterController();
