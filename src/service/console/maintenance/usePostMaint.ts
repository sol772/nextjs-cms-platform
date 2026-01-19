import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

interface body {
    category: string;
    name: string;
    password: string;
    subject: string;
    contents: string;
    company: string;
    email: string;
    b_file: File[];
}

// 유지보수 등록
export const usePostMaint = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (body: body) => {
            const formData = new FormData();

            // b_file을 제외한 나머지 데이터 추가
            Object.entries(body).forEach(([key, value]) => {
                if (key !== "b_file") {
                    formData.append(key, value);
                }
            });

            // b_file 처리
            if (body.b_file.length > 0) {
                body.b_file.forEach(file => {
                    formData.append("b_file", file);
                });
            } else {
                formData.append("b_file", "");
            }

            const res = await consoleAxios.post(CONSOLE_API_ROUTES.MAINTENANCE.POST_CREATE, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["maintList"],
            });
        },
    });
};
