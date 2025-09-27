export interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    nextPage: number;
    previousPage: number;
    perPage: number;
}

export interface ApiResponse<T> {
    data: T;
    message: string;
    status: number;
    timestamp: string;
    pagination?: PaginationMeta;
}

export interface ApiError {
    message: string;
    status: number;
    errors?: Record<string, string[]>;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
}
