import { useMutation } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

interface body {
    site_id: string;
    site_lang: string[]; // ["KR", "EN"] 다국어 설정
    c_site_name: string;
    // c_web_title: string;
    c_ceo: string;
    c_tel: string;
    c_num: string;
    c_num2: string;
    c_email: string;
    c_address: string;
    c_fax: string;
    c_manager: string;
    c_b_title: string;
    c_meta: string;
    c_meta_tag: string;
    // c_meta_type: string;
    c_lang: string;
}

// 사이트 정보 변경
export const usePutSiteInfo = () => {
    return useMutation({
        mutationFn: async (body: body) => {
            const res = await consoleAxios.put(CONSOLE_API_ROUTES.SITE.PUT, body);
            return res.data;
        },
    });
};
