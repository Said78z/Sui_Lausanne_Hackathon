import { Serialize } from '@shared/types/Serialize';
import { z } from 'zod';

export const ApplicationParameter = z.object({
    id: z.string(),
    name: z.string(),
    value: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type ApplicationParameter = z.infer<typeof ApplicationParameter>;
export type ApplicationParameterDto = Serialize<ApplicationParameter>;

export const CreateApplicationParameter = z.object({
    name: z.string().min(1, 'Le nom est requis'),
    value: z.string().min(1, 'La valeur est requise'),
});

export type CreateApplicationParameter = z.infer<typeof CreateApplicationParameter>;
export type CreateApplicationParameterDto = Serialize<CreateApplicationParameter>;

export const UpdateApplicationParameter = z.object({
    value: z.string().min(1, 'La valeur est requise').optional(),
});

export type UpdateApplicationParameter = z.infer<typeof UpdateApplicationParameter>;
export type UpdateApplicationParameterDto = Serialize<UpdateApplicationParameter>;

export const GetAllApplicationParameters = z.object({
    page: z.string().min(1, 'Le numéro de page doit être supérieur à 0').optional(),
    limit: z.string().min(1, "Le nombre d'éléments par page doit être supérieur à 0").optional(),
    name: z.string().optional(),
});

export type GetAllApplicationParameters = z.infer<typeof GetAllApplicationParameters>;
export type GetAllApplicationParametersDto = Serialize<GetAllApplicationParameters>;
