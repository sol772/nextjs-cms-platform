"use client";

import { notFound } from "next/navigation";
import { useEffect } from "react";

/**
 * 에러 발생 시 404 페이지로 리다이렉트하는 훅
 * @param errors - 체크할 에러 객체들 (하나라도 truthy면 notFound 실행)
 * @example
 * const { data, error } = useGetPost();
 * useNotFoundOnError(error);
 *
 * // 여러 에러 체크
 * useNotFoundOnError(getPostError, getCommentError);
 */
export const useNotFoundOnError = (...errors: unknown[]) => {
    useEffect(() => {
        const hasError = errors.some(error => error !== null && error !== undefined);
        if (hasError) {
            notFound();
        }
    }, [errors]);
};

