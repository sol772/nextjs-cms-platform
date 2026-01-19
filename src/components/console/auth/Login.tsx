"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import InputError from "@/components/console/common/InputError";
import Input from "@/components/console/form/Input";
import PasswordInput from "@/components/console/form/PasswordInput";
import ConsolePopup from "@/components/console/popup/Popup";
import { useLogin } from "@/service/console/auth/useLogin";
import { useAuthStore } from "@/store/common/useAuthStore";

const schema = z.object({
    m_email: z.string().min(1, "이메일을 입력해주세요."),
    m_password: z.string().min(1, "비밀번호를 입력해주세요."),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
    const router = useRouter();

    const { setUser } = useAuthStore();
    const loginMutation = useLogin();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            m_email: "likeweb@likeweb.co.kr",
            m_password: "test1!@#$",
        },
    });

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
                    router.push("/console/main");
                },
            },
        );
    };

    return (
        <>
            <div className="flex min-h-[100vh] items-center justify-center bg-[#f7f6fb]">
                <div className="w-full max-w-[560px] rounded-[16px] bg-white p-[70px_40px] text-center shadow-[0_0_16px_rgba(0,0,0,0.08)]">
                    <h1 className="text-[40px] font-[700]">관리자</h1>
                    <p className="text-[30px] font-[700]">로그인</p>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <ul className="mt-[70px] flex flex-col gap-[12px]">
                            <li>
                                <Input {...register("m_email")} placeholder="이메일을 입력해주세요." autoFocus />
                                <InputError message={errors.m_email?.message} />
                            </li>
                            <li>
                                <PasswordInput
                                    {...register("m_password")}
                                    id="m_password"
                                    placeholder="비밀번호를 입력해주세요."
                                />
                                <InputError message={errors.m_password?.message} />
                            </li>
                        </ul>
                        <div className="mt-[50px] flex flex-col gap-[12px]">
                            <button
                                type="submit"
                                className="h-[56px] rounded-[5px] bg-console text-[20px] font-[500] text-white"
                            >
                                로그인
                            </button>
                            <Link
                                href={`/`}
                                className="h-[56px] rounded-[5px] bg-[#D9D9D9] text-[20px] font-[500] leading-[56px] text-[#666]"
                            >
                                사용자화면 바로가기
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
            <ConsolePopup />
        </>
    );
}
