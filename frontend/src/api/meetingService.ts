import { buildQueryString } from '@/lib/utils';
import { ApiResponse } from '@/types';
import {
    CreateMeetingDto,
    MeetingWithRelationsDto,
    UpdateMeetingDto
} from '@shared/dto/meetingDto';
import { api } from './interceptor';

class MeetingService {
    private readonly baseUrl = '/api/meetings';

    // Get all meetings with filters and pagination
    public async getAllMeetings(params?: {
        page?: string;
        limit?: string;
        status?: string;
        type?: string;
        prospectId?: string;
        consultantId?: string;
        bookedById?: string;
        startingAfter?: string;
        startingBefore?: string;
    }): Promise<ApiResponse<MeetingWithRelationsDto[]>> {
        const queryString = params ? buildQueryString(params) : '';
        const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
        return api.fetchRequest(url, 'GET', null, true);
    }

    // Get meetings by prospect ID
    public async getMeetingsByProspectId(prospectId: string): Promise<ApiResponse<MeetingWithRelationsDto[]>> {
        const queryString = buildQueryString({ prospectId });
        return api.fetchRequest(`${this.baseUrl}?${queryString}`, 'GET', null, true);
    }

    // Get meetings by consultant ID
    public async getMeetingsByConsultantId(consultantId: string): Promise<ApiResponse<MeetingWithRelationsDto[]>> {
        const queryString = buildQueryString({ consultantId });
        return api.fetchRequest(`${this.baseUrl}?${queryString}`, 'GET', null, true);
    }

    // Get a meeting by id
    public async getMeetingById(id: string): Promise<ApiResponse<MeetingWithRelationsDto>> {
        return api.fetchRequest(`${this.baseUrl}/${id}`, 'GET', null, true);
    }

    // Create a new meeting
    public async createMeeting(meeting: CreateMeetingDto): Promise<ApiResponse<MeetingWithRelationsDto>> {
        return api.fetchRequest(this.baseUrl, 'POST', meeting, true);
    }

    // Update a meeting
    public async updateMeeting(id: string, meeting: UpdateMeetingDto): Promise<ApiResponse<MeetingWithRelationsDto>> {
        return api.fetchRequest(`${this.baseUrl}/${id}`, 'PATCH', meeting, true);
    }

    // Delete a meeting
    public async deleteMeeting(id: string): Promise<ApiResponse<void>> {
        return api.fetchRequest(`${this.baseUrl}/${id}`, 'DELETE', null, true);
    }

    // Get upcoming meetings by prospect ID
    public async getUpcomingMeetingsByProspectId(prospectId: string): Promise<ApiResponse<MeetingWithRelationsDto[]>> {
        const now = new Date().toISOString();
        const queryString = buildQueryString({ prospectId, startingAfter: now });
        return api.fetchRequest(`${this.baseUrl}?${queryString}`, 'GET', null, true);
    }
}

export const meetingService = new MeetingService();
