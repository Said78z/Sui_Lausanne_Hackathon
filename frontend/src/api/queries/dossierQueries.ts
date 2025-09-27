import { dossierService } from '@/api/dossierService';

import { CreateDossierDto, DossierDto, QueryDossiersDto, UpdateDossierDto } from '@shared/dto';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query for getting all dossiers with pagination and filters
export const useDossiers = (
    filters: QueryDossiersDto = {},
    page: number = 1,
    limit: number = 10
) => {
    return useQuery({
        queryKey: ['dossiers', filters, page, limit],
        queryFn: async () => {
            const response = await dossierService.getDossiers(filters, page, limit);
            return response; // return full response with data and pagination
        },
    });
};

// Query for getting a single dossier by ID
export const useDossierById = (id: string) => {
    return useQuery({
        queryKey: ['dossier', id],
        queryFn: async () => {
            const response = await dossierService.getDossierById(id);
            return response.data as DossierDto;
        },
        enabled: !!id,
    });
};

// Mutation for creating a new dossier
export const useCreateDossier = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateDossierDto) => {
            const response = await dossierService.createDossier(data);
            return response.data as DossierDto;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dossiers'] });
        },
    });
};

// Mutation for updating a dossier
export const useUpdateDossier = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateDossierDto }) => {
            const response = await dossierService.updateDossier(id, data);
            return response.data as DossierDto;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['dossiers'] });
            queryClient.invalidateQueries({ queryKey: ['dossier', id] });
        },
    });
};

// Mutation for deleting a dossier
export const useDeleteDossier = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await dossierService.deleteDossier(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dossiers'] });
        },
    });
};
