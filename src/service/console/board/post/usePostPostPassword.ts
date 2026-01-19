import { useMutation } from "@tanstack/react-query";

import { COMMON_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

interface body {
    idx: number | null;
    password: string;
}

// 게시글 비밀번호 확인
export const usePostPostPassword = () => {
    return useMutation({
        mutationFn: async (body: body) => {
            const res = await consoleAxios.post(COMMON_API_ROUTES.POST.POST_PASSWORD, body);
            return res.data;
        },
    });
};
