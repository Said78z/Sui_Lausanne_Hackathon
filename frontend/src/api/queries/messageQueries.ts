import { ReadMessagesDto } from '@shared/dto';
import { messageType } from '@shared/enums/messageEnums';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { messageService } from '../messageService';

export const useMarkMessagesAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ chatId, messageData }: { chatId: string; messageData: ReadMessagesDto }) => {
            const response = await messageService.markMessagesAsRead(chatId, messageData);
            return response.data;
        },
        onSuccess: (_, { chatId }) => {
            // Invalidate the specific chat
            queryClient.invalidateQueries({
                queryKey: ['chat', chatId],
            });

            // Also invalidate chats and groups lists to update unread counts
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            queryClient.invalidateQueries({ queryKey: ['groups'] });

            // Update unread message counts
            queryClient.invalidateQueries({ queryKey: ['unreadMessageCounts'] });
        }
    });
};

export const useSendMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ chatId, content, type }: { chatId: string; content: string; type: messageType }) => {
            const response = await messageService.sendMessage(chatId, content, type);
            return response.data;
        },
        onSuccess: (_, { chatId }) => {
            // Invalidate the specific chat
            queryClient.invalidateQueries({
                queryKey: ['chat', chatId],
            });

            // Also invalidate chats and groups lists
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            queryClient.invalidateQueries({ queryKey: ['groups'] });

            // Update unread message counts
            queryClient.invalidateQueries({ queryKey: ['unreadMessageCounts'] });
        }
    });
};

export const useUnreadMessageCounts = () => {
    return useQuery({
        queryKey: ['unreadMessageCounts'],
        queryFn: async () => {
            const response = await messageService.getUnreadMessageCounts();
            return response.data?.counts || [];
        },
        staleTime: 5000, // 5 seconds
        gcTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    });
};
