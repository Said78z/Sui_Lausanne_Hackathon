import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { opportunityService } from '@/api/opportunityService';
import { CreateOpportunityDto, QueryOpportunitiesSchema, UpdateOpportunityDto } from '@shared/dto';

// Query keys
export const opportunityKeys = {
    all: ['opportunities'] as const,
    lists: () => [...opportunityKeys.all, 'list'] as const,
    list: (params: QueryOpportunitiesSchema) => [...opportunityKeys.lists(), params] as const,
    details: () => [...opportunityKeys.all, 'detail'] as const,
    detail: (id: string) => [...opportunityKeys.details(), id] as const,
};

/**
 * Hook to get all opportunities with pagination
 */
export const useOpportunities = (params: QueryOpportunitiesSchema = { limit: "10" }) => {
    return useQuery({
        queryKey: opportunityKeys.list(params),
        queryFn: () => opportunityService.getAllOpportunities(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });
};

/**
 * Hook to get all opportunities (fetch all pages)
 */
export const useAllOpportunities = (options = {}) => {
    return useQuery({
        queryKey: [...opportunityKeys.all, 'all'],
        queryFn: async () => {
            const allOpportunities = [];
            let currentPage = 1;
            let hasMorePages = true;

            while (hasMorePages) {
                const response = await opportunityService.getAllOpportunities({
                    page: currentPage.toString(),
                    limit: "100" // Fetch 100 per page to minimize requests
                });

                allOpportunities.push(...response.data);

                if (response.pagination && currentPage < response.pagination.totalPages) {
                    currentPage++;
                } else {
                    hasMorePages = false;
                }
            }

            return {
                data: allOpportunities,
                message: 'Toutes les opportunités récupérées',
                status: 200,
                pagination: {
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: allOpportunities.length,
                    nextPage: 0,
                    previousPage: 0,
                    perPage: allOpportunities.length
                }
            };
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        ...options,
    });
};

/**
 * Hook for paginated opportunities with navigation controls
 */
export const usePaginatedOpportunities = (initialPage: number = 1, limit: number = 10) => {
    const [currentPage, setCurrentPage] = useState(initialPage);

    const query = useQuery({
        queryKey: opportunityKeys.list({ page: currentPage.toString(), limit: limit.toString() }),
        queryFn: () => opportunityService.getAllOpportunities({
            page: currentPage.toString(),
            limit: limit.toString()
        }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });

    const goToPage = (page: number) => {
        const totalPages = query.data?.pagination?.totalPages;
        if (totalPages && page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const goToNextPage = () => {
        const nextPage = query.data?.pagination?.nextPage;
        if (nextPage && nextPage > currentPage) {
            setCurrentPage(nextPage);
        }
    };

    const goToPreviousPage = () => {
        const previousPage = query.data?.pagination?.previousPage;
        if (previousPage && previousPage > 0) {
            setCurrentPage(previousPage);
        }
    };

    const goToFirstPage = () => setCurrentPage(1);

    const goToLastPage = () => {
        const totalPages = query.data?.pagination?.totalPages;
        if (totalPages) {
            setCurrentPage(totalPages);
        }
    };

    return {
        ...query,
        currentPage,
        pagination: query.data?.pagination,
        goToPage,
        goToNextPage,
        goToPreviousPage,
        goToFirstPage,
        goToLastPage,
        hasNextPage: Boolean(query.data?.pagination?.nextPage && query.data.pagination.nextPage > currentPage),
        hasPreviousPage: Boolean(query.data?.pagination?.previousPage && query.data.pagination.previousPage > 0),
    };
};

/**
 * Hook to get opportunity by ID
 */
export const useOpportunity = (id: string) => {
    return useQuery({
        queryKey: opportunityKeys.detail(id),
        queryFn: () => opportunityService.getOpportunityById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });
};

/**
 * Hook to create opportunity
 */
export const useCreateOpportunity = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateOpportunityDto) => opportunityService.createOpportunity(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
            toast.success('Opportunité créée avec succès');
        },
        onError: (error: unknown) => {
            console.error('❌ [FRONTEND] Error creating opportunity:', error);
            toast.error('Erreur lors de la création de l\'opportunité');
        },
    });
};

/**
 * Hook to update opportunity
 */
export const useUpdateOpportunity = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateOpportunityDto }) =>
            opportunityService.updateOpportunity(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
            queryClient.invalidateQueries({ queryKey: opportunityKeys.detail(variables.id) });
            toast.success('Opportunité mise à jour avec succès');
        },
        onError: (error: unknown) => {
            console.error('❌ [FRONTEND] Error updating opportunity:', error);
            toast.error('Erreur lors de la mise à jour de l\'opportunité');
        },
    });
};

/**
 * Hook to delete opportunity
 */
export const useDeleteOpportunity = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => opportunityService.deleteOpportunity(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
            toast.success('Opportunité supprimée avec succès');
        },
        onError: (error: unknown) => {
            console.error('❌ [FRONTEND] Error deleting opportunity:', error);
            toast.error('Erreur lors de la suppression de l\'opportunité');
        },
    });
};
