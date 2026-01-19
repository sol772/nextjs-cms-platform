/**
 * Jest 셋업 파일
 * 모든 테스트 파일 실행 전에 한 번 실행됩니다.
 */

import "@testing-library/jest-dom";

// ============================================================================
// 환경 변수 모킹
// ============================================================================

process.env.NEXT_PUBLIC_API_URL = "https://test-api.example.com";
process.env.NEXT_PUBLIC_SITE_ID = "test-site";
process.env.NEXT_PUBLIC_MAINT_NAME = "테스트 사이트";
process.env.NEXT_PUBLIC_ENCRYPTION_KEY = "test-encryption-key";
process.env.NEXT_PUBLIC_BASE_URL = "https://test.example.com";

// ============================================================================
// 글로벌 모킹
// ============================================================================

// window.matchMedia 모킹
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// IntersectionObserver 모킹
global.IntersectionObserver = class IntersectionObserver {
    constructor(callback) {
        this.callback = callback;
    }
    observe() {
        return null;
    }
    unobserve() {
        return null;
    }
    disconnect() {
        return null;
    }
};

// ResizeObserver 모킹
global.ResizeObserver = class ResizeObserver {
    constructor(callback) {
        this.callback = callback;
    }
    observe() {
        return null;
    }
    unobserve() {
        return null;
    }
    disconnect() {
        return null;
    }
};

// scrollTo 모킹
window.scrollTo = jest.fn();

// localStorage 모킹
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
});

// sessionStorage 모킹
const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, "sessionStorage", {
    value: sessionStorageMock,
});

// ============================================================================
// console 에러 필터링 (선택적)
// ============================================================================

// React 18의 특정 경고 메시지 무시 (필요시 주석 해제)
// const originalError = console.error;
// beforeAll(() => {
//     console.error = (...args) => {
//         if (
//             typeof args[0] === "string" &&
//             args[0].includes("Warning: ReactDOM.render is no longer supported")
//         ) {
//             return;
//         }
//         originalError.call(console, ...args);
//     };
// });
// afterAll(() => {
//     console.error = originalError;
// });

// ============================================================================
// 테스트 유틸리티
// ============================================================================

/**
 * 비동기 작업을 기다리는 헬퍼 함수
 */
global.waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * 모킹된 fetch 응답 생성 헬퍼
 */
global.createMockResponse = (data, status = 200) =>
    Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(data),
        text: () => Promise.resolve(JSON.stringify(data)),
    });
