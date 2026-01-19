import { useQuery } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

// 게시판메뉴 목록 조회
export const useGetBoardMenu = (options: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ["boardMenu"],
        queryFn: async () => {
            const res = await consoleAxios.get(CONSOLE_API_ROUTES.BOARD_MENU);
            return res.data;
        },
        enabled: options.enabled,
    });
};
