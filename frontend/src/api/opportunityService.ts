import { api } from '@/api/interceptor';
import { ApiResponse } from '@/types';

import { CreateOpportunityDto, OpportunityDto, QueryOpportunitiesSchema, UpdateOpportunityDto } from '@shared/dto';

class OpportunityService {
    private apiUrl = '/api/opportunities';

    /**
     * Get all opportunities with pagination and filters
     */
    public async getAllOpportunities(params: QueryOpportunitiesSchema = {}): Promise<ApiResponse<OpportunityDto[]>> {
        const searchParams = new URLSearchParams();

        // Only add pagination params if they are provided
        if (params.page) searchParams.append('page', params.page);
        if (params.limit) searchParams.append('limit', params.limit);
        if (params.type) searchParams.append('type', params.type);
        if (params.status) searchParams.append('status', params.status);
        if (params.city) searchParams.append('city', params.city);
        if (params.street) searchParams.append('street', params.street);
        if (params.state) searchParams.append('state', params.state);
        if (params.zip) searchParams.append('zip', params.zip);
        if (params.minSurface) searchParams.append('minSurface', params.minSurface);
        if (params.maxSurface) searchParams.append('maxSurface', params.maxSurface);
        if (params.minPrice) searchParams.append('minPrice', params.minPrice);
        if (params.maxPrice) searchParams.append('maxPrice', params.maxPrice);

        const url = searchParams.toString() ? `${this.apiUrl}?${searchParams.toString()}` : this.apiUrl;
        return api.fetchRequest(url, 'GET', null, true);
    }

    /**
     * Get opportunity by ID
     */
    public async getOpportunityById(id: string): Promise<ApiResponse<OpportunityDto>> {
        return api.fetchRequest(`${this.apiUrl}/${id}`, 'GET', null, true);
    }

    /**
     * Create a new opportunity
     */
    public async createOpportunity(data: CreateOpportunityDto): Promise<ApiResponse<OpportunityDto>> {
        return api.fetchRequest(this.apiUrl, 'POST', data, true);
    }

    /**
     * Update opportunity by ID
     */
    public async updateOpportunity(id: string, data: UpdateOpportunityDto): Promise<ApiResponse<OpportunityDto>> {
        return api.fetchRequest(`${this.apiUrl}/${id}`, 'PATCH', data, true);
    }

    /**
     * Delete opportunity by ID
     */
    public async deleteOpportunity(id: string): Promise<ApiResponse<void>> {
        return api.fetchRequest(`${this.apiUrl}/${id}`, 'DELETE', null, true);
    }
}

export const opportunityService = new OpportunityService();
