import { buildQueryString } from '@/lib/utils';
import { ApiResponse } from '@/types';
import { ConversationDto, CreateConversationDto, QueryConversationDto } from '@shared/dto';
import { api } from './interceptor';

class ChatService {
    private readonly baseUrl = 'api/chat';
    private readonly groupsUrl = 'api/groups';

    // Read all chats for the current user
    public async getAllChats(params?: Omit<QueryConversationDto, 'userId'>): Promise<ApiResponse<ConversationDto[]>> {
        const queryString = params ? buildQueryString({
            page: params.page,
            limit: params.limit
        }) : '';

        const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
        return api.fetchRequest(url, 'GET', null, true);
    }

    // Get all groups for the current user
    public async getAllGroups(params?: Omit<QueryConversationDto, 'userId'>): Promise<ApiResponse<ConversationDto[]>> {
        const queryString = params ? buildQueryString({
            page: params.page,
            limit: params.limit
        }) : '';

        const url = queryString ? `${this.groupsUrl}?${queryString}` : this.groupsUrl;
        return api.fetchRequest(url, 'GET', null, true);
    }

    // Get a chat by id
    public async getChatById(id: string): Promise<ApiResponse<ConversationDto>> {
        return api.fetchRequest(`${this.baseUrl}/${id}`, 'GET', null, true);
    }

    // Create a new chat
    public async createChat(conversation: CreateConversationDto): Promise<ApiResponse<ConversationDto>> {
        return api.fetchRequest(this.baseUrl, 'POST', conversation, true);
    }

    // Add or remove participants from a chat
    public async updateParticipants(chatId: string, participantIds: string[], action: 'add' | 'remove'): Promise<ApiResponse<void>> {
        return api.fetchRequest(`${this.baseUrl}/${chatId}/participants`, 'PATCH', { participantIds, action }, true);
    }
}

export const chatService = new ChatService(); 