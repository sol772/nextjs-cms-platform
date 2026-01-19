import { useQuery } from "@tanstack/react-query";

import { COMMON_API_ROUTES } from "@/config/apiConfig";
import userAxios from "@/service/axios/userAxios";

// 게시글 첨부파일 다운로드
export const useGetPostFileDownload = (category: string, board_idx: string, idx: string) => {
    return useQuery({
        queryKey: ["postFile", category, board_idx, idx],
        queryFn: async () => {
            const res = await userAxios.get(
                `${COMMON_API_ROUTES.POST_FILE.DOWNLOAD.replace(":category", category).replace(":parent_idx", board_idx).replace(":idx", idx)}`,
                { responseType: "blob" }, // 요청 데이터 형식을 blob으로 설정
            );
            return res;
        },
        enabled: !!idx, // idx가 있을 때만 실행
    });
};
