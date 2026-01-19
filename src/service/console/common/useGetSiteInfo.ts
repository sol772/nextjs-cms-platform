import { useQuery } from "@tanstack/react-query";

import { COMMON_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

// 사이트 정보 조회
export const useGetSiteInfo = (siteId: string, cLang: string, options: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ["siteInfo", siteId, cLang],
        queryFn: async () => {
            const res = await consoleAxios.get(COMMON_API_ROUTES.GET_SITE_INFO.replace(":site_id", siteId).replace(":c_lang", cLang));
            return res.data;
        },
        enabled: options.enabled,
    });
};
