// 언어 기본값
export const DEFAULT_LANGUAGE = "KR";

export interface Language {
    code: "KR" | "EN" | "JP" | "CH";
    locale: "ko" | "en" | "ja" | "zh";
}

export const LANGUAGES: Language[] = [
    { code: "KR", locale: "ko" },
    { code: "EN", locale: "en" },
    { code: "JP", locale: "ja" },
    { code: "CH", locale: "zh" },
];

// 사이트 아이디
export const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || "example";