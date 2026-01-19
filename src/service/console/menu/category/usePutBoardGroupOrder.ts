import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

interface body {
    id: number;
    parent_id: number;
    g_num: number;
}

// 게시판 분류 순서 변경
export const usePutBoardGroupOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (body: body) => {
            const res = await consoleAxios.put(CONSOLE_API_ROUTES.CATEGORY.PUT_BOARD_GROUP_ORDER, body);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["boardGroupList"],
            });
            queryClient.invalidateQueries({
                queryKey: ["postGroupList"],
            });
        },
    });
};
