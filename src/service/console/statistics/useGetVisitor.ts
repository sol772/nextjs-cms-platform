import { useQuery } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

// 접속자 이력 통계 조회
export const useGetVisitor = (page: string, start: string, end: string, searchTxt?: string) => {
    return useQuery({
        queryKey: ["statisticsVisitor", page, start, end, searchTxt],
        queryFn: async () => {
            const res = await consoleAxios.get(
                `${CONSOLE_API_ROUTES.STATISTICS.GET_VISITOR}?getPage=${page}&start=${start}&end=${end}${searchTxt ? `&searchTxt=${searchTxt}` : ""}`,
            );
            return res.data;
        },
    });
};
