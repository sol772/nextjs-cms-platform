import { useMutation } from "@tanstack/react-query";

import { USER_API_ROUTES } from "@/config/apiConfig";
import userAxios from "@/service/axios/userAxios";

interface body {
    member_idx: number;
    token: string;
    new_password: string;
}

export const usePutPassword = () => {
    return useMutation({
        mutationFn: async (body: body) => {
            const res = await userAxios.put(USER_API_ROUTES.AUTH.PASSWORD, body);
            return res.data;
        },
    });
};
