"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { memo, useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import InputError from "@/components/console/common/InputError";
import LoadingSpinner from "@/components/console/common/LoadingSpinner";
import DateRangePicker from "@/components/console/form/DateRangePicker";
import EditorWithHtml from "@/components/console/form/EditorWithHtml";
import Input from "@/components/console/form/Input";
import InputBox from "@/components/console/form/InputBox";
import Radio from "@/components/console/form/Radio";
import Toggle from "@/components/console/form/Toggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CONSOLE_CONFIRM_MESSAGES, CONSOLE_TOAST_MESSAGES } from "@/constants/console/messages";
import { useNotFoundOnError } from "@/hooks/common/useNotFoundOnError";
import { useToast } from "@/hooks/use-toast";
import { useDelPopup, useGetPopup, usePostPopup, usePutPopup } from "@/service/console/design/popup";
import { usePopupStore } from "@/store/console/usePopupStore";

const schema = z
    .object({
        isType: z.enum(["P", "M"]),
        p_open: z.enum(["Y", "N"]),
        p_title: z.string().min(1, "팝업명을 입력해주세요."),
        p_width_size: z.string().min(1, "가로 사이즈를 입력해주세요."),
        p_height_size: z.string().min(1, "세로 사이즈를 입력해주세요."),
        p_left_point: z.string().optional(),
        p_top_point: z.string().optional(),
        p_one_day: z.enum(["Y", "N"]),
        p_layer_pop: z.enum(["1", "2"]),
        p_link_target: z.enum(["1", "2"]),
        p_link_url: z.string().optional(),
        isDate: z.enum(["Y", "N"]),
        p_s_date: z.date().optional(),
        p_e_date: z.date().optional(),
        p_content: z.string().optional(),
        p_content_html: z.string().optional(),
        p_content_type: z.enum(["E", "H"]),
    })
    .superRefine((data, ctx) => {
        if (data.isType === "P" && (!data.p_left_point || !data.p_top_point)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "팝업 위치를 설정해주세요.",
                path: ["p_left_point"],
            });
        }
        if (data.isDate === "Y" && (!data.p_s_date || !data.p_e_date)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "기간을 설정해주세요.",
                path: ["p_s_date"],
            });
        }
    });

type FormValues = z.infer<typeof schema>;

interface PopupFormProps {
    lang: string;
    type: "P" | "M";
    mode: "create" | "edit";
    detailIdx: string;
    onComplete: () => void;
    handleCancel: () => void;
    onDeleteComplete: () => void;
}

export default memo(function PopupForm({
    lang,
    type,
    mode = "create",
    detailIdx,
    onComplete,
    handleCancel,
    onDeleteComplete,
}: PopupFormProps) {
    const initialValues = useMemo<FormValues>(
        () => ({
            isType: type,
            p_open: "Y",
            p_title: "",
            p_width_size: "",
            p_height_size: "",
            p_left_point: "",
            p_top_point: "",
            p_one_day: "Y",
            p_layer_pop: "1",
            p_link_target: "1",
            p_link_url: "",
            isDate: "N",
            p_s_date: undefined,
            p_e_date: undefined,
            p_content: "",
            p_content_html: "",
            p_content_type: "E",
        }),
        [type],
    );
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
        setValue,
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: initialValues,
    });
    const values = useWatch({ control });
    const {
        data: configData,
        isLoading: isInitialLoading,
        error: getPopupError,
    } = useGetPopup(detailIdx, {
        enabled: Boolean(detailIdx) && mode === "edit",
    });
    const postPopupMutation = usePostPopup();
    const putPopupMutation = usePutPopup();
    const delPopupMutation = useDelPopup();
    const { setConfirmPop, setLoadingPop } = usePopupStore();
    const { toast } = useToast();

    // 데이터 로딩 또는 저장,수정 중일 때 로딩 팝업 표시
    useEffect(() => {
        const isLoading = postPopupMutation.isPending || putPopupMutation.isPending;
        setLoadingPop(isLoading);
        return () => setLoadingPop(false);
    }, [postPopupMutation.isPending, putPopupMutation.isPending, setLoadingPop]);

    // 팝업 상세 조회
    useEffect(() => {
        // 팝업 등록 시 초기화
        if (mode === "create") {
            reset(initialValues);
            return;
        }
        if (mode === "edit") {
            if (configData) {
                const {
                    p_type,
                    p_open,
                    p_title,
                    p_width_size,
                    p_height_size,
                    p_left_point,
                    p_top_point,
                    p_one_day,
                    p_layer_pop,
                    p_link_target,
                    p_link_url,
                    p_s_date,
                    p_e_date,
                    p_content,
                    p_content_type,
                } = configData.data;
                reset({
                    isType: p_type[0],
                    p_open: p_open[0],
                    p_title,
                    p_width_size: p_width_size.toLocaleString(),
                    p_height_size: p_height_size.toLocaleString(),
                    p_left_point: p_left_point != null ? p_left_point.toLocaleString() : "",
                    p_top_point: p_top_point != null ? p_top_point.toLocaleString() : "",
                    p_one_day: p_one_day[0],
                    p_layer_pop: p_layer_pop[0],
                    p_link_target: p_link_target[0],
                    p_link_url: p_link_url ?? "",
                    isDate: p_s_date || p_e_date ? "Y" : "N",
                    p_s_date: p_s_date && p_s_date !== "" ? new Date(p_s_date) : undefined,
                    p_e_date: p_e_date && p_e_date !== "" ? new Date(p_e_date) : undefined,
                    p_content: p_content_type === "E" || !p_content_type ? p_content : "",
                    p_content_html: p_content_type === "H" ? p_content : "",
                    p_content_type: p_content_type ?? "E",
                });
            }
        }
    }, [configData, reset, mode]); // eslint-disable-line react-hooks/exhaustive-deps

    // 404 에러 처리
    useNotFoundOnError(getPopupError);

    // 저장 확인
    const handleConfirmSave = (data: FormValues) => {
        setConfirmPop(true, CONSOLE_CONFIRM_MESSAGES.SAVE, 2, () => onSubmit(data));
    };

    // 저장하기
    const onSubmit = (data: FormValues) => {
        const {
            isType,
            p_width_size,
            p_height_size,
            p_left_point,
            p_top_point,
            isDate,
            p_s_date,
            p_e_date,
            p_link_url,
            p_content,
            p_content_html,
            p_content_type,
            ...formData
        } = data;
        const baseBody = {
            ...formData,
            p_type: type,
            p_width_size: Number(p_width_size.replace(/,/g, "")),
            p_height_size: Number(p_height_size.replace(/,/g, "")),
            p_left_point: p_left_point ? Number(p_left_point.replace(/,/g, "")) : null,
            p_top_point: p_top_point ? Number(p_top_point.replace(/,/g, "")) : null,
            p_s_date: isDate === "Y" && p_s_date ? format(p_s_date, "yyyy.MM.dd") : "",
            p_e_date: isDate === "Y" && p_e_date ? format(p_e_date, "yyyy.MM.dd") : "",
            p_link_url: p_link_url ?? "",
            p_lang: lang,
            p_content: p_content_type === "E" ? p_content ?? "" : p_content_html ?? "",
            p_content_type,
        };
        void isType;
        void isDate;

        // 팝업 수정
        if (mode === "edit") {
            const body = { ...baseBody, idx: Number(detailIdx) };
            putPopupMutation.mutate(body, {
                onSuccess: () => {
                    toast({ title: CONSOLE_TOAST_MESSAGES.UPDATED });
                    onComplete();
                },
            });
        }
        // 팝업 등록
        else {
            postPopupMutation.mutate(baseBody, {
                onSuccess: () => {
                    toast({ title: CONSOLE_TOAST_MESSAGES.CREATED });
                    onComplete();
                },
            });
        }
    };

    // 삭제 확인
    const handleConfirmDelete = () => {
        setConfirmPop(
            true,
            CONSOLE_CONFIRM_MESSAGES.DELETE_ITEM("팝업을"),
            2,
            () => handleDelete(),
            undefined,
            "",
            "red",
        );
    };

    // 삭제하기
    const handleDelete = () => {
        const body = { idx: [detailIdx] };
        delPopupMutation.mutate(body, {
            onSuccess: () => {
                toast({ title: CONSOLE_TOAST_MESSAGES.DELETED });
                onDeleteComplete();
            },
        });
    };

    return (
        <div className="h-full rounded-[12px] bg-white">
            {isInitialLoading ? (
                <LoadingSpinner />
            ) : (
                <form onSubmit={handleSubmit(handleConfirmSave)} className="flex h-full flex-col">
                    <div className="flex items-center justify-between p-[16px_20px]">
                        <div className="flex items-center gap-[10px]">
                            <p className="text-[20px] font-[700]">팝업 관리</p>
                            <Controller
                                name="p_open"
                                control={control}
                                render={({ field }) => (
                                    <Toggle
                                        {...field}
                                        checked={field.value === "Y"}
                                        txt="노출"
                                        className="justify-start"
                                        handleChange={checked => {
                                            setValue("p_open", checked ? "Y" : "N");
                                        }}
                                    />
                                )}
                            />
                        </div>
                        <button
                            type="button"
                            className="h-[34px] rounded-[8px] bg-[#FEE2E2] px-[16px] font-[500] text-[#E5313D]"
                            onClick={handleConfirmDelete}
                        >
                            삭제
                        </button>
                    </div>
                    <div className="min-h-0 flex-1 border-t border-[#D9D9D9]">
                        <ScrollArea className="h-full">
                            <ul className="flex flex-wrap gap-[20px] p-[20px_40px]">
                                <li className="flex w-full flex-col gap-[8px]">
                                    <label htmlFor="p_title" className="text-[#666]">
                                        팝업명<span className="pl-[5px] font-[700] text-console-2">*</span>
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
                                <li className="flex w-[calc(50%-10px)] flex-col gap-[8px]">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="p_width_size" className="text-[#666]">
                                            노출 사이즈 <span className="pl-[5px] font-[700] text-console-2">*</span>
                                        </label>
                                        <p className="text-[14px] text-console-2">팝업창 가로 세로 픽셀 단위</p>
                                    </div>
                                    <div>
                                        <ul className="flex gap-[4px]">
                                            <li className="flex-1">
                                                <InputBox
                                                    {...register("p_width_size")}
                                                    id="p_width_size"
                                                    className="pl-[40px] text-right"
                                                    numberInput
                                                    thousandSeparator
                                                    value={values.p_width_size}
                                                >
                                                    <p className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[#9F9FA5]">
                                                        가로
                                                    </p>
                                                </InputBox>
                                            </li>
                                            <li className="flex-1">
                                                <InputBox
                                                    {...register("p_height_size")}
                                                    className="pl-[40px] text-right"
                                                    numberInput
                                                    thousandSeparator
                                                    value={values.p_height_size}
                                                >
                                                    <p className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[#9F9FA5]">
                                                        세로
                                                    </p>
                                                </InputBox>
                                            </li>
                                        </ul>
                                        <InputError
                                            message={errors.p_width_size?.message || errors.p_height_size?.message}
                                        />
                                    </div>
                                </li>
                                <li className="flex w-[calc(50%-10px)] flex-col gap-[8px]">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="p_left_point" className="text-[#666]">
                                            팝업 위치
                                            {type === "P" && (
                                                <span className="pl-[5px] font-[700] text-console-2">*</span>
                                            )}
                                        </label>
                                        {type === "P" && (
                                            <p className="text-[14px] text-console-2">
                                                좌측 상단 기준 표시 위치 픽셀 단위
                                            </p>
                                        )}
                                    </div>
                                    {type === "P" && (
                                        <>
                                            <ul className="flex gap-[4px]">
                                                <li className="flex-1">
                                                    <InputBox
                                                        {...register("p_left_point")}
                                                        id="p_left_point"
                                                        className="pl-[40px] text-right"
                                                        numberInput
                                                        thousandSeparator
                                                        value={values.p_left_point}
                                                    >
                                                        <p className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[#9F9FA5]">
                                                            가로
                                                        </p>
                                                    </InputBox>
                                                </li>
                                                <li className="flex-1">
                                                    <InputBox
                                                        {...register("p_top_point")}
                                                        className="pl-[40px] text-right"
                                                        numberInput
                                                        thousandSeparator
                                                        value={values.p_top_point}
                                                    >
                                                        <p className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[#9F9FA5]">
                                                            세로
                                                        </p>
                                                    </InputBox>
                                                </li>
                                            </ul>
                                            <InputError message={errors.p_left_point?.message} />
                                        </>
                                    )}
                                    {type === "M" && (
                                        <p className="text-[14px] text-console-2">
                                            * 모바일의 경우 등록한 최신순을 가장 먼저 중앙 정렬되어 노출됩니다.
                                        </p>
                                    )}
                                </li>
                                <li className="flex w-[calc(50%-10px)] flex-col gap-[8px]">
                                    <p className="text-[#666]">
                                        팝업창 닫기 1일 유효 여부
                                        <span className="pl-[5px] font-[700] text-console-2">*</span>
                                    </p>
                                    <Controller
                                        name="p_one_day"
                                        control={control}
                                        render={({ field }) => (
                                            <ul className="flex justify-between py-[14px]">
                                                <li className="flex-1">
                                                    <Radio
                                                        {...field}
                                                        value="Y"
                                                        checked={field.value === "Y"}
                                                        txt="사용"
                                                    />
                                                </li>
                                                <li className="flex-1">
                                                    <Radio
                                                        {...field}
                                                        value="N"
                                                        checked={field.value === "N"}
                                                        txt="사용안함"
                                                    />
                                                </li>
                                            </ul>
                                        )}
                                    />
                                </li>
                                <li className="flex w-[calc(50%-10px)] flex-col gap-[8px]">
                                    <p className="text-[#666]">
                                        팝업/레이어 선택<span className="pl-[5px] font-[700] text-console-2">*</span>
                                    </p>
                                    <Controller
                                        name="p_layer_pop"
                                        control={control}
                                        render={({ field }) => (
                                            <ul className="flex justify-between py-[14px]">
                                                <li className="flex-1">
                                                    <Radio
                                                        {...field}
                                                        value="1"
                                                        checked={field.value === "1"}
                                                        txt="레이어"
                                                    />
                                                </li>
                                                <li className="flex-1">
                                                    <Radio
                                                        {...field}
                                                        value="2"
                                                        checked={field.value === "2"}
                                                        txt="팝업창"
                                                    />
                                                </li>
                                            </ul>
                                        )}
                                    />
                                </li>
                                <li className="flex w-full flex-col gap-[8px]">
                                    <p className="text-[#666]">
                                        노출기간 설정<span className="pl-[5px] font-[700] text-console-2">*</span>
                                    </p>
                                    <div className="flex justify-between">
                                        <Controller
                                            name="isDate"
                                            control={control}
                                            render={({ field }) => (
                                                <ul className="flex w-[calc(50%-10px)] justify-between py-[14px]">
                                                    <li className="flex-1">
                                                        <Radio
                                                            {...field}
                                                            value="N"
                                                            checked={field.value === "N"}
                                                            txt="상시노출"
                                                        />
                                                    </li>
                                                    <li className="flex-1">
                                                        <Radio
                                                            {...field}
                                                            value="Y"
                                                            checked={field.value === "Y"}
                                                            txt="기간노출"
                                                        />
                                                    </li>
                                                </ul>
                                            )}
                                        />
                                        {values.isDate === "Y" && (
                                            <div className="w-[calc(50%-10px)]">
                                                <DateRangePicker
                                                    startDate={values.p_s_date ?? null}
                                                    endDate={values.p_e_date ?? null}
                                                    setStartDate={date => date && setValue("p_s_date", date)}
                                                    setEndDate={date => date && setValue("p_e_date", date)}
                                                />
                                                <InputError message={errors.p_s_date?.message} />
                                            </div>
                                        )}
                                    </div>
                                </li>
                                <li className="flex w-[calc(50%-10px)] flex-col gap-[8px]">
                                    <p className="text-[#666]">링크 열림창</p>
                                    <Controller
                                        name="p_link_target"
                                        control={control}
                                        render={({ field }) => (
                                            <ul className="flex justify-between py-[14px]">
                                                <li className="flex-1">
                                                    <Radio
                                                        {...field}
                                                        value="1"
                                                        checked={field.value === "1"}
                                                        txt="현재창"
                                                    />
                                                </li>
                                                <li className="flex-1">
                                                    <Radio
                                                        {...field}
                                                        value="2"
                                                        checked={field.value === "2"}
                                                        txt="새창"
                                                    />
                                                </li>
                                            </ul>
                                        )}
                                    />
                                </li>
                                <li className="flex w-[calc(50%-10px)] flex-col gap-[8px]">
                                    <label htmlFor="p_link_url" className="text-[#666]">
                                        링크
                                    </label>
                                    <Input
                                        {...register("p_link_url")}
                                        id="p_link_url"
                                        className="w-full"
                                        placeholder="URL을 입력해주세요."
                                    />
                                </li>
                                <li className="w-full">
                                    <EditorWithHtml
                                        editorValue={values.p_content || ""}
                                        htmlValue={values.p_content_html || ""}
                                        type={values.p_content_type ?? "E"}
                                        onChangeEditorValue={cont => setValue("p_content", cont)}
                                        onChangeHtmlValue={cont => setValue("p_content_html", cont)}
                                        onTypeChange={type => setValue("p_content_type", type)}
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
