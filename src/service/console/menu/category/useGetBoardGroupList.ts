import { useQuery } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

// 게시판 분류 리스트 조회
export const useGetBoardGroupList = (parent_id: string, options: { enabled: boolean; key?: string }) => {
    return useQuery({
        queryKey: ["boardGroupList", parent_id, options.key],
        queryFn: async () => {
            const res = await consoleAxios.get(`${CONSOLE_API_ROUTES.CATEGORY.GET_BOARD_GROUP.replace(":parent_id", parent_id)}`);
            return res.data;
        },
        enabled: options.enabled,
    });
};
