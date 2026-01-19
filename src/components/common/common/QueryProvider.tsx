"use client";

import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { ApiErrorCode, isApiError } from "@/lib/errors";

/**
 * React Query 기본 설정
 * - Axios 인터셉터에서 이미 에러 팝업을 처리하므로, 여기서는 추가 처리 불필요
 * - 필요시 MutationCache의 onError에서 전역 에러 로깅 가능
 */
const createQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                // 기본 재시도 로직
                retry: (failureCount, error) => {
                    // ApiError인 경우 특정 상태 코드는 재시도하지 않음
                    if (isApiError(error)) {
                        const noRetryStatuses = [
                            ApiErrorCode.UNAUTHORIZED,
                            ApiErrorCode.FORBIDDEN,
                            ApiErrorCode.NOT_FOUND,
                            ApiErrorCode.UNPROCESSABLE_ENTITY,
                        ];
                        if (noRetryStatuses.includes(error.code as ApiErrorCode)) {
                            return false;
                        }
                    }
                    // 최대 3번 재시도
                    return failureCount < 3;
                },
                // 캐시 유지 시간 (5분)
                staleTime: 1000 * 60 * 5,
                // 에러 시 자동 리페치 비활성화
                refetchOnWindowFocus: false,
            },
            mutations: {
                // 뮤테이션 재시도 비활성화
                retry: false,
            },
        },
        // 전역 Mutation 에러 핸들링 (Axios 인터셉터와 별도로 로깅용)
        mutationCache: new MutationCache({
            onError: error => {
                // 개발 환경에서만 콘솔 로깅 (프로덕션에서는 Sentry 등으로 대체 가능)
                if (process.env.NODE_ENV === "development") {
                    console.error("[Mutation Error]", error);
                }
            },
        }),
    });

/**
 * React Query Provider 컴포넌트
 * 애플리케이션 전체에서 React Query 기능을 사용할 수 있게 합니다.
 */
export default function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => createQueryClient());

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
