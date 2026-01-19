import { useQuery } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

// 팝업 상세 조회
export const useGetPopup = (idx: string, options: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ["popupDetail", idx],
        queryFn: async () => {
            const res = await consoleAxios.get(CONSOLE_API_ROUTES.POPUP.GET_DETAIL.replace(":idx", idx));
            return res.data;
        },
        enabled: options.enabled,
    });
};
