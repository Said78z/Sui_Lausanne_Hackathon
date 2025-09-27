import { buildQueryString } from '@/lib/utils';
import { ApiResponse } from '@/types';
import {
    CreateSimulationDto,
    GetAllSimulations,
    SimulationDto,
    UpdateSimulationDto
} from '@shared/dto';
import { api } from './interceptor';

class SimulationService {
    private readonly baseUrl = '/api/simulations';

    // Get all simulations with filters and pagination
    public async getAllSimulations(params?: GetAllSimulations): Promise<ApiResponse<SimulationDto[]>> {
        const queryString = params ? buildQueryString({
            page: params.page,
            limit: params.limit,
            ownsRealEstate: params.ownsRealEstate,
            minSaving: params.minSaving,
            maxSaving: params.maxSaving,
            startDate: params.startDate,
            endDate: params.endDate
        }) : '';

        const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
        return api.fetchRequest(url, 'GET', null, true);
    }

    // Get a simulation by id
    public async getSimulationById(id: string): Promise<ApiResponse<SimulationDto>> {
        return api.fetchRequest(`${this.baseUrl}/${id}`, 'GET', null, true);
    }

    // Create a new simulation
    public async createSimulation(simulation: CreateSimulationDto): Promise<ApiResponse<SimulationDto>> {
        return api.fetchRequest(this.baseUrl, 'POST', simulation, true);
    }

    // Update a simulation
    public async updateSimulation(id: string, simulation: UpdateSimulationDto): Promise<ApiResponse<SimulationDto>> {
        return api.fetchRequest(`${this.baseUrl}/${id}`, 'PATCH', simulation, true);
    }

    // Delete a simulation
    public async deleteSimulation(id: string): Promise<ApiResponse<void>> {
        return api.fetchRequest(`${this.baseUrl}/${id}`, 'DELETE', null, true);
    }

    // Get latest simulation for a prospect (custom endpoint)
    public async getLatestSimulationByProspectId(prospectId: string): Promise<ApiResponse<SimulationDto | null>> {
        const queryString = buildQueryString({ prospectId });
        return api.fetchRequest(`${this.baseUrl}/latest?${queryString}`, 'GET', null, true);
    }

    // Get simulations by prospect ID (if there's a relation)
    public async getSimulationsByProspectId(prospectId: string): Promise<ApiResponse<SimulationDto[]>> {
        const queryString = buildQueryString({ prospectId });
        return api.fetchRequest(`${this.baseUrl}?${queryString}`, 'GET', null, true);
    }
}

export const simulationService = new SimulationService();
