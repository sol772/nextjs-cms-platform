import { useMutation, useQueryClient } from "@tanstack/react-query";

import { COMMON_API_ROUTES } from "@/config/apiConfig";
import userAxios from "@/service/axios/userAxios";

interface body {
    idx: (string | number)[];
    category: number;
    pass: string;
}

// 게시글 삭제
export const useDelPost = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (body: body) => {
            const res = await userAxios.delete(COMMON_API_ROUTES.POST.CRUD, {
                data: body,
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["postList"],
            });
        },
    });
};
