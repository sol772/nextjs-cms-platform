import { useQuery } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

// 유지보수 첨부파일 다운로드
export const useGetMaintFileDownload = (list_no: string) => {
    return useQuery({
        queryKey: ["maintFile", list_no],
        queryFn: async () => {
            const res = await consoleAxios.get(
                `${CONSOLE_API_ROUTES.MAINTENANCE.GET_FILE.replace(":list_no", list_no)}`,
                { responseType: "blob" }, // 요청 데이터 형식을 blob으로 설정
            );
            return res;
        },
        enabled: !!list_no,
    });
};
