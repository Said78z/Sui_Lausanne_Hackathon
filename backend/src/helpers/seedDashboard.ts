import { EventPriority, EventStatus } from '@/config/client';
import prisma from '@/config/prisma';
import { logger } from '@/utils/logger';

export async function seedDashboard() {
    const seedLogger = logger.child({ module: '[SEED][DASHBOARD]' });

    try {
        seedLogger.info('Starting dashboard seed...');

        // Create default categories
        const categories = [
            { name: 'Tech', icon: '💻', color: 'blue' },
            { name: 'AI', icon: '🤖', color: 'purple' },
            { name: 'Food & Drink', icon: '🍽️', color: 'orange' },
            { name: 'Arts & Culture', icon: '🎨', color: 'green' },
            { name: 'Climate', icon: '🌱', color: 'emerald' },
            { name: 'Fitness', icon: '💪', color: 'red' },
            { name: 'Conference', icon: '🎤', color: 'purple' },
            { name: 'Networking', icon: '🤝', color: 'cyan' },
        ];

        for (const categoryData of categories) {
            await prisma.category.upsert({
                where: { name: categoryData.name },
                update: categoryData,
                create: categoryData,
            });
        }

        seedLogger.info(`Seeded ${categories.length} categories`);

        // Get the first user to create sample events
        const firstUser = await prisma.user.findFirst();

        if (firstUser) {
            // Create sample events
            const sampleEvents = [
                {
                    title: 'SUI <> BSA Hackathon 3rd Edition',
                    description: 'Join us for an exciting hackathon focused on blockchain innovation',
                    location: 'BC Building (building of the IC faculty)',
                    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
                    endTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
                    status: EventStatus.LIVE,
                    category: 'Tech',
                    priority: EventPriority.HIGH,
                    attendees: 248,
                    maxAttendees: 300,
                    createdBy: firstUser.id,
                },
                {
                    title: 'Hack Seasons Conference Singapore',
                    description: 'Premier blockchain conference in Southeast Asia',
                    location: 'The Westin Singapore',
                    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
                    endTime: new Date(Date.now() + 30 * 60 * 60 * 1000), // 1 day + 6 hours
                    status: EventStatus.UPCOMING,
                    category: 'Conference',
                    priority: EventPriority.MEDIUM,
                    attendees: 1400,
                    maxAttendees: 2000,
                    createdBy: firstUser.id,
                },
                {
                    title: 'AI & Blockchain Meetup',
                    description: 'Exploring the intersection of AI and blockchain technology',
                    location: 'Tech Hub Zurich',
                    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
                    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours duration
                    status: EventStatus.UPCOMING,
                    category: 'AI',
                    priority: EventPriority.MEDIUM,
                    attendees: 89,
                    maxAttendees: 150,
                    createdBy: firstUser.id,
                },
                {
                    title: 'NASA Space Apps Challenge - Paris 2025',
                    description: 'International hackathon focusing on space exploration challenges',
                    location: "École Supérieure d'Informatique",
                    startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
                    endTime: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 2 days duration
                    status: EventStatus.UPCOMING,
                    category: 'Tech',
                    priority: EventPriority.HIGH,
                    attendees: 892,
                    maxAttendees: 1000,
                    createdBy: firstUser.id,
                },
            ];

            for (const eventData of sampleEvents) {
                // Check if event already exists
                const existingEvent = await prisma.event.findFirst({
                    where: { title: eventData.title }
                });

                if (!existingEvent) {
                    await prisma.event.create({
                        data: eventData,
                    });
                }
            }

            seedLogger.info(`Seeded ${sampleEvents.length} sample events`);

            // Update category event counts
            for (const category of categories) {
                const eventCount = await prisma.event.count({
                    where: { category: category.name },
                });

                await prisma.category.update({
                    where: { name: category.name },
                    data: { eventCount },
                });
            }

            seedLogger.info('Updated category event counts');
        } else {
            seedLogger.warn('No users found - skipping event seeding');
        }

        seedLogger.info('Dashboard seed completed successfully');
    } catch (error) {
        seedLogger.error('Dashboard seed failed:', error);
        throw error;
    }
}
