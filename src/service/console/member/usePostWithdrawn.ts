import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

interface body {
    id: (string | number)[];
}

// 탈퇴회원정보 영구삭제
export const usePostWithdrawn = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (body: body) => {
            const res = await consoleAxios.post(CONSOLE_API_ROUTES.MEMBER.BASE_WITHDRAWN, body);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["withdrawnList"],
            });
        },
    });
};
