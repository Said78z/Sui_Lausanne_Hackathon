import prisma from '../src/config/prisma';
import { seedDashboard } from '../src/helpers/seedDashboard';
import { logger } from '../src/utils/logger';

async function main() {
    const seedLogger = logger.child({ module: '[SEED][MAIN]' });

    try {
        seedLogger.info('🌱 Starting database seeding...');

        // Skip application parameters for now (missing fixtures)

        // Create a basic user if none exists (for dashboard events)
        seedLogger.info('👥 Checking for users...');
        const userCount = await prisma.user.count();

        if (userCount === 0) {
            seedLogger.info('Creating default user for dashboard...');
            await prisma.user.create({
                data: {
                    email: 'admin@hacknsui.com',
                    firstName: 'Admin',
                    lastName: 'User',
                    googleId: 'seed-admin-user',
                    provider: 'google',
                    roles: JSON.stringify(['admin', 'user']),
                    isVerified: true,
                },
            });
            seedLogger.info('✅ Default user created');
        } else {
            seedLogger.info(`✅ Found ${userCount} existing users`);
        }

        // Seed dashboard data (categories and events)
        seedLogger.info('📊 Seeding dashboard data...');
        await seedDashboard();

        seedLogger.info('✅ Database seeding completed successfully!');
    } catch (error) {
        seedLogger.error('❌ Database seeding failed:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error('Seed script failed:', e);
        process.exit(1);
    });
