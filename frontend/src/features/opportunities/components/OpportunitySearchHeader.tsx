import { Button } from '@/components';

import { OpportunityDto } from '@shared/dto/opportunityDto';
import { ArrowDown, ArrowUp, ArrowUpDown, ListFilter } from 'lucide-react';

import { FilterButton } from '@/components/ui/FilterButton/FilterButton';
import { SearchBar } from '@/components/ui/SearchBar/SearchBar';

import { Filters } from './OpportunityFilters';

interface OpportunitySearchHeaderProps {
    onSearch: (query: string) => void;
    filters: Filters;
    onFilterChange: (type: string, value: string) => void;
    opportunities: OpportunityDto[];
    onSortByExpectedFiles?: (direction: 'asc' | 'desc' | null) => void;
    sortDirection?: 'asc' | 'desc' | null;
}

export function OpportunitySearchHeader({
    onSearch,
    filters,
    onFilterChange,
    opportunities,
    onSortByExpectedFiles,
    sortDirection = null,
}: OpportunitySearchHeaderProps) {
    // Obtenir les régions uniques
    const uniqueRegions = Array.from(
        new Set(
            opportunities
                .map((opp) => opp.address?.state)
                .filter((state): state is string => Boolean(state))
        )
    );
    const uniqueStatuses = Array.from(new Set(opportunities.map((opp) => opp.status)));

    // Options pour les filtres
    const filterOptions = [
        { label: 'Toutes les régions', value: 'Toutes', type: 'region' },
        ...uniqueRegions.map((region) => ({
            label: region,
            value: region,
            type: 'region',
        })),
        { label: 'Tous les statuts', value: 'Tous', type: 'status' },
        ...uniqueStatuses.map((status) => ({
            label:
                status === 'NEW'
                    ? 'Nouveau'
                    : status === 'QUALIFIED'
                      ? 'Qualifié'
                      : status === 'RELEVANT'
                        ? 'Pertinent'
                        : 'Non parsable',
            value: status,
            type: 'status',
        })),
    ];

    const handleSortClick = () => {
        if (!onSortByExpectedFiles) return;

        if (sortDirection === null) {
            onSortByExpectedFiles('desc');
        } else if (sortDirection === 'desc') {
            onSortByExpectedFiles('asc');
        } else {
            onSortByExpectedFiles(null);
        }
    };

    const getSortIcon = () => {
        if (sortDirection === 'asc') return <ArrowUp size={16} />;
        if (sortDirection === 'desc') return <ArrowDown size={16} />;
        return <ArrowUpDown size={16} />;
    };

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Recherche */}
            <div className="flex-1">
                <SearchBar
                    onSearch={onSearch}
                    placeholder="Rechercher une opportunité..."
                    className="w-full"
                />
            </div>

            {/* Filtres */}
            <div className="flex gap-3">
                <FilterButton
                    filters={filters as unknown as Record<string, string>}
                    filterOptions={filterOptions}
                    onFilterChange={onFilterChange}
                />
                <Button
                    variant="primary"
                    className="flex items-center gap-2"
                    onClick={handleSortClick}
                >
                    {getSortIcon()}
                    Trier par dossiers
                </Button>
                <Button variant="primary" className="flex items-center gap-2">
                    <ListFilter size={16} />
                    Filtre prédéfini
                </Button>
            </div>
        </div>
    );
}
