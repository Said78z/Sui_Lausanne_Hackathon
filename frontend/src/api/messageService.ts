import { ApiResponse } from '@/types';
import { MessageDto, ReadMessagesDto, UnreadMessageCountsResponseDto } from '@shared/dto';
import { messageType } from '@shared/enums/messageEnums';
import { api } from './interceptor';

class MessageService {
    private readonly baseUrl = 'api/message';

    // Send a message to a chat
    public async sendMessage(chatId: string, content: string, type: messageType): Promise<ApiResponse<MessageDto>> {
        return api.fetchRequest(`${this.baseUrl}/${chatId}`, 'POST', { content, type }, true);
    }

    // Mark messages as read
    public async markMessagesAsRead(chatId: string, messageData: ReadMessagesDto): Promise<ApiResponse<void>> {
        return api.fetchRequest(`${this.baseUrl}/${chatId}/read`, 'PATCH', messageData, true);
    }

    // Get unread message counts by chat
    public async getUnreadMessageCounts(): Promise<ApiResponse<UnreadMessageCountsResponseDto>> {
        return api.fetchRequest(`${this.baseUrl}/unread-counts`, 'GET', null, true);
    }
}

export const messageService = new MessageService();
