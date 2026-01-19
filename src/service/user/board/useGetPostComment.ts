import { useQuery } from "@tanstack/react-query";

import { COMMON_API_ROUTES } from "@/config/apiConfig";
import userAxios from "@/service/axios/userAxios";

// 게시글 댓글 조회
export const useGetPostComment = (
    category: string,
    boardIdx: string,
    options: { enabled: boolean },
) => {
    return useQuery({
        queryKey: ["postCommentList", category, boardIdx],
        queryFn: async () => {
            const res = await userAxios.get(
                `${COMMON_API_ROUTES.POST_COMMENT.GET.replace(":category", category).replace(":board_idx", boardIdx)}`,
            );
            return res.data;
        },
        enabled: options.enabled,
    });
};

