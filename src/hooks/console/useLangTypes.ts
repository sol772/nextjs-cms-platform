import { useSiteStore } from "@/store/common/useSiteStore";

export const useLangTypes = () => {
    const { siteLanguages } = useSiteStore();
    const langTypes = siteLanguages.map(lang => lang.site_lang);
    const initialLang = langTypes[0];

    return { langTypes, initialLang };
};