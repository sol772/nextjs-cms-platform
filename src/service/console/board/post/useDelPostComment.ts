import { useMutation, useQueryClient } from "@tanstack/react-query";

import { COMMON_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

interface body {
    category: number;
    idx: number;
}

// 게시글 댓글 삭제
export const useDelPostComment = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (body: body) => {
            const res = await consoleAxios.delete(COMMON_API_ROUTES.POST_COMMENT.CRUD, {
                data: body,
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["postCommentList"],
            });
            queryClient.invalidateQueries({
                queryKey: ["postDetail"],
            });
            queryClient.invalidateQueries({
                queryKey: ["postList"],
            });
        },
    });
};
