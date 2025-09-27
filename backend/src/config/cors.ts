import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { FastifyInstance } from 'fastify';

dotenv.config();

export async function corsConfig(fastify: FastifyInstance) {
    fastify.register(cors, {
        // En développement, autoriser toutes les origines localhost
        // En production, utiliser une origine spécifique
        origin:
            process.env.NODE_ENV === 'development'
                ? true // Permet toutes les origines en dev
                : process.env.PRODUCTION_FRONTEND_URL || false,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        preflightContinue: true,
        optionsSuccessStatus: 204,
    });
}
