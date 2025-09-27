import { meetingService } from '@/api/meetingService';
import {
    CreateMeetingDto,
    UpdateMeetingDto
} from '@shared/dto/meetingDto';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query Keys
export const MEETING_QUERY_KEYS = {
    all: ['meetings'] as const,
    lists: () => [...MEETING_QUERY_KEYS.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...MEETING_QUERY_KEYS.lists(), filters] as const,
    details: () => [...MEETING_QUERY_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...MEETING_QUERY_KEYS.details(), id] as const,
    byProspect: (prospectId: string) => [...MEETING_QUERY_KEYS.all, 'byProspect', prospectId] as const,
    byConsultant: (consultantId: string) => [...MEETING_QUERY_KEYS.all, 'byConsultant', consultantId] as const,
    upcomingByProspect: (prospectId: string) => [...MEETING_QUERY_KEYS.all, 'upcoming', prospectId] as const,
};

// Get all meetings
export const useMeetings = (params?: {
    page?: string;
    limit?: string;
    status?: string;
    type?: string;
    prospectId?: string;
    consultantId?: string;
    bookedById?: string;
    startingAfter?: string;
    startingBefore?: string;
}) => {
    return useQuery({
        queryKey: MEETING_QUERY_KEYS.list(params || {}),
        queryFn: async () => {
            const response = await meetingService.getAllMeetings(params);
            return response.data;
        },
    });
};

// Get meeting by ID
export const useMeetingById = (id: string) => {
    return useQuery({
        queryKey: MEETING_QUERY_KEYS.detail(id),
        queryFn: async () => {
            const response = await meetingService.getMeetingById(id);
            return response.data;
        },
        enabled: !!id,
    });
};

// Get meetings by prospect ID
export const useMeetingsByProspectId = (prospectId: string) => {
    return useQuery({
        queryKey: MEETING_QUERY_KEYS.byProspect(prospectId),
        queryFn: async () => {
            const response = await meetingService.getMeetingsByProspectId(prospectId);
            return response.data;
        },
        enabled: !!prospectId,
    });
};

// Get meetings by consultant ID
export const useMeetingsByConsultantId = (consultantId: string) => {
    return useQuery({
        queryKey: MEETING_QUERY_KEYS.byConsultant(consultantId),
        queryFn: async () => {
            const response = await meetingService.getMeetingsByConsultantId(consultantId);
            return response.data;
        },
        enabled: !!consultantId,
    });
};

// Get upcoming meetings by prospect ID
export const useUpcomingMeetingsByProspectId = (prospectId: string) => {
    return useQuery({
        queryKey: MEETING_QUERY_KEYS.upcomingByProspect(prospectId),
        queryFn: async () => {
            const response = await meetingService.getUpcomingMeetingsByProspectId(prospectId);
            return response.data;
        },
        enabled: !!prospectId,
    });
};

// Create meeting mutation
export const useCreateMeeting = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateMeetingDto) => meetingService.createMeeting(data),
        onSuccess: (_, variables) => {
            // Invalidate and refetch meetings
            queryClient.invalidateQueries({ queryKey: MEETING_QUERY_KEYS.all });

            // Invalidate specific prospect and consultant meetings
            queryClient.invalidateQueries({
                queryKey: MEETING_QUERY_KEYS.byProspect(variables.prospectId)
            });
            queryClient.invalidateQueries({
                queryKey: MEETING_QUERY_KEYS.byConsultant(variables.consultantId)
            });
            queryClient.invalidateQueries({
                queryKey: MEETING_QUERY_KEYS.upcomingByProspect(variables.prospectId)
            });
        },
    });
};

// Update meeting mutation
export const useUpdateMeeting = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateMeetingDto }) =>
            meetingService.updateMeeting(id, data),
        onSuccess: (_, { id }) => {
            // Invalidate and refetch meetings
            queryClient.invalidateQueries({ queryKey: MEETING_QUERY_KEYS.all });
            queryClient.invalidateQueries({ queryKey: MEETING_QUERY_KEYS.detail(id) });
        },
    });
};

// Delete meeting mutation
export const useDeleteMeeting = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => meetingService.deleteMeeting(id),
        onSuccess: (_, id) => {
            // Invalidate and refetch meetings
            queryClient.invalidateQueries({ queryKey: MEETING_QUERY_KEYS.all });
            queryClient.removeQueries({ queryKey: MEETING_QUERY_KEYS.detail(id) });
        },
    });
};
