import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

interface body {
    idx: (string | number)[];
    b_open: string;
}

// 배너 노출상태 변경
export const usePostBannerOpen = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (body: body) => {
            const res = await consoleAxios.post(CONSOLE_API_ROUTES.BANNER.POST_OPEN, body);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["bannerList"],
            });
            queryClient.invalidateQueries({
                queryKey: ["bannerDetail"],
            });
        },
    });
};
