import { useQuery } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

// cdn 파일 목록 조회
export const useGetCdnFileList = (
    limit: string,
    page: string,
    getFileKind: string,
    options: { enabled?: boolean },
    searchTxt?: string,
) => {
    return useQuery({
        queryKey: ["cdnFileList", limit, page, getFileKind, searchTxt],
        queryFn: async () => {
            const res = await consoleAxios.get(
                `${CONSOLE_API_ROUTES.CATEGORY.GET_CDN_FILE_LIST}?getLimit=${limit}&getPage=${page}&getFileKind=${getFileKind}${searchTxt ? `&searchTxt=${searchTxt}` : ""}`,
            );
            return res.data;
        },
        enabled: options.enabled,
    });
};

