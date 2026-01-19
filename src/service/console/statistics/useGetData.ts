import { useQuery } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

// 통계 데이터 조회
export const useGetData = (start: string, end: string) => {
    return useQuery({
        queryKey: ["statisticsData", start, end],
        queryFn: async () => {
            const res = await consoleAxios.get(`${CONSOLE_API_ROUTES.STATISTICS.GET_DATA}?start=${start}&end=${end}`);
            return res.data;
        },
    });
};
