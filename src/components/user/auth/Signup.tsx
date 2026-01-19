"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import signupComplete from "@/assets/images/user/signupComplete.png";
import InputError from "@/components/user/common/InputError";
import Input from "@/components/user/form/Input";
import InputWithButton from "@/components/user/form/InputWithButton";
import PasswordInput from "@/components/user/form/PasswordInput";
import { useSignup } from "@/service/user/auth";
import { usePopupStore } from "@/store/user/usePopupStore";

type FormValues = z.infer<ReturnType<typeof createSchema>>;

const createSchema = (t: (key: string) => string) =>
    z
        .object({
            m_name: z.string().min(1, t("name.error")),
            m_email: z.string().min(1, t("email.error")),
            m_password: z.string().min(1, t("password.error")).max(50, t("password.maxLengthError")),
            m_password_confirm: z.string().min(1, t("passwordConfirm.error")),
            m_mobile: z.string().regex(/^01[016789]-\d{3,4}-\d{4}$/, t("mobile.error")),
            mobile_auth: z.enum(["Y", "N"]),
            m_sms_yn: z.enum(["Y", "N"]),
            m_mail_yn: z.enum(["Y", "N"]),
        })
        .superRefine((data, ctx) => {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.m_email)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: t("email.invalidError"),
                    path: ["m_email"],
                });
            }
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
            if (data.m_mobile && data.mobile_auth === "N") {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: t("mobileAuth.error"),
                    path: ["mobile_auth"],
                });
            }
        });

const initialValues: FormValues = {
    m_name: "",
    m_email: "",
    m_password: "",
    m_password_confirm: "",
    m_mobile: "",
    mobile_auth: "N",
    m_sms_yn: "N",
    m_mail_yn: "N",
};

export default function Signup() {
    const t = useTranslations("Signup");
    const tHeader = useTranslations("Header");
    const schema = useMemo(() => createSchema(t), [t]);
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        setValue,
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: initialValues,
    });
    const values = useWatch({ control });
    const [complete, setComplete] = useState(false);
    const [authBox, setAuthBox] = useState(false);
    const [authCode, setAuthCode] = useState("");
    const [authCount, setAuthCount] = useState("05:00");
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const secondsRef = useRef(300);
    const signupMutation = useSignup();
    const { setConfirmPop } = usePopupStore();

    // 카운트다운 시작 함수
    const startCountdown = () => {
        // 기존 타이머가 있으면 정리
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        setAuthCount("05:00");
        secondsRef.current = 300; // 5분 = 300초

        timerRef.current = setInterval(() => {
            secondsRef.current -= 1;

            if (secondsRef.current < 0) {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
                setAuthCount("05:00");
                setAuthBox(false);
                setAuthCode("");
                setConfirmPop(true, t("mobileAuth.timeoutError"), 1);
                return;
            }

            const minutes = Math.floor(secondsRef.current / 60);
            const remainingSeconds = secondsRef.current % 60;
            const formattedTime = `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
            setAuthCount(formattedTime);
        }, 1000);
    };

    //인증번호확인 타이머 (5분 카운트다운)
    useEffect(() => {
        if (!authBox) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            setAuthCount("05:00");
            secondsRef.current = 300;
            return;
        }

        startCountdown();

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [authBox]); // eslint-disable-line react-hooks/exhaustive-deps

    const onSubmit = (data: FormValues) => {
        const { m_name, m_email, m_password, m_mobile, m_sms_yn, m_mail_yn } = data;
        const body = {
            m_name,
            m_email,
            m_password,
            m_mobile,
            m_sms_yn,
            m_mail_yn,
        };
        signupMutation.mutate(body, {
            onSuccess: () => {
                setComplete(true);
            },
        });
    };

    return (
        <div className="mx-auto w-full p-[60px_20px] md:p-[120px_28px] xl:max-w-[480px] xl:px-0">
            {!complete && (
                <>
                    <p className="text-center text-[24px] font-[700] md:text-[30px]">{t("title")}</p>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <ul className="mt-[70px] flex flex-col gap-[24px]">
                            <li className="flex flex-col gap-[8px]">
                                <label htmlFor="m_name" className="font-[500]">
                                    {t("name.label")}
                                </label>
                                <div>
                                    <Input
                                        {...register("m_name")}
                                        placeholder={t("name.placeholder")}
                                        id="m_name"
                                        autoFocus
                                    />
                                    <InputError message={errors.m_name?.message} />
                                </div>
                            </li>
                            <li className="flex flex-col gap-[8px]">
                                <label htmlFor="m_email" className="font-[500]">
                                    {t("email.label")}
                                </label>
                                <div>
                                    <Input {...register("m_email")} placeholder={t("email.placeholder")} id="m_email" />
                                    <InputError message={errors.m_email?.message} />
                                </div>
                            </li>
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
                            <li className="flex flex-col gap-[8px]">
                                <label htmlFor="m_mobile" className="font-[500]">
                                    {t("mobile.label")}
                                </label>
                                <div className="flex flex-col gap-[12px]">
                                    <div>
                                        <InputWithButton
                                            {...register("m_mobile")}
                                            id="m_mobile"
                                            placeholder={t("mobile.placeholder")}
                                            btnText={t("mobileAuth.sendButton")}
                                            handleClick={() => {
                                                setAuthBox(true);
                                                startCountdown(); // 카운트다운 재시작
                                                setValue("mobile_auth", "N");
                                            }}
                                            formattedInput
                                            btnDisabled={
                                                values.m_mobile && values.m_mobile.trim().length === 13 ? false : true
                                            }
                                        />
                                        <InputError message={errors.m_mobile?.message} />
                                    </div>
                                    {authBox && (
                                        <InputWithButton
                                            value={authCode}
                                            onChange={e => setAuthCode(e.currentTarget.value)}
                                            placeholder={t("mobileAuth.codePlaceholder")}
                                            btnText={t("mobileAuth.verifyButton")}
                                            handleClick={() => {
                                                setValue("mobile_auth", "Y");
                                                setAuthCode("");
                                                setAuthBox(false);
                                            }}
                                            btnDisabled={authCode.length === 0}
                                            boxClassName="[&>input]:pr-[140px]"
                                        >
                                            <p className="pr-[4px] text-[14px] font-[500] text-[#FF5463]">
                                                {authCount}
                                            </p>
                                        </InputWithButton>
                                    )}
                                </div>
                                <InputError message={errors.mobile_auth?.message} />
                            </li>
                        </ul>
                        <div className="mt-[50px] flex flex-col gap-[12px]">
                            <button
                                type="submit"
                                className="h-[56px] rounded-[5px] bg-primary text-[20px] font-[500] text-white"
                            >
                                {t("submit")}
                            </button>
                        </div>
                    </form>
                </>
            )}
            {complete && (
                <>
                    <div className="flex flex-col gap-[12px] rounded-[16px] py-[60px] text-center shadow-[0_0_16px_rgba(0,0,0,0.08)]">
                        <p className="text-center text-[24px] font-[700] md:text-[30px]">{t("complete.title")}</p>
                        <p
                            className="text-[20px] font-[500]"
                            dangerouslySetInnerHTML={{ __html: t("complete.message") }}
                        />
                        <Image
                            src={signupComplete}
                            alt={t("complete.alt")}
                            width={160}
                            height={160}
                            className="m-[20px_auto]"
                        />
                        <p className="text-[18px] font-[500] text-[#666]">{t("complete.description")}</p>
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
                            {tHeader("login")}
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
