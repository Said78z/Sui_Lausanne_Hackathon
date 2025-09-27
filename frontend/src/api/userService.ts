import { ApiResponse } from '@/types';
import {
    ContactFilters,
    ContactsResponse,
    ContactUserDto,
    GetAllUsers,
    GetChatContacts,
    RestrictedUserDto,
    UserDto
} from '@shared/dto';
import { api } from './interceptor';

export type { ContactFilters, ContactsResponse, ContactUserDto };

class UserService {
    private readonly baseUrl = 'api/users';

    // Helper method to convert params to URLSearchParams for GetAllUsers
    private createSearchParams(params: GetAllUsers): URLSearchParams {
        const searchParams = new URLSearchParams();

        if (params.page !== undefined) {
            searchParams.append('page', params.page.toString());
        }
        if (params.limit !== undefined) {
            searchParams.append('limit', params.limit.toString());
        }
        if (params.search) {
            searchParams.append('search', params.search);
        }
        if (params.type) {
            searchParams.append('type', params.type);
        }
        if (params.roles && params.roles.length > 0) {
            params.roles.forEach(role => {
                searchParams.append('roles', role);
            });
        }

        return searchParams;
    }

    // Helper method to convert params to URLSearchParams for GetChatContacts
    private createChatContactsSearchParams(params: GetChatContacts): URLSearchParams {
        const searchParams = new URLSearchParams();

        if (params.page !== undefined) {
            searchParams.append('page', params.page.toString());
        }
        if (params.limit !== undefined) {
            searchParams.append('limit', params.limit.toString());
        }
        if (params.search) {
            searchParams.append('search', params.search);
        }
        if (params.type) {
            searchParams.append('type', params.type);
        }
        if (params.onlineOnly) {
            searchParams.append('onlineOnly', params.onlineOnly);
        }

        return searchParams;
    }

    // Helper method to convert ContactFilters to URLSearchParams
    private createContactFiltersSearchParams(filters: ContactFilters): URLSearchParams {
        const searchParams = new URLSearchParams();

        if (filters.page) {
            searchParams.append('page', filters.page.toString());
        }
        if (filters.limit) {
            searchParams.append('limit', filters.limit.toString());
        }
        if (filters.search) {
            searchParams.append('search', filters.search);
        }
        if (filters.type) {
            searchParams.append('type', filters.type);
        }
        if (filters.onlineOnly !== undefined) {
            searchParams.append('onlineOnly', filters.onlineOnly.toString());
        }

        return searchParams;
    }

    // Get all users
    public async getAllUsers(params?: GetAllUsers): Promise<ApiResponse<RestrictedUserDto[]>> {
        const queryParams = params ? `?${this.createSearchParams(params).toString()}` : '';
        return api.fetchRequest(`${this.baseUrl}${queryParams}`, 'GET', null, true);
    }

    // Get chat eligible contacts
    public async getChatContacts(params?: GetChatContacts): Promise<ApiResponse<RestrictedUserDto[]>> {
        const queryParams = params ? `?${this.createChatContactsSearchParams(params).toString()}` : '';
        return api.fetchRequest(`${this.baseUrl}/contacts${queryParams}`, 'GET', null, true);
    }

    // Get contactable users with filters and pagination
    public async getContactableUsers(params?: ContactFilters): Promise<ApiResponse<ContactsResponse>> {
        const queryParams = params ? `?${this.createContactFiltersSearchParams(params).toString()}` : '';
        const response = await api.fetchRequest(`${this.baseUrl}/contacts${queryParams}`, 'GET', null, true);

        return {
            ...response,
            data: {
                contacts: response.data || [],
                pagination: response.pagination || {
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: 0,
                    nextPage: 0,
                    previousPage: 0,
                    perPage: 10,
                }
            }
        };
    }

    // Get all contacts/users according to permissions
    async getAllContacts(filters: ContactFilters = {}): Promise<ContactsResponse> {
        const queryParams = filters ? `?${this.createContactFiltersSearchParams(filters).toString()}` : '';
        const response = await api.fetchRequest(`${this.baseUrl}/contacts${queryParams}`, 'GET', null, true);

        return {
            contacts: response.data || [],
            pagination: response.pagination || {
                currentPage: 1,
                totalPages: 1,
                totalItems: 0,
                nextPage: 0,
                previousPage: 0,
                perPage: 10,
            }
        };
    }

    // Get a user by id
    // Get user by ID - returns full user data
    public async getUserById(id: string): Promise<ApiResponse<UserDto>> {
        return api.fetchRequest(`${this.baseUrl}/${id}`, 'GET', null, true);
    }

    // Get online users
    public async getOnlineUsers(): Promise<ApiResponse<string[]>> {
        return api.fetchRequest(`${this.baseUrl}/online`, 'GET', null, true);
    }
}

export const userService = new UserService(); 