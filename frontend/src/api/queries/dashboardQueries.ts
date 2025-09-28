import { dashboardService } from '@/api/dashboardService';
import { CreateCategoryDto, CreateEventDto, UpdateEventDto } from '@shared/dto';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query Keys
export const dashboardKeys = {
    all: ['dashboard'] as const,
    data: () => [...dashboardKeys.all, 'data'] as const,
    events: () => [...dashboardKeys.all, 'events'] as const,
    upcomingEvents: (limit?: number) => [...dashboardKeys.events(), 'upcoming', limit] as const,
    userEvents: (limit?: number) => [...dashboardKeys.events(), 'user', limit] as const,
    event: (id: string) => [...dashboardKeys.events(), id] as const,
    categories: () => [...dashboardKeys.all, 'categories'] as const,
};

// Dashboard Data Query
export const useDashboardData = (options = {}) => {
    return useQuery({
        queryKey: dashboardKeys.data(),
        queryFn: () => dashboardService.getDashboardData(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    });
};

// Events Queries
export const useUpcomingEvents = (limit = 10, options = {}) => {
    return useQuery({
        queryKey: dashboardKeys.upcomingEvents(limit),
        queryFn: () => dashboardService.getUpcomingEvents(limit),
        staleTime: 0, // Always fresh - no stale time
        gcTime: 1 * 60 * 1000, // 1 minute
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        ...options,
    });
};

export const useUserEvents = (limit = 10) => {
    return useQuery({
        queryKey: dashboardKeys.userEvents(limit),
        queryFn: () => dashboardService.getUserEvents(limit),
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useEvent = (eventId: string) => {
    return useQuery({
        queryKey: dashboardKeys.event(eventId),
        queryFn: () => dashboardService.getEventById(eventId),
        enabled: !!eventId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Categories Query
export const useCategories = (options = {}) => {
    return useQuery({
        queryKey: dashboardKeys.categories(),
        queryFn: () => dashboardService.getCategories(),
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        ...options,
    });
};

// Event Mutations
export const useCreateEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (eventData: CreateEventDto) => dashboardService.createEvent(eventData),
        onSuccess: () => {
            console.log('✅ Event created successfully, invalidating cache...');

            // Invalidate all dashboard-related queries
            queryClient.invalidateQueries({ queryKey: dashboardKeys.all });

            // Force refetch upcoming events with specific limits that might be used
            queryClient.refetchQueries({ queryKey: dashboardKeys.upcomingEvents(4) });
            queryClient.refetchQueries({ queryKey: dashboardKeys.upcomingEvents(10) });
            queryClient.refetchQueries({ queryKey: dashboardKeys.upcomingEvents() });

            // Also invalidate categories in case event count changed
            queryClient.refetchQueries({ queryKey: dashboardKeys.categories() });

            console.log('✅ Cache invalidated and refetch triggered');
        },
        onError: (error) => {
            console.error('Failed to create event:', error);
        },
    });
};

export const useUpdateEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ eventId, eventData }: { eventId: string; eventData: UpdateEventDto }) =>
            dashboardService.updateEvent(eventId, eventData),
        onSuccess: (data, variables) => {
            // Update the specific event in cache
            queryClient.setQueryData(dashboardKeys.event(variables.eventId), data);

            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: dashboardKeys.data() });
            queryClient.invalidateQueries({ queryKey: dashboardKeys.events() });
        },
        onError: (error) => {
            console.error('Failed to update event:', error);
        },
    });
};

export const useDeleteEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (eventId: string) => dashboardService.deleteEvent(eventId),
        onSuccess: (_, eventId) => {
            // Remove the event from cache
            queryClient.removeQueries({ queryKey: dashboardKeys.event(eventId) });

            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: dashboardKeys.data() });
            queryClient.invalidateQueries({ queryKey: dashboardKeys.events() });
        },
        onError: (error) => {
            console.error('Failed to delete event:', error);
        },
    });
};

// Category Mutations
export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (categoryData: CreateCategoryDto) => dashboardService.createCategory(categoryData),
        onSuccess: () => {
            // Invalidate categories query
            queryClient.invalidateQueries({ queryKey: dashboardKeys.categories() });
        },
        onError: (error) => {
            console.error('Failed to create category:', error);
        },
    });
};
