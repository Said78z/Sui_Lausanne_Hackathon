import { api } from '@/api/interceptor';
import { ApiResponse } from '@/types';
import { CityDto } from '@shared/dto';

class CityService {
    private readonly baseUrl = 'api/cities';

    // Get city by ID
    public async getCityById(id: string): Promise<ApiResponse<CityDto>> {
        return api.fetchRequest(`${this.baseUrl}/${id}`, 'GET', null, true);
    }

    // Get all cities
    public async getAllCities(): Promise<ApiResponse<CityDto[]>> {
        return api.fetchRequest(`${this.baseUrl}`, 'GET', null, true);
    }
}

export const cityService = new CityService();
