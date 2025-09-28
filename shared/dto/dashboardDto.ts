import { z } from 'zod';

// Event DTOs
export const eventSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    location: z.string().optional(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime().optional(),
    status: z.enum(['UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED', 'INVITED', 'GOING']),
    category: z.string(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    attendees: z.number(),
    maxAttendees: z.number().optional(),
    image: z.string().optional(),
    createdBy: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

export const createEventSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    location: z.string().optional(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime().optional(),
    category: z.string().min(1, 'Category is required'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
    maxAttendees: z.number().positive().optional(),
    image: z.string().optional(),
});

export const updateEventSchema = createEventSchema.partial();

// Category DTOs
export const categorySchema = z.object({
    id: z.string(),
    name: z.string(),
    icon: z.string(),
    color: z.string(),
    eventCount: z.number(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

export const createCategorySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    icon: z.string().min(1, 'Icon is required'),
    color: z.string().min(1, 'Color is required'),
});

// Dashboard Stats DTOs
export const dashboardStatsSchema = z.object({
    totalEvents: z.object({
        value: z.number(),
        change: z.string(),
        trend: z.enum(['up', 'down', 'stable']),
    }),
    activeUsers: z.object({
        value: z.number(),
        change: z.string(),
        trend: z.enum(['up', 'down', 'stable']),
    }),
    thisMonth: z.object({
        value: z.number(),
        change: z.string(),
        trend: z.enum(['up', 'down', 'stable']),
    }),
    revenue: z.object({
        value: z.string(),
        change: z.string(),
        trend: z.enum(['up', 'down', 'stable']),
    }),
});

// Dashboard Response DTOs
export const dashboardDataSchema = z.object({
    stats: dashboardStatsSchema,
    upcomingEvents: z.array(eventSchema),
    categories: z.array(categorySchema),
});

// TypeScript types
export type Event = z.infer<typeof eventSchema>;
export type CreateEventDto = z.infer<typeof createEventSchema>;
export type UpdateEventDto = z.infer<typeof updateEventSchema>;
export type Category = z.infer<typeof categorySchema>;
export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
export type DashboardData = z.infer<typeof dashboardDataSchema>;

// API Response types
export interface EventResponse {
    message: string;
    event: Event;
}

export interface EventsResponse {
    message: string;
    events: Event[];
    total: number;
    page: number;
    limit: number;
}

export interface CategoriesResponse {
    message: string;
    categories: Category[];
}

export interface DashboardResponse {
    message: string;
    data: DashboardData;
}
