import { useMutation } from "@tanstack/react-query";

import { USER_API_ROUTES } from "@/config/apiConfig";
import userAxios from "@/service/axios/userAxios";

interface body {
    m_email: string;
}

export const usePostPassword = () => {
    return useMutation({
        mutationFn: async (body: body) => {
            const res = await userAxios.post(USER_API_ROUTES.AUTH.PASSWORD, body);
            return res.data;
        },
    });
};
