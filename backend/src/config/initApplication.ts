import { Prisma, PrismaClient } from '@/config/client';
import { logger } from '@/utils';
import { defaultApplicationParameters } from './defaultApplicationParameters';
import { applicationParameterRepository } from '../repositories/applicationParameterRepository';

/**
 * Classe responsable de l'initialisation des paramètres de l'application
 */
export class ApplicationInitializer {
    private logger = logger.child({
        module: '[CFP][INIT][APPLICATION]'
    });

    /**
     * Initialise l'application en chargeant les paramètres par défaut
     * Cette méthode doit être appelée au démarrage de l'application
     */
    public async initialize(): Promise<void> {
        try {
            this.logger.info('Initialisation des paramètres de l\'application...');

            // Initialiser les paramètres par défaut
            await this.initializeApplicationParameters(defaultApplicationParameters);

            this.logger.info(`${defaultApplicationParameters.length} paramètres initialisés avec succès.`);
        } catch (error) {
            this.logger.error('Erreur lors de l\'initialisation des paramètres de l\'application', error);
            throw error;
        }
    }

    /**
     * Initialise les paramètres de l'application en vérifiant s'ils existent déjà
     * Si un paramètre existe déjà, il ne sera pas modifié
     * @param ApplicationParameterCreateInput[]
     */
    private async initializeApplicationParameters(parameters: Prisma.ApplicationParameterCreateInput[]): Promise<void> {
        for (const param of parameters) {
            await this.ensureParameter(param);
        }
    }

    /**
     * S'assure qu'un paramètre existe, le crée s'il n'existe pas
     * @param ApplicationParameterCreateInput
     */
    public async ensureParameter(
        parameter: Prisma.ApplicationParameterCreateInput
    ): Promise<void> {
        const existing = await applicationParameterRepository.findByName(parameter.name);

        if (!existing) {
            this.logger.info(`Création du paramètre: ${parameter.name}`);

            await applicationParameterRepository.create({
                ...parameter,
            });
        } else {
            this.logger.debug(`Le paramètre ${parameter.name} existe déjà, pas de modification.`);
        }
    }

    /**
     * Met à jour un paramètre existant
     * @param ApplicationParameterCreateInput
     */
    public async updateParameter(parameter: Prisma.ApplicationParameterCreateInput): Promise<void> {
        const existing = await applicationParameterRepository.findByName(parameter.name);

        if (existing) {
            this.logger.info(`Mise à jour du paramètre: ${parameter.name}`);

            await applicationParameterRepository.update(existing.id, {
                ...parameter,
            });
        } else {
            this.logger.warn(`Le paramètre ${parameter.name} n'existe pas, impossible de le mettre à jour.`);
        }
    }

    /**
     * Réinitialise tous les paramètres aux valeurs par défaut
     * Utile pour les mises à jour de l'application
     */
    public async resetAllParameters(): Promise<void> {
        try {
            this.logger.info('Réinitialisation de tous les paramètres...');

            for (const param of defaultApplicationParameters) {
                await this.updateParameter(param);
            }

            this.logger.info(`${defaultApplicationParameters.length} paramètres réinitialisés avec succès.`);
        } catch (error) {
            this.logger.error('Erreur lors de la réinitialisation des paramètres', error);
            throw error;
        }
    }
}

/**
 * Initialise l'application en créant et exécutant un initialisateur
 * Fonction utilitaire pour garder la compatibilité avec le code existant
 * @param prisma Instance du client Prisma
 */
export async function initializeApplication(prisma: PrismaClient): Promise<void> {
    const initializer = new ApplicationInitializer();
    await initializer.initialize();
}
