import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

interface body {
    idx: number;
    p_type: string;
    p_open: string;
    p_title: string;
    p_s_date: string;
    p_e_date: string;
    p_one_day: string;
    p_layer_pop: string;
    p_width_size: number;
    p_height_size: number;
    p_left_point: number | null;
    p_top_point: number | null;
    p_link_target: string;
    p_link_url: string;
    p_content: string;
    p_content_type: string;
    p_lang: string;
}

// 팝업 수정
export const usePutPopup = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (body: body) => {
            const res = await consoleAxios.put(CONSOLE_API_ROUTES.POPUP.CRUD, body);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["popupList"],
            });
        },
    });
};
