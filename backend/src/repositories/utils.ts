import { Prisma } from '@/config/client';

import { FilterService } from '@/services/filterService';

const DEFAULT_ORDER_BY = { createdAt: 'desc' };
const MAX_RECORDS_LIMIT = 100;

interface PaginationResult {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    nextPage: number;
    previousPage: number;
    perPage: number;
}

interface FindAllResult<T> {
    data: T[];
    pagination: PaginationResult;
}

/**
 * Fonction utilitaire pour récupérer une liste paginée d'enregistrements.
 *
 * @param modelClient - Le modèle Prisma client pour interagir avec la base de données
 * @param filters - Options de filtrage
 * @param skip - Numéro de début pour la pagination (par défaut est 0)
 * @param take - Nombre d'enregistrements par page (par défaut est MAX_RECORDS_LIMIT)
 * @param hasSoftDelete - Indique si le modèle utilise la suppression logique (deletedAt)
 * @returns Un objet contenant les données et les informations de pagination
 */
export async function findAll<T>(
    modelClient: any,
    filters: any = {},
    skip: number = 0,
    take: number = MAX_RECORDS_LIMIT,
    hasSoftDelete: boolean = false
): Promise<FindAllResult<T>> {
    // Construire la requête de base en utilisant FilterService
    const baseQuery = FilterService.buildQuery(filters);
    const where: Prisma.Args<typeof modelClient, 'findMany'>['where'] = {
        ...baseQuery,
    };

    // Ajoute le filtre deletedAt seulement si le champ existe
    if (hasSoftDelete) {
        where.deletedAt = null;
    }

    // Utilise FilterService pour extraire les paramètres de tri
    const { sort } = FilterService.applySortingAndPagination(where, filters);
    const orderBy = filters.sort ? sort : DEFAULT_ORDER_BY;

    // Default include is empty
    const include: Prisma.Args<typeof modelClient, 'findMany'>['include'] = {};

    const [data, total] = await Promise.all([
        modelClient.findMany({
            where,
            skip,
            take,
            orderBy,
            include,
        }),
        modelClient.count({ where }),
    ]);

    const currentPage = Math.floor(skip / take) + 1;
    const totalPages = Math.ceil(total / take);

    return {
        data,
        pagination: {
            currentPage,
            totalPages,
            totalItems: total,
            nextPage: currentPage < totalPages ? currentPage + 1 : 0,
            previousPage: currentPage > 1 ? currentPage - 1 : 0,
            perPage: take,
        },
    };
}
