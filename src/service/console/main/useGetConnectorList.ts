import { useQuery } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

// 메인 접속자 이력 조회
export const useGetConnectorList = () => {
    return useQuery({
        queryKey: ["connectorList"],
        queryFn: async () => {
            const res = await consoleAxios.get(CONSOLE_API_ROUTES.MAIN_CONNECTOR_LIST.replace(":limit","5"));
            return res.data;
        },
    });
};
