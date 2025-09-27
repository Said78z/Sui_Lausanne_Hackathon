// types/fastify-rewrite.d.ts
import { ParsedUserAgent } from '@/utils/userAgentParser';

import 'fastify';
import { IncomingMessage, ServerResponse } from 'http';

declare module 'fastify' {
    interface FastifyInstance {
        rewriteUrl?: (
            this: FastifyInstance,
            req: IncomingMessage,
            res: ServerResponse<IncomingMessage>
        ) => string;
    }

    interface FastifyRequest {
        rawBody?: Buffer;
    }

    interface FastifyRequest {
        userAgent: ParsedUserAgent;
    }
}
