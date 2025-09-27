interface OpportunityResultsHeaderProps {
    filteredCount: number;
    isFiltersOpen: boolean;
    onToggleFilters: () => void;
}

export function OpportunityResultsHeader({
    filteredCount,
    isFiltersOpen,
    onToggleFilters,
}: OpportunityResultsHeaderProps) {
    return (
        <div className="text-sm text-gray-600">
            {filteredCount} opportunité
            {filteredCount > 1 ? 's' : ''} trouvée
            {filteredCount > 1 ? 's' : ''}
            {' - '}
            <span className="cursor-pointer text-secondary" onClick={onToggleFilters}>
                {isFiltersOpen ? 'Masquer les filtres avancés' : 'Voir tous les filtres'}
            </span>
        </div>
    );
}
