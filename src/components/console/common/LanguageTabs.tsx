import { twMerge } from "tailwind-merge";

import { useSiteStore } from "@/store/common/useSiteStore";

interface LanguageTabsProps {
    activeLang: string;
    handleLanguageChange: (lang: string) => void;
}

export default function LanguageTabs({ activeLang, handleLanguageChange }: LanguageTabsProps) {
    const { siteLanguages } = useSiteStore();
    const liStyle =
        "flex-1 text-[#9F9FA5] font-[500] text-center py-[12px] px-[5px] bg-[#E7EAF3] rounded-t-[8px] cursor-pointer";
    const liOnStyle = twMerge(liStyle, "active !shadow-none bg-[#060606] text-white");

    // siteLanguages가 없거나 빈 배열인 경우 처리
    if (!siteLanguages || siteLanguages.length === 0) {
        return null;
    }

    // 언어 이름 목록 생성
    const languageNames = siteLanguages.map(lang => lang.site_lang_hangul);

    // 현재 선택된 언어의 인덱스 찾기
    const activeIdx = siteLanguages.findIndex(lang => lang?.site_lang === activeLang);

    const handleClick = (idx: number) => {
        const selectedLang = siteLanguages[idx];
        if (selectedLang?.site_lang) {
            handleLanguageChange(selectedLang.site_lang);
        }
    };

    return (
        <>
            {languageNames.length > 1 && (
                <ul className="flex">
                    {languageNames.map((tab, i) => (
                        <li
                            key={`tab_${i}`}
                            className={activeIdx === i ? liOnStyle : liStyle}
                            style={{ boxShadow: "inset 0px -4px 4px rgba(0, 0, 0, 0.04)" }}
                            onClick={() => handleClick(i)}
                        >
                            {tab}
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}
