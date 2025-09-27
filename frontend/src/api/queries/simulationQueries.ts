import { simulationService } from '@/api/simulationService';
import {
    CreateSimulationDto,
    GetAllSimulations,
    UpdateSimulationDto
} from '@shared/dto';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query Keys
export const SIMULATION_QUERY_KEYS = {
    all: ['simulations'] as const,
    lists: () => [...SIMULATION_QUERY_KEYS.all, 'list'] as const,
    list: (filters: GetAllSimulations) => [...SIMULATION_QUERY_KEYS.lists(), filters] as const,
    details: () => [...SIMULATION_QUERY_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...SIMULATION_QUERY_KEYS.details(), id] as const,
    byProspect: (prospectId: string) => [...SIMULATION_QUERY_KEYS.all, 'byProspect', prospectId] as const,
    latestByProspect: (prospectId: string) => [...SIMULATION_QUERY_KEYS.all, 'latest', prospectId] as const,
};

// Get all simulations
export const useSimulations = (params?: GetAllSimulations) => {
    return useQuery({
        queryKey: SIMULATION_QUERY_KEYS.list(params || {}),
        queryFn: async () => {
            const response = await simulationService.getAllSimulations(params);
            return response.data;
        },
    });
};

// Get simulation by ID
export const useSimulationById = (id: string) => {
    return useQuery({
        queryKey: SIMULATION_QUERY_KEYS.detail(id),
        queryFn: async () => {
            const response = await simulationService.getSimulationById(id);
            return response.data;
        },
        enabled: !!id,
    });
};

// Get simulations by prospect ID
export const useSimulationsByProspectId = (prospectId: string) => {
    return useQuery({
        queryKey: SIMULATION_QUERY_KEYS.byProspect(prospectId),
        queryFn: async () => {
            const response = await simulationService.getSimulationsByProspectId(prospectId);
            return response.data;
        },
        enabled: !!prospectId,
    });
};

// Get latest simulation by prospect ID
export const useLatestSimulationByProspectId = (prospectId: string) => {
    return useQuery({
        queryKey: SIMULATION_QUERY_KEYS.latestByProspect(prospectId),
        queryFn: async () => {
            const response = await simulationService.getLatestSimulationByProspectId(prospectId);
            return response.data;
        },
        enabled: !!prospectId,
    });
};

// Create simulation mutation
export const useCreateSimulation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateSimulationDto) => simulationService.createSimulation(data),
        onSuccess: () => {
            // Invalidate simulations queries
            queryClient.invalidateQueries({ queryKey: SIMULATION_QUERY_KEYS.all });
        },
    });
};

// Update simulation mutation
export const useUpdateSimulation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateSimulationDto }) =>
            simulationService.updateSimulation(id, data),
        onSuccess: (_, { id }) => {
            // Invalidate specific simulation and lists
            queryClient.invalidateQueries({ queryKey: SIMULATION_QUERY_KEYS.detail(id) });
            queryClient.invalidateQueries({ queryKey: SIMULATION_QUERY_KEYS.lists() });
        },
    });
};

// Delete simulation mutation
export const useDeleteSimulation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => simulationService.deleteSimulation(id),
        onSuccess: () => {
            // Invalidate and refetch simulations queries
            queryClient.invalidateQueries({ queryKey: SIMULATION_QUERY_KEYS.all });
        },
    });
};
