import { useMutation } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

interface body {
    idx: (number | string)[];
}

// 댓글 삭제
export const useDelComment = () => {
    return useMutation({
        mutationFn: async (body: body) => {
            const res = await consoleAxios.delete(CONSOLE_API_ROUTES.COMMENT.DELETE, {
                data: body,
            });
            return res.data;
        },
    });
};
