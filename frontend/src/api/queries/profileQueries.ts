import { useQuery } from '@tanstack/react-query';
import { profileService, ProfileStatsResponse } from '../profileService';

/**
 * Hook to fetch user profile statistics
 */
export const useProfileStats = (options?: { enabled?: boolean }) => {
    return useQuery<ProfileStatsResponse>({
        queryKey: ['profile', 'stats'],
        queryFn: () => profileService.getProfileStats(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    });
};
