import { buildQueryString } from '@/lib/utils';
import { ApiResponse } from '@/types';
import { EmailDto, EmailFiltersDto, EmailStatsDto } from '@shared/dto/emailDto';
import { api } from './interceptor';

class EmailService {
    private readonly baseUrl = '/api/emails';

    // Get all emails with filters
    public async getAllEmails(filters?: EmailFiltersDto): Promise<ApiResponse<EmailDto[]>> {
        const queryString = filters ? buildQueryString(filters) : '';
        const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
        console.log('Fetching emails from:', url, 'with filters:', filters); // Debugging line
        return api.fetchRequest(url, 'GET', null, true);
    }

    // Get email by ID
    public async getEmailById(id: string): Promise<ApiResponse<EmailDto>> {
        return api.fetchRequest(`${this.baseUrl}/${id}`, 'GET', null, true);
    }

    // Search emails
    public async searchEmails(filters: EmailFiltersDto): Promise<ApiResponse<EmailDto[]>> {
        const queryString = buildQueryString(filters);
        return api.fetchRequest(`${this.baseUrl}?${queryString}`, 'GET', null, true);
    }

    // Get email stats
    public async getEmailStats(): Promise<ApiResponse<EmailStatsDto>> {
        return api.fetchRequest(`${this.baseUrl}/stats`, 'GET', null, true);
    }
}

export const emailService = new EmailService();
