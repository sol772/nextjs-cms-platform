import { useQuery } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

// 유지보수 상세 조회
export const useGetMaint = (
    category: string,
    listNo: string,
    options: { enabled?: boolean }
) => {
    return useQuery({
        queryKey: ["maintDetail", category, listNo],
        queryFn: async () => {
            const res = await consoleAxios.get(
                `${CONSOLE_API_ROUTES.MAINTENANCE.GET_DETAIL.replace(":category", category).replace(":list_no", listNo)}`,
            );
            return res.data;
        },
        enabled: options.enabled,
        retry: (failureCount, error) => {
            // 404 에러는 재시도하지 않음 (유지보수 게시글 없을때)
            if ((error as { response?: { status?: number } })?.response?.status === 404) {
                return false;
            }
            // 다른 에러는 최대 3번(기본값)까지 재시도
            return failureCount < 3;
        },
    });
};

