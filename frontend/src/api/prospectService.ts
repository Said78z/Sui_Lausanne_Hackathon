import { buildQueryString } from '@/lib/utils';
import { ApiResponse } from '@/types';
import {
    CreateProspectDto,
    getAllProspectsDto,
    ProspectWithRelationsDto,
    UpdateProspectDto
} from '@shared/dto';
import { api } from './interceptor';

class ProspectService {
    private readonly baseUrl = '/api/prospects';

    // Get all prospects with filters and pagination
    public async getAllProspects(params?: getAllProspectsDto): Promise<ApiResponse<ProspectWithRelationsDto[]>> {
        const queryString = params ? buildQueryString({
            page: params.page,
            limit: params.limit,
            search: params.search
        }) : '';

        const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
        return api.fetchRequest(url, 'GET', null, true);
    }

    // Get a prospect by id
    public async getProspectById(id: string): Promise<ApiResponse<ProspectWithRelationsDto>> {
        return api.fetchRequest(`${this.baseUrl}/${id}`, 'GET', null, true);
    }

    // Get a prospect by user ID
    public async getProspectByUserId(userId: string): Promise<ApiResponse<ProspectWithRelationsDto>> {
        return api.fetchRequest(`${this.baseUrl}/user/${userId}`, 'GET', null, true);
    }

    // Create a new prospect
    public async createProspect(prospect: CreateProspectDto): Promise<ApiResponse<ProspectWithRelationsDto>> {
        return api.fetchRequest(this.baseUrl, 'POST', prospect, true);
    }

    // Update a prospect
    public async updateProspect(id: string, prospect: UpdateProspectDto): Promise<ApiResponse<ProspectWithRelationsDto>> {
        return api.fetchRequest(`${this.baseUrl}/${id}`, 'PATCH', prospect, true);
    }

    // Delete a prospect
    public async deleteProspect(id: string): Promise<ApiResponse<void>> {
        return api.fetchRequest(`${this.baseUrl}/${id}`, 'DELETE', null, true);
    }

    // Get prospects filtered by role/status for address book
    public async getProspectsByRole(_role: string, search?: string): Promise<ApiResponse<ProspectWithRelationsDto[]>> {
        const queryString = buildQueryString({
            search,
            // We'll map role to prospect status/filters as needed
            limit: '100' // Get more for address book display
        });

        const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
        return api.fetchRequest(url, 'GET', null, true);
    }
}

export const prospectService = new ProspectService();
