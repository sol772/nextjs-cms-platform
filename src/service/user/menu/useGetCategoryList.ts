import { useQuery } from "@tanstack/react-query";

import { USER_API_ROUTES } from "@/config/apiConfig";
import userAxios from "@/service/axios/userAxios";

// 카테고리 목록 조회
export const useGetCategoryList = (cLang: string) => {
    return useQuery({
        queryKey: ["categoryList", cLang],
        queryFn: async () => {
            const res = await userAxios.get(`${USER_API_ROUTES.CATEGORY.GET_LIST}?c_lang=${cLang}`);
            return res.data;
        },
        enabled: !!cLang,
    });
};