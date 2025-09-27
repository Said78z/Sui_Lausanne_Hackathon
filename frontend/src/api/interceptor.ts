import { AuthResponse } from '@/types';

import Cookies from 'js-cookie';

class Interceptor {
    private url: string;

    constructor() {
        this.url = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        console.log('API Base URL:', this.url);
    }

    public getUrl(): string {
        return this.url;
    }

    private createHeaders(includeAuth: boolean = false, isFormData: boolean = false): HeadersInit {
        const headers: HeadersInit = {};

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        if (includeAuth) {
            const token = Cookies.get('accessToken');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
                console.log('Auth token added to request:', token.substring(0, 10) + '...');
            } else {
                console.warn('No access token found in cookies for authenticated request');
            }
        }

        return headers;
    }

    public async fetchMultipartRequest(
        endpoint: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
        body: any = null,
        includeAuth: boolean = false
    ): Promise<any> {
        const isFormData = body instanceof FormData;
        const fullUrl = `${this.url}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
        console.log('Making request to:', fullUrl);

        const options: RequestInit = {
            method,
            headers: {
                ...this.createHeaders(includeAuth, isFormData),
            },
        };

        if (body) {
            options.body = isFormData ? body : JSON.stringify(body);
        }

        try {
            const response = await fetch(fullUrl, options);

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (jsonError) {
                    errorData = { message: response.statusText };
                }
                throw new Error(
                    errorData.message || `${method} request failed: ${response.statusText}`
                );
            }

            try {
                return await response.json();
            } catch (jsonError) {
                return { success: true };
            }
        } catch (error: any) {
            console.error('Request error:', error);
            throw new Error(error.message || 'Une erreur est survenue lors de la requête');
        }
    }

    // Fonction générique pour gérer toutes les requêtes HTTP
    public async fetchRequest(
        endpoint: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
        body: any = null,
        includeAuth: boolean = false
    ): Promise<any> {
        const isFormData = body instanceof FormData;
        const fullUrl = `${this.url}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

        const options: RequestInit = {
            method,
            headers: this.createHeaders(includeAuth, isFormData),
        };

        // J'ai ajouté cette partie pour que le DELETE fonctionne
        // car sinon il y a une erreur 400
        // Pour l'instant je laisse comme ca
        if (method === 'DELETE' && !body) {
            const headers = { ...options.headers } as Record<string, string>;
            delete headers['Content-Type'];
            options.headers = headers;
        }

        if (body) {
            options.body = isFormData ? body : JSON.stringify(body);
        }

        try {
            const response = await fetch(fullUrl, options);

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (jsonError) {
                    errorData = { message: response.statusText };
                }
                throw new Error(
                    errorData.message || `${method} request failed: ${response.statusText}`
                );
            }

            // Handle successful responses - check for empty content before parsing JSON
            const contentType = response.headers.get('content-type');
            const contentLength = response.headers.get('content-length');

            // For DELETE requests or empty responses, return empty object
            if (method === 'DELETE' || response.status === 204 || contentLength === '0') {
                return {};
            }

            // Only try to parse JSON if content-type indicates JSON
            if (contentType && contentType.includes('application/json')) {
                try {
                    return await response.json();
                } catch (jsonError) {
                    // If JSON parsing fails, return empty object for successful requests
                    return {};
                }
            }

            // For non-JSON responses, return text or empty object
            try {
                const text = await response.text();
                return text || {};
            } catch (textError) {
                return {};
            }
        } catch (error: any) {
            console.error('Request error:', error);
            throw new Error(error.message || 'Une erreur est survenue lors de la requête');
        }
    }

    // Récupération d'un nouveau token via le refresh token
    public async getNewAccessToken(refreshToken: string): Promise<AuthResponse | null> {
        const response = await this.fetchRequest('/api/auth/refresh', 'POST', {
            token: refreshToken,
        });

        if (response.token) {
            Cookies.set('accessToken', response.token, { expires: 1 }); // expire dans 1 jour
        }

        if (response.refreshToken) {
            Cookies.set('refreshToken', response.refreshToken, { expires: 30 }); // expire dans 30 jours
        }

        return response || null;
    }
}

export const api = new Interceptor();
