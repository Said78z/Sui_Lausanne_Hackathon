import { emailService } from '@/api/emailService';
import { EmailFiltersSchema } from '@shared/dto/emailDto';
import { useQuery } from '@tanstack/react-query';

// Query Keys
export const EMAIL_QUERY_KEYS = {
    all: ['emails'] as const,
    lists: () => [...EMAIL_QUERY_KEYS.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...EMAIL_QUERY_KEYS.lists(), filters] as const,
    details: () => [...EMAIL_QUERY_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...EMAIL_QUERY_KEYS.details(), id] as const,
    byProspect: (prospectId: string) => [...EMAIL_QUERY_KEYS.all, 'byProspect', prospectId] as const,
    stats: () => [...EMAIL_QUERY_KEYS.all, 'stats'] as const,
};

// Get emails by prospect ID
export const useEmailsByProspectId = (prospectId: string) => {
    return useQuery({
        queryKey: EMAIL_QUERY_KEYS.byProspect(prospectId),
        queryFn: async () => {
            const response = await emailService.getAllEmails({ prospectId });
            return response.data;
        },
        enabled: !!prospectId,
    });
};

// Get all emails with filters
export const useEmails = (filters?: EmailFiltersSchema) => {
    return useQuery({
        queryKey: EMAIL_QUERY_KEYS.list(filters || {}),
        queryFn: async () => {
            const response = await emailService.getAllEmails(filters);
            return response.data;
        },
    });
};

// Get email by ID
export const useEmailById = (id: string) => {
    return useQuery({
        queryKey: EMAIL_QUERY_KEYS.detail(id),
        queryFn: async () => {
            const response = await emailService.getEmailById(id);
            return response.data;
        },
        enabled: !!id,
    });
};

// Get email stats
export const useEmailStats = () => {
    return useQuery({
        queryKey: EMAIL_QUERY_KEYS.stats(),
        queryFn: async () => {
            const response = await emailService.getEmailStats();
            return response.data;
        },
    });
};
