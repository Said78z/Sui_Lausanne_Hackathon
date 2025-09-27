import { tokenRepository } from '@/repositories/tokenRepository';

import { v4 as uuidv4 } from 'uuid';

import { Token } from '@/config/client';

import { logger } from '../utils/logger';

class TokenService {
    private logger;

    constructor() {
        this.logger = logger.child({
            module: '[AppCFP][TokenService]',
        });
    }

    /**
     * Trouve un token par son token
     * @param token - Le token à trouver
     * @returns Le token trouvé ou null si aucun token n'est trouvé
     */
    async findByToken(token: string): Promise<Token | null> {
        return tokenRepository.findByToken(token);
    }

    /**
     * Supprime un token par son id
     * @param id - L'id du token à supprimer
     * @returns Le token supprimé ou null si aucun token n'est trouvé
     */
    async deleteToken(id: string): Promise<Token | null> {
        return tokenRepository.delete(id);
    }

    /**
     * Génère un token de réinitialisation de mot de passe pour un utilisateur
     * @param userId - L'id de l'utilisateur
     * @param ip - L'ip de l'utilisateur
     * @returns Le token de réinitialisation de mot de passe
     */
    async generatePasswordResetToken(userId: string, ip: string): Promise<string> {
        await tokenRepository.deleteByUserAndType(userId, 'reset_password');

        const token = uuidv4();

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 2);

        await tokenRepository.create({
            token,
            owner: {
                connect: {
                    id: userId,
                },
            },
            type: 'reset_password',
            scopes: 'reset',
            deviceName: 'Password Reset',
            deviceIp: ip,
            expiresAt,
        });

        return token;
    }
}

export const tokenService = new TokenService();
