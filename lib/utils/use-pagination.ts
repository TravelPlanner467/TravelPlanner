'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface UsePaginationProps {
    itemsPerPage: number;
    totalItems: number;
}

export function usePagination({ itemsPerPage, totalItems }: UsePaginationProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentPage = Number(searchParams.get('page')) || 1;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        router.push(`${pathname}?${params.toString()}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return {
        currentPage,
        totalPages,
        startIndex,
        endIndex,
        handlePageChange,
    };
}
