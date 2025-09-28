import { api } from '@/api/interceptor';
import {
    CategoriesResponse,
    CreateCategoryDto,
    CreateEventDto,
    DashboardResponse,
    EventResponse,
    EventsResponse,
    UpdateEventDto
} from '@shared/dto';

class DashboardService {
    /**
     * Get complete dashboard data
     */
    public async getDashboardData(): Promise<DashboardResponse> {
        try {
            console.log('DashboardService: Fetching dashboard data...');

            const response = await api.fetchRequest('/api/dashboard/data', 'GET', null, true);
            console.log('DashboardService: Dashboard data fetched successfully:', response);

            return response;
        } catch (error) {
            console.error('DashboardService: Failed to fetch dashboard data:', error);
            throw error;
        }
    }

    /**
     * Get upcoming events
     */
    public async getUpcomingEvents(limit = 10): Promise<EventsResponse> {
        try {
            console.log('🔍 Frontend DashboardService: Fetching upcoming events with limit:', limit);

            const response = await api.fetchRequest(
                `/api/dashboard/events/upcoming?limit=${limit}`,
                'GET',
                null,
                false
            );
            console.log('🔍 Frontend DashboardService: Raw API response:', response);
            console.log('🔍 Frontend DashboardService: Events in response:', response?.events?.length || 0);

            if (response?.events?.length > 0) {
                console.log('🔍 Frontend DashboardService: Sample event:', {
                    id: response.events[0].id,
                    title: response.events[0].title,
                    startTime: response.events[0].startTime,
                    status: response.events[0].status
                });
            }

            return response;
        } catch (error) {
            console.error('❌ Frontend DashboardService: Failed to fetch upcoming events:', error);
            throw error;
        }
    }

    /**
     * Get user events
     */
    public async getUserEvents(limit = 10): Promise<EventsResponse> {
        try {
            console.log('DashboardService: Fetching user events...');

            const response = await api.fetchRequest(
                `/api/dashboard/events/my?limit=${limit}`,
                'GET',
                null,
                true
            );
            console.log('DashboardService: User events fetched successfully:', response);

            return response;
        } catch (error) {
            console.error('DashboardService: Failed to fetch user events:', error);
            throw error;
        }
    }

    /**
     * Get event by ID
     */
    public async getEventById(eventId: string): Promise<EventResponse> {
        try {
            console.log('DashboardService: Fetching event by ID:', eventId);

            const response = await api.fetchRequest(
                `/api/dashboard/events/${eventId}`,
                'GET',
                null,
                true
            );
            console.log('DashboardService: Event fetched successfully:', response);

            return response;
        } catch (error) {
            console.error('DashboardService: Failed to fetch event:', error);
            throw error;
        }
    }

    /**
     * Create new event
     */
    public async createEvent(eventData: CreateEventDto): Promise<EventResponse> {
        try {
            console.log('DashboardService: Creating event:', eventData);

            const response = await api.fetchRequest(
                '/api/dashboard/events',
                'POST',
                eventData,
                true
            );
            console.log('DashboardService: Event created successfully:', response);

            return response;
        } catch (error) {
            console.error('DashboardService: Failed to create event:', error);
            throw error;
        }
    }

    /**
     * Update event
     */
    public async updateEvent(eventId: string, eventData: UpdateEventDto): Promise<EventResponse> {
        try {
            console.log('DashboardService: Updating event:', eventId, eventData);

            const response = await api.fetchRequest(
                `/api/dashboard/events/${eventId}`,
                'PUT',
                eventData,
                true
            );
            console.log('DashboardService: Event updated successfully:', response);

            return response;
        } catch (error) {
            console.error('DashboardService: Failed to update event:', error);
            throw error;
        }
    }

    /**
     * Delete event
     */
    public async deleteEvent(eventId: string): Promise<void> {
        try {
            console.log('DashboardService: Deleting event:', eventId);

            await api.fetchRequest(`/api/dashboard/events/${eventId}`, 'DELETE', null, true);
            console.log('DashboardService: Event deleted successfully');
        } catch (error) {
            console.error('DashboardService: Failed to delete event:', error);
            throw error;
        }
    }

    /**
     * Get all categories
     */
    public async getCategories(): Promise<CategoriesResponse> {
        try {
            console.log('DashboardService: Fetching categories...');

            const response = await api.fetchRequest('/api/dashboard/categories', 'GET', null, false);
            console.log('DashboardService: Categories fetched successfully:', response);

            return response;
        } catch (error) {
            console.error('DashboardService: Failed to fetch categories:', error);
            throw error;
        }
    }

    /**
     * Create new category
     */
    public async createCategory(categoryData: CreateCategoryDto): Promise<any> {
        try {
            console.log('DashboardService: Creating category:', categoryData);

            const response = await api.fetchRequest(
                '/api/dashboard/categories',
                'POST',
                categoryData,
                true
            );
            console.log('DashboardService: Category created successfully:', response);

            return response;
        } catch (error) {
            console.error('DashboardService: Failed to create category:', error);
            throw error;
        }
    }
}

export const dashboardService = new DashboardService();
