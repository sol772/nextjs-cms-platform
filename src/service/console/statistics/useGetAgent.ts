import { useQuery } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

// 최다 브라우저 조회
export const useGetAgent = (options: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ["siteAgentList"],
        queryFn: async () => {
            const res = await consoleAxios.get(CONSOLE_API_ROUTES.STATISTICS.GET_AGENT);
            return res.data;
        },
        enabled: options.enabled,
    });
};
