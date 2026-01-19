/**
 * 에러 처리 시스템
 * API 에러와 비즈니스 에러를 체계적으로 관리합니다.
 */

import axios, { AxiosError } from "axios";

// ============================================================================
// 에러 코드 정의
// ============================================================================

/**
 * HTTP 상태 코드 기반 API 에러 코드
 */
export enum ApiErrorCode {
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    UNPROCESSABLE_ENTITY = 422,
    INTERNAL_SERVER_ERROR = 500,
    SERVICE_UNAVAILABLE = 503,
}

/**
 * 비즈니스 로직 에러 코드
 */
export enum BusinessErrorCode {
    INVALID_PASSWORD = "INVALID_PASSWORD",
    DUPLICATE_EMAIL = "DUPLICATE_EMAIL",
    EXPIRED_TOKEN = "EXPIRED_TOKEN",
    INVALID_TOKEN = "INVALID_TOKEN",
    PERMISSION_DENIED = "PERMISSION_DENIED",
    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
    VALIDATION_FAILED = "VALIDATION_FAILED",
    FILE_UPLOAD_FAILED = "FILE_UPLOAD_FAILED",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
}

// ============================================================================
// 에러 클래스 정의
// ============================================================================

/**
 * API 에러 클래스
 * HTTP 요청 중 발생하는 에러를 처리합니다.
 */
export class ApiError extends Error {
    public readonly isApiError = true;

    constructor(
        public code: ApiErrorCode | number,
        public override message: string,
        public details?: Record<string, string[]>,
        public originalError?: AxiosError,
    ) {
        super(message);
        this.name = "ApiError";

        // ES5 환경에서 instanceof 체크를 위한 프로토타입 체인 설정
        Object.setPrototypeOf(this, ApiError.prototype);
    }

    /**
     * Axios 에러로부터 ApiError 인스턴스 생성
     */
    static fromAxiosError(error: unknown): ApiError {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status ?? ApiErrorCode.INTERNAL_SERVER_ERROR;
            const message = error.response?.data?.message ?? "알 수 없는 에러가 발생했습니다.";
            const details = error.response?.data?.details;

            return new ApiError(status, message, details, error);
        }

        if (error instanceof Error) {
            return new ApiError(ApiErrorCode.INTERNAL_SERVER_ERROR, error.message);
        }

        return new ApiError(ApiErrorCode.INTERNAL_SERVER_ERROR, "알 수 없는 에러가 발생했습니다.");
    }

    /**
     * 인증 관련 에러인지 확인
     */
    isAuthError(): boolean {
        return this.code === ApiErrorCode.UNAUTHORIZED || this.code === ApiErrorCode.FORBIDDEN;
    }

    /**
     * 재시도 가능한 에러인지 확인
     */
    isRetryable(): boolean {
        return (
            this.code === ApiErrorCode.INTERNAL_SERVER_ERROR ||
            this.code === ApiErrorCode.SERVICE_UNAVAILABLE
        );
    }

    /**
     * Not Found 에러인지 확인
     */
    isNotFound(): boolean {
        return this.code === ApiErrorCode.NOT_FOUND;
    }
}

/**
 * 비즈니스 에러 클래스
 * 비즈니스 로직에서 발생하는 에러를 처리합니다.
 */
export class BusinessError extends Error {
    public readonly isBusinessError = true;

    constructor(
        public code: BusinessErrorCode,
        public override message: string,
        public context?: Record<string, unknown>,
    ) {
        super(message);
        this.name = "BusinessError";

        Object.setPrototypeOf(this, BusinessError.prototype);
    }
}

/**
 * 유효성 검사 에러 클래스
 */
export class ValidationError extends Error {
    public readonly isValidationError = true;

    constructor(
        public override message: string,
        public fieldErrors: Record<string, string[]>,
    ) {
        super(message);
        this.name = "ValidationError";

        Object.setPrototypeOf(this, ValidationError.prototype);
    }

    /**
     * 특정 필드의 에러 메시지 조회
     */
    getFieldError(field: string): string | undefined {
        return this.fieldErrors[field]?.[0];
    }

    /**
     * 에러가 있는 필드 목록 조회
     */
    getErrorFields(): string[] {
        return Object.keys(this.fieldErrors);
    }
}

// ============================================================================
// 타입 가드 함수
// ============================================================================

/**
 * ApiError 인스턴스인지 확인
 */
export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError || (error as ApiError)?.isApiError === true;
}

/**
 * BusinessError 인스턴스인지 확인
 */
export function isBusinessError(error: unknown): error is BusinessError {
    return error instanceof BusinessError || (error as BusinessError)?.isBusinessError === true;
}

/**
 * ValidationError 인스턴스인지 확인
 */
export function isValidationError(error: unknown): error is ValidationError {
    return error instanceof ValidationError || (error as ValidationError)?.isValidationError === true;
}

/**
 * Axios 에러인지 확인
 */
export function isAxiosError(error: unknown): error is AxiosError {
    return axios.isAxiosError(error);
}

// ============================================================================
// 에러 메시지 헬퍼
// ============================================================================

/**
 * HTTP 상태 코드에 대한 기본 메시지
 */
export const DEFAULT_ERROR_MESSAGES: Record<number, string> = {
    [ApiErrorCode.BAD_REQUEST]: "잘못된 요청입니다.",
    [ApiErrorCode.UNAUTHORIZED]: "인증이 필요합니다.",
    [ApiErrorCode.FORBIDDEN]: "접근 권한이 없습니다.",
    [ApiErrorCode.NOT_FOUND]: "요청한 리소스를 찾을 수 없습니다.",
    [ApiErrorCode.CONFLICT]: "이미 존재하는 데이터입니다.",
    [ApiErrorCode.UNPROCESSABLE_ENTITY]: "처리할 수 없는 요청입니다.",
    [ApiErrorCode.INTERNAL_SERVER_ERROR]: "서버 오류가 발생했습니다.",
    [ApiErrorCode.SERVICE_UNAVAILABLE]: "서비스를 일시적으로 사용할 수 없습니다.",
};

/**
 * 에러 코드에 대한 기본 메시지 조회
 */
export function getDefaultErrorMessage(code: number): string {
    return DEFAULT_ERROR_MESSAGES[code] ?? "알 수 없는 에러가 발생했습니다.";
}

/**
 * 에러 객체에서 사용자에게 표시할 메시지 추출
 */
export function getErrorMessage(error: unknown): string {
    if (isApiError(error)) {
        return error.message;
    }

    if (isBusinessError(error)) {
        return error.message;
    }

    if (isValidationError(error)) {
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "알 수 없는 에러가 발생했습니다.";
}
