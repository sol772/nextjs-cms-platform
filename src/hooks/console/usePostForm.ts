import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import type { FileData } from "@/components/console/form/FileUpload";
import type { SelectItem } from "@/components/console/form/SelectBox";
import { API_URL } from "@/config/apiConfig";
import { useNotFoundOnError } from "@/hooks/common/useNotFoundOnError";
import { useToast } from "@/hooks/use-toast";
import { useDelPostFile, useGetPost, useGetPostGroupList, usePostPostCreate, usePostPostPassword,usePutPost } from "@/service/console/board/post";
import { useAuthStore } from "@/store/common/useAuthStore";
import { useBoardStore } from "@/store/common/useBoardStore";
import { usePopupStore } from "@/store/console/usePopupStore";

export const schema = z
    .object({
        b_title: z.string().min(1, "제목을 입력해주세요.").max(50, "제목은 50자 이하로 입력해주세요."),
        b_notice: z.string(),
        b_contents: z.string().min(1, "내용을 입력해주세요."),
        m_pwd: z.string().max(50, "비밀번호는 50자 이하로 입력해주세요.").optional(),
        b_secret: z.string().optional(),
        secret: z.enum(["Y", "N"]),
        group_id: z.string().optional(),
        c_content_type: z.number().nullable().optional(),
        b_depth: z.number(),
        parent_id: z.number().nullable(),
        b_group: z.enum(["Y", "N"]),
        group_list: z.enum(["Y", "N"]), //게시글 분류 목록 있는지 여부
        b_img_name: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.b_secret === "Y" && !data.m_pwd) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "비밀번호를 입력해주세요.",
                path: ["m_pwd"],
            });
        }
        // 비밀글인 게시글을 수정할 때 비밀글 해제하려면 비밀번호 확인 필요
        if (data.secret === "Y" && !data.m_pwd) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "비밀글 해제를 위해 기존 비밀번호를 입력해주세요.",
                path: ["m_pwd"],
            });
        }
        if ((data.b_group === "Y" && data.group_list === "Y") && !data.group_id) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "유형을 설정해주세요.",
                path: ["group_id"],
            });
        }
    });

export type FormValues = z.infer<typeof schema>;

export type UsePostFormMode = "create" | "edit" | "reply";

const initialValues: FormValues = {
    b_title: "",
    b_notice: "0",
    b_contents: "",
    m_pwd: "",
    b_secret: "",
    secret: "N",
    c_content_type: null,
    b_depth: 0,
    parent_id: null,
    b_group: "N",
    group_list: "N",
    b_img_name: "",
};

export function usePostForm(
    category: string,
    detailIdx: string,
    mode: UsePostFormMode = "create",
    onComplete: (edit?: boolean) => void,
) {
    const { loginUser } = useAuthStore();
    const { boardSettingData } = useBoardStore();
    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: initialValues,
    });
    const { register, handleSubmit, formState: { errors }, control, setValue, reset } = form;
    const values = useWatch({ control });
    const [boardGroupList, setBoardGroupList] = useState<SelectItem[]>([]);
    const [files, setFiles] = useState<FileData[]>([]);
    const [filesData, setFilesData] = useState<File[]>([]);
    const [imgFiles, setImgFiles] = useState<FileData[]>([]);
    const [imgFilesData, setImgFilesData] = useState<File[]>([]);
    const { data: configData, isLoading: isInitialLoading, error: getPostError } = useGetPost(category || "", detailIdx || "", "T", {
        enabled: !!detailIdx && mode === "edit",
    });
    const postPostCreateMutation = usePostPostCreate();
    const putBoardMutation = usePutPost();
    const { data: configBoardGroupList } = useGetPostGroupList(category, {
        enabled: boardSettingData.b_group === "Y",
    });
    const delBoardFileMutation = useDelPostFile();
    const postPostPasswordMutation = usePostPostPassword();
    const { setConfirmPop, setLoadingPop } = usePopupStore();
    const { toast } = useToast();

    // 데이터 로딩 또는 저장,수정 중일 때 로딩 팝업 표시
    useEffect(() => {
        const isLoading = isInitialLoading || putBoardMutation.isPending || postPostCreateMutation.isPending;
        setLoadingPop(isLoading);
        return () => setLoadingPop(false);
    }, [isInitialLoading, putBoardMutation.isPending, postPostCreateMutation.isPending]); // eslint-disable-line react-hooks/exhaustive-deps

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
            const { b_depth, b_title, b_notice, b_contents, group_id, b_file, b_img, parent_id, b_secret} = configData.data;
            reset({
                ...initialValues,
                b_depth,
                b_title,
                b_notice,
                b_contents,
                parent_id,
                b_secret,
                secret: b_secret === "Y" ? "Y" : "N",
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
    }, [configData, boardSettingData, mode]); // eslint-disable-line react-hooks/exhaustive-deps

    // 404 에러 처리
    useNotFoundOnError(getPostError);

    // 게시글 분류 목록 조회
    useEffect(() => {
        if (configBoardGroupList) {
            const list = configBoardGroupList.data.filter((item: { id: number; g_name: string; use_yn: string[] }) => !!item.id && item.use_yn[0] === "Y");
            const newList = list.map((item: { id: number; g_name: string }) => ({
                value: item.id.toString(),
                label: item.g_name,
            }));
            setBoardGroupList(newList);

            if(newList.length > 0) {
                setValue("group_list", "Y");
            } else {
                setValue("group_list", "N");
            }
        }
    }, [configBoardGroupList]); // eslint-disable-line react-hooks/exhaustive-deps

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
            setConfirmPop(true, "파일을 영구 삭제하시겠습니까?", 2, () =>
                handleDeleteFile(idx, file_idx, img), 
                undefined,
                "삭제 후에는 복구할 수 없습니다.",
                "red"
            );
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
                    title: "삭제되었습니다.",
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

    // 저장 확인
    const handleConfirmSave = (data: FormValues) => {
        setConfirmPop(true, "저장하시겠습니까?", 2, () => onSubmit(data));
    };

    // 저장하기
    const onSubmit = (data: FormValues) => {
        if (!category) return;
        const { secret, b_img_name, c_content_type, group_list, ...formData } = data;
        const baseBody = {
            ...formData,
            category,
            m_email: loginUser.m_email,
            m_name: loginUser.m_name,
            b_file: filesData.length > 0 ? filesData : [],
            m_pwd: data.m_pwd || "",
            b_secret: data.b_secret || "",
            ...(data.c_content_type === 5 && imgFilesData.length > 0 && { b_img: imgFilesData[0] }),
            ...(boardSettingData.b_group === "Y" && group_list === "Y" && { group_id: data.group_id }),
        };

        // 게시글 수정
        if (mode === "edit") {
            const body = { ...baseBody, 
                idx: detailIdx, parent_id: baseBody.parent_id?.toString() || "", 
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
                putBoardMutation.mutate(body, {
                    onSuccess: () => {
                        toast({
                            title: "수정되었습니다.",
                        });
                        onComplete?.(true);
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
                            const errorMessage =
                                axiosError.response?.data?.message || "알 수 없는 에러가 발생했습니다.";
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
            const body = {...baseBody, parent_id: ""};
            postPostCreateMutation.mutate(body, {
                onSuccess: () => {
                    toast({
                        title: "등록되었습니다.",
                    });
                    onComplete?.();
                },
            });
        }
        // 답글 등록
        else if (mode === "reply") {
            const body = { ...baseBody, b_depth: 1, parent_id: detailIdx };
            postPostCreateMutation.mutate(body, {
                onSuccess: () => {
                    toast({
                        title: "등록되었습니다.",
                    });
                    onComplete?.();
                },
            });
        }
    };

    return {
        register,
        control,
        errors,
        setValue,
        values,
        boardSettingData,
        boardGroupList,
        files,
        setFiles,
        setFilesData,
        imgFiles,
        setImgFiles,
        setImgFilesData,
        handleConfirmDeleteFile,
        handleSubmit,
        handleConfirmSave,
        isInitialLoading,
        mode,
    };
} 