import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

interface body {
    id: number;
    g_name: string;
}

// 게시판 분류 수정
export const usePutBoardGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (body: body) => {
            const formData = new FormData();

            Object.entries(body).forEach(([key, value]) => {
                formData.append(key, value);
            });

            const res = await consoleAxios.put(CONSOLE_API_ROUTES.CATEGORY.CRUD_BOARD_GROUP, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["boardGroupList"],
            });
            queryClient.invalidateQueries({
                queryKey: ["postGroupList"],
            });
            queryClient.invalidateQueries({
                queryKey: ["postList"],
            });
        },
    });
};
