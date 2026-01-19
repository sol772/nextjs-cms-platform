import { useQuery } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

// 유지보수 댓글 조회
export const useGetMaintComment = (
    listNo: string,
    options: { enabled?: boolean }
) => {
    return useQuery({
        queryKey: ["maintComment", listNo],
        queryFn: async () => {
            const res = await consoleAxios.get(
                `${CONSOLE_API_ROUTES.MAINTENANCE.GET_COMMENT.replace(":list_no", listNo)}`,
            );
            return res.data;
        },
        enabled: options.enabled,
    });
};

