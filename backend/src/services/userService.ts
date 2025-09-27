import { User } from '@/config/client';
import { userRepository } from '@/repositories/userRepository';


import { logger } from '../utils/logger';

class UserService {
    private logger;

    constructor() {
        this.logger = logger.child({
            module: '[SUI][UserService]',
        });
    }

    /**
     * Met à jour le mot de passe d'un utilisateur
     * @param userId - L'id de l'utilisateur
     * @param hashedPassword - Le mot de passe hashé
     * @returns L'utilisateur mis à jour
     */
    async updatePassword(userId: string, hashedPassword: string): Promise<any> {
        const user = await userRepository.findById(userId);

        if (!user) {
            this.logger.error('Utilisateur non trouvé');
            throw new Error('Utilisateur non trouvé');
        }

        return userRepository.update(userId, { password: hashedPassword });
    }

    /**
     * Désérialise les rôles d'un utilisateur
     * @param user - L'utilisateur à désérialiser
     * @returns L'utilisateur désérialisé
     */
    deserializeRoles(user: User): User {
        if (user && user.roles) {
            if (typeof user.roles === 'string') {
                try {
                    user.roles = JSON.parse(user.roles);
                } catch (error) {
                    console.error('Error parsing roles:', error);
                    user.roles = [];
                }
            }
        } else if (user) {
            user.roles = [];
        }
        return user;
    }

    /**
     * Désérialise seulement les rôles d'un array JSON
     * @param rolesJson - Les rôles à désérialiser
     * @returns Les rôles désérialisés
     */
    parseRoles(rolesJson: string): string[] {
        if (!rolesJson) return [];
        if (Array.isArray(rolesJson)) return rolesJson;
        if (typeof rolesJson === 'string') {
            try {
                const parsed = JSON.parse(rolesJson);
                return Array.isArray(parsed) ? parsed : [];
            } catch (error) {
                console.error('Error parsing roles:', error);
                return [];
            }
        }
        return [];
    }

}

export const userService = new UserService();
