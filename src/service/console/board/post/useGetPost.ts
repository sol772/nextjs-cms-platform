import { useQuery } from "@tanstack/react-query";

import { COMMON_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

// 게시글 상세 조회
export const useGetPost = (category: string, idx: string, pass: string, options: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ["postDetail", category, idx, pass],
        queryFn: async () => {
            const res = await consoleAxios.get(`${COMMON_API_ROUTES.POST.GET_DETAIL.replace(":category", category).replace(":idx", idx)}?pass=${pass}`);
            return res.data;
        },
        enabled: options.enabled,
        retry: (failureCount, error) => {
            // 404 에러는 재시도하지 않음 (게시글 없을때)
            if ((error as { response?: { status?: number } })?.response?.status === 404) {
                return false;
            }
            // 다른 에러는 최대 3번(기본값)까지 재시도
            return failureCount < 3;
        },
    });
};
