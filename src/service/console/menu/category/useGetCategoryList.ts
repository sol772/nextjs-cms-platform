import { useQuery } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

// 카테고리 목록 조회
export const useGetCategoryList = (cLang: string) => {
    return useQuery({
        queryKey: ["categoryList", cLang],
        queryFn: async () => {
            const res = await consoleAxios.get(`${CONSOLE_API_ROUTES.CATEGORY.CRUD}?c_lang=${cLang}`);
            return res.data;
        },
    });
};
