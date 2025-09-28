import { api } from '@/api/interceptor';
import { ApiResponse } from '@/types';
import {
    MintPassportRequestDto,
    MintPassportResponseDto,
    PassportInfoDto,
} from '@shared/dto';

class PassportService {
    /**
     * Mint a passport SBT for a user
     */
    public async mintPassport(
        request: MintPassportRequestDto
    ): Promise<ApiResponse<MintPassportResponseDto>> {
        try {
            console.log('PassportService: Minting passport...', request);

            const response = await api.fetchRequest('/api/passport/mint', 'POST', request, true);
            console.log('PassportService: Passport minted successfully:', response);

            return response;
        } catch (error) {
            console.error('PassportService: Failed to mint passport:', error);
            throw error;
        }
    }

    /**
     * Get passport information by ID
     */
    public async getPassportInfo(passportId: string): Promise<ApiResponse<PassportInfoDto>> {
        try {
            console.log('PassportService: Fetching passport info...', passportId);

            const response = await api.fetchRequest(`/api/passport/${passportId}`, 'GET', null, true);
            console.log('PassportService: Passport info fetched successfully:', response);

            return response;
        } catch (error) {
            console.error('PassportService: Failed to fetch passport info:', error);
            throw error;
        }
    }

    /**
     * Check if user has valid passport for event
     */
    public async checkPassportValidity(
        userAddress: string,
        eventId: number
    ): Promise<ApiResponse<{ hasValidPassport: boolean; userAddress: string; eventId: number }>> {
        try {
            console.log('PassportService: Checking passport validity...', { userAddress, eventId });

            const response = await api.fetchRequest(
                `/api/passport/check/${userAddress}/${eventId}`,
                'GET',
                null,
                true
            );
            console.log('PassportService: Passport validity checked successfully:', response);

            return response;
        } catch (error) {
            console.error('PassportService: Failed to check passport validity:', error);
            throw error;
        }
    }

    /**
     * Get all passports for a user
     */
    public async getUserPassports(
        userAddress: string
    ): Promise<ApiResponse<{ passports: PassportInfoDto[]; userAddress: string }>> {
        try {
            console.log('PassportService: Fetching user passports...', userAddress);

            const response = await api.fetchRequest(
                `/api/passport/user/${userAddress}`,
                'GET',
                null,
                true
            );
            console.log('PassportService: User passports fetched successfully:', response);

            return response;
        } catch (error) {
            console.error('PassportService: Failed to fetch user passports:', error);
            throw error;
        }
    }
}

export const passportService = new PassportService();

