import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

interface body {
    idx: (string | number)[];
    p_open: string;
}

// 팝업 노출상태 변경
export const usePostPopupOpen = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (body: body) => {
            const res = await consoleAxios.post(CONSOLE_API_ROUTES.POPUP.POST_OPEN, body);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["popupList"],
            });
            queryClient.invalidateQueries({
                queryKey: ["popupDetail"],
            });
        },
    });
};
