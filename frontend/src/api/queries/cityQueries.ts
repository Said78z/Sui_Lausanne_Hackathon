import { cityService } from '@/api/cityService';
import { CityDto } from '@shared/dto';
import { useQuery } from '@tanstack/react-query';

export const useCities = () => {
    return useQuery({
        queryKey: ['cities'],
        queryFn: async () => {
            const response = await cityService.getAllCities();
            return response.data;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes - cities don't change often
    });
};

export const useCityById = (id: string) => {
    return useQuery({
        queryKey: ['city', id],
        queryFn: async () => {
            const response = await cityService.getCityById(id);
            return response.data;
        },
        enabled: !!id,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Hook to get multiple cities by IDs
export const useCitiesByIds = (ids: string[]) => {
    return useQuery({
        queryKey: ['cities', 'byIds', ids],
        queryFn: async () => {
            const cityPromises = ids.map(id => cityService.getCityById(id));
            const responses = await Promise.allSettled(cityPromises);

            const cities: Record<string, CityDto> = {};
            responses.forEach((response, index) => {
                if (response.status === 'fulfilled' && response.value.data) {
                    cities[ids[index]] = response.value.data;
                }
            });

            return cities;
        },
        enabled: ids.length > 0,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Hook to find city by name (using all cities)
export const useCityByName = (cityName: string) => {
    const { data: cities, ...rest } = useCities();

    const city = cities?.find(c =>
        c.name?.toLowerCase() === cityName?.toLowerCase()
    );

    return {
        data: city,
        ...rest
    };
};
