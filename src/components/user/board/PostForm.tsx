"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { LoadCanvasTemplate, loadCaptchaEnginge, validateCaptcha } from "react-simple-captcha";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { Editor } from "@/components/blocks/editor-x/editor";
import FileUploadTooltip from "@/components/common/common/FileUploadTooltip";
import InputError from "@/components/user/common/InputError";
import Checkbox from "@/components/user/form/Checkbox";
import FileUpload, { FileData } from "@/components/user/form/FileUpload";
import Input from "@/components/user/form/Input";
import PasswordInput from "@/components/user/form/PasswordInput";
import SelectBox, { SelectItem } from "@/components/user/form/SelectBox";
import Textarea from "@/components/user/form/Textarea";
import { API_URL } from "@/config/apiConfig";
import { FILE_UPLOAD_ACCEPT } from "@/constants/common/fileUpload";
import { useNotFoundOnError } from "@/hooks/common/useNotFoundOnError";
import { useToast } from "@/hooks/use-toast";
import {
    useDelPostFile,
    useGetPost,
    useGetPostGroupList,
    usePostPostCreate,
    usePostPostPassword,
    usePutPost,
} from "@/service/user/board";
import { useBoardStore } from "@/store/common/useBoardStore";
import { usePopupStore } from "@/store/user/usePopupStore";

const createSchema = (t: (key: string) => string) => {
    const baseSchema = z.object({
        m_name: z.string().min(1, t("name.error")),
        m_email: z.string().min(1, t("email.error")).email(t("email.invalidError")),
        b_title: z.string().min(1, t("title.error")).max(50, t("title.maxLengthError")),
        b_notice: z.string(),
        b_contents: z.string().min(1, t("contents.error")),
        m_pwd: z.string().max(50, t("password.maxLengthError")).optional(),
        b_secret: z.string().optional(),
        secret: z.enum(["Y", "N"]),
        group_id: z.string().optional(),
        c_content_type: z.number().nullable().optional(),
        b_depth: z.number(),
        parent_id: z.number().nullable().optional(),
        b_group: z.enum(["Y", "N"]),
        b_img_name: z.string().optional(),
    });

    return baseSchema.superRefine((data, ctx) => {
        if (data.b_secret === "Y" && !data.m_pwd) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t("password.required"),
                path: ["m_pwd"],
            });
        }
        // 비밀글인 게시글을 수정할 때 비밀글 해제하려면 비밀번호 확인 필요
        if (data.secret === "Y" && !data.m_pwd) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t("password.requiredForUnlock"),
                path: ["m_pwd"],
            });
        }
        if (data.b_group === "Y" && !data.group_id) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t("type.required"),
                path: ["group_id"],
            });
        }
    });
};

interface PostFormProps {
    category: string;
    detailIdx?: string;
    mode: "create" | "edit" | "reply";
    boardType: string;
}

export default function PostForm({ category, detailIdx, mode, boardType }: PostFormProps) {
    const router = useRouter();
    const t = useTranslations("PostForm");
    const tCommon = useTranslations("Common");
    const { boardSettingData } = useBoardStore();

    const schema = useMemo(() => createSchema(t), [t]);
    type FormValues = z.infer<typeof schema>;
    const initialValues = useMemo<FormValues>(
        () => ({
            m_name: "",
            m_email: "",
            b_title: "",
            b_notice: "0",
            b_contents: "",
            m_pwd: "",
            b_secret: "",
            secret: "N",
            c_content_type: null,
            preview_img: "N",
            b_depth: 0,
            parent_id: null,
            b_group: "N",
            b_img_name: "",
        }),
        [],
    );
    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: initialValues,
    });
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        setValue,
        reset,
    } = form;
    const values = useWatch({ control });
    const [captcha, setCaptcha] = useState("");
    const [captchaError, setCaptchaError] = useState(false);
    const [boardGroupList, setBoardGroupList] = useState<SelectItem[]>([]);
    const [files, setFiles] = useState<FileData[]>([]);
    const [filesData, setFilesData] = useState<File[]>([]);
    const [imgFiles, setImgFiles] = useState<FileData[]>([]);
    const [imgFilesData, setImgFilesData] = useState<File[]>([]);
    const {
        data: configData,
        isLoading: isInitialLoading,
        error: getPostError,
    } = useGetPost(category || "", detailIdx || "", "T", {
        enabled: !!detailIdx && mode === "edit",
    });
    const postPostCreateMutation = usePostPostCreate();
    const putPostMutation = usePutPost();
    const { data: configBoardGroupList } = useGetPostGroupList(category, {
        enabled: boardSettingData.b_group === "Y",
    });
    const delBoardFileMutation = useDelPostFile();
    const postPostPasswordMutation = usePostPostPassword();
    const { setConfirmPop, setLoadingPop } = usePopupStore();
    const { toast } = useToast();

    useEffect(() => {
        loadCaptchaEnginge(6, "#C5CCE3", "#142864");
    }, []);

    // 데이터 로딩 또는 저장,수정 중일 때 로딩 팝업 표시
    useEffect(() => {
        const isLoading = isInitialLoading || postPostCreateMutation.isPending;
        setLoadingPop(isLoading);
        return () => setLoadingPop(false);
    }, [isInitialLoading, postPostCreateMutation.isPending]); // eslint-disable-line react-hooks/exhaustive-deps

    // 게시글 상세 조회
    useEffect(() => {
        if (mode === "reply") {
            reset({
                ...initialValues,
                ...(boardSettingData.c_content_type && { c_content_type: boardSettingData.c_content_type }),
                ...(boardSettingData.b_template === "Y" && { b_contents: boardSettingData.b_template_text }),
                ...(boardSettingData.b_group === "Y" ? { b_group: "Y" } : { b_group: "N" }),
            });
        }
        if (mode === "create") {
            reset({
                ...initialValues,
                ...(boardSettingData.c_content_type && { c_content_type: boardSettingData.c_content_type }),
                ...(boardSettingData.b_template === "Y" && { b_contents: boardSettingData.b_template_text }),
                ...(boardSettingData.b_group === "Y" ? { b_group: "Y" } : { b_group: "N" }),
            });
        }
        if (mode === "edit" && configData) {
            const {
                b_depth,
                m_name,
                m_email,
                b_title,
                b_notice,
                b_contents,
                group_id,
                b_file,
                b_img,
                parent_id,
                b_secret,
                c_content_type,
            } = configData.data;
            reset({
                ...initialValues,
                b_depth,
                m_name,
                m_email,
                b_title,
                b_notice,
                b_contents,
                parent_id,
                b_secret,
                secret: b_secret === "Y" ? "Y" : "N",
                c_content_type,
                ...(boardSettingData.b_group === "Y" ? { b_group: "Y" } : { b_group: "N" }),
                ...(group_id && { group_id: group_id.toString() }),
                ...(boardSettingData.c_content_type && { c_content_type: boardSettingData.c_content_type }),
                ...(boardSettingData.c_content_type === 5 && b_img && { b_img_name: b_img }),
            });
            setFiles(b_file);
            if (b_img) {
                setImgFiles([{ idx: uuidv4(), original_name: b_img, url: `${API_URL}/${b_img}` }]);
            }
        }
    }, [configData, boardSettingData.c_content_type, mode]); // eslint-disable-line react-hooks/exhaustive-deps

    // 게시글 분류 목록 조회
    useEffect(() => {
        if (configBoardGroupList) {
            const list = configBoardGroupList.data.filter(
                (item: { use_yn?: string[] }) => item.use_yn && item.use_yn[0] === "Y",
            );
            const newList = list.map((item: { id: number; g_name: string }) => ({
                value: item.id.toString(),
                label: item.g_name,
            }));
            setBoardGroupList(newList);
        }
    }, [configBoardGroupList]);

    // 404 에러 처리
    useNotFoundOnError(getPostError);

    // boardGroupList가 로드된 후 group_id 재설정 (수정일때만 적용)
    useEffect(() => {
        if (mode === "edit" && configData && boardGroupList.length > 0) {
            const { group_id } = configData.data;
            if (group_id) {
                setValue("group_id", group_id.toString());
            }
        }
    }, [boardGroupList, mode, configData]); // eslint-disable-line react-hooks/exhaustive-deps

    // 첨부파일 삭제
    const handleConfirmDeleteFile = (idx: number, file_idx: number | string, img?: boolean) => {
        if (detailIdx && typeof file_idx === "number") {
            setConfirmPop(true, t("fileDeleteConfirm"), 2, () => handleDeleteFile(idx, file_idx, img));
        } else {
            if (img) {
                const newList = [...imgFiles];
                newList.splice(idx, 1);
                setImgFiles(newList);
                const newFileData = [...imgFilesData];
                newFileData.splice(idx, 1);
                setImgFilesData(newFileData);
            } else {
                const newList = [...files];
                newList.splice(idx, 1);
                setFiles(newList);
                const newFileData = [...filesData];
                newFileData.splice(idx, 1);
                setFilesData(newFileData);
            }
        }
    };

    // 첨부파일 영구삭제
    const handleDeleteFile = (idx: number, file_idx: number, img?: boolean) => {
        const body = { idx: [file_idx] };
        delBoardFileMutation.mutate(body, {
            onSuccess: () => {
                toast({
                    title: t("deleted"),
                });
                if (img) {
                    const newList = [...imgFiles];
                    newList.splice(idx, 1);
                    setImgFiles(newList);
                } else {
                    const newList = [...files];
                    newList.splice(idx, 1);
                    setFiles(newList);
                }
            },
        });
    };

    // 보안문자 체크
    const handleCaptchaCheck = () => {
        if (!validateCaptcha(captcha)) {
            setCaptchaError(true);
        } else {
            setCaptchaError(false);
        }
    };

    // 저장 확인
    const handleConfirmSave = (data: FormValues) => {
        if (captchaError) return;
        setConfirmPop(true, t("saveConfirm"), 2, () => onSubmit(data));
    };

    // 저장하기
    const onSubmit = (data: FormValues) => {
        if (!category) return;
        const { secret, b_img_name, c_content_type, ...formData } = data;
        const baseBody = {
            ...formData,
            category,
            b_file: filesData.length > 0 ? filesData : [],
            m_pwd: data.m_pwd || "",
            b_secret: data.b_secret || "",
            ...(data.c_content_type === 5 && imgFilesData.length > 0 && { b_img: imgFilesData[0] }),
            ...(boardSettingData.b_group === "Y" && { group_id: data.group_id }),
        };

        // 게시글 수정
        if (mode === "edit") {
            if (!detailIdx) return;

            const body = {
                ...baseBody,
                idx: detailIdx,
                parent_id: baseBody.parent_id?.toString() || "",
                ...(c_content_type === 5 && {
                    b_img_name:
                        imgFilesData.length > 0
                            ? ""
                            : imgFiles.length === 0 && imgFilesData.length === 0
                            ? ""
                            : b_img_name,
                }),
            };

            const handleUpdatePost = () => {
                putPostMutation.mutate(body, {
                    onSuccess: () => {
                        toast({
                            title: t("updated"),
                        });
                        router.back();
                    },
                });
            };

            // 비밀글 수정시 비밀번호 확인
            if (secret === "Y") {
                postPostPasswordMutation.mutate(
                    { idx: Number(detailIdx), password: data.m_pwd || "" },
                    {
                        onSuccess: handleUpdatePost,
                        onError: error => {
                            const axiosError = error as AxiosError<{ message: string }>;
                            const errorMessage = axiosError.response?.data?.message || tCommon("error");
                            setConfirmPop(true, errorMessage, 1);
                        },
                    },
                );
            } else {
                handleUpdatePost();
            }
        }
        // 게시글 등록
        else if (mode === "create") {
            const body = { ...baseBody, parent_id: "" };
            postPostCreateMutation.mutate(body, {
                onSuccess: () => {
                    toast({
                        title: t("created"),
                    });
                    router.back();
                },
            });
        }
        // 답글 등록
        else if (mode === "reply") {
            const body = { ...baseBody, b_depth: 1, parent_id: detailIdx };
            postPostCreateMutation.mutate(body, {
                onSuccess: () => {
                    toast({
                        title: t("created"),
                    });
                    router.back();
                },
            });
        }
    };

    return (
        <>
            <div className="mb-[24px] border-b-2 border-[#060606] pb-[24px] text-center text-[24px] font-[500] md:text-[40px]">
                {boardType === "inquiry" ? t("inquiryTitle") : t("createTitle")}
            </div>
            <form onSubmit={handleSubmit(handleConfirmSave)} className="border-b border-[#D9D9D9]">
                <ul className="flex flex-col gap-[16px] md:flex-row md:flex-wrap md:gap-x-[16px] md:gap-y-[20px]">
                    <li className="flex w-full flex-col gap-[8px] md:w-[calc(50%-8px)]">
                        <label htmlFor="m_name" className="font-[500]">
                            {t("name.label")}
                        </label>
                        <div>
                            <Input
                                {...register("m_name")}
                                id="m_name"
                                className="w-full"
                                placeholder={t("name.placeholder")}
                            />
                            <InputError message={errors.m_name?.message} />
                        </div>
                    </li>
                    <li className="flex w-full flex-col gap-[8px] md:w-[calc(50%-8px)]">
                        <label htmlFor="m_email" className="font-[500]">
                            {t("email.label")}
                        </label>
                        <div>
                            <Input
                                {...register("m_email")}
                                id="m_email"
                                className="w-full"
                                placeholder={t("email.placeholder")}
                            />
                            <InputError message={errors.m_email?.message} />
                        </div>
                    </li>
                    <li className="flex w-full flex-col gap-[8px]">
                        <label htmlFor="b_title" className="font-[500]">
                            {t("title.label")}
                        </label>
                        <div>
                            <Input
                                {...register("b_title")}
                                id="b_title"
                                className="w-full"
                                placeholder={t("title.placeholder")}
                                maxLength={50}
                            />
                            <InputError message={errors.b_title?.message} />
                        </div>
                    </li>
                    {/* 게시판 분류 사용시에만 노출 */}
                    {boardSettingData.b_group === "Y" && (
                        <li className="flex w-full flex-col gap-[8px]">
                            <p className="font-[500]">{t("type.label")}</p>
                            <div>
                                <SelectBox
                                    list={boardGroupList}
                                    value={values.group_id}
                                    onChange={value => setValue("group_id", value)}
                                    triggerClassName="w-full"
                                />
                                <InputError message={errors.group_id?.message} />
                            </div>
                        </li>
                    )}
                    {/* 갤러리 게시판일때만 노출 */}
                    {boardType === "gallery" && (
                        <li className="flex w-full flex-col gap-[8px]">
                            <p className="font-[500]">{t("previewImage.label")}</p>
                            <FileUpload
                                uploadFiles={imgFiles}
                                setFiles={setImgFiles}
                                setFilesData={setImgFilesData}
                                handleDelt={(idx, file_idx) => handleConfirmDeleteFile(idx, file_idx, true)}
                                showPreview
                            />
                        </li>
                    )}
                    <li className="w-full">
                        {boardType === "inquiry" ? ( // 문의 게시판일때는 텍스트 입력
                            <Textarea {...register("b_contents")} />
                        ) : (
                            <Editor
                                htmlValue={values.b_contents || ""}
                                onHtmlChange={cont => setValue("b_contents", cont)}
                            />
                        )}
                        <InputError message={errors.b_contents?.message} />
                    </li>
                    <li className="flex w-full flex-col gap-[8px]">
                        <div className="flex items-center gap-[8px]">
                            <p className="text-[#666]">{t("fileAttachment.label")}</p>
                            <FileUploadTooltip />
                        </div>
                        <FileUpload
                            uploadFiles={files}
                            setFiles={setFiles}
                            setFilesData={setFilesData}
                            boxClassName="flex-1"
                            maxLength={10}
                            handleDelt={(idx, file_idx) => handleConfirmDeleteFile(idx, file_idx)}
                            accept={FILE_UPLOAD_ACCEPT}
                        />
                    </li>
                    {boardType !== "faq" && ( // FAQ 게시판일때는 비밀번호 영역 미노출
                        <>
                            <li className="flex w-full flex-col gap-[8px] md:w-[calc(50%-8px)]">
                                <p className="font-[500]">{t("secretPost.label")}</p>
                                <div className="flex items-start gap-[8px]">
                                    <div className="pt-[16px]">
                                        <Controller
                                            name="b_secret"
                                            control={control}
                                            render={({ field }) => (
                                                <Checkbox
                                                    {...field}
                                                    checked={field.value === "Y"}
                                                    txt={t("secretPost.label")}
                                                    className="justify-start"
                                                    onChange={e => {
                                                        const check = e.currentTarget.checked;
                                                        setValue("b_secret", check ? "Y" : "");
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                            </li>
                            <li className="flex w-full flex-col gap-[8px] md:w-[calc(50%-8px)]">
                                <label htmlFor="b_tim_pwdtle" className="font-[500]">
                                    {t("password.label")}
                                </label>
                                <div>
                                    <PasswordInput
                                        {...register("m_pwd")}
                                        id="m_pwd"
                                        className="w-full"
                                        placeholder={t("password.placeholder")}
                                        maxLength={50}
                                    />
                                    <InputError message={errors.m_pwd?.message} />
                                </div>
                            </li>
                        </>
                    )}
                    <li className="flex w-full flex-col gap-[8px]">
                        <label htmlFor="captcha" className="font-[500]">
                            {t("captcha.label")}
                        </label>
                        <div className="flex items-start gap-[10px]">
                            <div className="[&>div>div>a]:bg-icRefresh pt-[9px] [&>div>div>a]:block [&>div>div>a]:size-[24px] [&>div>div>a]:text-[0px] [&>div]:flex [&>div]:items-center [&>div]:gap-[10px]">
                                <LoadCanvasTemplate />
                            </div>
                            <div className="flex-1">
                                <Input
                                    id="captcha"
                                    className="w-full"
                                    placeholder={t("captcha.placeholder")}
                                    value={captcha}
                                    onChange={e => setCaptcha(e.target.value)}
                                />
                                <InputError message={captchaError ? t("captcha.error") : ""} />
                            </div>
                        </div>
                    </li>
                </ul>
                <div className="mx-auto flex max-w-[600px] gap-[8px] py-[24px]">
                    <button
                        type="button"
                        className="h-[50px] w-[calc(50%-4px)] rounded-[12px] bg-[#F2F3F8] text-[18px] font-[700] text-[#666]"
                        onClick={() => router.back()}
                    >
                        {tCommon("cancel")}
                    </button>
                    <button
                        type="submit"
                        className="h-[50px] w-[calc(50%-4px)] rounded-[12px] bg-primary text-[18px] font-[700] text-white"
                        onClick={handleCaptchaCheck}
                    >
                        {t("save")}
                    </button>
                </div>
            </form>
        </>
    );
}
