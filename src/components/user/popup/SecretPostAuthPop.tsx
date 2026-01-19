import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ScrollArea } from "@/components/ui/scroll-area";
import InputError from "@/components/user/common/InputError";
import UserDialogContent from "@/components/user/common/UserDialogContent";
import Input from "@/components/user/form/Input";
import { usePostPostPassword } from "@/service/user/board";
import { usePopupStore } from "@/store/user/usePopupStore";

interface SecretPostAuthPopProps {
    detailIdx: number | null;
    onComplete: () => void;
}

const createSchema = (t: (key: string) => string) =>
    z.object({
        password: z.string().min(1, t("password.error")),
    });

type FormValues = z.infer<ReturnType<typeof createSchema>>;

export default function SecretPostAuthPop({ detailIdx, onComplete }: SecretPostAuthPopProps) {
    const t = useTranslations("SecretPostAuthPop");
    const tCommon = useTranslations("Common");
    const schema = useMemo(() => createSchema(t), [t]);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });
    const postPostPasswordMutation = usePostPostPassword();
    const { setConfirmPop } = usePopupStore();

    const onSubmit = (data: FormValues) => {
        if (!detailIdx) return;
        postPostPasswordMutation.mutate(
            { idx: detailIdx, password: data.password },
            {
                onSuccess: () => {
                    onComplete();
                },
                onError: error => {
                    const axiosError = error as AxiosError<{ message: string }>;
                    const errorMessage = axiosError.response?.data?.message || tCommon("error");
                    setConfirmPop(true, errorMessage, 1);
                },
            },
        );
    };

    return (
        <UserDialogContent title={t("title")} className="max-w-[640px]">
            <form onSubmit={handleSubmit(onSubmit)}>
                <ScrollArea className="max-h-[75vh] min-h-[300px] border-b border-[#D9D9D9] p-[20px] md:p-[90px_80px]">
                    <div className="flex flex-col gap-[20px]">
                        <p
                            className="text-center text-[#666] md:text-[20px]"
                            dangerouslySetInnerHTML={{ __html: t("description") }}
                        />
                        <div>
                            <Input {...register("password")} id="password" placeholder={t("password.placeholder")} />
                            <InputError message={errors.password?.message} />
                        </div>
                        <button
                            type="submit"
                            className="h-[50px] rounded-[12px] bg-[#104893] text-[18px] font-[500] text-white"
                        >
                            {t("submit")}
                        </button>
                    </div>
                </ScrollArea>
            </form>
        </UserDialogContent>
    );
}
