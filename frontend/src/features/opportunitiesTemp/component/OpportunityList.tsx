import { opportunityService } from '@/api/opportunityService';

import React, { useEffect, useState } from 'react';

import { GetAllOpportunities, OpportunityDto } from '@shared/dto';

import { Pagination } from '@/components/ui/Pagination/Pagination';

import { OpportunityCard } from './OpportunityCard';
import { OpportunityFilters } from './OpportunityFilters';

interface OpportunityListProps {
    initialOpportunities?: OpportunityDto[];
    totalCount?: number;
    userHasTokens?: boolean;
    userRoles?: string[];
}

export const OpportunityList: React.FC<OpportunityListProps> = ({
    initialOpportunities = [],
    totalCount: initialTotalCount = 0,
    userHasTokens = false,
    userRoles = [],
}) => {
    const [opportunities, setOpportunities] = useState<OpportunityDto[]>(initialOpportunities);
    const [totalItems, setTotalItems] = useState<number>(initialTotalCount);
    const [filters, setFilters] = useState<GetAllOpportunities>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const itemsPerPage = 9;

    useEffect(() => {
        fetchOpportunities(filters, currentPage);
    }, []);

    const handleFilterChange = async (newFilters: GetAllOpportunities) => {
        setFilters(newFilters);
        setCurrentPage(1);
        await fetchOpportunities(newFilters, 1);
    };

    const handlePageChange = async (page: number) => {
        setCurrentPage(page);
        await fetchOpportunities(filters, page);
    };

    const fetchOpportunities = async (currentFilters: GetAllOpportunities, page: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await opportunityService.getOpportunities(
                currentFilters,
                page,
                itemsPerPage
            );
            if (response.data) {
                setOpportunities(response.data || []);
                setTotalItems(response.pagination?.totalItems ?? 0);
            } else {
                setOpportunities([]);
                setError(
                    response.message ||
                        'Une erreur est survenue lors du chargement des opportunités'
                );
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Une erreur est survenue lors du chargement des opportunités'
            );
            setOpportunities([]);
            console.error('Error fetching opportunities:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!userHasTokens) {
        return (
            <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-yellow-800 shadow">
                <strong>Accès restreint</strong>
                <p className="mb-0">
                    Vous avez expiré tous vos jetons, merci de{' '}
                    <a className="text-blue-700 underline" href="mailto:contact@cashflowpositif.fr">
                        nous contacter
                    </a>
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* Message d'erreur */}
            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 shadow">
                    {error}
                </div>
            )}

            {/* Filtres */}
            {userRoles.includes('ROLE_OPPORTUNITY_FILTERS') && (
                <div className="mb-6">
                    <OpportunityFilters
                        onFilterChange={handleFilterChange}
                        initialFilters={filters}
                        userRoles={userRoles}
                    />
                </div>
            )}

            {/* Compteur de résultats */}
            <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                    {currentPage * itemsPerPage > totalItems
                        ? `${totalItems} sur ${totalItems}`
                        : `${currentPage * itemsPerPage} sur ${totalItems}${totalItems === 1000 ? '+' : ''}`}{' '}
                    biens disponibles
                </span>
            </div>

            {/* Liste des opportunités */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    <div className="col-span-full flex justify-center py-10">
                        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    </div>
                ) : opportunities.length === 0 ? (
                    <div className="col-span-full py-10 text-center text-gray-400">
                        <p>Aucune opportunité trouvée</p>
                    </div>
                ) : (
                    opportunities.map((opportunity) => (
                        <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalItems > 0 && (
                <div className="mt-8 flex justify-center">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(totalItems / itemsPerPage)}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
};
