import { useQuery } from "@tanstack/react-query";

import { COMMON_API_ROUTES } from "@/config/apiConfig";
import userAxios from "@/service/axios/userAxios";

// 게시글 상세 조회
export const useGetPost = (category: string, idx: string, pass: string, options: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ["postDetail", category, idx, pass],
        queryFn: async () => {
            const res = await userAxios.get(`${COMMON_API_ROUTES.POST.GET_DETAIL.replace(":category", category).replace(":idx", idx)}?pass=${pass}`);
            return res.data;
        },
        enabled: options.enabled,
    });
};
