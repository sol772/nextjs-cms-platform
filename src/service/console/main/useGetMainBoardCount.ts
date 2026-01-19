import { useQuery } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

// 메인 최근 게시글 정보 조회
export const useGetMainBoardCount = () => {
    return useQuery({
        queryKey: ["mainBoardCount"],
        queryFn: async () => {
            const res = await consoleAxios.get(CONSOLE_API_ROUTES.MAIN_BOARD_COUNT);
            return res.data;
        },
    });
};
