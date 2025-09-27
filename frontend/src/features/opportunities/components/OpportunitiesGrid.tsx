import { useState } from 'react';

import { OpportunityDto } from '@shared/dto/opportunityDto';

import { AdvancedFilters, AdvancedFiltersState } from './AdvancedFilters';
import { EmptyOpportunities } from './EmptyOpportunities';
import { OpportunityCard } from './OpportunityCard';
import { Filters, useOpportunityFilters } from './OpportunityFilters';
import { OpportunityPagination } from './OpportunityPagination';
import { OpportunityResultsHeader } from './OpportunityResultsHeader';
import { OpportunitySearchHeader } from './OpportunitySearchHeader';

interface OpportunitiesGridProps {
    opportunities: OpportunityDto[];
    onOpportunityClick?: (opportunity: OpportunityDto) => void;
}

// Fonction pour simuler le nombre de dossiers attendus basé sur l'ID
const getExpectedFiles = (opportunityId: string): number => {
    // Utiliser l'ID pour générer un nombre pseudo-aléatoire mais consistant
    const hash = opportunityId.split('').reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
    }, 0);
    return Math.abs(hash) % 20; // Entre 0 et 19 dossiers
};

export function OpportunitiesGrid({ opportunities, onOpportunityClick }: OpportunitiesGridProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
    const [filters, setFilters] = useState<Filters>({
        region: 'Toutes',
        status: 'Tous',
    });
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    // États pour les filtres avancés
    const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersState>({
        priceRange: [100, 800] as [number, number],
        workCostRange: [25, 125] as [number, number],
        includedRegions: [] as string[],
        propertyType: '',
        quality: '',
        city: '',
        extendUrbanAreas: false,
        publishedDays: '',
        lotsQuantity: '',
        minYield: '',
        occupancyRange: [0, 100] as [number, number],
        minCashFlow: '',
        communeSize: '',
        urbanAreaSize: '',
        isOffMarket: false,
        isolated: '',
        withoutSeasonalLots: false,
        withoutColocation: false,
        bauxType: '',
    });

    const itemsPerPage = 6;

    // Filtrage des opportunités avec tous les filtres
    let filteredOpportunities = useOpportunityFilters(
        opportunities,
        searchTerm,
        filters,
        advancedFilters
    );

    // Tri par expectedFiles si activé
    if (sortDirection) {
        filteredOpportunities = [...filteredOpportunities].sort((a, b) => {
            const expectedFilesA = getExpectedFiles(a.id);
            const expectedFilesB = getExpectedFiles(b.id);

            if (sortDirection === 'asc') {
                return expectedFilesA - expectedFilesB;
            } else {
                return expectedFilesB - expectedFilesA;
            }
        });
    }

    // Pagination
    const totalPages = Math.ceil(filteredOpportunities.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedOpportunities = filteredOpportunities.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    // Réinitialiser la page lors du changement de filtres
    const handleFilterChange = (type: string, value: string) => {
        setFilters((prev) => ({
            ...prev,
            [type]: value,
        }));
        setCurrentPage(1);
    };

    // Réinitialiser la page lors du changement des filtres avancés
    const handleAdvancedFilterChange = (newFilters: Partial<AdvancedFiltersState>) => {
        setAdvancedFilters((prev) => ({
            ...prev,
            ...newFilters,
        }));
        setCurrentPage(1);
    };

    // Obtenir les régions uniques
    const uniqueRegions = Array.from(
        new Set(
            opportunities
                .map((opp) => opp.address?.state)
                .filter((state): state is string => Boolean(state))
        )
    );

    const handleSearch = (query: string) => {
        setSearchTerm(query);
        setCurrentPage(1);
    };

    const handleToggleFilters = () => {
        setIsFiltersOpen(!isFiltersOpen);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSortByExpectedFiles = (direction: 'asc' | 'desc' | null) => {
        setSortDirection(direction);
        setCurrentPage(1);
    };

    return (
        <div className="space-y-6">
            {/* Barre de recherche et filtres */}
            <OpportunitySearchHeader
                onSearch={handleSearch}
                filters={filters}
                onFilterChange={handleFilterChange}
                opportunities={opportunities}
                onSortByExpectedFiles={handleSortByExpectedFiles}
                sortDirection={sortDirection}
            />

            {/* Résultats */}
            <OpportunityResultsHeader
                filteredCount={filteredOpportunities.length}
                isFiltersOpen={isFiltersOpen}
                onToggleFilters={handleToggleFilters}
            />

            {/* Filtres avancés */}
            <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isFiltersOpen ? 'max-h-[100vh] border-y py-6' : 'max-h-0 py-0'}`}
            >
                <AdvancedFilters
                    advancedFilters={advancedFilters}
                    setAdvancedFilters={setAdvancedFilters}
                    handleAdvancedFilterChange={handleAdvancedFilterChange}
                    uniqueRegions={uniqueRegions}
                />
            </div>

            {/* Grille des opportunités */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {paginatedOpportunities.map((opportunity) => (
                    <OpportunityCard
                        key={opportunity.id}
                        opportunity={opportunity}
                        onClick={() => onOpportunityClick?.(opportunity)}
                    />
                ))}
            </div>

            {/* Message si aucun résultat */}
            {filteredOpportunities.length === 0 && <EmptyOpportunities />}

            {/* Pagination */}
            <OpportunityPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
}

export { getExpectedFiles };
