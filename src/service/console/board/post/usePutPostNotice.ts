import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

interface body {
    idx: (string | number)[];
    category: number;
    notice: string;
}

// 게시글 공지설정
export const usePutPostNotice = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (body: body) => {
            const res = await consoleAxios.put(CONSOLE_API_ROUTES.POST.PUT_NOTICE, body);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["postList"],
            });
            queryClient.invalidateQueries({
                queryKey: ["postDetail"],
            });
        },
    });
};
