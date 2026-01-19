import { useQuery } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

// 전체 통계 조회
export const useGetAllStatistics = () => {
    return useQuery({
        queryKey: ["allStatistics"],
        queryFn: async () => {
            const res = await consoleAxios.get(CONSOLE_API_ROUTES.STATISTICS.GET_ALL);
            return res.data;
        },
    });
};
