import { useMutation } from "@tanstack/react-query";

import { USER_API_ROUTES } from "@/config/apiConfig";
import userAxios from "@/service/axios/userAxios";

interface body {
    m_name: string;
    m_email: string;
    m_password: string;
    m_mobile: string;
    m_sms_yn: string;
    m_mail_yn: string;
}

export const useSignup = () => {
    return useMutation({
        mutationFn: async (body: body) => {
            const res = await userAxios.post(USER_API_ROUTES.AUTH.SIGNUP, body);
            return res.data;
        },
    });
};
