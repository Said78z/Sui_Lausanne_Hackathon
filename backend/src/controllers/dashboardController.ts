import { dashboardService } from '@/services/dashboardService';
import { asyncHandler } from '@/utils/asyncHandler';
import { jsonResponse } from '@/utils/jsonResponse';
import { logger } from '@/utils/logger';
import {
    CategoriesResponse,
    CreateCategoryDto,
    CreateEventDto,
    DashboardResponse,
    EventResponse,
    EventsResponse,
    UpdateEventDto
} from '@shared/dto';

class DashboardController {
    private logger = logger.child({
        module: '[SUI][DASHBOARD][CONTROLLER]',
    });

    /**
     * Get complete dashboard data
     */
    public getDashboardData = asyncHandler<unknown, unknown, unknown, DashboardResponse>({
        logger: this.logger,
        handler: async (request, reply) => {
            const userId = (request as any).user?.id;

            const data = await dashboardService.getDashboardData(userId);

            return jsonResponse(
                reply,
                'Dashboard data retrieved successfully',
                { data },
                200
            );
        },
    });

    /**
     * Get upcoming events
     */
    public getUpcomingEvents = asyncHandler<unknown, { limit?: string }, unknown, EventsResponse>({
        logger: this.logger,
        handler: async (request, reply) => {
            const limit = request.query.limit ? parseInt(request.query.limit) : 10;
            console.log('🔍 DashboardController: Getting upcoming events with limit:', limit);

            const events = await dashboardService.getUpcomingEvents(limit);
            console.log('🔍 DashboardController: Retrieved events from service:', events.length);

            const response = {
                events,
                total: events.length,
                page: 1,
                limit
            };

            console.log('🔍 DashboardController: Sending response:', {
                eventsCount: response.events.length,
                total: response.total,
                sampleEvent: response.events[0] ? {
                    id: response.events[0].id,
                    title: response.events[0].title,
                    startTime: response.events[0].startTime
                } : null
            });

            return jsonResponse(
                reply,
                'Upcoming events retrieved successfully',
                response,
                200
            );
        },
    });

    /**
     * Get user events
     */
    public getUserEvents = asyncHandler<unknown, { limit?: string }, unknown, EventsResponse>({
        logger: this.logger,
        handler: async (request, reply) => {
            const userId = (request as any).user?.id;
            if (!userId) {
                return jsonResponse(reply, 'User not authenticated', {}, 401);
            }

            const limit = request.query.limit ? parseInt(request.query.limit) : 10;

            const events = await dashboardService.getUserEvents(userId, limit);

            return jsonResponse(
                reply,
                'User events retrieved successfully',
                {
                    events,
                    total: events.length,
                    page: 1,
                    limit
                },
                200
            );
        },
    });

    /**
     * Get event by ID
     */
    public getEventById = asyncHandler<{ id: string }, unknown, unknown, EventResponse>({
        logger: this.logger,
        handler: async (request, reply) => {
            const { id } = request.params;

            const event = await dashboardService.getEventById(id);

            if (!event) {
                return jsonResponse(reply, 'Event not found', {}, 404);
            }

            return jsonResponse(
                reply,
                'Event retrieved successfully',
                { event },
                200
            );
        },
    });

    /**
     * Create new event
     */
    public createEvent = asyncHandler<unknown, unknown, CreateEventDto, EventResponse>({
        logger: this.logger,
        handler: async (request, reply) => {
            const userId = (request as any).user?.id;
            if (!userId) {
                return jsonResponse(reply, 'User not authenticated', {}, 401);
            }

            const eventData = request.body;

            const event = await dashboardService.createEvent(eventData, userId);

            return jsonResponse(
                reply,
                'Event created successfully',
                { event },
                201
            );
        },
    });

    /**
     * Update event
     */
    public updateEvent = asyncHandler<{ id: string }, unknown, UpdateEventDto, EventResponse>({
        logger: this.logger,
        handler: async (request, reply) => {
            const userId = (request as any).user?.id;
            if (!userId) {
                return jsonResponse(reply, 'User not authenticated', {}, 401);
            }

            const { id } = request.params;
            const eventData = request.body;

            const event = await dashboardService.updateEvent(id, eventData, userId);

            return jsonResponse(
                reply,
                'Event updated successfully',
                { event },
                200
            );
        },
    });

    /**
     * Delete event
     */
    public deleteEvent = asyncHandler<{ id: string }, unknown, unknown, unknown>({
        logger: this.logger,
        handler: async (request, reply) => {
            const userId = (request as any).user?.id;
            if (!userId) {
                return jsonResponse(reply, 'User not authenticated', {}, 401);
            }

            const { id } = request.params;

            await dashboardService.deleteEvent(id, userId);

            return jsonResponse(
                reply,
                'Event deleted successfully',
                {},
                200
            );
        },
    });

    /**
     * Get all categories
     */
    public getCategories = asyncHandler<unknown, unknown, unknown, CategoriesResponse>({
        logger: this.logger,
        handler: async (request, reply) => {
            const categories = await dashboardService.getCategories();

            return jsonResponse(
                reply,
                'Categories retrieved successfully',
                { categories },
                200
            );
        },
    });

    /**
     * Create new category
     */
    public createCategory = asyncHandler<unknown, unknown, CreateCategoryDto, unknown>({
        logger: this.logger,
        handler: async (request, reply) => {
            const categoryData = request.body;

            const category = await dashboardService.createCategory(categoryData);

            return jsonResponse(
                reply,
                'Category created successfully',
                { category },
                201
            );
        },
    });
}

export const dashboardController = new DashboardController();
