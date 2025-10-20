'use client'

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    const getVisiblePages = () => {
        if (totalPages <= 7) return pages;

        if (currentPage <= 4) {
            return [...pages.slice(0, 5), '...', totalPages];
        }

        if (currentPage >= totalPages - 3) {
            return [1, '...', ...pages.slice(totalPages - 5)];
        }

        return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    };

    return (
        <div className="flex justify-center items-center gap-2 mt-8">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
                Previous
            </button>

            {getVisiblePages().map((page, index) => (
                typeof page === 'number' ? (
                    <button
                        key={index}
                        onClick={() => onPageChange(page)}
                        className={`px-4 py-2 rounded-lg ${
                            currentPage === page
                                ? 'bg-blue-500 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        {page}
                    </button>
                ) : (
                    <span key={index} className="px-2">...</span>
                )
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
                Next
            </button>
        </div>
    );
}
