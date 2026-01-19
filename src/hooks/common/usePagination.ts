"use client";

import { useCallback, useEffect, useState } from "react";

interface UsePaginationProps {
    totalPages: number;
    initialPage?: number;
}

export const usePagination = ({ totalPages, initialPage = 1 }: UsePaginationProps) => {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const maxPagesToShow = 5;

    const getPages = useCallback(
        (page: number) => {
            let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
            const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

            if (endPage - startPage + 1 < maxPagesToShow) {
                startPage = Math.max(1, endPage - maxPagesToShow + 1);
            }

            return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
        },
        [totalPages],
    );

    // 초기값을 현재 페이지 기준으로 설정
    const [pages, setPages] = useState<number[]>(getPages(currentPage));

    // currentPage가 변경될 때 pages 업데이트
    useEffect(() => {
        setPages(getPages(currentPage));
    }, [currentPage, getPages]);

    // 페이지변경함수
    const handleChangePage = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    return {
        currentPage,
        setCurrentPage,
        pages,
        handleChangePage,
    };
};
