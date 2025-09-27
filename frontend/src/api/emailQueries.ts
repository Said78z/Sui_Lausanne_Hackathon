import { ApiResponse } from '@/types';
import { EmailDto, EmailFiltersDto, EmailStatsDto } from '@shared/dto/emailDto';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { emailService } from './emailService';

// Query keys
export const emailKeys = {
    all: ['emails'] as const,
    lists: () => [...emailKeys.all, 'list'] as const,
    list: (filters?: EmailFiltersDto) => [...emailKeys.lists(), filters] as const,
    details: () => [...emailKeys.all, 'detail'] as const,
    detail: (id: string) => [...emailKeys.details(), id] as const,
    search: () => [...emailKeys.all, 'search'] as const,
    searchWithQuery: (filters: EmailFiltersDto) => [...emailKeys.search(), filters] as const,
    stats: () => [...emailKeys.all, 'stats'] as const,
};

// Query hooks
export const useGetAllEmails = (filters?: EmailFiltersDto): UseQueryResult<ApiResponse<EmailDto[]>, Error> => {
    return useQuery({
        queryKey: emailKeys.list(filters),
        queryFn: () => emailService.getAllEmails(filters),
        enabled: !!filters?.prospectId, // Only run when we have a prospect ID
    });
};

export const useGetEmailById = (id: string): UseQueryResult<ApiResponse<EmailDto>, Error> => {
    return useQuery({
        queryKey: emailKeys.detail(id),
        queryFn: () => emailService.getEmailById(id),
        enabled: !!id,
    });
};

export const useSearchEmails = (filters: EmailFiltersDto): UseQueryResult<ApiResponse<EmailDto[]>, Error> => {
    return useQuery({
        queryKey: emailKeys.searchWithQuery(filters),
        queryFn: () => emailService.searchEmails(filters),
        enabled: !!filters.search && filters.search.length > 0,
    });
};

export const useGetEmailStats = (): UseQueryResult<ApiResponse<EmailStatsDto>, Error> => {
    return useQuery({
        queryKey: emailKeys.stats(),
        queryFn: () => emailService.getEmailStats(),
    });
};
