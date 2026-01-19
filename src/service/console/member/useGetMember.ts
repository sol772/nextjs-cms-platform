import { useQuery } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

// 회원 상세 조회
export const useGetMember = (idx: string, options: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ["memberDetail", idx],
        queryFn: async () => {
            const res = await consoleAxios.get(CONSOLE_API_ROUTES.MEMBER.GET_DETAIL.replace(":idx", idx));
            return res.data;
        },
        enabled: options.enabled,
    });
};
