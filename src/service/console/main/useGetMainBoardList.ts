import { useQuery } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

// 메인 최근 게시판 조회
export const useGetMainBoardList = () => {
    return useQuery({
        queryKey: ["mainBoardList"],
        queryFn: async () => {
            const res = await consoleAxios.get(CONSOLE_API_ROUTES.MAIN_BOARD_LIST.replace(":limit","5"));
            return res.data;
        },
    });
};
