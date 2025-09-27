import pino, { Logger } from 'pino';
import pinoLoki from 'pino-loki';

/**
 * Transport pour les logs
 */
const createTransports = () => {
    // Transport Loki toujours configuré pour envoyer les logs
    const lokiTransport = pinoLoki({
        batching: false,
        labels: {
            app: process.env.APP_NAME || 'app',
            namespace: process.env.NODE_ENV || 'development',
            source: process.env.LOG_SOURCE || 'pino',
            runtime: `nodejs/${process.version}`,
        },
        host: process.env.LOKI_HOST || 'http://localhost:3100',
        basicAuth: {
            username: process.env.LOKI_USERNAME || 'admin',
            password: process.env.LOKI_PASSWORD || 'admin',
        },
    });

    return lokiTransport;
};

// Logger principal qui enverra les logs à Loki mais pas à la console
export const logger: Logger = pino({ level: process.env.LOG_LEVEL || 'debug' }, createTransports());

// Logger spécifique pour les logs applicatifs (non HTTP) qui seront affichés en console
export const appLogger = pino({
    transport:
        process.env.NODE_ENV === 'development'
            ? {
                  target: 'pino-pretty',
                  options: {
                      translateTime: 'HH:MM:ss Z',
                      ignore: 'pid,hostname',
                      colorize: true,
                  },
              }
            : undefined,
});
