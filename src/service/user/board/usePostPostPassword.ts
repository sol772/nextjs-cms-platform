import { useMutation } from "@tanstack/react-query";

import { COMMON_API_ROUTES } from "@/config/apiConfig";
import userAxios from "@/service/axios/userAxios";

interface body {
    idx: number | null;
    password: string;
}

// 게시글 비밀번호 확인
export const usePostPostPassword = () => {
    return useMutation({
        mutationFn: async (body: body) => {
            const res = await userAxios.post(COMMON_API_ROUTES.POST.POST_PASSWORD, body);
            return res.data;
        },
    });
};
