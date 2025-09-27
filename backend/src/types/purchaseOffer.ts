import { Prisma } from '@/config/client';

import { userInclude } from '@/repositories/userRepository';

export const purchaseOfferWithRelations = Prisma.validator<Prisma.PurchaseOfferInclude>()({
    opportunity: {
        include: {
            realEstateAgency: { include: { address: true } },
            address: true,
        },
    },
    note: true,
    media: true,
    dossier: { include: { customers: { include: userInclude } } },
});

export type PurchaseOfferWithRelations = Prisma.PurchaseOfferGetPayload<{
    include: typeof purchaseOfferWithRelations;
}>;
