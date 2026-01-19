import { useMutation } from "@tanstack/react-query";

import { USER_API_ROUTES } from "@/config/apiConfig";
import userAxios from "@/service/axios/userAxios";

interface body {
    m_email: string;
    m_password: string;
}

export const useLogin = () => {
    return useMutation({
        mutationFn: async (body: body) => {
            const res = await userAxios.post(USER_API_ROUTES.AUTH.LOGIN, body);
            return res.data;
        },
    });
};
