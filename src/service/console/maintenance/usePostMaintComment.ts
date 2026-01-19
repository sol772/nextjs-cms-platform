import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

interface body {
    c_content: string;
    c_name: string;
    c_password: string;
    c_table: string;
    list_no: number;
    m_id: string;
}

// 유지보수 댓글 등록
export const usePostMaintComment = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (body: body) => {
            const res = await consoleAxios.post(CONSOLE_API_ROUTES.MAINTENANCE.POST_COMMENT, body);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["maintComment"],
            });
        },
    });
};
