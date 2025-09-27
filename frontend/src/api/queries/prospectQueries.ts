import { prospectService } from '@/api/prospectService';
import {
    CreateProspectDto,
    getAllProspectsDto,
    UpdateProspectDto
} from '@shared/dto';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query Keys
export const PROSPECT_QUERY_KEYS = {
    all: ['prospects'] as const,
    lists: () => [...PROSPECT_QUERY_KEYS.all, 'list'] as const,
    list: (filters: getAllProspectsDto) => [...PROSPECT_QUERY_KEYS.lists(), filters] as const,
    details: () => [...PROSPECT_QUERY_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...PROSPECT_QUERY_KEYS.details(), id] as const,
    byRole: (role: string, search?: string) => [...PROSPECT_QUERY_KEYS.all, 'byRole', role, search] as const,
};

// Get all prospects
export const useProspects = (params?: getAllProspectsDto) => {
    return useQuery({
        queryKey: PROSPECT_QUERY_KEYS.list(params || {}),
        queryFn: async () => {
            const response = await prospectService.getAllProspects(params);
            return response.data;
        },
    });
};

// Get prospect by ID
export const useProspectById = (id: string) => {
    return useQuery({
        queryKey: PROSPECT_QUERY_KEYS.detail(id),
        queryFn: async () => {
            const response = await prospectService.getProspectById(id);
            return response.data;
        },
        enabled: !!id,
    });
};

// Get prospect by user ID
export const useProspectByUserId = (userId: string) => {
    return useQuery({
        queryKey: [...PROSPECT_QUERY_KEYS.details(), 'byUserId', userId],
        queryFn: async () => {
            const response = await prospectService.getProspectByUserId(userId);
            return response.data;
        },
        enabled: !!userId,
    });
};

// Get prospects by role (for address book)
export const useProspectsByRole = (role: string, search?: string) => {
    return useQuery({
        queryKey: PROSPECT_QUERY_KEYS.byRole(role, search),
        queryFn: async () => {
            const response = await prospectService.getProspectsByRole(role, search);
            return response.data;
        },
        enabled: !!role,
    });
};

// Create prospect mutation
export const useCreateProspect = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateProspectDto) => prospectService.createProspect(data),
        onSuccess: () => {
            // Invalidate and refetch prospects queries
            queryClient.invalidateQueries({ queryKey: PROSPECT_QUERY_KEYS.all });
        },
    });
};

// Update prospect mutation
export const useUpdateProspect = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateProspectDto }) =>
            prospectService.updateProspect(id, data),
        onSuccess: (_, { id }) => {
            // Invalidate specific prospect and lists
            queryClient.invalidateQueries({ queryKey: PROSPECT_QUERY_KEYS.detail(id) });
            queryClient.invalidateQueries({ queryKey: PROSPECT_QUERY_KEYS.lists() });
        },
    });
};

// Delete prospect mutation
export const useDeleteProspect = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => prospectService.deleteProspect(id),
        onSuccess: () => {
            // Invalidate and refetch prospects queries
            queryClient.invalidateQueries({ queryKey: PROSPECT_QUERY_KEYS.all });
        },
    });
};
