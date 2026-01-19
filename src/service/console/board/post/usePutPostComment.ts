import { useMutation, useQueryClient } from "@tanstack/react-query";

import { COMMON_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

interface body {
    category: number;
    idx: number;
    c_contents: string;
}

// 댓글 수정
export const usePutPostComment = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (body: body) => {
            const res = await consoleAxios.put(COMMON_API_ROUTES.POST_COMMENT.CRUD, body);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["postCommentList"],
            });
        },
    });
};
