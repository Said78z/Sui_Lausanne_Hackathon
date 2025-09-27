import { Serialize } from '@shared/types/Serialize';
import { z } from 'zod';

export const idSchema = z.object({
    id: z.string().min(1, "L'id est requis"),
});

export type IdParamsSchema = z.infer<typeof idSchema>;
export type IdParams = Serialize<IdParamsSchema>;

export const QueryParamsSchema = z.object({
    page: z.number().optional(),
    limit: z.number().optional(),
    search: z.string().optional(),
    sort: z.string().optional(),
});

export type QueryParamsSchema = z.infer<typeof QueryParamsSchema>;
export type QueryParamsDto = Serialize<QueryParamsSchema>;

export const FileSchema = z.object({
    id: z.string().min(1, "L'id est requis").optional(),
    name: z.string().min(1, 'Le nom est requis').optional(),
    type: z.string().min(1, 'Le type est requis').optional(),
    size: z.number().min(1, 'La taille est requise').optional(),
    mimetype: z.string().min(1, 'Le type mime est requis').optional(),
    fieldname: z.string().min(1, 'Le nom du champ est requis').optional(),
    originalname: z.string().min(1, 'Le nom original est requis').optional(),
    buffer: z.any().optional(),
    file: z.any().optional(),
    url: z.string().min(1, "L'url est requise").optional(),
    legend: z.string().optional(),
    source: z.string().optional(),
});

export type FileSchema = z.infer<typeof FileSchema>;
export type FileDto = Serialize<FileSchema>;

export const ExtendIdParamsSchema = idSchema.extend({
    type: z.string().min(1, 'Le type est requis'),
});

export type ExtendIdParamsSchema = z.infer<typeof ExtendIdParamsSchema>;
export type ExtendIdParams = Serialize<ExtendIdParamsSchema>;

export const PaginationSchema = z.object({
    currentPage: z.number(),
    totalPages: z.number(),
    totalItems: z.number(),
    nextPage: z.number(),
    previousPage: z.number(),
    perPage: z.number(),
});

export type Pagination = z.infer<typeof PaginationSchema>;
export type PaginationDto = Serialize<Pagination>;

export const PaginatedResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
    z.object({
        data: z.array(dataSchema),
        pagination: PaginationSchema,
    });

export type PaginatedResponse<T> = {
    data: T[];
    pagination: Pagination;
};

export type PaginatedResponseDto<T> = Serialize<PaginatedResponse<T>>;
