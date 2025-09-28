import { api } from '@/api/interceptor';
import { ApiResponse } from '@/types';
import {
    CreateMissionRequestDto,
    CreateMissionResponseDto,
    ValidateCheckInRequestDto,
    ValidateCheckInResponseDto,
    MissionInfoDto,
    AttestationInfoDto,
} from '@shared/dto';

class CheckInService {
    /**
     * Create a new mission
     */
    public async createMission(
        request: CreateMissionRequestDto
    ): Promise<ApiResponse<CreateMissionResponseDto>> {
        try {
            console.log('CheckInService: Creating mission...', request);

            const response = await api.fetchRequest('/api/checkin/missions', 'POST', request, true);
            console.log('CheckInService: Mission created successfully:', response);

            return response;
        } catch (error) {
            console.error('CheckInService: Failed to create mission:', error);
            throw error;
        }
    }

    /**
     * Validate a check-in and mint attestation
     */
    public async validateCheckIn(
        request: ValidateCheckInRequestDto
    ): Promise<ApiResponse<ValidateCheckInResponseDto>> {
        try {
            console.log('CheckInService: Validating check-in...', request);

            const response = await api.fetchRequest('/api/checkin/validate', 'POST', request, true);
            console.log('CheckInService: Check-in validated successfully:', response);

            return response;
        } catch (error) {
            console.error('CheckInService: Failed to validate check-in:', error);
            throw error;
        }
    }

    /**
     * Generate QR signature for a mission
     */
    public async generateQRSignature(
        missionId: string,
        userAddress: string
    ): Promise<ApiResponse<{ qrSignature: string; missionId: string; userAddress: string }>> {
        try {
            console.log('CheckInService: Generating QR signature...', { missionId, userAddress });

            const response = await api.fetchRequest(
                `/api/checkin/qr-signature?missionId=${missionId}&userAddress=${userAddress}`,
                'GET',
                null,
                true
            );
            console.log('CheckInService: QR signature generated successfully:', response);

            return response;
        } catch (error) {
            console.error('CheckInService: Failed to generate QR signature:', error);
            throw error;
        }
    }

    /**
     * Get mission information by ID
     */
    public async getMissionInfo(missionId: string): Promise<ApiResponse<MissionInfoDto>> {
        try {
            console.log('CheckInService: Fetching mission info...', missionId);

            const response = await api.fetchRequest(
                `/api/checkin/missions/${missionId}`,
                'GET',
                null,
                true
            );
            console.log('CheckInService: Mission info fetched successfully:', response);

            return response;
        } catch (error) {
            console.error('CheckInService: Failed to fetch mission info:', error);
            throw error;
        }
    }

    /**
     * Get user's attestations
     */
    public async getUserAttestations(
        userAddress: string
    ): Promise<ApiResponse<{ attestations: AttestationInfoDto[]; userAddress: string }>> {
        try {
            console.log('CheckInService: Fetching user attestations...', userAddress);

            const response = await api.fetchRequest(
                `/api/checkin/attestations/${userAddress}`,
                'GET',
                null,
                true
            );
            console.log('CheckInService: User attestations fetched successfully:', response);

            return response;
        } catch (error) {
            console.error('CheckInService: Failed to fetch user attestations:', error);
            throw error;
        }
    }

    /**
     * Get missions for an event (helper method)
     */
    public async getEventMissions(eventId: number): Promise<ApiResponse<MissionInfoDto[]>> {
        try {
            console.log('CheckInService: Fetching event missions...', eventId);

            // Note: This would need to be implemented in the backend
            // For now, we'll return an empty array
            console.warn('CheckInService: getEventMissions not yet implemented in backend');

            return {
                success: true,
                data: [],
                message: 'Event missions feature coming soon'
            };
        } catch (error) {
            console.error('CheckInService: Failed to fetch event missions:', error);
            throw error;
        }
    }
}

export const checkInService = new CheckInService();

