import { useQuery } from "@tanstack/react-query";

import { USER_API_ROUTES } from "@/config/apiConfig";
import userAxios from "@/service/axios/userAxios";

// 게시글 분류 목록 조회
export const useGetPostGroupList = (
    parent_id: string,
    options: { enabled: boolean },
) => {
    return useQuery({
        queryKey: ["postGroupList", parent_id],
        queryFn: async () => {
            const res = await userAxios.get(
                USER_API_ROUTES.POST.GET_GROUP.replace(":parent_id", parent_id),
            );
            return res.data;
        },
        enabled: options.enabled,
    });
};

