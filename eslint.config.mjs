import { FlatCompat } from "@eslint/eslintrc";
import tanstackQueryPlugin from "@tanstack/eslint-plugin-query";
import importPlugin from "eslint-plugin-import";
import simpleImportSortPlugin from "eslint-plugin-simple-import-sort";
import tailwindcssPlugin from "eslint-plugin-tailwindcss";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends(
        "next/core-web-vitals", // Next.js 웹 최적화 기본 규칙
        "plugin:@typescript-eslint/recommended", // TypeScript 관련 규칙
        "plugin:react-hooks/recommended", // React Hooks 사용 관련 경고
        "plugin:@tanstack/eslint-plugin-query/recommended", // TanStack Query 규칙 추가
    ),
    {
        plugins: {
            import: importPlugin,
            tailwindcss: tailwindcssPlugin,
            "@tanstack/eslint-plugin-query": tanstackQueryPlugin,
            "simple-import-sort": simpleImportSortPlugin,
        },
        rules: {
            "import/order": "off",
            // simple-import-sort 적용
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",
            "tailwindcss/classnames-order": "warn", // Tailwind CSS 클래스 정렬 경고
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }], // 사용하지 않는 변수 경고
            "react-hooks/exhaustive-deps": "warn", // useEffect 의존성 배열 검사
            "@tanstack/query/exhaustive-deps": "error", // useQuery/useMutation의 의존성 배열 검사
            "@tanstack/query/stable-query-client": "error", // queryClient 관련 안정성 검사
            "@tanstack/query/no-rest-destructuring": "warn", // queryKey는 구조 분해 할당하면 안됨
        },
        settings: {
            tailwindcss: {
                callees: ["cn"], // Tailwind 클래스를 merge할 때 사용하는 함수 설정 (예: clsx, classnames 등)
            },
        },
    },
];

export default eslintConfig;
