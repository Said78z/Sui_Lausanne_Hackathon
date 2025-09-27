import { logger } from '@/utils/logger';

import prisma from '@/config/prisma';

export const main = async () => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    await prisma.token.deleteMany({
        where: {
            expiresAt: {
                lt: threeMonthsAgo,
            },
        },
    });

    logger.info('Tokens nettoyés avec succès');
};
