import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import { usePopupStore } from "@/store/console/usePopupStore";

const consoleAxios = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

interface LoginBody {
    m_email: string;
    m_password: string;
}

// 로그인
export const useLogin = () => {
    const { setLoadingPop, setConfirmPop } = usePopupStore();
    return useMutation({
        mutationFn: async (body: LoginBody) => {
            const res = await consoleAxios.post(CONSOLE_API_ROUTES.LOGIN, body);
            return res.data;
        },
        onMutate: () => {
            setLoadingPop(true);
        },
        onError: error => {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || "알 수 없는 에러가 발생했습니다.";
            setConfirmPop(true, errorMessage, 1);
        },
        onSettled: () => {
            setLoadingPop(false);
        },
    });
};
