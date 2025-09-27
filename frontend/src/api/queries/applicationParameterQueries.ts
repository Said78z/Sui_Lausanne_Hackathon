import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { applicationParameterService } from '@/api/applicationParameterService';
import { CreateApplicationParameterDto, GetAllApplicationParameters, UpdateApplicationParameterDto } from '@shared/dto';

// Query keys
export const applicationParameterKeys = {
    all: ['applicationParameters'] as const,
    lists: () => [...applicationParameterKeys.all, 'list'] as const,
    list: (params: GetAllApplicationParameters) => [...applicationParameterKeys.lists(), params] as const,
    details: () => [...applicationParameterKeys.all, 'detail'] as const,
    detail: (id: string) => [...applicationParameterKeys.details(), id] as const,
};

/**
 * Hook to get all application parameters with pagination
 */
export const useApplicationParameters = (params: GetAllApplicationParameters = { limit: "10" }) => {
    return useQuery({
        queryKey: applicationParameterKeys.list(params),
        queryFn: () => applicationParameterService.getAllParameters(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });
};

/**
 * Hook to get all application parameters (fetch all pages)
 */
export const useAllApplicationParameters = (options = {}) => {
    return useQuery({
        queryKey: [...applicationParameterKeys.all, 'all'],
        queryFn: async () => {
            const allParameters = [];
            let currentPage = 1;
            let hasMorePages = true;

            while (hasMorePages) {
                const response = await applicationParameterService.getAllParameters({
                    page: currentPage.toString(),
                    limit: "100" // Fetch 100 per page to minimize requests
                });

                allParameters.push(...response.data);

                if (response.pagination && currentPage < response.pagination.totalPages) {
                    currentPage++;
                } else {
                    hasMorePages = false;
                }
            }

            return {
                data: allParameters,
                message: 'Tous les paramètres récupérés',
                status: 200,
                pagination: {
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: allParameters.length,
                    nextPage: 0,
                    previousPage: 0,
                    perPage: allParameters.length
                }
            };
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        ...options,
    });
};

/**
 * Hook for paginated application parameters with navigation controls
 */
export const usePaginatedApplicationParameters = (initialPage: number = 1, limit: number = 10) => {
    const [currentPage, setCurrentPage] = useState(initialPage);

    const query = useQuery({
        queryKey: applicationParameterKeys.list({ page: currentPage.toString(), limit: limit.toString() }),
        queryFn: () => applicationParameterService.getAllParameters({
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
 * Hook to get application parameter by ID
 */
export const useApplicationParameter = (id: string) => {
    return useQuery({
        queryKey: applicationParameterKeys.detail(id),
        queryFn: () => applicationParameterService.getParameterById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });
};

/**
 * Hook to create application parameter
 */
export const useCreateApplicationParameter = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateApplicationParameterDto) => applicationParameterService.createParameter(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: applicationParameterKeys.lists() });
            toast.success('Paramètre créé avec succès');
        },
        onError: (error: unknown) => {
            console.error('❌ [FRONTEND] Error creating application parameter:', error);
            toast.error('Erreur lors de la création du paramètre');
        },
    });
};

/**
 * Hook to update application parameter
 */
export const useUpdateApplicationParameter = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateApplicationParameterDto }) =>
            applicationParameterService.updateParameter(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: applicationParameterKeys.lists() });
            queryClient.invalidateQueries({ queryKey: applicationParameterKeys.detail(variables.id) });
            toast.success('Paramètre mis à jour avec succès');
        },
        onError: (error: unknown) => {
            console.error('❌ [FRONTEND] Error updating application parameter:', error);
            toast.error('Erreur lors de la mise à jour du paramètre');
        },
    });
};

/**
 * Hook to delete application parameter
 */
export const useDeleteApplicationParameter = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => applicationParameterService.deleteParameter(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: applicationParameterKeys.lists() });
            toast.success('Paramètre supprimé avec succès');
        },
        onError: (error: unknown) => {
            console.error('❌ [FRONTEND] Error deleting application parameter:', error);
            toast.error('Erreur lors de la suppression du paramètre');
        },
    });
};
