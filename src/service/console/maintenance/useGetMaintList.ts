import { useQuery } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

// 유지보수 목록 조회
export const useGetMaintList = (
    category: string,
    limit: string,
    page: string,
    options: { enabled?: boolean },
    searchtxt?: string,
) => {
    return useQuery({
        queryKey: ["maintList", category, limit, page, searchtxt],
        queryFn: async () => {
            const res = await consoleAxios.get(
                `${CONSOLE_API_ROUTES.MAINTENANCE.GET_LIST.replace(":category", category)}?limit=${limit}&page=${page}&search=titlecontents${searchtxt ? `&searchtxt=${searchtxt}` : ""}`,
            );
            return res.data;
        },
        enabled: options.enabled,
    });
};

