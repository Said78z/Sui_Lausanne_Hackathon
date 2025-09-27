import { Prisma } from '@/config/client';

export const dossierInclude = {
    owner: true,
    partner: true,
    department: true,
    referenceCity: true,
    opportunities: {
        include: {
            address: true,
            lots: true,
        },
    },
    media: true,
    suggestions: {
        include: {
            createdBy: true,
        },
    },
    regions: true,
    excludedRegions: true,
    excludedOpportunities: {
        include: {
            address: true,
            lots: true,
        },
    },
    purchaseOffers: {
        include: {
            dossier: true,
            opportunity: true,
            note: true,
        },
    },
    activities: {
        include: {
            // createdBy: true,
            media: true,
            // opportunity: true,
            dossier: true,
        },
    },
    customers: true,
    // yousignDocuments: {
    //     include: {
    //         dossier: true,
    //         suggestion: true,
    //         // createdBy: true,
    //         purchaseOffer: true,
    //     },
    // },
    // activeSearch: true,
    // address: true,
    // goal: true,
    // typeOfSearch: true,
    // minBudget: true,
    // maxBudget: true,
};

export type DossierWithRelations = Prisma.DossierGetPayload<{
    include: typeof dossierInclude;
}>;

const dossierWithCustomers = Prisma.validator<Prisma.DossierInclude>()({
    customers: {
        include: {
            address: true,
        },
    },
});

export type DossierWithCustomers = Prisma.DossierGetPayload<{
    include: typeof dossierWithCustomers;
}>;
