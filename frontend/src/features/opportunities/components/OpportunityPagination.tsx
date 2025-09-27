import { ChevronLeft, ChevronRight } from 'lucide-react';

interface OpportunityPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function OpportunityPagination({
    currentPage,
    totalPages,
    onPageChange,
}: OpportunityPaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="flex items-center justify-center gap-2 pt-6">
            <button
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <ChevronLeft size={16} />
                Précédent
            </button>

            <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`rounded-lg px-3 py-2 text-sm font-medium ${
                            currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        {page}
                    </button>
                ))}
            </div>

            <button
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
                Suivant
                <ChevronRight size={16} />
            </button>
        </div>
    );
}
