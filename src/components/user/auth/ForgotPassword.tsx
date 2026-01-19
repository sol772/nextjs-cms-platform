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
import Input from "@/components/user/form/Input";
import { usePostPassword } from "@/service/user/auth";
import { usePopupStore } from "@/store/user/usePopupStore";

type FormValues = z.infer<ReturnType<typeof createSchema>>;

const createSchema = (t: (key: string) => string) =>
    z
        .object({
            m_email: z.string().min(1, t("email.error")),
        })
        .superRefine((data, ctx) => {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.m_email)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: t("email.invalidError"),
                    path: ["m_email"],
                });
            }
        });

export default function ForgotPassword() {
    const t = useTranslations("ForgotPassword");
    const [complete, setComplete] = useState(false);
    const postPasswordMutation = usePostPassword();
    const { setLoadingPop } = usePopupStore();

    const schema = useMemo(() => createSchema(t), [t]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            m_email: "",
        },
    });

    useEffect(() => {
        setLoadingPop(postPasswordMutation.isPending);
        return () => setLoadingPop(false);
    }, [postPasswordMutation.isPending]); // eslint-disable-line react-hooks/exhaustive-deps

    const onSubmit = (data: FormValues) => {
        postPasswordMutation.mutate(
            { m_email: data.m_email },
            {
                onSuccess: () => {
                    setComplete(true);
                },
            },
        );
    };

    return (
        <div className="mx-auto w-full p-[60px_20px] text-center md:p-[120px_28px] xl:max-w-[480px] xl:px-0">
            {!complete && (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col gap-[12px] rounded-[16px] p-[40px_20px] text-center shadow-[0_0_16px_rgba(0,0,0,0.08)]">
                        <p className="text-center text-[24px] font-[700] md:text-[30px]">{t("title")}</p>
                        <p className="text-[20px] font-[500]">
                            {t("description")} <br />
                            {t("descriptionSub")}
                        </p>
                        <ul className="mt-[70px] flex flex-col gap-[12px]">
                            <li>
                                <Input {...register("m_email")} placeholder={t("email.placeholder")} autoFocus />
                                <InputError message={errors.m_email?.message} />
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
                        <p className="text-[18px] font-[500] text-[#666]">
                            {t("complete.description")} <br />
                            {t("complete.descriptionSub")}
                        </p>
                    </div>
                    <div className="mt-[50px] flex justify-between gap-[12px]">
                        <Link
                            href={`/`}
                            className="h-[56px] flex-1 rounded-[5px] bg-[#D9D9D9] text-center text-[20px] font-[500] leading-[56px] text-[#666]"
                        >
                            {t("backToMain")}
                        </Link>
                        <Link
                            href={`/login`}
                            className="h-[56px] flex-1 rounded-[5px] bg-primary text-center text-[20px] font-[500] leading-[56px] text-white"
                        >
                            {t("Header.login")}
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
