import { ApiResponse } from '@/types';
import { SmsDto, SmsFiltersDto, SmsStatsDto } from '@shared/dto/smsDto';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { smsService } from './smsService';

// Query keys
export const smsKeys = {
    all: ['sms'] as const,
    lists: () => [...smsKeys.all, 'list'] as const,
    list: (filters?: SmsFiltersDto) => [...smsKeys.lists(), filters] as const,
    details: () => [...smsKeys.all, 'detail'] as const,
    detail: (id: string) => [...smsKeys.details(), id] as const,
    search: () => [...smsKeys.all, 'search'] as const,
    searchWithQuery: (filters: SmsFiltersDto) => [...smsKeys.search(), filters] as const,
    stats: () => [...smsKeys.all, 'stats'] as const,
};

// Query hooks
export const useGetAllSms = (filters?: SmsFiltersDto): UseQueryResult<ApiResponse<SmsDto[]>, Error> => {
    return useQuery({
        queryKey: smsKeys.list(filters),
        queryFn: () => smsService.getAllSms(filters),
        enabled: !!filters?.prospectId, // Only run when we have a prospect ID
    });
};

export const useGetSmsById = (id: string): UseQueryResult<ApiResponse<SmsDto>, Error> => {
    return useQuery({
        queryKey: smsKeys.detail(id),
        queryFn: () => smsService.getSmsById(id),
        enabled: !!id,
    });
};

export const useSearchSms = (filters: SmsFiltersDto): UseQueryResult<ApiResponse<SmsDto[]>, Error> => {
    return useQuery({
        queryKey: smsKeys.searchWithQuery(filters),
        queryFn: () => smsService.getAllSms(filters),
        enabled: !!filters.search && filters.search.length > 0,
    });
};

export const useGetSmsStats = (): UseQueryResult<ApiResponse<SmsStatsDto>, Error> => {
    return useQuery({
        queryKey: smsKeys.stats(),
        queryFn: () => smsService.getSmsStats(),
    });
};
