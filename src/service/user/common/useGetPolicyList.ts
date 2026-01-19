import { useQuery } from "@tanstack/react-query";

import { USER_API_ROUTES } from "@/config/apiConfig";
import userAxios from "@/service/axios/userAxios";

// 운영정책 목록 조회 (현재경로 헤더 추가)
export const useGetPolicyList = (lang: string, pathname: string, options: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ["policyList", lang, pathname],
        queryFn: async () => {
            // 현재 경로를 헤더에 추가
            const headers: Record<string, string> = {};
            if (pathname) {
                headers["x-react-route"] = pathname;
            }

            const res = await userAxios.get(`${USER_API_ROUTES.POLICY.GET_LIST}?p_lang=${lang}`, { headers });
            return res.data;
        },
        enabled: options.enabled,
    });
};
