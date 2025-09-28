import { Category, Event } from '@/config/client';
import prisma from '@/config/prisma';
import { logger } from '@/utils/logger';

interface CreateEventData {
    title: string;
    description?: string;
    location?: string;
    startTime: Date;
    endTime?: Date;
    category: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    maxAttendees?: number;
    image?: string;
    createdBy: string;
}

interface CreateCategoryData {
    name: string;
    icon: string;
    color: string;
}

class DashboardRepository {
    private logger = logger.child({
        class: '[App][DashboardRepository]',
    });

    // Event methods
    async createEvent(data: CreateEventData): Promise<Event> {
        return prisma.event.create({
            data: {
                ...data,
                startTime: data.startTime,
                endTime: data.endTime,
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
    }

    async findEventById(id: string): Promise<Event | null> {
        return prisma.event.findUnique({
            where: { id },
            include: {
                creator: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
    }

    async findEventsByUser(userId: string, limit = 10): Promise<Event[]> {
        return prisma.event.findMany({
            where: { createdBy: userId },
            orderBy: { startTime: 'asc' },
            take: limit,
            include: {
                creator: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
    }

    async findUpcomingEvents(limit = 10): Promise<Event[]> {
        try {
            console.log('🔍 DashboardRepository: Finding upcoming events with limit:', limit);
            const now = new Date();
            console.log('🔍 Current time for filtering:', now.toISOString());

            // First, let's try a simple query to see if there are any events at all
            const allEvents = await prisma.event.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
            });
            console.log('🔍 DashboardRepository: Total events in database:', allEvents.length);
            if (allEvents.length > 0) {
                console.log('🔍 Latest events:', allEvents.map(e => ({
                    id: e.id,
                    title: e.title,
                    startTime: e.startTime.toISOString(),
                    status: e.status,
                    createdAt: e.createdAt.toISOString()
                })));
            }

            // Show all events for now (most recent first) to ensure new events appear
            const result = await prisma.event.findMany({
                orderBy: { createdAt: 'desc' },
                take: limit,
                include: {
                    creator: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            });

            console.log('✅ DashboardRepository: Found upcoming events:', result.length);
            if (result.length > 0) {
                console.log('✅ Upcoming events details:', result.map(e => ({
                    id: e.id,
                    title: e.title,
                    startTime: e.startTime.toISOString(),
                    status: e.status
                })));
            }
            return result;
        } catch (error) {
            console.error('❌ DashboardRepository: Error finding upcoming events:', error);
            console.error('❌ Error details:', error.message);
            throw error;
        }
    }

    async updateEvent(id: string, data: Partial<CreateEventData>): Promise<Event> {
        return prisma.event.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date(),
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
    }

    async deleteEvent(id: string): Promise<Event> {
        return prisma.event.delete({
            where: { id },
        });
    }

    // Category methods
    async createCategory(data: CreateCategoryData): Promise<Category> {
        return prisma.category.create({
            data,
        });
    }

    async findAllCategories(): Promise<Category[]> {
        return prisma.category.findMany({
            orderBy: { name: 'asc' },
        });
    }

    async findCategoryById(id: string): Promise<Category | null> {
        return prisma.category.findUnique({
            where: { id },
        });
    }

    async updateCategoryEventCount(categoryName: string): Promise<void> {
        const eventCount = await prisma.event.count({
            where: { category: categoryName },
        });

        await prisma.category.updateMany({
            where: { name: categoryName },
            data: { eventCount },
        });
    }

    // Stats methods
    async getEventStats() {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Total events
        const totalEvents = await prisma.event.count();
        const totalEventsLastMonth = await prisma.event.count({
            where: {
                createdAt: {
                    lt: lastMonth,
                },
            },
        });

        // Events this month
        const eventsThisMonth = await prisma.event.count({
            where: {
                createdAt: {
                    gte: thisMonth,
                },
            },
        });

        const eventsLastMonth = await prisma.event.count({
            where: {
                createdAt: {
                    gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
                    lt: thisMonth,
                },
            },
        });

        // Active users (users who created events in the last 30 days)
        const activeUsers = await prisma.user.count({
            where: {
                events: {
                    some: {
                        createdAt: {
                            gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
                        },
                    },
                },
            },
        });

        // Calculate percentage changes
        const totalEventsChange = totalEventsLastMonth > 0
            ? Math.round(((totalEvents - totalEventsLastMonth) / totalEventsLastMonth) * 100)
            : 100;

        const thisMonthChange = eventsLastMonth > 0
            ? Math.round(((eventsThisMonth - eventsLastMonth) / eventsLastMonth) * 100)
            : 100;

        return {
            totalEvents: {
                value: totalEvents,
                change: `${totalEventsChange >= 0 ? '+' : ''}${totalEventsChange}%`,
                trend: totalEventsChange > 0 ? 'up' : totalEventsChange < 0 ? 'down' : 'stable',
            },
            activeUsers: {
                value: activeUsers,
                change: '+8%', // Mock for now
                trend: 'up',
            },
            thisMonth: {
                value: eventsThisMonth,
                change: `${thisMonthChange >= 0 ? '+' : ''}${thisMonthChange}%`,
                trend: thisMonthChange > 0 ? 'up' : thisMonthChange < 0 ? 'down' : 'stable',
            },
            revenue: {
                value: '$12.4k', // Mock for now
                change: '+15%',
                trend: 'up',
            },
        };
    }
}

export const dashboardRepository = new DashboardRepository();
