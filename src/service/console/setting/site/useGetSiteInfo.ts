import { useQuery } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

// 사이트정보 조회
export const useGetSiteInfo = (id: string, lang: string, options: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ["siteInfo", id, lang],
        queryFn: async () => {
            const res = await consoleAxios.get(`${CONSOLE_API_ROUTES.SITE.GET.replace(":site_id", id).replace(":c_lang", lang)}`);
            return res.data;
        },
        enabled: options.enabled,
    });
};
