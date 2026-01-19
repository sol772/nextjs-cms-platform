import { useQuery } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

// 통계 차트 조회
export const useGetChart = (start: string, end: string, type: string) => {
    return useQuery({
        queryKey: ["statisticsChart", start, end, type],
        queryFn: async () => {
            const res = await consoleAxios.get(`${CONSOLE_API_ROUTES.STATISTICS.GET_CHART}?start=${start}&end=${end}&type=${type}`);
            return res.data;
        },
    });
};
