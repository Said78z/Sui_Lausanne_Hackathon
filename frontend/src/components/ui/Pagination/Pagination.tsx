import type React from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
    sticky?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    className = '',
    sticky = false,
}) => {
    // Protection contre les valeurs incorrectes
    const safeTotalPages = Math.max(1, totalPages || 1);
    const safeCurrentPage = Math.min(Math.max(1, currentPage || 1), safeTotalPages);

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;

        if (safeTotalPages <= maxVisiblePages) {
            for (let i = 1; i <= safeTotalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            if (safeCurrentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pageNumbers.push(i);
                }
                pageNumbers.push('...');
                pageNumbers.push(safeTotalPages);
            } else if (safeCurrentPage >= safeTotalPages - 2) {
                pageNumbers.push(1);
                pageNumbers.push('...');
                for (let i = safeTotalPages - 3; i <= safeTotalPages; i++) {
                    pageNumbers.push(i);
                }
            } else {
                pageNumbers.push(1);
                pageNumbers.push('...');
                for (let i = safeCurrentPage - 1; i <= safeCurrentPage + 1; i++) {
                    pageNumbers.push(i);
                }
                pageNumbers.push('...');
                pageNumbers.push(safeTotalPages);
            }
        }

        return pageNumbers;
    };

    const pageNumbers = getPageNumbers();

    if (safeTotalPages <= 1) {
        return null; // Ne pas afficher la pagination s'il n'y a qu'une seule page
    }

    return (
        <div
            className={`flex flex-wrap items-center justify-center gap-2 ${sticky ? 'fixed bottom-0 z-10 w-full bg-white py-4' : ''} ${className}`}
        >
            <button
                onClick={() => onPageChange(safeCurrentPage - 1)}
                disabled={safeCurrentPage === 1}
                className="inline-flex h-9 items-center justify-center rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-50"
                aria-label="Page précédente"
            >
                <ChevronLeft className="h-4 w-4" />
                <span className="ml-1">Précédent</span>
            </button>

            <div className="flex items-center gap-1">
                {pageNumbers.map((number, index) => (
                    <button
                        key={index}
                        onClick={() => typeof number === 'number' && onPageChange(number)}
                        disabled={number === '...'}
                        className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md border text-sm font-medium ${
                            number === safeCurrentPage
                                ? 'border-primary bg-primary text-white'
                                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        } ${number === '...' ? 'pointer-events-none cursor-default' : ''}`}
                        aria-label={typeof number === 'number' ? `Page ${number}` : 'Plus de pages'}
                        aria-current={number === safeCurrentPage ? 'page' : undefined}
                    >
                        {number}
                    </button>
                ))}
            </div>

            <button
                onClick={() => onPageChange(safeCurrentPage + 1)}
                disabled={safeCurrentPage === safeTotalPages}
                className="inline-flex h-9 items-center justify-center rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-50"
                aria-label="Page suivante"
            >
                <span className="mr-1">Suivant</span>
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
};
