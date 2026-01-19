import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";

interface body {
    m_email: string;
    m_name: string;
    m_mobile: string;
    m_level: number;
    m_sms_yn: string;
    m_mail_yn: string;
    m_memo: string;
    m_menu_auth: string | null;
    m_password: string;
}

// 회원 정보 변경
export const usePutMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (body: body) => {
            const res = await consoleAxios.put(CONSOLE_API_ROUTES.MEMBER.BASE, body);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["memberList"],
            });
        },
    });
};
