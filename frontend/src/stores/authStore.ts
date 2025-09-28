// src/stores/authStore.ts
import { BasicUserDto } from '@shared/dto';
import Cookies from 'js-cookie';
import { create } from 'zustand';

interface AuthState {
    user: BasicUserDto | null;
    isAuthenticated: boolean;
    accessToken: string | null;
    refreshToken: string | null;
    setUser: (user: BasicUserDto | null) => void;
    setIsAuthenticated: (value: boolean) => void;
    login: (accessToken: string, refreshToken: string) => void;
    logout: () => void;
    initializeAuth: () => void;
    checkAuthStatus: () => boolean;
}

// Helper function to check if tokens exist and are valid
const checkTokensExist = (): boolean => {
    const accessToken = Cookies.get('accessToken');
    const refreshToken = Cookies.get('refreshToken');
    return !!(accessToken && refreshToken);
};

// Initialize auth state from cookies
const initializeAuthState = () => {
    const hasTokens = checkTokensExist();
    const accessToken = Cookies.get('accessToken') || null;
    const refreshToken = Cookies.get('refreshToken') || null;

    console.log('AuthStore: Initializing auth state', { hasTokens, accessToken: accessToken ? 'exists' : 'none' });

    return {
        accessToken,
        refreshToken,
        isAuthenticated: hasTokens,
    };
};

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    ...initializeAuthState(), // Initialize from cookies

    setUser: (user) => {
        console.log('AuthStore: Setting user:', user);
        set({ user });
    },

    setIsAuthenticated: (value) => {
        console.log('AuthStore: Setting isAuthenticated:', value);
        set({ isAuthenticated: value });
    },

    login: (accessToken, refreshToken) => {
        console.log('AuthStore: Login called with tokens');
        console.log('🍪 AuthStore: AccessToken length:', accessToken.length);
        console.log('🍪 AuthStore: RefreshToken length:', refreshToken.length);

        // Store tokens in cookies (done by enokiAuthService, but let's be explicit)
        const cookieOptions = {
            expires: 1,
            path: '/',
            sameSite: 'lax'
        };
        const refreshCookieOptions = {
            expires: 30,
            path: '/',
            sameSite: 'lax'
        };

        Cookies.set('accessToken', accessToken, cookieOptions);
        Cookies.set('refreshToken', refreshToken, refreshCookieOptions);

        // Verify cookies were set in auth store
        const storedAccessToken = Cookies.get('accessToken');
        const storedRefreshToken = Cookies.get('refreshToken');

        console.log('🍪 AuthStore: Cookie verification after setting:');
        console.log('🍪 AuthStore: AccessToken stored:', !!storedAccessToken, storedAccessToken ? `(${storedAccessToken.length} chars)` : '');
        console.log('🍪 AuthStore: RefreshToken stored:', !!storedRefreshToken, storedRefreshToken ? `(${storedRefreshToken.length} chars)` : '');
        console.log('🍪 AuthStore: All cookies:', document.cookie);

        set({
            accessToken,
            refreshToken,
            isAuthenticated: true,
        });

        console.log('AuthStore: Login completed, isAuthenticated:', true);
    },

    logout: () => {
        console.log('AuthStore: Logout called');

        // Clear cookies
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');

        set({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
        });

        console.log('AuthStore: Logout completed');
    },

    initializeAuth: () => {
        console.log('AuthStore: Initializing auth...');
        const authState = initializeAuthState();
        set(authState);

        // If we have tokens but no user, try to decode user from access token
        if (authState.isAuthenticated && authState.accessToken && !get().user) {
            console.log('AuthStore: Found tokens but no user, attempting to decode from JWT...');
            try {
                // Decode JWT to get user info
                const payload = authState.accessToken.split('.')[1];
                const paddedPayload = payload + '='.repeat((4 - (payload.length % 4)) % 4);
                const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
                const userData = JSON.parse(decodedPayload);

                const user = {
                    id: userData.id,
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    roles: userData.roles ? JSON.parse(userData.roles) : ['user'],
                    isVerified: userData.isVerified,
                    provider: userData.provider,
                    avatar: userData.avatar,
                    suiAddress: userData.suiAddress,
                };

                console.log('AuthStore: Restored user from JWT:', user);
                set({ user });
            } catch (error) {
                console.error('AuthStore: Failed to decode user from JWT:', error);
            }
        }

        console.log('AuthStore: Auth initialized', authState);
    },

    checkAuthStatus: () => {
        const hasTokens = checkTokensExist();
        const currentAuth = get().isAuthenticated;

        if (hasTokens !== currentAuth) {
            console.log('AuthStore: Auth status mismatch, updating', { hasTokens, currentAuth });
            set({ isAuthenticated: hasTokens });
        }

        return hasTokens;
    },
}));
