import { ApiResponse } from '@/types';
import { jsonResponse } from '@/utils/jsonResponse';
import { logger } from '@/utils/logger';

import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

type RequestType<TBody = unknown, TQuery = unknown, TParams = unknown> = {
    Body: TBody;
    Querystring: TQuery;
    Params: TParams;
};

type StrictRequestHandler<TRequest extends RequestType, TResponse = any> = (
    request: FastifyRequest<TRequest>,
    reply: FastifyReply
) => Promise<ApiResponse<TResponse> | void>;

// Types spécialisés pour différentes combinaisons de schémas
export type BodyHandlerOptions<TBody, TResponse = any> = {
    bodySchema: z.ZodType<TBody>;
    querySchema?: never;
    paramsSchema?: never;
    logger?: any;
    handler: StrictRequestHandler<RequestType<TBody>, TResponse>;
};

export type ParamsHandlerOptions<TParams, TResponse = any> = {
    bodySchema?: never;
    querySchema?: never;
    paramsSchema: z.ZodType<TParams>;
    logger?: any;
    handler: StrictRequestHandler<RequestType<unknown, unknown, TParams>, TResponse>;
};

export type QueryHandlerOptions<TQuery, TResponse = any> = {
    bodySchema?: never;
    querySchema: z.ZodType<TQuery>;
    paramsSchema?: never;
    logger?: any;
    handler: StrictRequestHandler<RequestType<unknown, TQuery>, TResponse>;
};

export type BodyParamsHandlerOptions<TBody, TParams, TResponse = any> = {
    bodySchema: z.ZodType<TBody>;
    querySchema?: never;
    paramsSchema: z.ZodType<TParams>;
    logger?: any;
    handler: StrictRequestHandler<RequestType<TBody, unknown, TParams>, TResponse>;
};

// Union de tous les types possibles
type AsyncHandlerOptions<TBody = unknown, TQuery = unknown, TParams = unknown, TResponse = any> =
    | BodyHandlerOptions<TBody, TResponse>
    | ParamsHandlerOptions<TParams, TResponse>
    | QueryHandlerOptions<TQuery, TResponse>
    | BodyParamsHandlerOptions<TBody, TParams, TResponse>
    | {
          bodySchema?: z.ZodType<TBody>;
          querySchema?: z.ZodType<TQuery>;
          paramsSchema?: z.ZodType<TParams>;
          logger?: any;
          handler: StrictRequestHandler<RequestType<TBody, TQuery, TParams>, TResponse>;
      };

/**
 * DTO pour les erreurs de validation
 */
export interface ValidationErrorDto {
    field: string;
    message: string;
    code: string;
}

/**
 * Formatte les erreurs de validation
 * @param error - L'erreur de validation
 * @returns Les erreurs de validation
 */
function formatZodError(error: z.ZodError): ValidationErrorDto[] {
    return error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
    }));
}

/**
 * Gestionnaire de requêtes asynchrones
 * @param handler - Le gestionnaire de requêtes
 * @returns Le gestionnaire de requêtes
 */
export function asyncHandler<TBody = unknown, TQuery = unknown, TParams = unknown, TResponse = any>(
    handler: StrictRequestHandler<RequestType<TBody, TQuery, TParams>>
): StrictRequestHandler<RequestType<TBody, TQuery, TParams>>;

/**
 * Gestionnaire de requêtes asynchrones avec options complètes
 * @param options - Les options du gestionnaire de requêtes
 * @returns Le gestionnaire de requêtes
 */
export function asyncHandler<TBody = unknown, TQuery = unknown, TParams = unknown, TResponse = any>(
    options: AsyncHandlerOptions<TBody, TQuery, TParams>
): StrictRequestHandler<RequestType<TBody, TQuery, TParams>>;

/**
 * Implémentation du gestionnaire de requêtes asynchrones
 * @param options - Les options du gestionnaire de requêtes
 * @returns Le gestionnaire de requêtes
 */
export function asyncHandler<TBody = unknown, TQuery = unknown, TParams = unknown, TResponse = any>(
    options:
        | StrictRequestHandler<RequestType<TBody, TQuery, TParams>, TResponse>
        | AsyncHandlerOptions<TBody, TQuery, TParams, TResponse>
): StrictRequestHandler<RequestType<TBody, TQuery, TParams>, TResponse> {
    return async function (
        request: FastifyRequest<RequestType<TBody, TQuery, TParams>>,
        reply: FastifyReply
    ): Promise<ApiResponse<TResponse> | void> {
        try {
            if (typeof options === 'function') {
                await options(request, reply);
                return;
            }

            const {
                bodySchema,
                querySchema,
                paramsSchema,
                handler,
                logger: customLogger,
            } = options;
            const loggerToUse = customLogger || logger;

            // Validation du body
            if (bodySchema) {
                // Convertir les champs de type 'field' en valeurs simples uniquement si la requête est multipart
                const processedBody = request.isMultipart()
                    ? Object.fromEntries(
                          Object.entries(request.body as any).map(([key, value]: any) => [
                              key,
                              value?.type === 'field'
                                  ? value.value === 'true'
                                      ? true
                                      : value.value === 'false'
                                        ? false
                                        : value.value
                                  : value,
                          ])
                      )
                    : request.body;

                const body = bodySchema.safeParse(processedBody);
                if (!body.success) {
                    loggerToUse.error('Validation error in body', body.error);
                    jsonResponse<ValidationErrorDto[]>(
                        reply,
                        'Invalid body data',
                        formatZodError(body.error),
                        400
                    );
                    return;
                }
                request.body = body.data as TBody;
            }

            // Validation des query
            if (querySchema) {
                const query = querySchema.safeParse(request.query);
                if (!query.success) {
                    loggerToUse.error('Validation error in query', query.error);
                    jsonResponse<ValidationErrorDto[]>(
                        reply,
                        'Invalid query parameters',
                        formatZodError(query.error),
                        400
                    );
                    return;
                }
                request.query = query.data as TQuery;
            }

            // Validation des params
            if (paramsSchema) {
                const params = paramsSchema.safeParse(request.params);
                if (!params.success) {
                    loggerToUse.error('Validation error in params', params.error);
                    jsonResponse<ValidationErrorDto[]>(
                        reply,
                        'Invalid route parameters',
                        formatZodError(params.error),
                        400
                    );
                    return;
                }
                request.params = params.data as TParams;
            }

            await handler(request, reply);
        } catch (error) {
            const loggerToUse = typeof options === 'function' ? logger : options.logger || logger;
            loggerToUse.error('Error in request handler', error);

            if (error instanceof z.ZodError) {
                jsonResponse<ValidationErrorDto[]>(
                    reply,
                    'Validation error',
                    formatZodError(error),
                    400
                );
                return;
            }

            jsonResponse<null>(reply, 'Internal server error', null, 500);
        }
    };
}
