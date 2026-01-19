import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

interface body {
    parent_id: number;
    id: (number | string)[];
    g_grade: string;
}

// 게시판 분류 상태 변경
export const usePutBoardGroupGrade = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (body: body) => {
            const res = await consoleAxios.put(CONSOLE_API_ROUTES.CATEGORY.PUT_BOARD_GROUP_GRADE, body);
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
