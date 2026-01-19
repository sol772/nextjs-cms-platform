import { useQuery } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

// 최다 접속 경로 조회
export const useGetUrl = (options: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ["siteUrlList"],
        queryFn: async () => {
            const res = await consoleAxios.get(CONSOLE_API_ROUTES.STATISTICS.GET_URL);
            return res.data;
        },
        enabled: options.enabled,
    });
};
