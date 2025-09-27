import { callService } from '@/api/callService';
import {
    CreateCallDto,
    GetAllCallsDto,
    UpdateCallDto
} from '@shared/dto';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query Keys
export const CALL_QUERY_KEYS = {
    all: ['calls'] as const,
    lists: () => [...CALL_QUERY_KEYS.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...CALL_QUERY_KEYS.lists(), filters] as const,
    details: () => [...CALL_QUERY_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...CALL_QUERY_KEYS.details(), id] as const,
    byProspect: (prospectId: string) => [...CALL_QUERY_KEYS.all, 'byProspect', prospectId] as const,
    latestByProspect: (prospectId: string) => [...CALL_QUERY_KEYS.all, 'latest', prospectId] as const,
};

// Get all calls
export const useCalls = (params?: GetAllCallsDto) => {
    return useQuery({
        queryKey: CALL_QUERY_KEYS.list(params || {}),
        queryFn: async () => {
            const response = await callService.getAllCalls(params);
            return response.data;
        },
    });
};

// Get call by ID
export const useCallById = (id: string) => {
    return useQuery({
        queryKey: CALL_QUERY_KEYS.detail(id),
        queryFn: async () => {
            const response = await callService.getCallById(id);
            return response.data;
        },
        enabled: !!id,
    });
};

// Get calls by prospect ID
export const useCallsByProspectId = (prospectId: string) => {
    return useQuery({
        queryKey: CALL_QUERY_KEYS.byProspect(prospectId),
        queryFn: async () => {
            const response = await callService.getCallsByProspectId(prospectId);
            return response.data;
        },
        enabled: !!prospectId,
    });
};

// Get latest call by prospect ID
export const useLatestCallByProspectId = (prospectId: string) => {
    return useQuery({
        queryKey: CALL_QUERY_KEYS.latestByProspect(prospectId),
        queryFn: async () => {
            const response = await callService.getLatestCallByProspectId(prospectId);
            return response.data;
        },
        enabled: !!prospectId,
    });
};

// Create call mutation
export const useCreateCall = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCallDto) => callService.createCall(data),
        onSuccess: (_, variables) => {
            // Invalidate calls queries
            queryClient.invalidateQueries({ queryKey: CALL_QUERY_KEYS.all });

            // Invalidate prospect-specific queries if prospect is available
            if (variables.prospect) {
                queryClient.invalidateQueries({
                    queryKey: CALL_QUERY_KEYS.byProspect(variables.prospect)
                });
                queryClient.invalidateQueries({
                    queryKey: CALL_QUERY_KEYS.latestByProspect(variables.prospect)
                });
            }
        },
    });
};

// Update call mutation
export const useUpdateCall = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCallDto }) =>
            callService.updateCall(id, data),
        onSuccess: (response, { id }) => {
            // Invalidate specific call and lists
            queryClient.invalidateQueries({ queryKey: CALL_QUERY_KEYS.detail(id) });
            queryClient.invalidateQueries({ queryKey: CALL_QUERY_KEYS.lists() });

            // Invalidate prospect-specific queries if available
            if (response.data?.prospectId) {
                queryClient.invalidateQueries({
                    queryKey: CALL_QUERY_KEYS.byProspect(response.data.prospectId)
                });
                queryClient.invalidateQueries({
                    queryKey: CALL_QUERY_KEYS.latestByProspect(response.data.prospectId)
                });
            }
        },
    });
};

// Delete call mutation
export const useDeleteCall = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => callService.deleteCall(id),
        onSuccess: () => {
            // Invalidate and refetch calls queries
            queryClient.invalidateQueries({ queryKey: CALL_QUERY_KEYS.all });
        },
    });
};
