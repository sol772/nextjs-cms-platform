"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { memo, useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import InputError from "@/components/console/common/InputError";
import LoadingSpinner from "@/components/console/common/LoadingSpinner";
import EditorWithHtml from "@/components/console/form/EditorWithHtml";
import Input from "@/components/console/form/Input";
import Toggle from "@/components/console/form/Toggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CONSOLE_CONFIRM_MESSAGES, CONSOLE_TOAST_MESSAGES } from "@/constants/console/messages";
import { useNotFoundOnError } from "@/hooks/common/useNotFoundOnError";
import { useToast } from "@/hooks/use-toast";
import { useGetPolicy, usePutPolicy } from "@/service/console/setting/policy";
import { usePopupStore } from "@/store/console/usePopupStore";

const schema = z.object({
    p_use_yn: z.enum(["Y", "N"]),
    p_title: z.string().min(1, "팝업명을 입력해주세요."),
    p_contents: z.string().min(1, "내용을 입력해주세요."),
    p_contents_html: z.string().optional(),
    p_contents_type: z.enum(["E", "H"]),
});

type FormValues = z.infer<typeof schema>;

interface PolicyFormProps {
    detailIdx: string;
    lang: string;
    onComplete: () => void;
    handleCancel: () => void;
}

export default memo(function PolicyForm({ detailIdx, lang, onComplete, handleCancel }: PolicyFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
        setValue,
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });
    const values = useWatch({ control });
    const {
        data: configData,
        isLoading: isInitialLoading,
        error: getPolicyError,
    } = useGetPolicy(detailIdx, lang, {
        enabled: Boolean(detailIdx),
    });
    const putPolicyMutation = usePutPolicy();
    const { setConfirmPop } = usePopupStore();
    const { toast } = useToast();

    // 상세 조회
    useEffect(() => {
        if (configData) {
            const { p_use_yn, p_title, p_contents, p_contents_type } = configData.data;
            reset({
                p_use_yn,
                p_title,
                p_contents: p_contents_type === "E" || !p_contents_type ? p_contents : "",
                p_contents_html: p_contents_type === "H" ? p_contents : "",
                p_contents_type: p_contents_type ?? "E",
            });
        }
    }, [configData]); // eslint-disable-line react-hooks/exhaustive-deps

    // 404 에러 처리
    useNotFoundOnError(getPolicyError);

    // 저장 확인
    const handleConfirmSave = (data: FormValues) => {
        setConfirmPop(true, CONSOLE_CONFIRM_MESSAGES.SAVE, 2, () => onSubmit(data));
    };

    // 저장하기
    const onSubmit = (data: FormValues) => {
        const { p_contents, p_contents_html, p_contents_type, ...formData } = data;
        const body = {
            ...formData,
            idx: Number(detailIdx),
            p_contents: p_contents_type === "E" ? p_contents ?? "" : p_contents_html ?? "",
            p_contents_type,
        };
        putPolicyMutation.mutate(body, {
            onSuccess: () => {
                toast({ title: CONSOLE_TOAST_MESSAGES.UPDATED });
                onComplete();
            },
        });
    };

    return (
        <div className="h-full rounded-[12px] bg-white">
            {isInitialLoading ? (
                <LoadingSpinner />
            ) : (
                <form onSubmit={handleSubmit(handleConfirmSave)} className="flex h-full flex-col">
                    <div className="flex items-center gap-[10px] p-[16px_20px]">
                        <p className="text-[20px] font-[700]">이용정책 관리</p>
                        <Controller
                            name="p_use_yn"
                            control={control}
                            render={({ field }) => (
                                <Toggle
                                    {...field}
                                    checked={field.value === "Y"}
                                    txt="노출"
                                    className="justify-start"
                                    handleChange={checked => {
                                        setValue("p_use_yn", checked ? "Y" : "N");
                                    }}
                                />
                            )}
                        />
                    </div>
                    <div className="min-h-0 flex-1 border-t border-[#D9D9D9]">
                        <ScrollArea className="h-full">
                            <ul className="flex flex-wrap gap-[20px] p-[20px_40px]">
                                <li className="flex w-full flex-col gap-[8px]">
                                    <label htmlFor="p_title" className="text-[#666]">
                                        제목<span className="pl-[5px] font-[700] text-console-2">*</span>
                                    </label>
                                    <div>
                                        <Input
                                            {...register("p_title")}
                                            id="p_title"
                                            className="w-full"
                                            placeholder="제목을 입력해주세요."
                                        />
                                        <InputError message={errors.p_title?.message} />
                                    </div>
                                </li>
                                <li className="w-full">
                                    <EditorWithHtml
                                        editorValue={values.p_contents || ""}
                                        htmlValue={values.p_contents_html || ""}
                                        type={values.p_contents_type ?? "E"}
                                        onChangeEditorValue={cont => setValue("p_contents", cont)}
                                        onChangeHtmlValue={cont => setValue("p_contents_html", cont)}
                                        onTypeChange={type => setValue("p_contents_type", type)}
                                    />
                                </li>
                            </ul>
                        </ScrollArea>
                    </div>
                    <div className="flex justify-end gap-[10px] border-t border-[#D9D9D9] p-[12px_20px]">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="h-[52px] w-[160px] rounded-[12px] bg-[#F6F7FA] text-[18px] font-[700] text-[#666]"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="h-[52px] w-[160px] rounded-[12px] bg-console-2 text-[18px] font-[700] text-white"
                        >
                            저장
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
});
