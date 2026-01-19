import { useQuery } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

// 하위카테고리 상세 조회
export const useGetSubCategory = (id: string, options: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ["subCategoryDetail", id],
        queryFn: async () => {
            const res = await consoleAxios.get(`${CONSOLE_API_ROUTES.CATEGORY.GET_SUB.replace(":id", id)}`);
            return res.data;
        },
        enabled: options.enabled,
    });
};
