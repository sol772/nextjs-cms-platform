import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

interface body {
    c_depth: number;
    c_depth_parent: number;
    c_num: string;
    c_name: string;
    c_link_target: string;
    c_link_url: string;
    c_main_banner: string;
    c_main_banner_file: File[];
    c_use_yn: string;
    c_lang: string;
}

// 카테고리 등록
export const usePostCategory = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (body: body) => {
            const formData = new FormData();

            // c_main_banner_file 제외한 나머지 데이터 추가
            Object.entries(body).forEach(([key, value]) => {
                if (key !== "c_main_banner_file") {
                    formData.append(key, value);
                }
            });

            // c_main_banner_file 처리
            if (body.c_main_banner_file.length > 0) {
                body.c_main_banner_file.forEach(file => {
                    formData.append("c_main_banner_file", file);
                });
            } else {
                formData.append("c_main_banner_file", "");
            }

            const res = await consoleAxios.post(CONSOLE_API_ROUTES.CATEGORY.CRUD, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["categoryList"],
            });
        },
    });
};
