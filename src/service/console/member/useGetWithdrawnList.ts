import { useQuery } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

// 탈퇴회원 목록 조회
export const useGetWithdrawnList = (
    limit: string,
    page: string,
    search?: string,
    searchtxt?: string,
) => {
    return useQuery({
        queryKey: ["withdrawnList", limit, page, search, searchtxt],
        queryFn: async () => {
            const res = await consoleAxios.get(
                `${CONSOLE_API_ROUTES.MEMBER.BASE_WITHDRAWN}?getLimit=${limit}&page=${page}${search ? `&search=${search}` : ""}${searchtxt ? `&searchtxt=${searchtxt}` : ""}`,
            );
            return res.data;
        }
    });
};

