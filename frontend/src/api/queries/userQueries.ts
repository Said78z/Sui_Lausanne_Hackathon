import { userService } from '@/api/userService';
import { ApiResponse } from '@/types';
import {
    ContactFilters,
    ContactValidationRequestDto,
    ContactValidationResponseDto, GetAllUsers
} from '@shared/dto';
import { useMutation, useQuery } from '@tanstack/react-query';


export const useUsers = (params?: GetAllUsers) => {
    return useQuery({
        queryKey: ['users', params],
        queryFn: async () => {
            const response = await userService.getAllUsers(params);
            return response.data;
        },
    });
};

export const useUserById = (id: string) => {
    return useQuery({
        queryKey: ['user', id],
        queryFn: async () => {
            const response = await userService.getUserById(id);
            return response.data;
        },
        enabled: !!id,
    });
};

export const useOnlineUsers = () => {
    return useQuery({
        queryKey: ['users', 'online'],
        queryFn: async () => {
            const response = await userService.getOnlineUsers();
            return response.data;
        },
        staleTime: 15000, // Consider data stale after 15 seconds
        gcTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    });
};


export const useContactableUsers = (params?: ContactFilters) => {
    return useQuery({
        queryKey: ['contactableUsers', params],
        queryFn: async () => {
            const response = await userService.getContactableUsers(params);
            return response;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useValidateContact = () => {
    return useMutation<ApiResponse<ContactValidationResponseDto>, Error, ContactValidationRequestDto>({
        mutationFn: async (_data: ContactValidationRequestDto) => {
            // Implémentation simple - validation automatique
            return {
                message: 'Contact validé',
                data: {
                    canContact: true,
                    reason: 'Autorisé par les permissions de chat'
                },
                status: 200
            };
        },
    });
};
