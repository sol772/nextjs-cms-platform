const nextJest = require("next/jest");

const createJestConfig = nextJest({
    // Next.js 앱 루트 경로
    dir: "./",
});

/** @type {import('jest').Config} */
const customJestConfig = {
    // 테스트 환경 설정
    testEnvironment: "jsdom",

    // 테스트 파일 패턴
    testMatch: [
        "**/__tests__/**/*.[jt]s?(x)",
        "**/?(*.)+(spec|test).[jt]s?(x)",
    ],

    // 제외할 경로
    testPathIgnorePatterns: [
        "/node_modules/",
        "/.next/",
    ],

    // 모듈 경로 별칭 (tsconfig.json의 paths와 동일하게)
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
    },

    // 셋업 파일
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

    // 커버리지 설정
    collectCoverageFrom: [
        "src/**/*.{js,jsx,ts,tsx}",
        "!src/**/*.d.ts",
        "!src/**/*.stories.{js,jsx,ts,tsx}",
        "!src/app/**/*.{js,jsx,ts,tsx}",
        "!**/node_modules/**",
    ],

    // 커버리지 임계값
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50,
        },
    },

    // 변환 제외 패턴
    transformIgnorePatterns: [
        "/node_modules/",
        "^.+\\.module\\.(css|sass|scss)$",
    ],

    // 타임아웃 설정
    testTimeout: 10000,

    // 상세 출력
    verbose: true,
};

module.exports = createJestConfig(customJestConfig);
