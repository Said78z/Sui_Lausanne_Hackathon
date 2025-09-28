import { Category, Event } from '@/config/client';
import { dashboardRepository } from '@/repositories/dashboardRepository';
import { logger } from '@/utils/logger';
import { CreateCategoryDto, CreateEventDto, DashboardData } from '@shared/dto';

class DashboardService {
    private logger = logger.child({
        module: '[App][DashboardService]',
    });

    /**
     * Get complete dashboard data
     * @param userId - Current user ID for personalized data
     * @returns Dashboard data with stats, events, and categories
     */
    async getDashboardData(userId?: string): Promise<DashboardData> {
        try {
            this.logger.info('Fetching dashboard data', { userId });

            // Fetch all data in parallel
            const [stats, upcomingEvents, categories] = await Promise.all([
                this.getStats(),
                this.getUpcomingEvents(),
                this.getCategories(),
            ]);

            const dashboardData: DashboardData = {
                stats,
                upcomingEvents: upcomingEvents.map(this.formatEvent),
                categories: categories.map(this.formatCategory),
            };

            this.logger.info('Dashboard data fetched successfully', {
                eventsCount: upcomingEvents.length,
                categoriesCount: categories.length,
            });

            return dashboardData;
        } catch (error) {
            this.logger.error('Error fetching dashboard data:', error);
            throw new Error('Failed to fetch dashboard data');
        }
    }

    /**
     * Get dashboard statistics
     */
    async getStats() {
        try {
            return await dashboardRepository.getEventStats();
        } catch (error) {
            this.logger.error('Error fetching stats:', error);
            throw new Error('Failed to fetch statistics');
        }
    }

    /**
     * Get upcoming events
     * @param limit - Number of events to fetch
     */
    async getUpcomingEvents(limit = 10): Promise<Event[]> {
        try {
            console.log('🔍 DashboardService: Fetching upcoming events with limit:', limit);
            const events = await dashboardRepository.findUpcomingEvents(limit);
            console.log('🔍 DashboardService: Retrieved events from repository:', events.length);

            // Format events for API response
            const formattedEvents = events.map(this.formatEvent);
            console.log('🔍 DashboardService: Formatted events:', formattedEvents.length);

            return formattedEvents;
        } catch (error) {
            this.logger.error('Error fetching upcoming events:', error);
            throw new Error('Failed to fetch upcoming events');
        }
    }

    /**
     * Get all categories
     */
    async getCategories(): Promise<Category[]> {
        try {
            return await dashboardRepository.findAllCategories();
        } catch (error) {
            this.logger.error('Error fetching categories:', error);
            throw new Error('Failed to fetch categories');
        }
    }

    /**
     * Create a new event
     * @param eventData - Event creation data
     * @param userId - Creator user ID
     */
    async createEvent(eventData: CreateEventDto, userId: string): Promise<Event> {
        try {
            this.logger.info('Creating new event', { title: eventData.title, userId });

            const event = await dashboardRepository.createEvent({
                ...eventData,
                startTime: new Date(eventData.startTime),
                endTime: eventData.endTime ? new Date(eventData.endTime) : undefined,
                createdBy: userId,
            });

            // Update category event count
            await dashboardRepository.updateCategoryEventCount(eventData.category);

            this.logger.info('Event created successfully', { eventId: event.id });
            return event;
        } catch (error) {
            this.logger.error('Error creating event:', error);
            throw new Error('Failed to create event');
        }
    }

    /**
     * Get events by user
     * @param userId - User ID
     * @param limit - Number of events to fetch
     */
    async getUserEvents(userId: string, limit = 10): Promise<Event[]> {
        try {
            return await dashboardRepository.findEventsByUser(userId, limit);
        } catch (error) {
            this.logger.error('Error fetching user events:', error);
            throw new Error('Failed to fetch user events');
        }
    }

    /**
     * Get event by ID
     * @param eventId - Event ID
     */
    async getEventById(eventId: string): Promise<Event | null> {
        try {
            return await dashboardRepository.findEventById(eventId);
        } catch (error) {
            this.logger.error('Error fetching event:', error);
            throw new Error('Failed to fetch event');
        }
    }

    /**
     * Update event
     * @param eventId - Event ID
     * @param eventData - Updated event data
     * @param userId - User ID (for authorization)
     */
    async updateEvent(eventId: string, eventData: Partial<CreateEventDto>, userId: string): Promise<Event> {
        try {
            // Check if event exists and user owns it
            const existingEvent = await dashboardRepository.findEventById(eventId);
            if (!existingEvent) {
                throw new Error('Event not found');
            }

            if (existingEvent.createdBy !== userId) {
                throw new Error('Unauthorized to update this event');
            }

            const updateData = {
                ...eventData,
                startTime: eventData.startTime ? new Date(eventData.startTime) : undefined,
                endTime: eventData.endTime ? new Date(eventData.endTime) : undefined,
            };

            const updatedEvent = await dashboardRepository.updateEvent(eventId, updateData);

            // Update category event count if category changed
            if (eventData.category && eventData.category !== existingEvent.category) {
                await Promise.all([
                    dashboardRepository.updateCategoryEventCount(eventData.category),
                    dashboardRepository.updateCategoryEventCount(existingEvent.category),
                ]);
            }

            this.logger.info('Event updated successfully', { eventId });
            return updatedEvent;
        } catch (error) {
            this.logger.error('Error updating event:', error);
            throw error;
        }
    }

    /**
     * Delete event
     * @param eventId - Event ID
     * @param userId - User ID (for authorization)
     */
    async deleteEvent(eventId: string, userId: string): Promise<void> {
        try {
            // Check if event exists and user owns it
            const existingEvent = await dashboardRepository.findEventById(eventId);
            if (!existingEvent) {
                throw new Error('Event not found');
            }

            if (existingEvent.createdBy !== userId) {
                throw new Error('Unauthorized to delete this event');
            }

            await dashboardRepository.deleteEvent(eventId);

            // Update category event count
            await dashboardRepository.updateCategoryEventCount(existingEvent.category);

            this.logger.info('Event deleted successfully', { eventId });
        } catch (error) {
            this.logger.error('Error deleting event:', error);
            throw error;
        }
    }

    /**
     * Create a new category
     * @param categoryData - Category creation data
     */
    async createCategory(categoryData: CreateCategoryDto): Promise<Category> {
        try {
            this.logger.info('Creating new category', { name: categoryData.name });

            const category = await dashboardRepository.createCategory(categoryData);

            this.logger.info('Category created successfully', { categoryId: category.id });
            return category;
        } catch (error) {
            this.logger.error('Error creating category:', error);
            throw new Error('Failed to create category');
        }
    }

    /**
     * Format event for API response
     */
    private formatEvent(event: any) {
        return {
            id: event.id,
            title: event.title,
            description: event.description,
            location: event.location,
            startTime: event.startTime.toISOString(),
            endTime: event.endTime?.toISOString(),
            status: event.status,
            category: event.category,
            priority: event.priority,
            attendees: event.attendees,
            maxAttendees: event.maxAttendees,
            image: event.image,
            createdBy: event.createdBy,
            createdAt: event.createdAt.toISOString(),
            updatedAt: event.updatedAt.toISOString(),
        };
    }

    /**
     * Format category for API response
     */
    private formatCategory(category: any) {
        return {
            id: category.id,
            name: category.name,
            icon: category.icon,
            color: category.color,
            eventCount: category.eventCount,
            createdAt: category.createdAt.toISOString(),
            updatedAt: category.updatedAt.toISOString(),
        };
    }
}

export const dashboardService = new DashboardService();
