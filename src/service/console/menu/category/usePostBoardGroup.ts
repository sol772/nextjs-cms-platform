import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

interface body {
    parent_id: number;
    g_name: string;
    use_yn: string;
}

// 게시판 분류 등록
export const usePostBoardGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (body: body) => {
            const formData = new FormData();

            Object.entries(body).forEach(([key, value]) => {
                formData.append(key, value);
            });

            const res = await consoleAxios.post(CONSOLE_API_ROUTES.CATEGORY.CRUD_BOARD_GROUP, formData, {
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
        },
    });
};
