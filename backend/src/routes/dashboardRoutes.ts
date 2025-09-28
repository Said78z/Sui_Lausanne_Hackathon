import { dashboardController } from '@/controllers/dashboardController';
import { isAuthenticated } from '@/middleware/auth';
import { createSwaggerSchema } from '@/utils/swaggerUtils';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export async function dashboardRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    // Dashboard Data Routes (requires authentication)
    fastify.get('/data', {
        schema: createSwaggerSchema(
            'Get complete dashboard data',
            [
                { message: 'Dashboard data retrieved successfully', data: [], status: 200 },
                { message: 'User not authenticated', data: [], status: 401 },
                { message: 'Failed to get dashboard data', data: [], status: 500 },
            ],
            null,
            true,
            null,
            ['Dashboard', 'Analytics']
        ),
        preHandler: [isAuthenticated],
        handler: dashboardController.getDashboardData,
    });

    // Event Routes
    // Get upcoming events (public access)
    fastify.get('/events/upcoming', {
        schema: createSwaggerSchema(
            'Get upcoming events',
            [
                { message: 'Upcoming events retrieved successfully', data: [], status: 200 },
                { message: 'Failed to get upcoming events', data: [], status: 500 },
            ],
            null,
            false,
            null,
            ['Dashboard', 'Events']
        ),
        handler: dashboardController.getUpcomingEvents,
    });

    fastify.get('/events/my', {
        schema: createSwaggerSchema(
            'Get user events',
            [
                { message: 'User events retrieved successfully', data: [], status: 200 },
                { message: 'User not authenticated', data: [], status: 401 },
                { message: 'Failed to get user events', data: [], status: 500 },
            ],
            null,
            true,
            null,
            ['Dashboard', 'Events']
        ),
        preHandler: [isAuthenticated],
        handler: dashboardController.getUserEvents,
    });

    fastify.get('/events/:id', {
        schema: createSwaggerSchema(
            'Get event by ID',
            [
                { message: 'Event retrieved successfully', data: [], status: 200 },
                { message: 'Event not found', data: [], status: 404 },
                { message: 'Failed to get event', data: [], status: 500 },
            ],
            null,
            false,
            null,
            ['Dashboard', 'Events']
        ),
        handler: dashboardController.getEventById,
    });

    fastify.post('/events', {
        schema: createSwaggerSchema(
            'Create new event',
            [
                { message: 'Event created successfully', data: [], status: 201 },
                { message: 'User not authenticated', data: [], status: 401 },
                { message: 'Failed to create event', data: [], status: 500 },
            ],
            null,
            true,
            null,
            ['Dashboard', 'Events']
        ),
        preHandler: [isAuthenticated],
        handler: dashboardController.createEvent,
    });

    fastify.put('/events/:id', {
        schema: createSwaggerSchema(
            'Update event',
            [
                { message: 'Event updated successfully', data: [], status: 200 },
                { message: 'User not authenticated', data: [], status: 401 },
                { message: 'Unauthorized to update this event', data: [], status: 403 },
                { message: 'Event not found', data: [], status: 404 },
                { message: 'Failed to update event', data: [], status: 500 },
            ],
            null,
            true,
            null,
            ['Dashboard', 'Events']
        ),
        preHandler: [isAuthenticated],
        handler: dashboardController.updateEvent,
    });

    fastify.delete('/events/:id', {
        schema: createSwaggerSchema(
            'Delete event',
            [
                { message: 'Event deleted successfully', data: [], status: 200 },
                { message: 'User not authenticated', data: [], status: 401 },
                { message: 'Unauthorized to delete this event', data: [], status: 403 },
                { message: 'Event not found', data: [], status: 404 },
                { message: 'Failed to delete event', data: [], status: 500 },
            ],
            null,
            true,
            null,
            ['Dashboard', 'Events']
        ),
        preHandler: [isAuthenticated],
        handler: dashboardController.deleteEvent,
    });

    // Category Routes
    fastify.get('/categories', {
        schema: createSwaggerSchema(
            'Get all categories',
            [
                { message: 'Categories retrieved successfully', data: [], status: 200 },
                { message: 'Failed to get categories', data: [], status: 500 },
            ],
            null,
            false,
            null,
            ['Dashboard', 'Categories']
        ),
        handler: dashboardController.getCategories,
    });

    fastify.post('/categories', {
        schema: createSwaggerSchema(
            'Create new category',
            [
                { message: 'Category created successfully', data: [], status: 201 },
                { message: 'Failed to create category', data: [], status: 500 },
            ],
            null,
            false,
            null,
            ['Dashboard', 'Categories']
        ),
        handler: dashboardController.createCategory,
    });
}
