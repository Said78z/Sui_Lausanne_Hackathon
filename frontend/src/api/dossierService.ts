import { api } from '@/api/interceptor';
import { ApiResponse } from '@/types';

import {
    CreateDossierDto,
    DossierDto,
    DossierListDto,
    QueryDossiersDto,
    SendMandatDto,
    UpdateDossierDto,
    YousignDocumentDto
} from '@shared/dto';

export interface DossierListResponse {
    data: DossierListDto[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        nextPage: number | null;
        previousPage: number | null;
        perPage: number;
    };
}

export const dossierService = {
    // Get all dossiers with pagination and filters
    async getDossiers(
        filters: QueryDossiersDto = {},
        page: number = 1,
        limit: number = 10
    ): Promise<DossierListResponse> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        // Add filters to params
        if (filters.status && filters.status.length > 0) {
            filters.status.forEach(status => params.append('status', status));
        }
        if (filters.name) params.append('name', filters.name);
        if (filters.minBudget) params.append('minBudget', filters.minBudget.toString());
        if (filters.maxBudget) params.append('maxBudget', filters.maxBudget.toString());
        if (filters.departmentId) params.append('departmentId', filters.departmentId.toString());
        if (filters.regionId) params.append('regionId', filters.regionId.toString());
        if (filters.cityId) params.append('cityId', filters.cityId.toString());
        if (typeof filters.autopilot === 'boolean') params.append('autopilot', String(filters.autopilot));

        const queryParams = params.toString();
        return api.fetchRequest(`/api/dossiers?${queryParams}`, 'GET', null, true) as unknown as Promise<DossierListResponse>;
    },

    // Get a single dossier by ID
    async getDossierById(id: string): Promise<ApiResponse<DossierDto>> {
        return api.fetchRequest(`/api/dossiers/${id}`, 'GET', null, true);
    },

    // Create a new dossier
    async createDossier(data: CreateDossierDto): Promise<ApiResponse<DossierDto>> {
        return api.fetchRequest('/api/dossiers', 'POST', data, true);
    },

    // Update an existing dossier
    async updateDossier(id: string, data: UpdateDossierDto): Promise<ApiResponse<DossierDto>> {
        return api.fetchRequest(`/api/dossiers/${id}`, 'PATCH', data, true);
    },

    // Delete a dossier
    async deleteDossier(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
        return api.fetchRequest(`/api/dossiers/${id}`, 'DELETE', null, true);
    },

    // Send mandate for a dossier
    async sendMandat(id: string, data: SendMandatDto): Promise<ApiResponse<YousignDocumentDto>> {
        return api.fetchRequest(`/api/dossiers/${id}/send-mandat`, 'POST', data, true);
    },
};
