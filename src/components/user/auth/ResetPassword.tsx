"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import signupComplete from "@/assets/images/user/signupComplete.png";
import InputError from "@/components/user/common/InputError";
import PasswordInput from "@/components/user/form/PasswordInput";
import { usePutPassword } from "@/service/user/auth";
import { usePopupStore } from "@/store/user/usePopupStore";

type FormValues = z.infer<ReturnType<typeof createSchema>>;

const createSchema = (t: (key: string) => string) =>
    z
        .object({
            m_password: z.string().min(1, t("password.error")).max(50, t("password.maxLengthError")),
            m_password_confirm: z.string().min(1, t("passwordConfirm.error")),
        })
        .superRefine((data, ctx) => {
            if (!data.m_password) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: t("password.error"),
                    path: ["m_password"],
                });
            }
            if (data.m_password.length < 6) {
                ctx.addIssue({
                    code: "custom",
                    message: t("password.minLengthError"),
                    path: ["m_password"],
                });
            }
            if (!/[a-zA-Z]/.test(data.m_password)) {
                ctx.addIssue({
                    code: "custom",
                    message: t("password.letterError"),
                    path: ["m_password"],
                });
            }
            if (!/[0-9]/.test(data.m_password)) {
                ctx.addIssue({
                    code: "custom",
                    message: t("password.numberError"),
                    path: ["m_password"],
                });
            }
            if (data.m_password !== data.m_password_confirm) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: t("passwordConfirm.mismatchError"),
                    path: ["m_password_confirm"],
                });
            }
        });

export default function ResetPassword({ memberId, token }: { memberId: string; token: string }) {
    const t = useTranslations("ResetPassword");
    const tHeader = useTranslations("Header");
    const [complete, setComplete] = useState(false);
    const putPasswordMutation = usePutPassword();
    const { setLoadingPop } = usePopupStore();
    const schema = useMemo(() => createSchema(t), [t]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            m_password: "",
            m_password_confirm: "",
        },
    });

    useEffect(() => {
        setLoadingPop(putPasswordMutation.isPending);
        return () => setLoadingPop(false);
    }, [putPasswordMutation.isPending]); // eslint-disable-line react-hooks/exhaustive-deps

    const onSubmit = (data: FormValues) => {
        putPasswordMutation.mutate(
            { member_idx: Number(memberId), token, new_password: data.m_password },
            {
                onSuccess: () => {
                    setComplete(true);
                },
            },
        );
    };

    return (
        <div className="mx-auto w-full p-[60px_20px] md:p-[120px_28px] xl:max-w-[480px] xl:px-0">
            {!complete && (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col gap-[12px] rounded-[16px] p-[40px_20px] shadow-[0_0_16px_rgba(0,0,0,0.08)]">
                        <div className="text-center">
                            <p className="text-center text-[24px] font-[700] md:text-[30px]">{t("title")}</p>
                        </div>
                        <ul className="mt-[70px] flex flex-col gap-[24px]">
                            <li className="flex flex-col gap-[8px]">
                                <label htmlFor="m_password" className="font-[500]">
                                    {t("password.label")}
                                </label>
                                <div>
                                    <PasswordInput
                                        {...register("m_password")}
                                        id="m_password"
                                        placeholder={t("password.placeholder")}
                                        maxLength={50}
                                    />
                                    <InputError message={errors.m_password?.message} />
                                </div>
                            </li>
                            <li className="flex flex-col gap-[8px]">
                                <label htmlFor="m_password_confirm" className="font-[500]">
                                    {t("passwordConfirm.label")}
                                </label>
                                <div>
                                    <PasswordInput
                                        {...register("m_password_confirm")}
                                        id="m_password_confirm"
                                        placeholder={t("passwordConfirm.placeholder")}
                                        maxLength={50}
                                    />
                                    <InputError message={errors.m_password_confirm?.message} />
                                </div>
                            </li>
                        </ul>
                    </div>
                    <button
                        type="submit"
                        className="mt-[50px] h-[56px] w-full rounded-[5px] bg-primary text-[20px] font-[500] text-white"
                    >
                        {t("submit")}
                    </button>
                </form>
            )}
            {complete && (
                <>
                    <div className="flex flex-col gap-[12px] rounded-[16px] py-[60px] text-center shadow-[0_0_16px_rgba(0,0,0,0.08)]">
                        <p className="text-center text-[24px] font-[700] md:text-[30px]">{t("complete.title")}</p>
                        <p className="text-[20px] font-[500]">{t("complete.message")}</p>
                        <Image
                            src={signupComplete}
                            alt={t("complete.alt")}
                            width={160}
                            height={160}
                            className="m-[20px_auto]"
                        />
                        <p className="text-[18px] font-[500] text-[#666]">{t("complete.description")}</p>
                    </div>
                    <div className="mt-[50px]">
                        <Link
                            href={`/login`}
                            className="block h-[56px] w-full rounded-[5px] bg-primary text-center text-[20px] font-[500] leading-[56px] text-white"
                        >
                            {tHeader("login")}
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
