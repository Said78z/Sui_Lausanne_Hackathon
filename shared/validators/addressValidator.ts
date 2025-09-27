import { z } from 'zod';

/**
 * Schéma de base pour la validation d'une adresse
 * Ce schéma est partagé entre le frontend et le backend
 */
export const addressBaseSchema = z.object({
    street: z.string().min(1, 'La rue est obligatoire').max(255),
    streetNumber: z.string().max(20).optional(),
    streetComplement: z.string().max(255).optional(),
    city: z.string().min(1, 'La ville est obligatoire').max(255),
    state: z.string().min(1, 'Le département est obligatoire').max(255),
    zip: z.string().min(1, 'Le code postal est obligatoire').max(20),
    country: z.string().max(100).default('France'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    placeId: z.string().max(255).optional(),
    formattedAddress: z.string().optional(),
});

/**
 * Schéma pour la création d'une adresse
 */
export const createAddressSchema = addressBaseSchema;

/**
 * Schéma pour la mise à jour d'une adresse
 * Tous les champs sont optionnels
 */
export const updateAddressSchema = addressBaseSchema.partial();

/**
 * Schéma pour la recherche d'adresses
 */
export const getAddressesQuerySchema = z.object({
    page: z
        .string()
        .optional()
        .transform((val) => Number(val) || 1),
    limit: z
        .string()
        .optional()
        .transform((val) => Number(val) || 10),
    search: z.string().optional(),
    city: z.string().optional(),
    zip: z.string().optional(),
});

/**
 * Schéma pour la validation d'un ID d'adresse
 */
export const addressIdSchema = z.object({
    id: z.string().transform((val) => Number(val)),
});
