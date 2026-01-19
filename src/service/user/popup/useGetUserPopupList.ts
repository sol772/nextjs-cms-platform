import { useQuery } from "@tanstack/react-query";

import { USER_API_ROUTES } from "@/config/apiConfig";
import userAxios from "@/service/axios/userAxios";

// 팝업 목록 조회
export const useGetUserPopupList = (type: string, lang: string, options: { enabled: boolean }) => {
    return useQuery({
        queryKey: ["userPopupList", type, lang],
        queryFn: async () => {
            const res = await userAxios.get(`${USER_API_ROUTES.POPUP.GET_LIST}?p_type=${type}&p_lang=${lang}`);
            return res.data;
        },
        enabled: options.enabled,
    });
};
