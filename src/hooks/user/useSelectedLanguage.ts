import { useLocale } from "next-intl";

import { DEFAULT_LANGUAGE, LANGUAGES } from "@/constants/common/site";

/**
 * 현재 locale을 기반으로 선택된 언어 코드를 반환하는 hook
 * @returns {string} 선택된 언어 코드 (KR, EN, JP, CH)
 */
export const useSelectedLanguage = (): string => {
    const currentLocale = useLocale();
    const currentLanguage = LANGUAGES.find(lang => lang.locale === currentLocale);
    return currentLanguage?.code || DEFAULT_LANGUAGE;
};

