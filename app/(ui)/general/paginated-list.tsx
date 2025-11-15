'use client'

import { ReactNode } from 'react';
import { usePagination } from '@/lib/utils/use-pagination';
import Pagination from '@/app/(ui)/general/pagination';

interface PaginatedListProps<T> {
    items: T[];
    itemsPerPage: number;
    renderItem: (item: T) => ReactNode;
    containerClassName?: string;
}

export function PaginatedList<T extends { [key: string]: any }>({
                                                                    items,
                                                                    itemsPerPage,
                                                                    renderItem,
                                                                    containerClassName = 'flex flex-col gap-4'
                                                                }: PaginatedListProps<T>) {
    const {
        currentPage,
        totalPages,
        startIndex,
        endIndex,
        handlePageChange
    } = usePagination({
        itemsPerPage,
        totalItems: items.length
    });

    const currentItems = items.slice(startIndex, endIndex);

    return (
        <div className="w-full flex flex-col pb-6">
            <div className={containerClassName}>
                {currentItems.map(renderItem)}
            </div>

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChangeAction={handlePageChange}
                />
            )}
        </div>
    );
}
