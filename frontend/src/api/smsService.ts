import { buildQueryString } from '@/lib/utils';
import { ApiResponse } from '@/types';
import { SmsDto, SmsFiltersDto, SmsStatsDto } from '@shared/dto/smsDto';
import { api } from './interceptor';

class SmsService {
    private readonly baseUrl = '/api/sms';

    // Get all SMS with filters
    public async getAllSms(filters?: SmsFiltersDto): Promise<ApiResponse<SmsDto[]>> {
        const queryString = filters ? buildQueryString(filters) : '';
        const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
        console.log('Fetching SMS from:', url, 'with filters:', filters); // Debugging line
        try {
            const response = await api.fetchRequest(url, 'GET', null, true);
            console.log('SMS API Response:', response); // Debugging line
            return response;
        } catch (error) {
            console.error('SMS API Error:', error); // Debugging line
            throw error;
        }
    }

    // Get SMS by ID
    public async getSmsById(id: string): Promise<ApiResponse<SmsDto>> {
        return api.fetchRequest(`${this.baseUrl}/${id}`, 'GET', null, true);
    }

    // Get SMS stats
    public async getSmsStats(): Promise<ApiResponse<SmsStatsDto>> {
        return api.fetchRequest(`${this.baseUrl}/stats`, 'GET', null, true);
    }
}

export const smsService = new SmsService();
