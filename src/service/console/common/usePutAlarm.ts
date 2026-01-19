import { useMutation } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

interface body {
    follow: string;
    idx: number | string;
    flg: string;
}

// 알림 읽음처리 및 삭제
export const usePutAlarm = () => {
    return useMutation({
        mutationFn: async (body: body) => {
            const res = await consoleAxios.put(CONSOLE_API_ROUTES.PUT_ALARM, body);
            return res.data;
        },
    });
};
