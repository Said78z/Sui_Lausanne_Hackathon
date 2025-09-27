import { communicationService } from '@/api/communicationService';
import {
    CreateCommunicationDto,
    UpdateCommunicationDto
} from '@shared/dto/communicationDto';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query Keys
export const COMMUNICATION_QUERY_KEYS = {
    all: ['communications'] as const,
    lists: () => [...COMMUNICATION_QUERY_KEYS.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...COMMUNICATION_QUERY_KEYS.lists(), filters] as const,
    details: () => [...COMMUNICATION_QUERY_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...COMMUNICATION_QUERY_KEYS.details(), id] as const,
    byProspect: (prospectId: string) => [...COMMUNICATION_QUERY_KEYS.all, 'byProspect', prospectId] as const,
    byOpportunity: (opportunityId: string) => [...COMMUNICATION_QUERY_KEYS.all, 'byOpportunity', opportunityId] as const,
};

// Get all communications
export const useCommunications = (params?: {
    page?: string;
    limit?: string;
    type?: string;
    way?: string;
    prospectId?: string;
    opportunityId?: string;
    sentFromUserId?: string;
    sentAfter?: string;
    sentBefore?: string;
}) => {
    return useQuery({
        queryKey: COMMUNICATION_QUERY_KEYS.list(params || {}),
        queryFn: async () => {
            const response = await communicationService.getAllCommunications(params);
            return response.data;
        },
    });
};

// Get communication by ID
export const useCommunicationById = (id: string) => {
    return useQuery({
        queryKey: COMMUNICATION_QUERY_KEYS.detail(id),
        queryFn: async () => {
            const response = await communicationService.getCommunicationById(id);
            return response.data;
        },
        enabled: !!id,
    });
};

// Get communications by prospect ID
export const useCommunicationsByProspectId = (prospectId: string) => {
    return useQuery({
        queryKey: COMMUNICATION_QUERY_KEYS.byProspect(prospectId),
        queryFn: async () => {
            const response = await communicationService.getCommunicationsByProspectId(prospectId);
            return response.data;
        },
        enabled: !!prospectId,
    });
};

// Get communications by opportunity ID
export const useCommunicationsByOpportunityId = (opportunityId: string) => {
    return useQuery({
        queryKey: COMMUNICATION_QUERY_KEYS.byOpportunity(opportunityId),
        queryFn: async () => {
            const response = await communicationService.getCommunicationsByOpportunityId(opportunityId);
            return response.data;
        },
        enabled: !!opportunityId,
    });
};

// Create communication mutation
export const useCreateCommunication = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCommunicationDto) => communicationService.createCommunication(data),
        onSuccess: (_, variables) => {
            // Invalidate and refetch communications
            queryClient.invalidateQueries({ queryKey: COMMUNICATION_QUERY_KEYS.all });

            // Invalidate specific prospect or opportunity communications if applicable
            if (variables.opportunityId) {
                queryClient.invalidateQueries({
                    queryKey: COMMUNICATION_QUERY_KEYS.byOpportunity(variables.opportunityId)
                });
            }
        },
    });
};

// Update communication mutation
export const useUpdateCommunication = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCommunicationDto }) =>
            communicationService.updateCommunication(id, data),
        onSuccess: (_, { id }) => {
            // Invalidate and refetch communications
            queryClient.invalidateQueries({ queryKey: COMMUNICATION_QUERY_KEYS.all });
            queryClient.invalidateQueries({ queryKey: COMMUNICATION_QUERY_KEYS.detail(id) });
        },
    });
};

// Delete communication mutation
export const useDeleteCommunication = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => communicationService.deleteCommunication(id),
        onSuccess: (_, id) => {
            // Invalidate and refetch communications
            queryClient.invalidateQueries({ queryKey: COMMUNICATION_QUERY_KEYS.all });
            queryClient.removeQueries({ queryKey: COMMUNICATION_QUERY_KEYS.detail(id) });
        },
    });
};
