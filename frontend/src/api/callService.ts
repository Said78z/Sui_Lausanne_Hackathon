import { buildQueryString } from '@/lib/utils';
import { ApiResponse } from '@/types';
import {
    CallWithRelationsDto,
    CreateCallDto,
    GetAllCallsDto,
    UpdateCallDto
} from '@shared/dto';
import { api } from './interceptor';

class CallService {
    private readonly baseUrl = '/api/calls';

    // Get all calls with filters and pagination
    public async getAllCalls(params?: GetAllCallsDto): Promise<ApiResponse<CallWithRelationsDto[]>> {
        const queryString = params ? buildQueryString(params) : '';
        const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
        return api.fetchRequest(url, 'GET', null, true);
    }

    // Get calls by prospect ID
    public async getCallsByProspectId(prospectId: string): Promise<ApiResponse<CallWithRelationsDto[]>> {
        const queryString = buildQueryString({ prospectId });
        return api.fetchRequest(`${this.baseUrl}?${queryString}`, 'GET', null, true);
    }

    // Get a call by id
    public async getCallById(id: string): Promise<ApiResponse<CallWithRelationsDto>> {
        return api.fetchRequest(`${this.baseUrl}/${id}`, 'GET', null, true);
    }

    // Create a new call
    public async createCall(call: CreateCallDto): Promise<ApiResponse<CallWithRelationsDto>> {
        return api.fetchRequest(this.baseUrl, 'POST', call, true);
    }

    // Update a call
    public async updateCall(id: string, call: UpdateCallDto): Promise<ApiResponse<CallWithRelationsDto>> {
        return api.fetchRequest(`${this.baseUrl}/${id}`, 'PATCH', call, true);
    }

    // Delete a call
    public async deleteCall(id: string): Promise<ApiResponse<void>> {
        return api.fetchRequest(`${this.baseUrl}/${id}`, 'DELETE', null, true);
    }

    // Get latest call for a prospect
    public async getLatestCallByProspectId(prospectId: string): Promise<ApiResponse<CallWithRelationsDto | null>> {
        const response = await this.getCallsByProspectId(prospectId);
        if (response.data && response.data.length > 0) {
            // Sort by calledAt descending and take the first one
            const sortedCalls = response.data.sort((a, b) =>
                new Date(b.calledAt).getTime() - new Date(a.calledAt).getTime()
            );
            return {
                ...response,
                data: sortedCalls[0]
            };
        }
        return {
            ...response,
            data: null
        };
    }
}

export const callService = new CallService();
