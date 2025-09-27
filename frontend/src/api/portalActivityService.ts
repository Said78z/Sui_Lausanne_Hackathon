import { api } from "@/api/interceptor";
import { ApiResponse } from "@/types";
import {
    ActivityType,
    CreatePortalActivityDto,
    GetAllPortalActivities,
    PortalActivityDto,
    UpdatePortalActivityDto
} from "@shared/dto";

export type { ActivityType, CreatePortalActivityDto, GetAllPortalActivities, PortalActivityDto, UpdatePortalActivityDto };

class PortalActivityService {
    private readonly baseUrl = 'api/portal-activities';

    // Helper method to convert params to URLSearchParams for GetAllPortalActivities
    private createSearchParams(params: GetAllPortalActivities): URLSearchParams {
        const searchParams = new URLSearchParams();

        if (params.page !== undefined) {
            searchParams.append('page', params.page.toString());
        }
        if (params.limit !== undefined) {
            searchParams.append('limit', params.limit.toString());
        }
        if (params.type) {
            searchParams.append('type', params.type);
        }
        if (params.cityId) {
            searchParams.append('cityId', params.cityId);
        }
        if (params.userId) {
            searchParams.append('userId', params.userId);
        }
        if (params.startDate) {
            searchParams.append('startDate', params.startDate);
        }
        if (params.endDate) {
            searchParams.append('endDate', params.endDate);
        }

        return searchParams;
    }

    // Get all portal activities
    public async getAllActivities(params?: GetAllPortalActivities): Promise<ApiResponse<PortalActivityDto[]>> {
        const queryParams = params ? `?${this.createSearchParams(params).toString()}` : '';
        return api.fetchRequest(`${this.baseUrl}${queryParams}`, 'GET', null, true);
    }

    // Get portal activity by ID
    public async getActivityById(id: string): Promise<ApiResponse<PortalActivityDto>> {
        return api.fetchRequest(`${this.baseUrl}/${id}`, 'GET', null, true);
    }

    // Create new portal activity
    public async createActivity(activityData: CreatePortalActivityDto): Promise<ApiResponse<PortalActivityDto>> {
        return api.fetchRequest(`${this.baseUrl}`, 'POST', activityData, true);
    }

    // Update portal activity
    public async updateActivity(id: string, activityData: UpdatePortalActivityDto): Promise<ApiResponse<PortalActivityDto>> {
        return api.fetchRequest(`${this.baseUrl}/${id}`, 'PATCH', activityData, true);
    }

    // Delete portal activity
    public async deleteActivity(id: string): Promise<ApiResponse<void>> {
        return api.fetchRequest(`${this.baseUrl}/${id}`, 'DELETE', null, true);
    }
}

export const portalActivityService = new PortalActivityService();

