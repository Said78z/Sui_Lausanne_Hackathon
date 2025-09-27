import { Prisma } from '@/config/client';

export const OpportunityWithRelations = Prisma.validator<Prisma.OpportunityInclude>()({
    address: true,
    realEstateAgency: {
        include: {
            address: true,
        },
    },
    // lots: true,
});

export type OpportunityWithRelations = Prisma.OpportunityGetPayload<{
    include: typeof OpportunityWithRelations;
}>;
