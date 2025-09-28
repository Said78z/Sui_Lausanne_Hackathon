import { api } from '@/api/interceptor';
import { EnokiAuthResponse } from '@shared/dto';
import Cookies from 'js-cookie';

class EnokiAuthService {
    /**
     * Authenticate user with Enoki JWT token
     * @param token - The JWT token from Enoki authentication
     * @returns Authentication response with user data and tokens
     */
    public async authenticateWithEnoki(token: string): Promise<EnokiAuthResponse> {
        try {
            console.log('EnokiAuthService: Authenticating with Enoki token...');
            console.log('EnokiAuthService: Token length:', token.length);

            const response = await api.fetchRequest('/api/users/authenticate-enoki', 'POST', { token });
            console.log('EnokiAuthService: API response:', response);

            if (response.accessToken && response.refreshToken) {
                // Store tokens in cookies
                Cookies.set('accessToken', response.accessToken, { expires: 1 });
                Cookies.set('refreshToken', response.refreshToken, { expires: 30 });

                console.log('EnokiAuthService: Authentication successful, user:', response.user);
                return response;
            }

            console.error('EnokiAuthService: Invalid response structure:', response);
            throw new Error('Invalid authentication response');
        } catch (error) {
            console.error('EnokiAuthService: Authentication failed:', error);
            throw error;
        }
    }

    /**
     * NEW: Authenticate user with Google JWT token (PROPER BACKEND APPROACH)
     * @param jwtToken - The Google JWT token from OAuth
     * @param walletAddress - Optional wallet address from Enoki
     * @returns Authentication response with user data and tokens
     */
    public async authenticateWithGoogleJWT(
        jwtToken: string,
        walletAddress?: string
    ): Promise<EnokiAuthResponse> {
        try {
            console.log('🚀 NEW EnokiAuthService: Authenticating with Google JWT...');
            console.log('📋 JWT Token length:', jwtToken.length);
            console.log('📋 Wallet address:', walletAddress || 'None');

            const response = await api.fetchRequest('/api/auth/jwt', 'POST', {
                jwtToken,
                walletAddress,
            });
            console.log('✅ NEW EnokiAuthService: API response:', response);

            if (response.accessToken && response.refreshToken) {
                // Store tokens in cookies
                Cookies.set('accessToken', response.accessToken, { expires: 1 });
                Cookies.set('refreshToken', response.refreshToken, { expires: 30 });

                console.log('✅ NEW EnokiAuthService: Authentication successful, user:', response.user);
                return response;
            }

            console.error('❌ NEW EnokiAuthService: Invalid response structure:', response);
            throw new Error('Invalid authentication response');
        } catch (error) {
            console.error('❌ NEW EnokiAuthService: Authentication failed:', error);
            throw error;
        }
    }

    /**
     * Get current user profile using stored tokens
     * @returns User profile data
     */
    public async getCurrentUser(): Promise<EnokiAuthResponse['user'] | null> {
        try {
            const accessToken = Cookies.get('accessToken');
            if (!accessToken) {
                return null;
            }

            const response = await api.fetchRequest('/api/auth/profile', 'GET');
            return response.user;
        } catch (error) {
            console.error('Failed to get current user:', error);
            return null;
        }
    }

    /**
     * Logout user by clearing tokens
     */
    public logout(): void {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        console.log('User logged out');
    }

    /**
     * Check if user is authenticated
     * @returns True if user has valid tokens
     */
    public isAuthenticated(): boolean {
        const accessToken = Cookies.get('accessToken');
        return !!accessToken;
    }
}

export const enokiAuthService = new EnokiAuthService();
