import { useMutation } from "@tanstack/react-query";

import { COMMON_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

interface body {
    idx: number[];
}

// 게시글 첨부파일 영구삭제
export const useDelPostFile = () => {
    return useMutation({
        mutationFn: async (body: body) => {
            const res = await consoleAxios.delete(COMMON_API_ROUTES.POST_FILE.DELETE, {
                data: body,
            });
            return res.data;
        },
    });
};
