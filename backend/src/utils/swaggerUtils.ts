import swagger from '@fastify/swagger';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { responseSchemaType } from './jsonResponse';

/**
 * Initialize the swagger
 * @param app - The Fastify application instance
 * Initialize the swagger
 * @param app - The Fastify application instance
 */
export function initSwagger(app: FastifyInstance) {
    app.register(swagger, {
        mode: 'dynamic',
        openapi: {
            info: { title: 'Fastify API', version: '1.0.0' },
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                },
            },
            security: [
                {
                    bearerAuth: [],
                },
            ],
            tags: [
                { name: 'Auth', description: "Routes d'authentification" },
                { name: 'Users', description: 'Routes de gestion des utilisateurs' },
                { name: 'Contacts', description: 'Routes de gestion des permissions de contact' },
                { name: 'Formations', description: 'Routes de gestion des formations' },
                { name: 'Modules', description: 'Routes de gestion des modules' },
            ],
        },
    });

    // Route to access the Swagger documentation
    // Route to access the Swagger documentation
    if (process.env.NODE_ENV !== 'production') {
        app.register(require('@fastify/swagger-ui'), {
            routePrefix: '/api',
            uiConfig: {
                docExpansion: 'list',
                deepLinking: false,
                persistAuthorization: true,
                tagsSorter: 'alpha',
                operationsSorter: 'alpha',
                defaultModelsExpandDepth: 1,
                defaultModelExpandDepth: 2,
            },
            uiHooks: {
                onRequest: function (request: FastifyRequest, reply: FastifyReply, next: any) {
                    next();
                },
                preHandler: function (request: FastifyRequest, reply: FastifyReply, next: any) {
                    next();
                },
            },
            staticCSP: true,
            transformStaticCSP: (header: string) => header,
            transformSpecification: (
                swaggerObject: any,
                request: FastifyRequest,
                reply: FastifyReply
            ) => {
                return swaggerObject;
            },
            transformSpecificationClone: true,
        });
    }
}

/**
 * Create a swagger schema for a route
 * @param description - The description of the route
 * @param responses - The responses of the route
 * @param bodySchema - The zod schema of the request body
 * @param security - If the route is secured
 * @param querySchema - The zod schema of the request query
 * @param tags - The tags of the route for grouping
 * Create a swagger schema for a route
 * @param description - The description of the route
 * @param responses - The responses of the route
 * @param bodySchema - The zod schema of the request body
 * @param security - If the route is secured
 * @param querySchema - The zod schema of the request query
 * @param tags - The tags of the route for grouping
 * @returns Le schéma de swagger
 */
export function createSwaggerSchema(
    description: string,
    responses: responseSchemaType[],
    bodySchema?: z.ZodObject<any, any> | null,
    security?: boolean,
    querySchema?: z.ZodObject<any, any> | null,
    tags?: string[]
) {
    let schema: any = {
        description,
        response: responses.reduce(
            (acc, response) => {
                // Créer le schéma de base avec toutes les propriétés possibles
                const baseSchema: {
                    type: string;
                    properties: {
                        message: { type: string };
                        status: { type: string };
                        data?: any;
                        pagination?: any;
                        accessToken?: any;
                        refreshToken?: any;
                    };
                } = {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        status: { type: 'integer' },
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                    },
                };

                // Ajouter les données si un ZodObject est fourni
                if (response.data && response.data instanceof z.ZodObject) {
                    baseSchema.properties.data = generateSchemaProperties(response.data);
                } else if (response.data !== undefined) {
                    baseSchema.properties.data = {
                        type: 'object',
                        additionalProperties: true,
                    };
                }

                // Ajouter la pagination si nécessaire
                if (response.pagination !== undefined) {
                    baseSchema.properties.pagination = {
                        type: 'object',
                        properties: {
                            currentPage: { type: 'number' },
                            totalPages: { type: 'number' },
                            totalItems: { type: 'number' },
                            nextPage: { type: 'number' },
                            previousPage: { type: 'number' },
                            perPage: { type: 'number' },
                        },
                    };
                }

                acc[response.status] = {
                    description: response.message,
                    content: {
                        'application/json': {
                            schema: baseSchema,
                        },
                    },
                };
                return acc;
            },
            {} as Record<string, any>
        ),
    };

    if (security) {
        schema.security = [{ bearerAuth: [] }];
    }

    if (bodySchema) {
        schema.body = generateSchemaProperties(bodySchema);
    }

    if (querySchema) {
        schema.querystring = generateSchemaProperties(querySchema);
    }

    if (tags && tags.length > 0) {
        schema.tags = tags;
    }

    return schema;
}

/**
 * Generate the properties of the swagger schema
 * @param schema - The zod schema to convert
 * @returns The properties of the swagger schema
 * Generate the properties of the swagger schema
 * @param schema - The zod schema to convert
 * @returns The properties of the swagger schema
 */
export const generateSchemaProperties = (schema: z.ZodTypeAny): any => {
    const getType = (zodType: z.ZodTypeAny): any => {
        const type = zodType instanceof z.ZodOptional ? zodType.unwrap() : zodType;
        const description = type.description || '';

        if (type instanceof z.ZodString) return { type: 'string', description };
        if (type instanceof z.ZodNumber) return { type: 'number', description };
        if (type instanceof z.ZodBoolean) return { type: 'boolean', description };
        if (type instanceof z.ZodDate) return { type: 'string', format: 'date-time', description };
        if (type instanceof z.ZodEnum) return { type: 'string', enum: type.options, description };

        if (type instanceof z.ZodArray) {
            return {
                type: 'array',
                description,
                items: getType(type._def.type),
            };
        }

        if (type instanceof z.ZodObject) {
            const nestedShape = type.shape;
            const props: Record<string, any> = {};
            const required: string[] = [];

            for (const key in nestedShape) {
                const prop = nestedShape[key];
                props[key] = getType(prop);
                if (!(prop instanceof z.ZodOptional)) required.push(key);
            }

            return {
                type: 'object',
                properties: props,
                required: required.length > 0 ? required : undefined,
                description,
            };
        }

        return { type: 'string', description }; // fallback
    };

    return getType(schema);
};
