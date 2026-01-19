import { useMutation, useQueryClient } from "@tanstack/react-query";

import { COMMON_API_ROUTES } from "@/config/apiConfig";
import userAxios from "@/service/axios/userAxios";

interface body {
    idx: string;
    category: string;
    m_email: string;
    m_name: string;
    m_pwd: string;
    b_title: string;
    b_contents: string;
    b_depth: number;
    b_notice: string;
    b_secret: string;
    b_file: File[];
    b_img?: File; // 갤러리 게시판일때 썸네일
    b_img_name?: string; // 갤러리 게시판일때 썸네일 이름 (삭제여부 확인용)
    group_id?: string; // FAQ, 문의게시판일때 분류유형
}

// 게시글 수정
export const usePutPost = () => {
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

            const res = await userAxios.put(COMMON_API_ROUTES.POST.CRUD, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["postList"],
            });
        },
    });
};
