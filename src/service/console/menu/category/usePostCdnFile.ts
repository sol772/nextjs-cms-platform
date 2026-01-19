import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

interface body {
    sessions: File[];
    fileKind: string;
    overwrite?: string;
}

// cdn 파일 등록
export const usePostCdnFile = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (body: body) => {
            const formData = new FormData();

            body.sessions.forEach(file => {
                formData.append("sessions", file);
            });
            formData.append("fileKind", body.fileKind);

            const res = await consoleAxios.post(`${CONSOLE_API_ROUTES.CATEGORY.POST_CDN_FILE}${body.overwrite ? `?overwrite=${body.overwrite}` : ""}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "X-Handle-409": "true",
                },
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
