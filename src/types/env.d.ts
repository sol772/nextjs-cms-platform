/**
 * 환경 변수 타입 정의
 * Next.js에서 사용하는 환경 변수의 타입을 정의합니다.
 */

declare namespace NodeJS {
    interface ProcessEnv {
        /** API 서버 URL */
        NEXT_PUBLIC_API_URL: string;

        /** 사이트 ID */
        NEXT_PUBLIC_SITE_ID: string;

        /** 사이트 이름 (유지보수용) */
        NEXT_PUBLIC_MAINT_NAME: string;

        /** 토큰 암호화 키 */
        NEXT_PUBLIC_ENCRYPTION_KEY: string;

        /** 사이트 기본 URL */
        NEXT_PUBLIC_BASE_URL: string;

        /** Node 환경 */
        NODE_ENV: "development" | "production" | "test";
    }
}
