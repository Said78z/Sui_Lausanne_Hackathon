import { portalActivityService } from '@/api';
import {
    CreatePortalActivityDto,
    GetAllPortalActivities,
    UpdatePortalActivityDto
} from '@shared/dto';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const usePortalActivities = (params?: GetAllPortalActivities) => {
    return useQuery({
        queryKey: ['portalActivities', params],
        queryFn: async () => {
            const response = await portalActivityService.getAllActivities(params);
            return response.data;
        },
    });
};

export const usePortalActivityById = (id: string) => {
    return useQuery({
        queryKey: ['portalActivity', id],
        queryFn: async () => {
            const response = await portalActivityService.getActivityById(id);
            return response.data;
        },
        enabled: !!id,
    });
};

export const useCreatePortalActivity = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (activityData: CreatePortalActivityDto) => {
            const response = await portalActivityService.createActivity(activityData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portalActivities'] });
            console.log('L\'activité du portail a été créée avec succès');
        },
        onError: (error) => {
            console.error('Une erreur s\'est produite lors de la création de l\'activité:', error);
        },
    });
};

export const useUpdatePortalActivity = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, activityData }: { id: string; activityData: UpdatePortalActivityDto }) => {
            const response = await portalActivityService.updateActivity(id, activityData);
            return response.data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['portalActivities'] });
            queryClient.invalidateQueries({ queryKey: ['portalActivity', id] });
            console.log('L\'activité du portail a été mise à jour avec succès');
        },
        onError: (error) => {
            console.error('Une erreur s\'est produite lors de la mise à jour de l\'activité:', error);
        },
    });
};

export const useDeletePortalActivity = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await portalActivityService.deleteActivity(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portalActivities'] });
            console.log('L\'activité du portail a été supprimée avec succès');
        },
        onError: (error) => {
            console.error('Une erreur s\'est produite lors de la suppression de l\'activité:', error);
        },
    });
};

// Hook for tracking activity (commonly used for analytics)
export const useTrackActivity = () => {
    return useMutation({
        mutationFn: async (activityData: CreatePortalActivityDto) => {
            const response = await portalActivityService.createActivity(activityData);
            return response.data;
        },
        // Don't invalidate queries for tracking - just fire and forget
        onError: (error) => {
            console.error('Une erreur s\'est produite lors du suivi de l\'activité:', error);
        },
    });
};
