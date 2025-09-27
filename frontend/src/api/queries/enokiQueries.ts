import { enokiService } from '@/api/enokiService';
import {
    ExecuteTransactionRequestDto,
    SponsorTransactionRequestDto,
} from '@shared/dto';
import { useMutation, useQuery } from '@tanstack/react-query';

// Query keys
export const enokiQueryKeys = {
    health: ['enoki', 'health'] as const,
} as const;

/**
 * Hook to check Enoki service health
 */
export const useEnokiHealth = () => {
    return useQuery({
        queryKey: enokiQueryKeys.health,
        queryFn: () => enokiService.healthCheck(),
        staleTime: 30000, // 30 seconds
        refetchInterval: 60000, // Refetch every minute
    });
};

/**
 * Hook to sponsor a transaction
 */
export const useSponsorTransaction = () => {
    return useMutation({
        mutationFn: (request: SponsorTransactionRequestDto) =>
            enokiService.sponsorTransaction(request),
        onError: (error) => {
            console.error('Failed to sponsor transaction:', error);
        },
    });
};

/**
 * Hook to execute a sponsored transaction
 */
export const useExecuteTransaction = () => {
    return useMutation({
        mutationFn: (request: ExecuteTransactionRequestDto) =>
            enokiService.executeTransaction(request),
        onError: (error) => {
            console.error('Failed to execute transaction:', error);
        },
    });
};
