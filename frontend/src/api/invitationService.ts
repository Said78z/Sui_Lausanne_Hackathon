import { api } from '@/api/interceptor';
import { ApiResponse } from '@/types';

import { CreateInvitationRequestDto, CreateInvitationRequestSchema, DeleteInvitationRequestDto, DeleteInvitationRequestSchema, GetAllInvitationsRequestDto, GetAllInvitationsRequestSchema } from '@shared/dto';

class InvitationService {
    private apiUrl = '/api/invitation-requests';

    public async createInvitation(invitation: CreateInvitationRequestSchema): Promise<ApiResponse<CreateInvitationRequestDto>> {
        return api.fetchRequest(this.apiUrl, 'POST', invitation, true);
    }

    public async getAllInvitations(request: GetAllInvitationsRequestSchema): Promise<ApiResponse<GetAllInvitationsRequestDto>> {
        let url = this.apiUrl;

        if (request) {
            const params = new URLSearchParams();
            if (request.status) params.append('status', request.status);
            if (request.invitedBy) params.append('invitedBy', request.invitedBy);

            const queryString = params.toString();
            if (queryString) {
                url = `${this.apiUrl}?${queryString}`;
            }
        }

        return api.fetchRequest(url, 'GET', null, true);
    }

    public async deleteInvitation(request: DeleteInvitationRequestSchema): Promise<ApiResponse<DeleteInvitationRequestDto>> {
        return api.fetchRequest(this.apiUrl, 'DELETE', request, true);
    }

    public async resendInvitation(email: string): Promise<ApiResponse<any>> {
        console.log('Sending resend invitation request for email:', email);
        const response = await api.fetchRequest(`${this.apiUrl}/resend`, 'POST', { email }, true);
        console.log('Resend invitation response:', response);
        return response;
    }
}

export default new InvitationService();