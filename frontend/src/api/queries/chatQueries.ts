import { CreateConversationDto, QueryConversationDto } from '@shared/dto';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../chatService';

export const useChats = (params?: Omit<QueryConversationDto, 'userId'>) => {
    return useQuery({
        queryKey: ['chats', params],
        queryFn: async () => {
            const response = await chatService.getAllChats(params);
            return response.data;
        },
        // Improve caching
        staleTime: 5000, // 5 seconds
        gcTime: 1000 * 60 * 5, // 5 minutes (formerly cacheTime)
        refetchOnWindowFocus: false,
    });
};

export const useGroups = (params?: Omit<QueryConversationDto, 'userId'>) => {
    return useQuery({
        queryKey: ['groups', params],
        queryFn: async () => {
            const response = await chatService.getAllGroups(params);
            return response.data;
        },
        // Improve caching
        staleTime: 5000, // 5 seconds
        gcTime: 1000 * 60 * 5, // 5 minutes (formerly cacheTime)
        refetchOnWindowFocus: false,
    });
};

export const useChatById = (id: string) => {
    return useQuery({
        queryKey: ['chat', id],
        queryFn: async () => {
            const response = await chatService.getChatById(id);
            return response.data;
        },
        enabled: !!id,
        // Improve caching for individual chats
        staleTime: 2000, // 2 seconds
        // Don't automatically refetch - rely on WebSocket updates
        refetchOnWindowFocus: false,
    });
};

export const useCreateChat = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (chat: CreateConversationDto) => {
            const response = await chatService.createChat(chat);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate both chats and groups queries
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            queryClient.invalidateQueries({ queryKey: ['groups'] });
        },
        onError: (error: any) => {
            console.error('Une erreur s\'est produite lors de la création du chat:', error?.message || error);
        }
    });
};

export const useUpdateParticipants = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ chatId, participantIds, action }: { chatId: string; participantIds: string[]; action: 'add' | 'remove' }) => {
            const response = await chatService.updateParticipants(chatId, participantIds, action);
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
        }
    });
}; 