import { OpportunityStatus, OpportunityType } from '../dto/opportunityDto';

export interface Opportunity {
    id: string;
    idNotHashed?: string;
    title: string;
    url?: string;
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
    agency?: string;
    city?: string;
    cityFullName?: string;
    description?: string;
    comments?: string;
    presentation?: string;
    phone?: string;
    price?: number;
    reference?: string;
    surface?: number;
    type?: OpportunityType;
    isFullyRented?: boolean;
    needRework?: boolean;
    annualRentalRevenue?: number;
    rentalYield?: number;
    buyerRentalYield?: number;
    imageFolderName?: string;
    status: OpportunityStatus;
    edited?: boolean;
    potentialAnnualRentalRevenue?: number;
    charges?: number;
    propertyTax?: number;
    vacancy?: number;
    amountOfLots?: number;
    postalCode?: number;
    roofAge?: number;
    negociatedPrice?: number;
    buyerPrice?: number;
    agentCommission?: number;
    rework?: number;
    reworkBoost?: number;
    addedAt?: Date;
    image?: string;
    classManual?: string;
    cfpCommission?: number;
    isFake?: boolean;
    statusUpdatedAt?: Date;
    statusUpdatedBy?: string;
    isParsedRentalYieldCorrect?: boolean;
    parsedRentalYield?: number;
    buildingYear?: number;
    displayedTitle?: string;
    availabilityCheckedAt?: Date;
    reasonForSelling?: string;
    unavailableAt?: Date;
    source?: string;
    revenuesContainCharges?: boolean;
    isCoOwned?: boolean;
    hasIndividualElectricMeters?: boolean;
    hasIndividualWaterMeters?: boolean;
    chargesProvisions?: number;
    emailAgent?: string;
    agentMood?: number;
    canBeVirtuallyVisited?: boolean;
    agentPhoneModified?: string;
    quality?: string;
    blacklistedNumber?: boolean;
    adChecksCount?: number;
    glazing?: string;
    qualityComment?: string;
    notaryFees?: number;
    rentingLicense?: boolean;
    verifiedEmail?: string;
    rooms?: number;
    energyPerformanceDiagnosis?: string;
    greenhouseEffectIndex?: string;
    rentalYieldGuessingMethod?: string;
    interestedDossiersCount?: number;
    dataQualityCertification?: Record<string, unknown>;
    pdlElec?: string;
    pdlWater?: string;
    pdlGas?: string;
    allCommercialLotsAreRented?: boolean;
    roofState?: string;
    facadeState?: string;
    placeId?: string;
    longitude?: number;
    latitude?: number;
    minAnnualCashFlow?: number;
    hasVacationLots?: boolean;
    hasNoSingleBedrooms?: boolean;
    availabilityDurationDays?: number;
    potential?: number;
    syndicCharges?: number;
    hasBalcony?: boolean;
    hasTerrace?: boolean;
    hasElevator?: boolean;
    unoverlooked?: boolean;
    hasCellar?: boolean;
    orientation?: string;
    nthFloor?: number;
    isTopFloor?: boolean;
    hasSeperatedWC?: boolean;
    hasCareTaker?: boolean;
    hasParkingPlace?: boolean;
    completionScore?: number;
    approvedBy?: string;
    isNegotiable?: boolean;
    AskForNegotiation?: number;
    isFurnishable?: boolean;
    goodsMerchant?: string;
    annualRentIncreased?: boolean;
    countryIsoCode3?: string;
    descriptionFR?: string;

    // Relations
    departmentId?: number;
    addressId?: number;
}

// Type pour la création d'une opportunité (tous les champs optionnels sauf ceux requis)
export type CreateOpportunityInput = Partial<
    Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>
> & {
    title: string;
    status: OpportunityStatus;
};

// Type pour la mise à jour d'une opportunité (tous les champs optionnels)
export type UpdateOpportunityInput = Partial<Opportunity>;

// Type pour les filtres de recherche d'opportunités
export interface OpportunityFilters {
    type?: OpportunityType;
    status?: OpportunityStatus;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    minSurface?: number;
    maxSurface?: number;
    departmentId?: number;
    isFullyRented?: boolean;
    hasBalcony?: boolean;
    hasTerrace?: boolean;
    hasElevator?: boolean;
    hasParkingPlace?: boolean;
    rooms?: number;
    postalCode?: number;
}

// Type pour la réponse de la liste des opportunités
export interface OpportunitiesListResponse {
    opportunities: Opportunity[];
    totalCount: number;
}
