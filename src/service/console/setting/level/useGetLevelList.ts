import { useQuery } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

// 회원등급 목록 조회
export const useGetLevelList = () => {
    return useQuery({
        queryKey: ["levelList"],
        queryFn: async () => {
            const res = await consoleAxios.get(CONSOLE_API_ROUTES.LEVEL.BASE);
            return res.data;
        },
    });
};
