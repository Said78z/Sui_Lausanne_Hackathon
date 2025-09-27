import { buildQueryString } from '@/lib/utils';
import { ApiResponse } from '@/types';
import {
    CommunicationWithRelationsDto,
    CreateCommunicationDto,
    UpdateCommunicationDto
} from '@shared/dto/communicationDto';
import { api } from './interceptor';

class CommunicationService {
    private readonly baseUrl = '/api/communications';

    // Get all communications with filters and pagination
    public async getAllCommunications(params?: {
        page?: string;
        limit?: string;
        type?: string;
        way?: string;
        prospectId?: string;
        opportunityId?: string;
        sentFromUserId?: string;
        sentAfter?: string;
        sentBefore?: string;
    }): Promise<ApiResponse<CommunicationWithRelationsDto[]>> {
        const queryString = params ? buildQueryString(params) : '';
        const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
        return api.fetchRequest(url, 'GET', null, true);
    }

    // Get communications by prospect ID
    public async getCommunicationsByProspectId(prospectId: string): Promise<ApiResponse<CommunicationWithRelationsDto[]>> {
        const queryString = buildQueryString({ prospectId });
        return api.fetchRequest(`${this.baseUrl}?${queryString}`, 'GET', null, true);
    }

    // Get communications by opportunity ID
    public async getCommunicationsByOpportunityId(opportunityId: string): Promise<ApiResponse<CommunicationWithRelationsDto[]>> {
        const queryString = buildQueryString({ opportunityId });
        return api.fetchRequest(`${this.baseUrl}?${queryString}`, 'GET', null, true);
    }

    // Get a communication by id
    public async getCommunicationById(id: string): Promise<ApiResponse<CommunicationWithRelationsDto>> {
        return api.fetchRequest(`${this.baseUrl}/${id}`, 'GET', null, true);
    }

    // Create a new communication
    public async createCommunication(communication: CreateCommunicationDto): Promise<ApiResponse<CommunicationWithRelationsDto>> {
        return api.fetchRequest(this.baseUrl, 'POST', communication, true);
    }

    // Update a communication
    public async updateCommunication(id: string, communication: UpdateCommunicationDto): Promise<ApiResponse<CommunicationWithRelationsDto>> {
        return api.fetchRequest(`${this.baseUrl}/${id}`, 'PATCH', communication, true);
    }

    // Delete a communication
    public async deleteCommunication(id: string): Promise<ApiResponse<void>> {
        return api.fetchRequest(`${this.baseUrl}/${id}`, 'DELETE', null, true);
    }
}

export const communicationService = new CommunicationService();
