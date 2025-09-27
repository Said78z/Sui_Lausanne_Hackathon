import { authService } from '@/api/authService';
import { AuthResponse } from '@/types';

import { LoginSchema, RegisterDto } from '@shared/dto';
import { useMutation, useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';

import { useAuthStore } from '@/stores/authStore';

export const useRegister = () => {
    const { login } = useAuthStore();

    return useMutation({
        mutationFn: async (userData: RegisterDto) => {
            const response = await authService.registerUser(userData);
            if (response.accessToken && response.refreshToken) {
                login(response.accessToken, response.refreshToken);
                return {
                    accessToken: response.accessToken,
                    refreshToken: response.refreshToken,
                };
            } else {
                throw new Error('Registration failed');
            }
        },
        onSuccess: async (response: AuthResponse) => {
            login(response.accessToken, response.refreshToken);
            console.log('Registration successful');
        },
    });
};

export const useLogin = () => {
    const { login } = useAuthStore();

    return useMutation<{ accessToken: string; refreshToken: string }, Error, LoginSchema>({
        mutationFn: async (credentials: LoginSchema) => {
            const response = await authService.loginUser(credentials);
            if (response.accessToken && response.refreshToken) {
                // Mettre à jour le store avec les tokens
                login(response.accessToken, response.refreshToken);

                return {
                    accessToken: response.accessToken,
                    refreshToken: response.refreshToken,
                };
            } else {
                throw new Error('Login failed');
            }
        },

        onSuccess: async (response: AuthResponse) => {
            login(response.accessToken, response.refreshToken);
            console.log('Login successful');
        },
    });
};

export const useAutoLogin = () => {
    const { login, setUser, setIsAuthenticated } = useAuthStore();

    return useQuery({
        queryKey: ['autoLogin'],
        queryFn: async () => {
            const accessToken = Cookies.get('accessToken');
            const refreshToken = Cookies.get('refreshToken');

            if (accessToken && refreshToken) {
                try {
                    const response = await authService.getUserByToken(accessToken);
                    login(accessToken, refreshToken);
                    setUser(response?.data || null);
                    setIsAuthenticated(true);
                    return true;
                } catch (error) {
                    console.error('Failed to fetch user by token:', error);
                    if (refreshToken) {
                        try {
                            const newTokens = await authService.refreshToken(refreshToken);
                            if (!newTokens) throw new Error('Failed to refresh tokens');

                            const userData = await authService.getUserByToken(
                                newTokens.accessToken
                            );
                            login(newTokens.accessToken, newTokens.refreshToken);
                            setUser(userData?.data || null);
                            setIsAuthenticated(true);
                            console.log('Auto login successful with refreshed token');
                            return true;
                        } catch (refreshError) {
                            console.error('Failed to refresh token, user needs to log in again.');
                            handleLogout();
                        }
                    }
                }
            } else {
                handleLogout();
                console.log('No token available in localStorage');
            }
            return false;
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });
};

export const useLogout = () => {
    return useMutation({
        mutationFn: async () => {
            const refreshToken = Cookies.get('refreshToken');
            if (refreshToken) {
                await authService.logout(refreshToken);
                handleLogout();
            }
        },
    });
};

const handleLogout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    useAuthStore.getState().logout();
};
