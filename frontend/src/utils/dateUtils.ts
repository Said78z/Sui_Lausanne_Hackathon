import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formats a date string to a user-friendly format
 * @param dateString ISO date string or Date object
 * @param formatStr Optional format string (default: 'dd/MM/yyyy à HH:mm')
 * @returns Formatted date string
 */
export const formatDate = (
    dateString: string | Date | null | undefined,
    formatStr: string = 'dd/MM/yyyy à HH:mm'
): string => {
    if (!dateString) return '';

    try {
        const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
        return format(date, formatStr, { locale: fr });
    } catch (error) {
        console.error('Error formatting date:', error);
        return typeof dateString === 'string' ? dateString : '';
    }
};

/**
 * Formats a date string to ISO format for backend
 * @param date Date object
 * @returns ISO formatted date string (YYYY-MM-DD)
 */
export const formatDateForBackend = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
}; 