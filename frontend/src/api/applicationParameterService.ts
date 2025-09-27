import { api } from '@/api/interceptor';
import { ApiResponse } from '@/types';

import { ApplicationParameterDto, CreateApplicationParameterDto, GetAllApplicationParameters, UpdateApplicationParameterDto } from '@shared/dto';

class ApplicationParameterService {
    private apiUrl = '/api/application-parameters';

    /**
     * Get all application parameters with pagination and filters
     */
    public async getAllParameters(params: GetAllApplicationParameters = {}): Promise<ApiResponse<ApplicationParameterDto[]>> {
        const searchParams = new URLSearchParams();

        // Only add pagination params if they are provided
        if (params.page) searchParams.append('page', params.page);
        if (params.limit) searchParams.append('limit', params.limit);
        if (params.name) searchParams.append('name', params.name);

        const url = searchParams.toString() ? `${this.apiUrl}?${searchParams.toString()}` : this.apiUrl;
        return api.fetchRequest(url, 'GET', null, true);
    }

    /**
     * Get application parameter by ID
     */
    public async getParameterById(id: string): Promise<ApiResponse<ApplicationParameterDto>> {
        return api.fetchRequest(`${this.apiUrl}/${id}`, 'GET', null, true);
    }

    /**
     * Create a new application parameter
     */
    public async createParameter(data: CreateApplicationParameterDto): Promise<ApiResponse<ApplicationParameterDto>> {
        return api.fetchRequest(this.apiUrl, 'POST', data, true);
    }

    /**
     * Update application parameter by ID
     */
    public async updateParameter(id: string, data: UpdateApplicationParameterDto): Promise<ApiResponse<ApplicationParameterDto>> {
        return api.fetchRequest(`${this.apiUrl}/${id}`, 'PATCH', data, true);
    }

    /**
     * Delete application parameter by ID
     */
    public async deleteParameter(id: string): Promise<ApiResponse<void>> {
        return api.fetchRequest(`${this.apiUrl}/${id}`, 'DELETE', null, true);
    }
}

export const applicationParameterService = new ApplicationParameterService();
