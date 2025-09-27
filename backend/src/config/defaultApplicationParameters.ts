import { Prisma } from '@/config/client';
import { ApplicationParameterName } from '@shared/enums';

/**
 * Paramètres par défaut pour l'initialisation de l'application
 */
export const defaultApplicationParameters: Prisma.ApplicationParameterCreateInput[] = [
    {
        name: ApplicationParameterName.NEVER_CALLED_PROSPECTS_PERCENTAGE,
        value: '20'
    },
    {
        name: ApplicationParameterName.DEFAULT_PAGE_SIZE,
        value: '25'
    },
    {
        name: ApplicationParameterName.MAINTENANCE_MODE,
        value: 'false'
    },
    {
        name: ApplicationParameterName.MAX_ALERTS_PER_USER,
        value: '10'
    },
    {
        name: ApplicationParameterName.MAX_PROSPECTING_QUEUE_PROSPECTS,
        value: '100'
    }
];