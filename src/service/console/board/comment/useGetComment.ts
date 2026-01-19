import { useQuery } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

// 댓글관리 목록 조회
export const useGetComment = (
    limit: string,
    page: string,
    search?: string,
    searchtxt?: string,
) => {
    return useQuery({
        queryKey: ["commentList", limit, page, search, searchtxt],
        queryFn: async () => {
            const res = await consoleAxios.get(`${CONSOLE_API_ROUTES.COMMENT.GET.replace(":getLimit", limit)}?page=${page}${search ? `&search=${search}` : ""}${searchtxt ? `&searchtxt=${searchtxt}` : ""}`);
            return res.data;
        },
    });
};