import { useQuery } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

// 메인 최근 접속자 정보 조회
export const useGetConnectorCount = () => {
    return useQuery({
        queryKey: ["mainConnectorCount"],
        queryFn: async () => {
            const res = await consoleAxios.get(CONSOLE_API_ROUTES.MAIN_CONNECTOR_COUNT);
            return res.data;
        },
    });
};
