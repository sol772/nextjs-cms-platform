import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

interface body {
    id: number;
    c_depth: number;
    c_depth_parent: number;
    c_num: number;
    c_name: string;
    c_link_target: string;
    c_link_url: string;
    c_use_yn: string;
    c_lang: string;
    c_content_type: number;
    content: string;
    c_type: string;
    file_path: string;
    admin_file_path: string;
    sms: string;
    email: string;
    b_column_title: string;
    b_column_date: string;
    b_column_view: string;
    b_column_file: string;
    b_list_cnt: number;
    b_read_lv: number;
    b_write_lv: number;
    b_secret: string;
    b_reply: string;
    b_reply_lv: number;
    b_comment: string;
    b_comment_lv: number;
    b_alarm: string;
    b_alarm_email: string;
    b_top_html: string;
    b_template: string;
    b_template_text: string;
    b_write_alarm: string;
    b_write_send: string;
    b_write_sms: string;
    b_group: string;
    c_kind_use: string;
    c_main_banner_file: File[];
    b_gallery_type: string;
}

// 하위카테고리 수정
export const usePutSubCategory = () => {
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

            const res = await consoleAxios.put(CONSOLE_API_ROUTES.CATEGORY.CRUD_SUB, formData, {
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
