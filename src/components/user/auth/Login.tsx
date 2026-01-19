"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import InputError from "@/components/user/common/InputError";
import Input from "@/components/user/form/Input";
import PasswordInput from "@/components/user/form/PasswordInput";
import { useLogin } from "@/service/user/auth";
import { useAuthStore } from "@/store/common/useAuthStore";
import { usePopupStore } from "@/store/user/usePopupStore";

type FormValues = z.infer<ReturnType<typeof createSchema>>;

const createSchema = (t: (key: string) => string) =>
    z.object({
        m_email: z.string().min(1, t("email.error")),
        m_password: z.string().min(1, t("password.error")),
    });

export default function Login() {
    const t = useTranslations("Login");
    const currentLocale = useLocale();
    const router = useRouter();
    const { setUser } = useAuthStore();
    const loginMutation = useLogin();
    const { setConfirmPop, setLoadingPop } = usePopupStore();

    const schema = useMemo(() => createSchema(t), [t]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            m_email: "",
            m_password: "",
        },
    });

    useEffect(() => {
        setLoadingPop(loginMutation.isPending);
        return () => setLoadingPop(false);
    }, [loginMutation.isPending]); // eslint-disable-line react-hooks/exhaustive-deps

    const onSubmit = (data: FormValues) => {
        loginMutation.mutate(
            { m_email: data.m_email, m_password: data.m_password },
            {
                onSuccess: response => {
                    const data = response.data;
                    const userData = {
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                        m_email: data.m_email,
                        m_level: data.m_level,
                        m_name: data.m_name,
                        m_menu_auth: data.m_menu_auth,
                        siteId: process.env.NEXT_PUBLIC_SITE_ID || "",
                        maintName: process.env.NEXT_PUBLIC_MAINT_NAME || "",
                    };
                    setUser(userData);
                    router.push("/");
                },
                onError: error => {
                    const axiosError = error as AxiosError<{ message: string }>;
                    const errorMessage = axiosError.response?.data?.message || t("error");
                    setConfirmPop(true, errorMessage, 1);
                },
            },
        );
    };

    return (
        <div className="mx-auto w-full p-[60px_20px] text-center md:p-[120px_28px] xl:max-w-[480px] xl:px-0">
            <p className="text-[24px] font-[700] md:text-[30px]">{t("title")}</p>
            <form onSubmit={handleSubmit(onSubmit)}>
                <ul className="mt-[70px] flex flex-col gap-[12px]">
                    <li>
                        <Input {...register("m_email")} placeholder={t("email.placeholder")} autoFocus />
                        <InputError message={errors.m_email?.message} />
                    </li>
                    <li>
                        <PasswordInput
                            {...register("m_password")}
                            id="m_password"
                            placeholder={t("password.placeholder")}
                        />
                        <InputError message={errors.m_password?.message} />
                    </li>
                </ul>
                <div className="flex items-center justify-end pt-[20px]">
                    <Link
                        href={`/${currentLocale}/forgot-password`}
                        className="text-[15px] font-[500] text-[#999] underline"
                    >
                        {t("forgotPassword")}
                    </Link>
                </div>
                <div className="mt-[50px] flex flex-col gap-[12px]">
                    <button
                        type="submit"
                        className="h-[56px] rounded-[5px] bg-primary text-[20px] font-[500] text-white"
                    >
                        {t("submit")}
                    </button>
                    <Link
                        href={`/${currentLocale}/signup`}
                        className="h-[56px] rounded-[5px] bg-[#D9D9D9] text-[20px] font-[500] leading-[56px] text-[#666]"
                    >
                        {t("signup")}
                    </Link>
                </div>
            </form>
        </div>
    );
}
