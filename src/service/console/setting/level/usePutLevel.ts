import { useMutation } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

interface body {
    l_name: string;
    l_level: number;
    signup_lv: string | null;
}

// 회원등급 수정
export const usePutLevel = () => {
    return useMutation({
        mutationFn: async (body: body) => {
            const res = await consoleAxios.put(CONSOLE_API_ROUTES.LEVEL.BASE, body);
            return res.data;
        },
    });
};
