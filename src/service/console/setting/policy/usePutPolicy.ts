import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

interface body {
    idx: number;
    p_title: string;
    p_contents: string;
    p_contents_type: string;
    p_use_yn: string;
}

// 운영정책 상세 변경
export const usePutPolicy = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (body: body) => {
            const res = await consoleAxios.put(CONSOLE_API_ROUTES.POLICY.CRUD, body);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["policyList"],
            });
        },
    });
};
