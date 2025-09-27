import type { Logger } from 'pino';

import { logger } from './logger';

interface HttpClientOptions {
    baseUrl: string;
    apiKey?: string;
    moduleName: string;
    customLogger?: Logger;
}

interface RequestOptions {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    endpoint: string;
    body?: object;
    headers?: Record<string, string>;
    isBinary?: boolean;
}

export class HttpClient {
    private readonly baseUrl: string;
    private readonly apiKey?: string;
    private readonly logger: Logger;

    constructor({ baseUrl, apiKey, moduleName, customLogger }: HttpClientOptions) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.logger =
            customLogger ||
            logger.child({
                module: `[App][HTTPClient ${moduleName}]`,
            });
    }

    async makeRequest<T = any>({
        method,
        endpoint,
        body,
        headers = {},
        isBinary = false,
    }: RequestOptions): Promise<T> {
        try {
            const defaultHeaders = {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
                ...headers,
            };

            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method,
                headers: defaultHeaders,
                ...(body ? { body: JSON.stringify(body) } : {}),
            });

            if (!response.ok) {
                const text = await response.text();
                this.logger.error(`${method} ${endpoint} failed: ${response.status} - ${text}`);
                throw new Error(response.status.toString());
            }

            if (isBinary) {
                return response.arrayBuffer() as unknown as T;
            }

            const text = await response.text();
            const json = text ? JSON.parse(text) : null;
            return json as T;
        } catch (error) {
            console.log('error', error);
            this.logger.error(`${method} ${endpoint} exception:`, error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('500');
        }
    }
}
