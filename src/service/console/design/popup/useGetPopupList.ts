import { useQuery } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

// 팝업 목록 조회
export const useGetPopupList = (
    limit: string,
    page: string,
    p_type: string,
    p_lang: string,
    searchtxt?: string,
) => {
    return useQuery({
        queryKey: ["popupList", limit, page, p_type, p_lang, searchtxt],
        queryFn: async () => {
            const res = await consoleAxios.get(
                `${CONSOLE_API_ROUTES.POPUP.CRUD}?limit=${limit}&page=${page}&p_type=${p_type}&p_lang=${p_lang}${searchtxt ? `&searchtxt=${searchtxt}` : ""}`,
            );
            return res.data;
        },
    });
};

