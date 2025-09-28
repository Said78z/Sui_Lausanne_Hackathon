import { api } from '@/api/interceptor';

export interface ProfileStats {
    eventsCreated: number;
    eventsCreatedThisMonth: number;
    eventsAttended: number;
    eventsAttendedThisMonth: number;
    networkSize: number;
    networkGrowthThisMonth: number;
    suiBalance: string;
}

export interface ProfileStatsResponse {
    message: string;
    data: {
        stats: ProfileStats;
    };
    status: number;
    timestamp: string;
}

class ProfileService {
    /**
     * Get user profile statistics
     */
    public async getProfileStats(): Promise<ProfileStatsResponse> {
        try {
            console.log('ProfileService: Fetching profile stats...');

            const response = await api.fetchRequest('/api/users/profile/stats', 'GET', null, true);

            console.log('ProfileService: Profile stats fetched successfully:', response);
            return response;
        } catch (error) {
            console.error('ProfileService: Failed to fetch profile stats:', error);
            throw error;
        }
    }
}

export const profileService = new ProfileService();
