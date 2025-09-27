import dotenv from 'dotenv';

import { PrismaClient } from './client';

// Load the appropriate environment variables
if (process.env.NODE_ENV === 'test') {
    dotenv.config({ path: '.env.test' });
} else {
    dotenv.config();
}

// Declaration of the global instance
declare global {
    var prisma: PrismaClient | undefined;
}

// Creation or reuse of the instance
const prisma =
    global.prisma ||
    new PrismaClient({
        //TODO : Potentiellement les mettre sur grafana aussi 
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

// In development mode, we keep the instance in global
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

export default prisma;
