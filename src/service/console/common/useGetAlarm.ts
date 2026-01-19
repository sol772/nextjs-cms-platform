import { useQuery } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

// 알림 조회
export const useGetAlarm = (follow: string) => {
    return useQuery({
        queryKey: ["consoleAlarm", follow],
        queryFn: async () => {
            const res = await consoleAxios.get(CONSOLE_API_ROUTES.GET_ALARM.replace(":follow", follow));
            return res.data;
        },
    });
};
