import { useQuery } from "@tanstack/react-query";

import { USER_API_ROUTES } from "@/config/apiConfig";
import userAxios from "@/service/axios/userAxios";

// 팝업 상세 조회
export const useGetUserPopup = (idx: string, options: { enabled: boolean }) => {
    return useQuery({
        queryKey: ["userPopupDetail", idx],
        queryFn: async () => {
            const res = await userAxios.get(`${USER_API_ROUTES.POPUP.GET_DETAIL.replace(":idx", idx)}`);
            return res.data;
        },
        enabled: options.enabled,
    });
};
