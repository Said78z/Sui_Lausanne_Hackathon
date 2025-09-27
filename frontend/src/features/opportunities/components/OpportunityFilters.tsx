import { OpportunityDto } from '@shared/dto/opportunityDto';

import { AdvancedFiltersState } from './AdvancedFilters';

interface Filters {
    region: string;
    status: string;
}

export function useOpportunityFilters(
    opportunities: OpportunityDto[],
    searchTerm: string,
    filters: Filters,
    advancedFilters: AdvancedFiltersState
) {
    const filteredOpportunities = opportunities.filter((opportunity) => {
        // Recherche textuelle
        const matchesSearch =
            opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            opportunity.city.toLowerCase().includes(searchTerm.toLowerCase());

        // Filtres de base
        const matchesRegion =
            !filters.region ||
            filters.region === 'Toutes' ||
            opportunity.address?.state === filters.region;

        const matchesStatus =
            !filters.status || filters.status === 'Tous' || opportunity.status === filters.status;

        // Filtres avancés - Prix
        const matchesPriceRange =
            opportunity.price >= advancedFilters.priceRange[0] * 1000 &&
            opportunity.price <= advancedFilters.priceRange[1] * 1000;

        // Filtres avancés - Coût travaux (simulé avec une propriété workCost)
        const matchesWorkCost = true; // À implémenter quand la propriété workCost sera disponible

        // Filtres avancés - Régions
        const matchesIncludedRegions =
            advancedFilters.includedRegions.length === 0 ||
            advancedFilters.includedRegions.includes(opportunity.address?.state ?? '');

        // Filtres avancés - Type de bien
        const matchesPropertyType =
            !advancedFilters.propertyType ||
            opportunity.type.toLowerCase() === advancedFilters.propertyType.toLowerCase();

        // Filtres avancés - Qualité (simulé avec le statut)
        const matchesQuality =
            !advancedFilters.quality ||
            (advancedFilters.quality === 'approved' && opportunity.status === 'QUALIFIED') ||
            (advancedFilters.quality === 'not_reviewed' && opportunity.status === 'NEW') ||
            (advancedFilters.quality === 'pending' && opportunity.status === 'RELEVANT');

        // Filtres avancés - Ville
        const matchesCity =
            !advancedFilters.city ||
            opportunity.city.toLowerCase().includes(advancedFilters.city.toLowerCase()) ||
            opportunity.city.toLowerCase().includes(advancedFilters.city.toLowerCase());

        // Filtres avancés - Publié il y a X jours (simulé)
        const matchesPublishedDays = !advancedFilters.publishedDays || true; // À implémenter avec une vraie date de publication

        // Filtres avancés - Quantité de lots (simulé)
        const matchesLotsQuantity = !advancedFilters.lotsQuantity || true; // À implémenter avec une propriété lotsCount

        // Filtres avancés - Rendement minimum
        const matchesMinYield =
            !advancedFilters.minYield ||
            (opportunity.rentalYield &&
                opportunity.rentalYield >= Number(advancedFilters.minYield));

        // Filtres avancés - Occupation (simulé avec occupancyRange)
        const matchesOccupancy = true; // À implémenter quand la propriété occupancy sera disponible
        // opportunity.occupancy >= advancedFilters.occupancyRange[0] &&
        // opportunity.occupancy <= advancedFilters.occupancyRange[1];

        // Filtres avancés - Cash flow minimum (simulé)
        const matchesCashFlow = !advancedFilters.minCashFlow || true; // À implémenter avec une propriété cashFlow

        // Filtres avancés - Taille commune et aire urbaine (simulé)
        const matchesCommuneSize = !advancedFilters.communeSize || true;
        const matchesUrbanAreaSize = !advancedFilters.urbanAreaSize || true;

        // Filtres avancés - Off market (simulé)
        const matchesOffMarket = !advancedFilters.isOffMarket || true; // À implémenter avec une propriété isOffMarket

        // Filtres avancés - Isolé (simulé)
        const matchesIsolated = !advancedFilters.isolated || true; // À implémenter avec des propriétés spécifiques

        // Filtres avancés - Sans colocation (simulé)
        const matchesWithoutColocation = !advancedFilters.withoutColocation || true; // À implémenter avec une propriété hasColocation

        // Filtres avancés - Sans lots saisonniers (simulé)
        const matchesWithoutSeasonalLots = !advancedFilters.withoutSeasonalLots || true; // À implémenter avec une propriété hasSeasonalLots

        // Filtres avancés - Type de baux (simulé)
        const matchesBauxType = !advancedFilters.bauxType || true; // À implémenter avec une propriété bauxType

        return (
            matchesSearch &&
            matchesRegion &&
            matchesStatus &&
            matchesPriceRange &&
            matchesWorkCost &&
            matchesIncludedRegions &&
            matchesPropertyType &&
            matchesQuality &&
            matchesCity &&
            matchesPublishedDays &&
            matchesLotsQuantity &&
            matchesMinYield &&
            matchesOccupancy &&
            matchesCashFlow &&
            matchesCommuneSize &&
            matchesUrbanAreaSize &&
            matchesOffMarket &&
            matchesIsolated &&
            matchesWithoutColocation &&
            matchesWithoutSeasonalLots &&
            matchesBauxType
        );
    });

    return filteredOpportunities;
}

export type { Filters, OpportunityDto };
