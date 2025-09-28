import { api } from '@/api/interceptor';
import { ApiResponse } from '@/types';
import {
    ExecuteTransactionRequestDto,
    ExecuteTransactionResponseDto,
    SponsorTransactionRequestDto,
    SponsorTransactionResponseDto,
} from '@shared/dto';

class EnokiService {
    /**
     * Check if the Enoki service is healthy
     */
    public async healthCheck(): Promise<ApiResponse<{ status: string; message: string }>> {
        return api.fetchRequest('/api/enoki/health', 'GET');
    }

    /**
     * Sponsor a transaction using the backend Enoki service
     */
    public async sponsorTransaction(
        request: SponsorTransactionRequestDto
    ): Promise<ApiResponse<SponsorTransactionResponseDto>> {
        return api.fetchRequest('/api/enoki/sponsor-transaction', 'POST', request);
    }

    /**
     * Execute a sponsored transaction using the backend Enoki service
     */
    public async executeTransaction(
        request: ExecuteTransactionRequestDto
    ): Promise<ApiResponse<ExecuteTransactionResponseDto>> {
        return api.fetchRequest('/api/enoki/execute-transaction', 'POST', request);
    }
}

export const enokiService = new EnokiService();
