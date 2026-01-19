import { useQuery } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

// 운영정책 목록 조회
export const useGetPolicyList = (
    limit: string,
    page: string,
    p_lang: string,
    searchtxt?: string,
) => {
    return useQuery({
        queryKey: ["policyList", limit, page, p_lang, searchtxt],
        queryFn: async () => {
            const res = await consoleAxios.get(
                `${CONSOLE_API_ROUTES.POLICY.CRUD}?limit=${limit}&page=${page}&search=titlecontents&p_lang=${p_lang}${searchtxt ? `&searchtxt=${searchtxt}` : ""}`,
            );
            return res.data;
        },
    });
};

