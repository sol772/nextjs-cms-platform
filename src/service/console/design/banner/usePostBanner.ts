import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

interface body {
    b_type: string; // (PC : P, 모바일 : M)
    b_open: string; // (Y : 노출, N : 중단)
    b_title: string;
    b_width_size: number;
    b_height_size: number;
    b_size: string;
    b_s_date?: string;
    b_e_date?: string;
    b_file: File[];
    b_c_type: string; // (1 : 이미지, 2 : 동영상, 3 : HTML)
    b_url?: string;
    b_url_target: string; // (1 : 현재창, 2 : 새창)
    b_mov_type: string; // (1 : 직접, 2 : URL)
    b_mov_url?: string;
    b_mov_play: string; // (Y : 자동재생, N : 자동재생안함)
    b_content?: string;
    b_lang: string;
}

// 배너 등록
export const usePostBanner = () => {
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

            const res = await consoleAxios.post(CONSOLE_API_ROUTES.BANNER.CRUD, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["bannerList"],
            });
        },
    });
};
