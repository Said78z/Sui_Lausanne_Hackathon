import { applicationParameterFixtures } from '@/fixtures';

import prisma from '@/config/prisma';

export async function seedApplicationParameters() {
    const parameters = await Promise.all(
        applicationParameterFixtures.map(async (parameter) => {
            return prisma.applicationParameter.create({
                data: parameter,
            });
        })
    );
    return parameters;
}
