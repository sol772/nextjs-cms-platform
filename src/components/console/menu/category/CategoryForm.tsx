"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { memo, useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { Editor } from "@/components/blocks/editor-x/editor";
import InputError from "@/components/console/common/InputError";
import LoadingSpinner from "@/components/console/common/LoadingSpinner";
import Tabs from "@/components/console/common/Tabs";
import Checkbox from "@/components/console/form/Checkbox";
import FileUpload, { FileData } from "@/components/console/form/FileUpload";
import Input from "@/components/console/form/Input";
import LevelSelect from "@/components/console/form/LevelSelect";
import ListSizeSelect from "@/components/console/form/ListSizeSelect";
import MonacoHtmlEditor from "@/components/console/form/MonacoHtmlEditor";
import Radio from "@/components/console/form/Radio";
import Toggle from "@/components/console/form/Toggle";
import BoardGroupPop from "@/components/console/popup/BoardGroupPop";
import ImgUploadPop from "@/components/console/popup/ImgUploadPop";
import { ScrollArea } from "@/components/ui/scroll-area";
import { API_URL } from "@/config/apiConfig";
import { CONSOLE_CONFIRM_MESSAGES, CONSOLE_TOAST_MESSAGES } from "@/constants/console/messages";
import { useNotFoundOnError } from "@/hooks/common/useNotFoundOnError";
import { useToast } from "@/hooks/use-toast";
import {
    useDelCategory,
    useDelSubCategory,
    useGetCategory,
    useGetSubCategory,
    usePostCategory,
    usePostSubCategory,
    usePutCategory,
    usePutSubCategory,
} from "@/service/console/menu/category";
import { usePopupStore } from "@/store/console/usePopupStore";

const schema = z
    .object({
        c_use_yn: z.enum(["Y", "N"]),
        c_name: z.string().min(1, "카테고리명을 입력해주세요."),
        c_link_target: z.enum(["1", "2"]),
        c_link_url: z.string().optional(),
        c_main_banner: z.enum(["1", "2"]),
        c_content_type: z.number(),
        content: z.string().optional(),
        c_type: z.enum(["1", "2"]),
        file_path: z.string().optional(),
        admin_file_path: z.string().optional(),
        sms: z.string().optional(),
        email: z.string().optional(),
        b_column_title: z.enum(["Y", "N"]),
        b_column_date: z.enum(["Y", "N"]),
        b_column_view: z.enum(["Y", "N"]),
        b_column_file: z.enum(["Y", "N"]),
        b_list_cnt: z.number(),
        b_read_lv: z.number(),
        b_write_lv: z.number(),
        b_secret: z.enum(["Y", "N"]),
        b_reply: z.enum(["Y", "N"]),
        b_reply_lv: z.number(),
        b_comment: z.enum(["Y", "N"]),
        b_comment_lv: z.number(),
        b_alarm: z.enum(["Y", "N"]),
        b_alarm_email: z.string().optional(),
        b_top_html: z.string().optional(),
        b_template: z.enum(["Y", "N"]),
        b_template_text: z.string().optional(),
        b_write_alarm: z.enum(["Y", "N"]),
        b_write_send: z.enum(["Y", "N"]),
        b_write_sms: z.enum(["Y", "N"]),
        b_group: z.enum(["Y", "N"]),
        c_kind_use: z.enum(["Y", "N"]),
        b_gallery_type: z.enum(["1", "2", "3"]),
    })
    .superRefine((data, ctx) => {
        if (data.c_content_type === 3) {
            if (!data.file_path || !data.admin_file_path) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "파일 경로를 입력해주세요.",
                    path: ["file_path"],
                });
            }
            if (!data.sms) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "휴대폰번호를 입력해주세요.",
                    path: ["sms"],
                });
            } else if (!/^01[016789]-\d{3,4}-\d{4}$/.test(data.sms)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "올바른 휴대폰번호 형식을 입력해주세요.",
                    path: ["sms"],
                });
            }
            if (!data.email) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "이메일을 입력해주세요.",
                    path: ["email"],
                });
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "올바른 이메일 형식을 입력해주세요.",
                    path: ["email"],
                });
            }
        }
        if (data.b_alarm === "Y") {
            if (!data.b_alarm_email) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "이메일을 입력해주세요.",
                    path: ["b_alarm_email"],
                });
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.b_alarm_email)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "올바른 이메일 형식을 입력해주세요.",
                    path: ["b_alarm_email"],
                });
            }
        }
        // if (data.b_write_alarm === "Y" && data.b_write_send === "N" && data.b_write_sms === "N") {
        //     ctx.addIssue({
        //         code: z.ZodIssueCode.custom,
        //         message: "이메일 또는 문자 중 선택해주세요.",
        //         path: ["b_write_alarm"],
        //     });
        // }
    });

type FormValues = z.infer<typeof schema>;

interface CategoryFormProps {
    lang: string;
    mode: "create" | "edit";
    isSub: boolean; // 서브카테고리 여부
    detailIdx: string;
    depth: number;
    onComplete: (isSub?: boolean) => void;
    handleCancel: () => void;
    onDeleteComplete: () => void;
}

interface Info {
    id: number;
    c_depth: number;
    c_depth_parent: number;
    c_num: number;
    c_content_type: number;
    b_column_title: string;
    b_column_date: string;
    b_column_view: string;
    b_column_file: string;
    b_list_cnt: number;
    b_read_lv: number;
    b_write_lv: number;
    b_secret: string;
    b_reply: string;
    b_reply_lv: number;
    b_comment: string;
    b_comment_lv: number;
    b_alarm: string;
    b_alarm_email: string;
    b_top_html: string;
    b_template: string;
    b_template_text: string;
    b_group: string;
    c_kind_use: string;
    b_gallery_type: string;
}

const initialValues: FormValues = {
    c_use_yn: "Y",
    c_name: "",
    c_link_target: "1",
    c_link_url: "",
    c_main_banner: "1",
    c_content_type: 1,
    content: "",
    c_type: "1",
    b_column_title: "Y",
    b_column_date: "Y",
    b_column_view: "Y",
    b_column_file: "Y",
    b_list_cnt: 10,
    b_read_lv: 0,
    b_write_lv: 0,
    b_secret: "N",
    b_reply: "N",
    b_reply_lv: 0,
    b_comment: "N",
    b_comment_lv: 0,
    b_alarm: "N",
    b_alarm_email: "",
    b_template: "N",
    b_write_alarm: "N",
    b_write_send: "N",
    b_write_sms: "N",
    b_group: "N",
    c_kind_use: "N",
    b_gallery_type: "1",
};

export default memo(function CategoryForm({
    lang,
    mode = "create",
    isSub = false,
    detailIdx,
    depth,
    onComplete,
    handleCancel,
    onDeleteComplete,
}: CategoryFormProps) {
    const tabList = ["HTML", "빈메뉴", "맞춤", "일반게시판", "갤러리", "FAQ", "문의게시판"];
    const [tabOn, setTabOn] = useState(0);
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
    const [info, setInfo] = useState<Info | null>(null);
    const [getCategory, setGetCategory] = useState(false);
    const [getSubCategory, setGetSubCategory] = useState(false);
    const [files, setFiles] = useState<FileData[]>([]);
    const [filesData, setFilesData] = useState<File[]>([]);
    const {
        data: categoryData,
        isLoading: isCategoryLoading,
        error: getCategoryError,
        refetch: refetchCategory,
    } = useGetCategory(detailIdx, {
        enabled: getCategory && Boolean(detailIdx) && mode === "edit",
    });
    const {
        data: subCategoryData,
        isLoading: isSubCategoryLoading,
        error: getSubCategoryError,
        refetch: refetchSubCategory,
    } = useGetSubCategory(detailIdx, {
        enabled: getSubCategory && Boolean(detailIdx) && mode === "edit",
    });
    const postCategoryMutation = usePostCategory();
    const postSubCategoryMutation = usePostSubCategory();
    const putCategoryMutation = usePutCategory();
    const putSubCategoryMutation = usePutSubCategory();
    const delCategoryMutation = useDelCategory();
    const delSubCategoryMutation = useDelSubCategory();
    const { setConfirmPop } = usePopupStore();
    const { toast } = useToast();

    // 카테고리 또는 서브카테고리 조회 여부 설정
    useEffect(() => {
        if (detailIdx && !isSub && mode === "edit") {
            setGetCategory(true);
        } else {
            setGetCategory(false);
        }
        if (detailIdx && isSub && mode === "edit") {
            setGetSubCategory(true);
        } else {
            setGetSubCategory(false);
        }
    }, [detailIdx, isSub, mode]);

    // 상세 조회
    useEffect(() => {
        // 등록 시 초기화
        if (mode === "create") {
            reset(initialValues);
            setFiles([]);
            setFilesData([]);
            return;
        }
        if (mode === "edit") {
            // 1차 카테고리 수정
            if (categoryData) {
                const { c_use_yn, c_name, c_link_target, c_link_url, c_main_banner, c_main_banner_file } =
                    categoryData.data;
                reset({
                    ...initialValues,
                    c_use_yn,
                    c_name,
                    c_link_target: c_link_target ? c_link_target[0] : "1",
                    c_link_url: c_link_url || "",
                    c_main_banner: c_main_banner[0],
                });
                if (c_main_banner_file) {
                    setFiles([
                        {
                            idx: uuidv4(),
                            original_name: c_main_banner_file,
                            url: `${API_URL}/${c_main_banner_file}`,
                        },
                    ]);
                } else {
                    setFiles([]);
                }
            }
            // 하위 카테고리 수정
            if (subCategoryData) {
                const {
                    c_use_yn,
                    c_name,
                    c_link_target,
                    c_link_url,
                    c_content_type,
                    content,
                    c_type,
                    file_path,
                    admin_file_path,
                    sms,
                    email,
                    b_column_title,
                    b_column_date,
                    b_column_view,
                    b_column_file,
                    b_list_cnt,
                    b_read_lv,
                    b_write_lv,
                    b_secret,
                    b_reply,
                    b_reply_lv,
                    b_comment,
                    b_comment_lv,
                    b_alarm,
                    b_alarm_email,
                    b_top_html,
                    b_template,
                    b_template_text,
                    b_write_alarm,
                    b_write_send,
                    b_write_sms,
                    b_group,
                    c_kind_use,
                    b_gallery_type,
                } = subCategoryData.data;
                reset({
                    ...initialValues,
                    c_use_yn,
                    c_name,
                    c_link_target: c_link_target ? c_link_target[0] : initialValues.c_link_target,
                    c_link_url: c_link_url || initialValues.c_link_url,
                    c_content_type: c_content_type[0],
                    content,
                    c_type: c_type ? c_type.toString() : initialValues.c_type,
                    file_path,
                    admin_file_path,
                    sms,
                    email,
                    b_column_title: b_column_title ?? initialValues.b_column_title,
                    b_column_date: b_column_date ?? initialValues.b_column_date,
                    b_column_view: b_column_view ?? initialValues.b_column_view,
                    b_column_file: b_column_file ?? initialValues.b_column_file,
                    b_list_cnt: b_list_cnt ?? initialValues.b_list_cnt,
                    b_read_lv: b_read_lv ?? initialValues.b_read_lv,
                    b_write_lv: b_write_lv ?? initialValues.b_write_lv,
                    b_secret: b_secret ?? initialValues.b_secret,
                    b_reply: b_reply ?? initialValues.b_reply,
                    b_reply_lv: b_reply_lv ?? initialValues.b_reply_lv,
                    b_comment: b_comment ?? initialValues.b_comment,
                    b_comment_lv: b_comment_lv ?? initialValues.b_comment_lv,
                    b_alarm: b_alarm ?? initialValues.b_alarm,
                    b_alarm_email: b_alarm_email ?? initialValues.b_alarm_email,
                    b_top_html: b_top_html ?? initialValues.b_top_html,
                    b_template: b_template ?? initialValues.b_template,
                    b_template_text: b_template_text ?? initialValues.b_template_text,
                    b_write_alarm: b_write_alarm ?? initialValues.b_write_alarm,
                    b_write_send: b_write_send ?? initialValues.b_write_send,
                    b_write_sms: b_write_sms ?? initialValues.b_write_sms,
                    b_group: b_group ?? initialValues.b_group,
                    c_kind_use: c_kind_use ?? initialValues.c_kind_use,
                    b_gallery_type: b_gallery_type ?? initialValues.b_gallery_type,
                });
                setInfo({ ...subCategoryData.data, c_content_type: c_content_type[0] });
                setTabOn(c_content_type[0] - 1);
            } else {
                setInfo(null);
                setTabOn(0);
            }
        }
    }, [categoryData, subCategoryData, mode]); // eslint-disable-line react-hooks/exhaustive-deps

    // 404 에러 처리
    useNotFoundOnError(getCategoryError, getSubCategoryError);

    // 카테고리 종류 변경
    const handleChangeTab = (idx: number) => {
        const index = idx + 1;
        setValue("c_content_type", index);
    };

    // 카테고리 종류 변경 시 탭 변경
    useEffect(() => {
        if (values.c_content_type) {
            setTabOn(values.c_content_type - 1);
        }
    }, [values.c_content_type]);

    // 하위카테고리 수정일때 카테고리 종류 변경 시 중복값 초기화
    useEffect(() => {
        if (mode === "edit" && isSub && info) {
            if (tabOn + 1 !== info.c_content_type) {
                setValue("b_column_title", initialValues.b_column_title);
                setValue("b_column_date", initialValues.b_column_date);
                setValue("b_column_view", initialValues.b_column_view);
                setValue("b_column_file", initialValues.b_column_file);
                setValue("b_list_cnt", initialValues.b_list_cnt);
                setValue("b_read_lv", initialValues.b_read_lv);
                setValue("b_write_lv", initialValues.b_write_lv);
                setValue("b_secret", initialValues.b_secret);
                setValue("b_reply", initialValues.b_reply);
                setValue("b_reply_lv", initialValues.b_reply_lv);
                setValue("b_comment", initialValues.b_comment);
                setValue("b_comment_lv", initialValues.b_comment_lv);
                setValue("b_alarm", initialValues.b_alarm);
                setValue("b_alarm_email", initialValues.b_alarm_email);
                setValue("b_top_html", initialValues.b_top_html);
                setValue("b_template", initialValues.b_template);
                setValue("b_template_text", initialValues.b_template_text);
                setValue("b_write_alarm", initialValues.b_write_alarm);
                setValue("b_group", initialValues.b_group);
                setValue("c_kind_use", initialValues.c_kind_use);
                setValue("b_gallery_type", initialValues.b_gallery_type);
            } else {
                setValue("b_column_title", (info.b_column_title as "Y" | "N") || initialValues.b_column_title);
                setValue("b_column_date", (info.b_column_date as "Y" | "N") || initialValues.b_column_date);
                setValue("b_column_view", (info.b_column_view as "Y" | "N") || initialValues.b_column_view);
                setValue("b_column_file", (info.b_column_file as "Y" | "N") || initialValues.b_column_file);
                setValue("b_list_cnt", info.b_list_cnt || initialValues.b_list_cnt);
                setValue("b_read_lv", info.b_read_lv || initialValues.b_read_lv);
                setValue("b_write_lv", info.b_write_lv || initialValues.b_write_lv);
                setValue("b_secret", (info.b_secret as "Y" | "N") || initialValues.b_secret);
                setValue("b_reply", (info.b_reply as "Y" | "N") || initialValues.b_reply);
                setValue("b_reply_lv", info.b_reply_lv || initialValues.b_reply_lv);
                setValue("b_comment", (info.b_comment as "Y" | "N") || initialValues.b_comment);
                setValue("b_comment_lv", info.b_comment_lv || initialValues.b_comment_lv);
                setValue("b_alarm", (info.b_alarm as "Y" | "N") || initialValues.b_alarm);
                setValue("b_alarm_email", info.b_alarm_email || initialValues.b_alarm_email);
                setValue("b_top_html", info.b_top_html || initialValues.b_top_html);
                setValue("b_template", (info.b_template as "Y" | "N") || initialValues.b_template);
                setValue("b_template_text", info.b_template_text || initialValues.b_template_text);
                setValue("b_group", (info.b_group as "Y" | "N") || initialValues.b_group);
                setValue("c_kind_use", (info.c_kind_use as "Y" | "N") || initialValues.c_kind_use);
                setValue("b_gallery_type", (info.b_gallery_type as "1" | "2" | "3") || initialValues.b_gallery_type);
            }
        }
    }, [tabOn, info, mode, isSub]); // eslint-disable-line react-hooks/exhaustive-deps

    // 저장 확인
    const handleConfirmSave = (data: FormValues) => {
        setConfirmPop(true, CONSOLE_CONFIRM_MESSAGES.SAVE, 2, () => onSubmit(data));
    };

    // 저장하기
    const onSubmit = (data: FormValues) => {
        const { b_gallery_type, b_write_alarm, ...formData } = data;
        const baseBody = {
            ...formData,
            b_write_alarm,
            b_write_send: b_write_alarm === "Y" ? "Y" : "N",
            b_write_sms: "N", //현재 사용안함 "N"으로 고정값
        };

        // 카테고리 수정
        if (mode === "edit") {
            // 하위 카테고리 수정
            if (isSub) {
                if (!info) return;
                const body = {
                    ...baseBody,
                    c_link_url: baseBody.c_link_url || "",
                    id: info?.id,
                    c_content_type: tabOn + 1,
                    content: baseBody.content || "",
                    file_path: baseBody.file_path || "",
                    admin_file_path: baseBody.admin_file_path || "",
                    sms: baseBody.sms || "",
                    email: baseBody.email || "",
                    b_alarm_email: baseBody.b_alarm_email || "",
                    b_top_html: baseBody.b_top_html || "",
                    b_template_text: baseBody.b_template_text || "",
                    c_depth: info?.c_depth,
                    c_depth_parent: info?.c_depth_parent,
                    c_num: info?.c_num,
                    c_lang: lang,
                    c_main_banner_file: [],
                    b_gallery_type: tabOn === 4 ? b_gallery_type : "",
                };

                putSubCategoryMutation.mutate(body, {
                    onSuccess: () => {
                        toast({ title: CONSOLE_TOAST_MESSAGES.UPDATED });
                        onComplete(true);
                        refetchSubCategory();
                    },
                });
            }
            // 1차 카테고리 수정
            else {
                const body = {
                    id: Number(detailIdx),
                    c_name: baseBody.c_name,
                    c_link_target: baseBody.c_link_target,
                    c_link_url: baseBody.c_link_url || "",
                    c_main_banner: baseBody.c_main_banner,
                    c_main_banner_file: filesData,
                    c_use_yn: baseBody.c_use_yn,
                    c_main_banner_file_del: files.length > 0 ? "N" : "Y",
                };

                putCategoryMutation.mutate(body, {
                    onSuccess: () => {
                        toast({ title: CONSOLE_TOAST_MESSAGES.UPDATED });
                        onComplete();
                        refetchCategory();
                    },
                });
            }
        }
        // 카테고리 등록
        else {
            // 하위 카테고리 등록
            if (isSub) {
                const body = {
                    ...baseBody,
                    c_link_url: baseBody.c_link_url || "",
                    content: baseBody.content || "",
                    file_path: baseBody.file_path || "",
                    admin_file_path: baseBody.admin_file_path || "",
                    sms: baseBody.sms || "",
                    email: baseBody.email || "",
                    b_alarm_email: baseBody.b_alarm_email || "",
                    b_top_html: baseBody.b_top_html || "",
                    b_template_text: baseBody.b_template_text || "",
                    c_depth: depth + 1,
                    c_depth_parent: Number(detailIdx),
                    c_num: "", // 고정값
                    c_lang: lang,
                    c_main_banner_file: [],
                    b_gallery_type: tabOn === 4 ? b_gallery_type : "",
                };

                postSubCategoryMutation.mutate(body, {
                    onSuccess: () => {
                        toast({ title: CONSOLE_TOAST_MESSAGES.CREATED });
                        onComplete(depth > 1);
                    },
                });
            }
            // 1차 카테고리 등록
            else {
                const body = {
                    c_depth: 1, // 고정값
                    c_depth_parent: 0, // 고정값
                    c_num: "", // 고정값
                    c_name: baseBody.c_name,
                    c_link_target: baseBody.c_link_target,
                    c_link_url: baseBody.c_link_url || "",
                    c_main_banner: baseBody.c_main_banner,
                    c_main_banner_file: filesData,
                    c_use_yn: baseBody.c_use_yn,
                    c_lang: lang,
                };

                postCategoryMutation.mutate(body, {
                    onSuccess: () => {
                        toast({ title: CONSOLE_TOAST_MESSAGES.CREATED });
                        onComplete();
                    },
                });
            }
        }
    };

    // 삭제 확인
    const handleConfirmDelete = () => {
        setConfirmPop(true, CONSOLE_CONFIRM_MESSAGES.DELETE, 2, () => handleDelete(), undefined, "", "red");
    };

    // 삭제하기
    const handleDelete = () => {
        const body = { id: Number(detailIdx) };
        if (isSub) {
            delSubCategoryMutation.mutate(body, {
                onSuccess: () => {
                    toast({ title: CONSOLE_TOAST_MESSAGES.DELETED });
                    onDeleteComplete();
                },
            });
        } else {
            delCategoryMutation.mutate(body, {
                onSuccess: () => {
                    toast({ title: CONSOLE_TOAST_MESSAGES.DELETED });
                    onDeleteComplete();
                },
            });
        }
    };

    return (
        <div className="h-full rounded-[12px] bg-white">
            {isCategoryLoading || isSubCategoryLoading ? (
                <LoadingSpinner />
            ) : (
                <form onSubmit={handleSubmit(handleConfirmSave)} className="flex h-full flex-col">
                    <div className="flex items-center justify-between p-[16px_20px]">
                        <div className="flex items-center gap-[10px]">
                            <p className="text-[20px] font-[700]">카테고리</p>
                            <Controller
                                name="c_use_yn"
                                control={control}
                                render={({ field }) => (
                                    <Toggle
                                        {...field}
                                        checked={field.value === "Y"}
                                        txt="노출"
                                        className="justify-start"
                                        handleChange={checked => {
                                            setValue("c_use_yn", checked ? "Y" : "N");
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
                                    <label htmlFor="c_name" className="text-[#666]">
                                        카테고리명<span className="pl-[5px] font-[700] text-console-2">*</span>
                                    </label>
                                    <div>
                                        <Input
                                            {...register("c_name")}
                                            id="c_name"
                                            placeholder="카테고리명을 입력해주세요."
                                        />
                                        <InputError message={errors.c_name?.message} />
                                    </div>
                                </li>
                                <li className="flex w-[calc(50%-10px)] flex-col gap-[8px]">
                                    <p className="text-[#666]">링크 열림창</p>
                                    <Controller
                                        name="c_link_target"
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
                                    <label htmlFor="c_link_url" className="text-[#666]">
                                        링크
                                    </label>
                                    <Input
                                        {...register("c_link_url")}
                                        id="c_link_url"
                                        className="w-full"
                                        placeholder="URL을 입력해주세요."
                                    />
                                </li>
                                {!isSub && ( // 1차 카테고리일때만 노출
                                    <>
                                        <li className="flex w-[calc(50%-10px)] flex-col gap-[8px]">
                                            <p className="text-[#666]">서브 메인 배너</p>
                                            <Controller
                                                name="c_main_banner"
                                                control={control}
                                                render={({ field }) => (
                                                    <ul className="flex justify-between py-[14px]">
                                                        <li className="flex-1">
                                                            <Radio
                                                                {...field}
                                                                value="1"
                                                                checked={field.value === "1"}
                                                                txt="커버"
                                                            />
                                                        </li>
                                                        <li className="flex-1">
                                                            <Radio
                                                                {...field}
                                                                value="2"
                                                                checked={field.value === "2"}
                                                                txt="원본 사이즈 고정"
                                                            />
                                                        </li>
                                                    </ul>
                                                )}
                                            />
                                        </li>
                                        <li className="flex w-full flex-col gap-[8px]">
                                            <p className="text-[#666]">배너 등록</p>
                                            <FileUpload
                                                uploadFiles={files}
                                                setFiles={setFiles}
                                                setFilesData={setFilesData}
                                                handleDelt={() => {
                                                    setFiles([]);
                                                    setFilesData([]);
                                                }}
                                                showPreview
                                                accept="image/*"
                                            />
                                        </li>
                                    </>
                                )}
                                {isSub && ( // 하위 카테고리일때만 노출
                                    <li className="flex w-full flex-col gap-[8px]">
                                        <p className="text-[#666]">카테고리 종류</p>
                                        <Tabs list={tabList} activeIdx={tabOn} handleClick={handleChangeTab} />
                                        <div className="overflow-hidden rounded-[8px] border border-[#D9D9D9]">
                                            <div className="bg-[#F2F3F8] p-[16px_20px] text-[20px] font-[700]">
                                                {tabList[tabOn]}
                                            </div>
                                            <ul className="flex flex-wrap gap-[20px] border-t border-[#D9D9D9] p-[20px]">
                                                {tabOn === 0 && ( // HTML 카테고리일때만 노출
                                                    <li className="flex w-full flex-col gap-[8px]">
                                                        <ImgUploadPop />
                                                        <MonacoHtmlEditor
                                                            value={values.content || ""}
                                                            onChange={cont => setValue("content", cont)}
                                                        />
                                                    </li>
                                                )}
                                                {tabOn === 1 && ( // 빈 메뉴 카테고리일때만 노출
                                                    <li className="flex w-full items-center justify-center py-[40px]">
                                                        <p className="text-[18px]">
                                                            빈 메뉴 카테고리를 선택하였습니다.
                                                        </p>
                                                    </li>
                                                )}
                                                {tabOn === 2 && ( // 맞춤 카테고리일때만 노출
                                                    <>
                                                        <li className="flex w-full flex-col gap-[8px]">
                                                            <p className="text-[#666]">
                                                                유형
                                                                <span className="pl-[5px] font-[700] text-console-2">
                                                                    *
                                                                </span>
                                                            </p>
                                                            <Controller
                                                                name="c_type"
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <ul className="flex w-[calc(50%-10px)] justify-between py-[14px]">
                                                                        <li className="flex-1">
                                                                            <Radio
                                                                                {...field}
                                                                                value="1"
                                                                                checked={field.value === "1"}
                                                                                txt="폼메일(게시판)"
                                                                            />
                                                                        </li>
                                                                        <li className="flex-1">
                                                                            <Radio
                                                                                {...field}
                                                                                value="2"
                                                                                checked={field.value === "2"}
                                                                                txt="일반"
                                                                            />
                                                                        </li>
                                                                    </ul>
                                                                )}
                                                            />
                                                        </li>
                                                        <li className="flex w-[calc(50%-10px)] flex-col gap-[8px]">
                                                            <label htmlFor="file_path" className="text-[#666]">
                                                                파일경로
                                                                <span className="pl-[5px] font-[700] text-console-2">
                                                                    *
                                                                </span>
                                                            </label>
                                                            <div>
                                                                <Input
                                                                    {...register("file_path")}
                                                                    id="file_path"
                                                                    placeholder="파일 경로를 입력해주세요."
                                                                />
                                                                <InputError message={errors.file_path?.message} />
                                                            </div>
                                                        </li>
                                                        <li className="flex w-[calc(50%-10px)] flex-col gap-[8px]">
                                                            <label htmlFor="admin_file_path" className="text-[#666]">
                                                                관리자 파일경로
                                                                <span className="pl-[5px] font-[700] text-console-2">
                                                                    *
                                                                </span>
                                                            </label>
                                                            <div>
                                                                <Input
                                                                    {...register("admin_file_path")}
                                                                    id="admin_file_path"
                                                                    placeholder="파일 경로를 입력해주세요."
                                                                />
                                                                <InputError message={errors.file_path?.message} />
                                                            </div>
                                                        </li>
                                                        <li className="flex w-[calc(50%-10px)] flex-col gap-[8px]">
                                                            <label htmlFor="sms" className="text-[#666]">
                                                                수신 문자
                                                                <span className="pl-[5px] font-[700] text-console-2">
                                                                    *
                                                                </span>
                                                            </label>
                                                            <div>
                                                                <Controller
                                                                    name="sms"
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <Input
                                                                            {...field}
                                                                            id="sms"
                                                                            placeholder="숫자만 입력해주세요."
                                                                            formattedInput
                                                                        />
                                                                    )}
                                                                />
                                                                <InputError message={errors.sms?.message} />
                                                            </div>
                                                        </li>
                                                        <li className="flex w-[calc(50%-10px)] flex-col gap-[8px]">
                                                            <label htmlFor="email" className="text-[#666]">
                                                                수신 메일
                                                                <span className="pl-[5px] font-[700] text-console-2">
                                                                    *
                                                                </span>
                                                            </label>
                                                            <div>
                                                                <Input
                                                                    {...register("email")}
                                                                    id="email"
                                                                    placeholder="ID@example.com"
                                                                />
                                                                <InputError message={errors.email?.message} />
                                                            </div>
                                                        </li>
                                                    </>
                                                )}
                                                {tabOn === 4 && ( // 갤러리 카테고리일때만 노출
                                                    <li className="flex w-full flex-col gap-[8px]">
                                                        <p className="text-[#666]">갤러리 종류</p>
                                                        <Controller
                                                            name="b_gallery_type"
                                                            control={control}
                                                            render={({ field }) => (
                                                                <ul className="flex justify-between py-[14px]">
                                                                    <li className="flex-1">
                                                                        <Radio
                                                                            {...field}
                                                                            value="1"
                                                                            checked={field.value === "1"}
                                                                            txt="갤러리1"
                                                                        />
                                                                    </li>
                                                                    <li className="flex-1">
                                                                        <Radio
                                                                            {...field}
                                                                            value="2"
                                                                            checked={field.value === "2"}
                                                                            txt="갤러리2"
                                                                        />
                                                                    </li>
                                                                    <li className="flex-1">
                                                                        <Radio
                                                                            {...field}
                                                                            value="3"
                                                                            checked={field.value === "3"}
                                                                            txt="갤러리3"
                                                                        />
                                                                    </li>
                                                                </ul>
                                                            )}
                                                        />
                                                    </li>
                                                )}
                                                {tabOn > 2 && ( // 게시판 카테고리일때만 노출
                                                    <>
                                                        {tabOn !== 5 && ( // FAQ 아닐때만 노출
                                                            <li className="flex w-[calc(50%-10px)] flex-col gap-[8px]">
                                                                <p className="text-[#666]">목록 요소</p>
                                                                <ul className="flex flex-wrap justify-between py-[16px]">
                                                                    <Controller
                                                                        name="b_column_title"
                                                                        control={control}
                                                                        render={({ field }) => (
                                                                            <li>
                                                                                <Checkbox
                                                                                    {...field}
                                                                                    checked={field.value === "Y"}
                                                                                    txt="제목"
                                                                                    className="justify-start"
                                                                                    onChange={e => {
                                                                                        const check =
                                                                                            e.currentTarget.checked;
                                                                                        setValue(
                                                                                            "b_column_title",
                                                                                            check ? "Y" : "N",
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            </li>
                                                                        )}
                                                                    />
                                                                    <Controller
                                                                        name="b_column_date"
                                                                        control={control}
                                                                        render={({ field }) => (
                                                                            <li>
                                                                                <Checkbox
                                                                                    {...field}
                                                                                    checked={field.value === "Y"}
                                                                                    txt="등록 일자"
                                                                                    className="justify-start"
                                                                                    onChange={e => {
                                                                                        const check =
                                                                                            e.currentTarget.checked;
                                                                                        setValue(
                                                                                            "b_column_date",
                                                                                            check ? "Y" : "N",
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            </li>
                                                                        )}
                                                                    />
                                                                    <Controller
                                                                        name="b_column_view"
                                                                        control={control}
                                                                        render={({ field }) => (
                                                                            <li>
                                                                                <Checkbox
                                                                                    {...field}
                                                                                    checked={field.value === "Y"}
                                                                                    txt="조회수"
                                                                                    className="justify-start"
                                                                                    onChange={e => {
                                                                                        const check =
                                                                                            e.currentTarget.checked;
                                                                                        setValue(
                                                                                            "b_column_view",
                                                                                            check ? "Y" : "N",
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            </li>
                                                                        )}
                                                                    />
                                                                    <Controller
                                                                        name="b_column_file"
                                                                        control={control}
                                                                        render={({ field }) => (
                                                                            <li>
                                                                                <Checkbox
                                                                                    {...field}
                                                                                    checked={field.value === "Y"}
                                                                                    txt="파일"
                                                                                    className="justify-start"
                                                                                    onChange={e => {
                                                                                        const check =
                                                                                            e.currentTarget.checked;
                                                                                        setValue(
                                                                                            "b_column_file",
                                                                                            check ? "Y" : "N",
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            </li>
                                                                        )}
                                                                    />
                                                                </ul>
                                                            </li>
                                                        )}
                                                        <li className="flex w-[calc(50%-10px)] flex-col gap-[8px]">
                                                            <p className="text-[#666]">목록 개수</p>
                                                            <Controller
                                                                name="b_list_cnt"
                                                                control={control}
                                                                render={({ field }) => <ListSizeSelect {...field} />}
                                                            />
                                                        </li>
                                                        {tabOn > 2 && ( // 게시판 카테고리일때만 노출
                                                            <li className="flex w-full flex-col gap-[8px]">
                                                                <p className="text-[#666]">게시판 분류 사용여부</p>
                                                                {mode === "create" && (
                                                                    <p className="py-[5px] text-[14px] text-console-2">
                                                                        * 카테고리를 등록 후 수정 시에 설정 가능합니다.
                                                                    </p>
                                                                )}
                                                                {mode === "edit" && (
                                                                    <div className="flex items-center gap-[20px]">
                                                                        <div className="flex items-center justify-start">
                                                                            <Controller
                                                                                name="b_group"
                                                                                control={control}
                                                                                render={({ field }) => (
                                                                                    <Checkbox
                                                                                        {...field}
                                                                                        checked={field.value === "Y"}
                                                                                        txt="체크시 게시판 분류를 사용합니다."
                                                                                        onChange={e => {
                                                                                            const check =
                                                                                                e.currentTarget.checked;
                                                                                            setValue(
                                                                                                "b_group",
                                                                                                check ? "Y" : "N",
                                                                                            );
                                                                                        }}
                                                                                    />
                                                                                )}
                                                                            />
                                                                        </div>
                                                                        <BoardGroupPop
                                                                            showAllUseCheck={true}
                                                                            parentId={detailIdx}
                                                                            allUseCheck={values.c_kind_use === "Y"}
                                                                            handleAllUseCheck={checked => {
                                                                                setValue(
                                                                                    "c_kind_use",
                                                                                    checked ? "Y" : "N",
                                                                                );
                                                                            }}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </li>
                                                        )}
                                                        {tabOn !== 5 && ( // FAQ 아닐때만 노출
                                                            <>
                                                                <li className="flex w-[calc(50%-10px)] gap-[8px]">
                                                                    <div className="flex w-[calc(50%-4px)] flex-col gap-[8px]">
                                                                        <p className="text-[#666]">읽기 권한</p>
                                                                        <Controller
                                                                            name="b_read_lv"
                                                                            control={control}
                                                                            render={({ field }) => (
                                                                                <LevelSelect
                                                                                    value={field.value}
                                                                                    onChange={field.onChange}
                                                                                    className="min-w-full"
                                                                                />
                                                                            )}
                                                                        />
                                                                    </div>
                                                                    <div className="flex w-[calc(50%-4px)] flex-col gap-[8px]">
                                                                        <p className="text-[#666]">쓰기 권한</p>
                                                                        <Controller
                                                                            name="b_write_lv"
                                                                            control={control}
                                                                            render={({ field }) => (
                                                                                <LevelSelect
                                                                                    value={field.value}
                                                                                    onChange={field.onChange}
                                                                                    className="min-w-full"
                                                                                />
                                                                            )}
                                                                        />
                                                                    </div>
                                                                </li>
                                                                <li className="flex w-[calc(50%-10px)] flex-col gap-[8px]">
                                                                    <p className="text-[#666]">
                                                                        작성 시 비밀글 설정 여부
                                                                    </p>
                                                                    <div className="flex h-[48px] items-center justify-start">
                                                                        <Controller
                                                                            name="b_secret"
                                                                            control={control}
                                                                            render={({ field }) => (
                                                                                <Checkbox
                                                                                    {...field}
                                                                                    checked={field.value === "Y"}
                                                                                    txt="체크 시 비밀글 설정 가능"
                                                                                    onChange={e => {
                                                                                        const check =
                                                                                            e.currentTarget.checked;
                                                                                        setValue(
                                                                                            "b_secret",
                                                                                            check ? "Y" : "N",
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            )}
                                                                        />
                                                                    </div>
                                                                </li>
                                                                <li className="flex w-[calc(50%-10px)] flex-col gap-[8px]">
                                                                    <p className="text-[#666]">게시 알림 사용</p>
                                                                    <div className="flex h-[48px] items-center justify-start">
                                                                        <Controller
                                                                            name="b_alarm"
                                                                            control={control}
                                                                            render={({ field }) => (
                                                                                <Checkbox
                                                                                    {...field}
                                                                                    checked={field.value === "Y"}
                                                                                    txt="체크시 알림 전송"
                                                                                    onChange={e => {
                                                                                        const check =
                                                                                            e.currentTarget.checked;
                                                                                        setValue(
                                                                                            "b_alarm",
                                                                                            check ? "Y" : "N",
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            )}
                                                                        />
                                                                    </div>
                                                                </li>
                                                                <li className="flex w-[calc(50%-10px)] flex-col gap-[8px]">
                                                                    <label
                                                                        htmlFor="b_alarm_email"
                                                                        className="text-[#666]"
                                                                    >
                                                                        게시 알림 전송 이메일
                                                                    </label>
                                                                    <div>
                                                                        <Controller
                                                                            name="b_alarm_email"
                                                                            control={control}
                                                                            render={({ field }) => (
                                                                                <Input
                                                                                    {...field}
                                                                                    id="b_alarm_email"
                                                                                    placeholder="이메일을 입력해주세요."
                                                                                />
                                                                            )}
                                                                        />
                                                                        <InputError
                                                                            message={errors.b_alarm_email?.message}
                                                                        />
                                                                    </div>
                                                                </li>
                                                            </>
                                                        )}
                                                        {tabOn < 5 && ( // 일반게시판,갤러리 일때만 노출
                                                            <>
                                                                <li className="flex w-[calc(50%-10px)] flex-col gap-[8px]">
                                                                    <p className="text-[#666]">답글 사용 및 권한</p>
                                                                    <div className="flex gap-[8px]">
                                                                        <Controller
                                                                            name="b_reply"
                                                                            control={control}
                                                                            render={({ field }) => (
                                                                                <div className="w-[calc(50%-4px)] py-[16px]">
                                                                                    <Checkbox
                                                                                        {...field}
                                                                                        checked={field.value === "Y"}
                                                                                        txt="체크시 답변 작성 가능"
                                                                                        className="justify-start"
                                                                                        onChange={e => {
                                                                                            const check =
                                                                                                e.currentTarget.checked;
                                                                                            setValue(
                                                                                                "b_reply",
                                                                                                check ? "Y" : "N",
                                                                                            );
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        />
                                                                        <Controller
                                                                            name="b_reply_lv"
                                                                            control={control}
                                                                            render={({ field }) => (
                                                                                <div className="w-[calc(50%-4px)]">
                                                                                    <LevelSelect
                                                                                        value={field.value}
                                                                                        onChange={field.onChange}
                                                                                        className="min-w-full"
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        />
                                                                    </div>
                                                                </li>
                                                                <li className="flex w-[calc(50%-10px)] flex-col gap-[8px]">
                                                                    <p className="text-[#666]">댓글 사용 및 권한</p>
                                                                    <div className="flex gap-[8px]">
                                                                        <Controller
                                                                            name="b_comment"
                                                                            control={control}
                                                                            render={({ field }) => (
                                                                                <div className="w-[calc(50%-4px)] py-[16px]">
                                                                                    <Checkbox
                                                                                        {...field}
                                                                                        checked={field.value === "Y"}
                                                                                        txt="체크시 댓글 작성 가능"
                                                                                        className="justify-start"
                                                                                        onChange={e => {
                                                                                            const check =
                                                                                                e.currentTarget.checked;
                                                                                            setValue(
                                                                                                "b_comment",
                                                                                                check ? "Y" : "N",
                                                                                            );
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        />
                                                                        <Controller
                                                                            name="b_comment_lv"
                                                                            control={control}
                                                                            render={({ field }) => (
                                                                                <div className="w-[calc(50%-4px)]">
                                                                                    <LevelSelect
                                                                                        value={field.value}
                                                                                        onChange={field.onChange}
                                                                                        className="min-w-full"
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        />
                                                                    </div>
                                                                </li>
                                                            </>
                                                        )}
                                                        {tabOn === 6 && ( // 문의게시판일때만 노출
                                                            <>
                                                                <li className="flex w-[calc(50%-10px)] flex-col gap-[8px]">
                                                                    <p className="text-[#666]">
                                                                        작성자 답변 알림 수신 여부
                                                                    </p>
                                                                    <div className="flex h-[48px] items-center justify-start">
                                                                        <Controller
                                                                            name="b_write_alarm"
                                                                            control={control}
                                                                            render={({ field }) => (
                                                                                <Checkbox
                                                                                    {...field}
                                                                                    checked={field.value === "Y"}
                                                                                    txt="체크 시 답변 알림 이메일 수신"
                                                                                    onChange={e => {
                                                                                        const check =
                                                                                            e.currentTarget.checked;
                                                                                        setValue(
                                                                                            "b_write_alarm",
                                                                                            check ? "Y" : "N",
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            )}
                                                                        />
                                                                    </div>
                                                                </li>
                                                                {/* <li className="flex w-[calc(50%-10px)] flex-col gap-[8px]">
                                                                    <p className="text-[#666]">알림 수신 정보</p>
                                                                    <div>
                                                                        <div className="flex">
                                                                            <div className="w-1/2 py-[16px]">
                                                                                <Controller
                                                                                    name="b_write_send"
                                                                                    control={control}
                                                                                    render={({ field }) => (
                                                                                        <Checkbox
                                                                                            {...field}
                                                                                            checked={
                                                                                                field.value === "Y"
                                                                                            }
                                                                                            txt="이메일"
                                                                                            className="justify-start"
                                                                                            onChange={e => {
                                                                                                const check =
                                                                                                    e.currentTarget
                                                                                                        .checked;
                                                                                                setValue(
                                                                                                    "b_write_send",
                                                                                                    check ? "Y" : "N",
                                                                                                );
                                                                                            }}
                                                                                        />
                                                                                    )}
                                                                                />
                                                                            </div>
                                                                            <div className="w-1/2 py-[16px]">
                                                                                <Controller
                                                                                    name="b_write_sms"
                                                                                    control={control}
                                                                                    render={({ field }) => (
                                                                                        <Checkbox
                                                                                            {...field}
                                                                                            checked={
                                                                                                field.value === "Y"
                                                                                            }
                                                                                            txt="문자"
                                                                                            className="justify-start"
                                                                                            onChange={e => {
                                                                                                const check =
                                                                                                    e.currentTarget
                                                                                                        .checked;
                                                                                                setValue(
                                                                                                    "b_write_sms",
                                                                                                    check ? "Y" : "N",
                                                                                                );
                                                                                            }}
                                                                                        />
                                                                                    )}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        <InputError
                                                                            message={errors.b_write_alarm?.message}
                                                                        />
                                                                    </div>
                                                                </li> */}
                                                            </>
                                                        )}
                                                        <li className="flex w-full flex-col gap-[8px]">
                                                            <label htmlFor="b_top_html" className="text-[#666]">
                                                                게시판 상단 HTML
                                                            </label>
                                                            <MonacoHtmlEditor
                                                                value={values.b_top_html || ""}
                                                                onChange={cont => setValue("b_top_html", cont)}
                                                            />
                                                        </li>
                                                        <li className="flex w-full flex-col gap-[8px]">
                                                            <p className="text-[#666]">게시글 템플릿 적용</p>
                                                            <div className="flex h-[48px] items-center justify-start">
                                                                <Controller
                                                                    name="b_template"
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <Checkbox
                                                                            {...field}
                                                                            checked={field.value === "Y"}
                                                                            txt="게시글 작성시 템플릿 적용 가능"
                                                                            onChange={e => {
                                                                                const check = e.currentTarget.checked;
                                                                                setValue(
                                                                                    "b_template",
                                                                                    check ? "Y" : "N",
                                                                                );
                                                                            }}
                                                                        />
                                                                    )}
                                                                />
                                                            </div>
                                                        </li>
                                                        {values.b_template === "Y" && (
                                                            <li className="w-full">
                                                                <Editor
                                                                    htmlValue={values.b_template_text || ""}
                                                                    onHtmlChange={cont =>
                                                                        setValue("b_template_text", cont)
                                                                    }
                                                                />
                                                            </li>
                                                        )}
                                                    </>
                                                )}
                                            </ul>
                                        </div>
                                    </li>
                                )}
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
