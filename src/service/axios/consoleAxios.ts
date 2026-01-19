import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import { API_URL, COMMON_API_ROUTES } from "@/config/apiConfig";
import { ApiError, ApiErrorCode, getDefaultErrorMessage } from "@/lib/errors";
import { useAuthStore } from "@/store/common/useAuthStore";
import { usePopupStore } from "@/store/console/usePopupStore";

/**
 * 관리자단 API 호출을 위한 Axios 인스턴스
 */
const consoleAxios = axios.create({
    baseURL: API_URL,
});

/**
 * 토큰 갱신 전용 Axios 인스턴스
 * 무한 루프 방지를 위해 별도 인스턴스 사용
 */
const refreshAxios = axios.create({ baseURL: API_URL });

// 토큰 갱신 상태 관리
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

/**
 * 토큰 갱신 완료 시 대기 중인 요청들에게 알림
 */
const onRefreshed = (token: string) => {
    refreshSubscribers.forEach(callback => callback(token));
    refreshSubscribers = [];
};

/**
 * 토큰 갱신 대기 프로미스 추가
 */
const addRefreshSubscriber = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback);
};

/**
 * 로그인 페이지로 리다이렉트
 */
const redirectToLogin = () => {
    if (typeof window !== "undefined") {
        window.location.href = "/console/login";
    }
};

/**
 * 에러 처리를 건너뛸지 확인
 */
const shouldSkipErrorHandling = (config?: InternalAxiosRequestConfig): boolean => {
    return config?.headers?.["x-skip-error-handling"] === true ||
           config?.headers?.["x-skip-error-handling"] === "true";
};

// ============================================================================
// 요청 인터셉터
// ============================================================================

consoleAxios.interceptors.request.use(
    config => {
        const { loginUser, clearUser } = useAuthStore.getState();

        if (loginUser.accessToken) {
            config.headers["Authorization"] = `Bearer ${loginUser.accessToken}`;
        } else {
            clearUser();
            redirectToLogin();
        }

        return config;
    },
    error => Promise.reject(ApiError.fromAxiosError(error)),
);

// ============================================================================
// 응답 인터셉터
// ============================================================================

consoleAxios.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
        const { setConfirmPop } = usePopupStore.getState();
        const { loginUser, setUser, clearUser } = useAuthStore.getState();
        const originalRequest = error.config;
        const status = error.response?.status;

        // 401 Unauthorized: 토큰 갱신 시도
        if (status === ApiErrorCode.UNAUTHORIZED && originalRequest) {
            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    const { data } = await refreshAxios.post(COMMON_API_ROUTES.REFRESH_TOKEN, {
                        refresh_token: loginUser.refreshToken,
                    });
                    const { m_level, accessToken, refreshToken } = data.data;

                    // 관리자 회원(m_level === 9)일 때만 토큰 갱신
                    if (m_level === 9) {
                        setUser({
                            ...loginUser,
                            accessToken,
                            refreshToken,
                        });
                        onRefreshed(accessToken);
                        isRefreshing = false;

                        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
                        return consoleAxios(originalRequest);
                    } else {
                        clearUser();
                        redirectToLogin();
                        return Promise.reject(
                            new ApiError(ApiErrorCode.FORBIDDEN, "관리자 권한이 필요합니다."),
                        );
                    }
                } catch (refreshError) {
                    isRefreshing = false;
                    refreshSubscribers = [];
                    clearUser();
                    redirectToLogin();
                    return Promise.reject(ApiError.fromAxiosError(refreshError));
                }
            } else {
                // 토큰 갱신 중이면 대기
                return new Promise(resolve => {
                    addRefreshSubscriber((token: string) => {
                        if (originalRequest) {
                            originalRequest.headers["Authorization"] = `Bearer ${token}`;
                            resolve(consoleAxios(originalRequest));
                        }
                    });
                });
            }
        }

        // ApiError로 변환
        const apiError = ApiError.fromAxiosError(error);

        // 에러 처리 건너뛰기 확인
        if (shouldSkipErrorHandling(originalRequest)) {
            return Promise.reject(apiError);
        }

        // 404 Not Found: 개별 처리 (팝업 표시 안 함)
        if (status === ApiErrorCode.NOT_FOUND) {
            return Promise.reject(apiError);
        }

        // 409 Conflict: 헤더로 개별 처리 허용
        if (status === ApiErrorCode.CONFLICT && originalRequest?.headers?.["X-Handle-409"] === "true") {
            return Promise.reject(apiError);
        }

        // 403 Forbidden: 권한 없음
        if (status === ApiErrorCode.FORBIDDEN) {
            setConfirmPop(true, apiError.message || getDefaultErrorMessage(ApiErrorCode.FORBIDDEN), 1);
            return Promise.reject(apiError);
        }

        // 500 Internal Server Error: 서버 오류
        if (status === ApiErrorCode.INTERNAL_SERVER_ERROR) {
            setConfirmPop(true, getDefaultErrorMessage(ApiErrorCode.INTERNAL_SERVER_ERROR), 1);
            return Promise.reject(apiError);
        }

        // 기타 에러: 에러 메시지 팝업 표시
        setConfirmPop(true, apiError.message, 1);

        return Promise.reject(apiError);
    },
);

export default consoleAxios;