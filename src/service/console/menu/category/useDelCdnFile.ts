import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

interface body {
    idx: number;
}

// cdn 파일 삭제
export const useDelCdnFile = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (body: body) => {
            const res = await consoleAxios.delete(CONSOLE_API_ROUTES.CATEGORY.DELETE_CDN_FILE, {
                data: body,
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["cdnFileList"],
            });
        },
    });
};
