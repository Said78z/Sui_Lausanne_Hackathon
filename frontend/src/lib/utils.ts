import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Creates URLSearchParams from an object, filtering out undefined values
 * @param params Object containing query parameters
 * @returns URLSearchParams instance
 */
export function createSearchParams(params: Record<string, string | number | boolean | undefined | null>): URLSearchParams {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            searchParams.append(key, value.toString());
        }
    });

    return searchParams;
}

/**
 * Creates a query string from an object, filtering out undefined values
 * @param params Object containing query parameters
 * @returns Query string (without the leading '?')
 */
export function buildQueryString(params: Record<string, string | number | boolean | undefined | null>): string {
    return createSearchParams(params).toString();
}
