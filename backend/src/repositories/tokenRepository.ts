import { Prisma, PrismaClient, Token } from '@/config/client';
import prisma from '@/config/prisma';

class TokenRepository {
    protected modelClient: PrismaClient['token'];

    constructor() {
        this.modelClient = prisma.token;
    }

    /**
     * Trouve un token par son token
     * @param token - Le token à trouver
     * @returns Le token trouvé ou null si aucun token n'est trouvé
     */
    async findByToken(token: string): Promise<Token | null> {
        return this.findOne({ token });
    }

    /**
     * Supprime un token par son id
     * @param id - L'id du token à supprimer
     * @returns Le token supprimé ou null si aucun token n'est trouvé
     */
    async deleteByUserAndType(userId: string, type: string): Promise<{ count: number }> {
        return this.deleteMany({ ownedById: userId, type });
    }

    /**
     * Récupère tous les tokens d'un utilisateur
     * @param userId - L'id de l'utilisateur à récupérer
     * @returns Les tokens de l'utilisateur
     */
    async findAllByUserId(userId: string): Promise<Token[]> {
        return this.modelClient.findMany({
            where: {
                ownedById: userId,
            },
        });
    }

    /**
     * Je veux récupérer les tokens les plus récents pour chaque Browser
     * @param data - Les données du token à créer
     * @returns Le token créé
     */
    async findAllByUserIdAndBrowser(userId: string): Promise<Token[]> {
        return this.modelClient.findMany({
            where: {
                ownedById: userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            distinct: ['browserName'],
        });
    }

    async create(data: Prisma.TokenCreateInput): Promise<Token> {
        return this.modelClient.create({
            data,
        });
    }

    /**
     * Trouve un token par des critères spécifiques
     * @param filters - Les critères de recherche
     * @returns Le token trouvé ou null si aucun token n'est trouvé
     */
    async findOne(filters: Prisma.TokenWhereInput): Promise<Token | null> {
        return this.modelClient.findFirst({ where: filters });
    }

    /**
     * Supprime plusieurs tokens selon des critères
     * @param filters - Les critères de suppression
     * @returns Le nombre de tokens supprimés
     */
    async deleteMany(filters: Prisma.TokenWhereInput): Promise<{ count: number }> {
        const result = await this.modelClient.deleteMany({
            where: filters
        });
        return { count: result.count };
    }

    /**
     * Supprime un token par son id
     * @param id - L'id du token à supprimer
     * @returns Le token supprimé
     */
    async delete(id: string): Promise<Token> {
        return this.modelClient.delete({
            where: { id }
        });
    }
}

export const tokenRepository = new TokenRepository();
