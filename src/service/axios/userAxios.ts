import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import { API_URL, COMMON_API_ROUTES } from "@/config/apiConfig";
import { ApiError, ApiErrorCode, getDefaultErrorMessage } from "@/lib/errors";
import { useAuthStore } from "@/store/common/useAuthStore";
import { usePopupStore } from "@/store/user/usePopupStore";

/**
 * 사용자단 API 호출을 위한 Axios 인스턴스
 */
const userAxios = axios.create({
    baseURL: API_URL,
});

/**
 * 토큰 갱신 전용 Axios 인스턴스
 * 무한 루프 방지를 위해 별도 인스턴스 사용
 */
const refreshAxios = axios.create({ baseURL: API_URL });

// 활성 요청 수 추적 (디버깅/로딩 상태 용도)
let activeRequests = 0;

// 토큰 갱신 상태 관리
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

/**
 * 토큰 갱신 완료 시 대기 중인 요청들에게 알림
 */
const onRefreshed = (token: string) => {
    refreshSubscribers.forEach(cb => cb(token));
    refreshSubscribers = [];
};

/**
 * 토큰 갱신 대기 프로미스 추가
 */
const addRefreshSubscriber = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback);
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

userAxios.interceptors.request.use(
    config => {
        const { loginUser } = useAuthStore.getState();
        activeRequests++;

        if (loginUser.accessToken) {
            config.headers["Authorization"] = `Bearer ${loginUser.accessToken}`;
        }

        return config;
    },
    error => {
        activeRequests = Math.max(activeRequests - 1, 0);
        return Promise.reject(ApiError.fromAxiosError(error));
    },
);

// ============================================================================
// 응답 인터셉터
// ============================================================================

userAxios.interceptors.response.use(
    response => {
        activeRequests = Math.max(activeRequests - 1, 0);
        return response;
    },
    async (error: AxiosError) => {
        activeRequests = Math.max(activeRequests - 1, 0);

        const { setConfirmPop } = usePopupStore.getState();
        const { loginUser, setUser, clearUser } = useAuthStore.getState();
        const originalRequest = error.config;
        const status = error.response?.status;

        // 401 Unauthorized: 로그인 상태에서만 토큰 갱신 시도
        if (status === ApiErrorCode.UNAUTHORIZED && loginUser?.refreshToken && originalRequest) {
            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    const { data } = await refreshAxios.post(COMMON_API_ROUTES.REFRESH_TOKEN, {
                        refresh_token: loginUser.refreshToken,
                    });
                    const { accessToken, refreshToken } = data.data;

                    setUser({
                        ...loginUser,
                        accessToken,
                        refreshToken,
                    });
                    onRefreshed(accessToken);
                    isRefreshing = false;

                    originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
                    return userAxios(originalRequest);
                } catch (refreshError) {
                    // 갱신 실패 시 로그인 정보 제거 (리디렉션은 호출측에서 처리)
                    isRefreshing = false;
                    refreshSubscribers = [];
                    clearUser();
                    return Promise.reject(ApiError.fromAxiosError(refreshError));
                }
            } else {
                // 토큰 갱신 중이면 대기
                return new Promise(resolve => {
                    addRefreshSubscriber((token: string) => {
                        if (originalRequest) {
                            originalRequest.headers["Authorization"] = `Bearer ${token}`;
                            resolve(userAxios(originalRequest));
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

export default userAxios;
