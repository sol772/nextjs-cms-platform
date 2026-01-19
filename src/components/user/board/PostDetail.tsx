"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import arrowNext from "@/assets/images/user/arrowNext.svg";
import arrowPrev from "@/assets/images/user/arrowPrev.svg";
import arrowUpRight from "@/assets/images/user/arrowUpRight.svg";
import { Editor } from "@/components/blocks/editor-x/editor";
import Comment, { CommentItem } from "@/components/user/form/Comment";
import CommentForm from "@/components/user/form/CommentForm";
import { FileData } from "@/components/user/form/FileUpload";
import { useNotFoundOnError } from "@/hooks/common/useNotFoundOnError";
import { useToast } from "@/hooks/use-toast";
import {
    useDelPost,
    useDelPostComment,
    useGetPost,
    useGetPostComment,
    useGetPostFileDownload,
    usePostPostComment,
    usePutPostComment,
} from "@/service/user/board";
import { useAuthStore } from "@/store/common/useAuthStore";
import { useBoardStore } from "@/store/common/useBoardStore";
import { useNavigationStore } from "@/store/user/useNavigationStore";
import { usePopupStore } from "@/store/user/usePopupStore";

interface InfoItem {
    b_title: string;
    b_reg_date: string;
    b_contents: string;
    b_file: FileData[];
    b_img: string | null;
    g_name: string | null;
    prev_board: { idx: string; b_title: string } | null;
    next_board: { idx: string; b_title: string } | null;
    reply_idx: number[];
}

export default function PostDetail({
    boardType,
    category,
    detailIdx,
    reply = false,
}: {
    boardType: string;
    category: string;
    detailIdx: string;
    reply?: boolean;
}) {
    const t = useTranslations("PostDetail");
    const router = useRouter();
    const { currentPath, clearPath } = useNavigationStore();
    const { loginUser } = useAuthStore();
    const { boardSettingData } = useBoardStore();
    const [downloadFile, setDownloadFile] = useState<{ idx: string; name: string } | null>(null);
    const [commentList, setCommentList] = useState<CommentItem[]>([]);
    const [commentValue, setCommentValue] = useState("");
    const [completePost, setCompletePost] = useState(false);
    const [collapsedMap, setCollapsedMap] = useState<{ [idx: number]: boolean }>({});
    const {
        data: configData,
        isLoading: isInitialLoading,
        error: getPostError,
    } = useGetPost(category || "", detailIdx || "", "T", {
        enabled: Boolean(detailIdx),
    });
    const { data: downloadData, isLoading: isFileDownloadLoading } = useGetPostFileDownload(
        category || "",
        detailIdx || "",
        downloadFile?.idx || "",
    );
    const {
        data: postComment,
        isLoading: isCommentLoading,
        error: getPostCommentError,
    } = useGetPostComment(category || "", detailIdx || "", {
        enabled: Boolean(detailIdx),
    });
    const delPostMutation = useDelPost();
    const postPostCommentMutation = usePostPostComment();
    const putPostCommentMutation = usePutPostComment();
    const delPostCommentMutation = useDelPostComment();
    const initialInfo = useMemo<InfoItem>(
        () => ({
            b_title: "",
            b_reg_date: "",
            b_contents: "",
            b_content_type: "editor",
            b_file: [],
            b_img: null,
            g_name: null,
            prev_board: null,
            next_board: null,
            reply_idx: [],
        }),
        [],
    );
    const [info, setInfo] = useState<InfoItem>(initialInfo);
    const { setLoadingPop, setConfirmPop } = usePopupStore();
    const { toast } = useToast();

    // 데이터 수정,삭제 중일 때 로딩 팝업 표시
    useEffect(() => {
        const isLoading = isInitialLoading || isFileDownloadLoading || isCommentLoading;
        setLoadingPop(isLoading);
        return () => setLoadingPop(false);
    }, [isInitialLoading, isFileDownloadLoading, isCommentLoading]); // eslint-disable-line react-hooks/exhaustive-deps

    // 상세 조회
    useEffect(() => {
        if (configData) {
            setInfo(configData.data);
        } else {
            setInfo(initialInfo);
        }
    }, [configData, initialInfo]);

    // 게시글 댓글 조회
    useEffect(() => {
        if (postComment) {
            setCommentList(postComment.data);

            // 댓글 더보기 토글 상태 초기화
            setCollapsedMap(prev => {
                const newMap = { ...prev };
                const setCollapsedForDepth = (comments: CommentItem[]) => {
                    comments.forEach(comment => {
                        // 기존에 값이 없을 때만 기본값 세팅
                        if (newMap[comment.idx] === undefined) {
                            newMap[comment.idx] = comment.depth >= 1; // 기본 댓글 depth 1 까지만 노출
                        }
                        if (comment.children && comment.children.length > 0) {
                            setCollapsedForDepth(comment.children);
                        }
                    });
                };
                setCollapsedForDepth(postComment.data);
                return newMap;
            });
        } else {
            setCommentList([]);
            setCollapsedMap({});
        }
    }, [postComment]);

    // 404 에러 처리
    useNotFoundOnError(getPostError, getPostCommentError);

    // 파일다운로드 데이터가 있을 때 실행
    useEffect(() => {
        if (downloadData && downloadFile) {
            const url = window.URL.createObjectURL(new Blob([downloadData.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", downloadFile.name);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setDownloadFile(null); // 다운로드 완료 후 초기화
        }
    }, [downloadData, downloadFile]);

    // 첨부파일 다운로드 버튼 클릭시
    const handleFileDownload = (idx: string, file_name: string) => {
        if (!category || !detailIdx) return;
        setDownloadFile({ idx, name: file_name });
    };

    // 목록으로 버튼 클릭 핸들러
    const handleBackToList = () => {
        if (currentPath && currentPath.includes(`/${category}`)) {
            router.push(currentPath);
        } else {
            router.push(`/${category}`);
        }

        // 사용 후 경로 초기화
        clearPath();
    };

    // 삭제 확인
    const handleConfirmDelete = (reply: boolean) => {
        setConfirmPop(true, t("comment.deleteConfirm"), 2, () => handleDelete(reply));
    };

    // 삭제하기
    const handleDelete = (reply: boolean) => {
        if (!category || !detailIdx) return;
        const body = { idx: [detailIdx], category: Number(category), pass: "T" };
        delPostMutation.mutate(body, {
            onSuccess: () => {
                if (!reply) {
                    router.back();
                }
            },
        });
    };

    // 댓글 등록
    const handlePostComment = (depth: number, contents: string, parent_idx?: number) => {
        if (contents.length < 1) {
            return setConfirmPop(true, t("comment.required"), 1);
        }
        const body = {
            category: Number(category),
            board_idx: Number(detailIdx),
            parent_idx: parent_idx || 0,
            depth: depth,
            m_email: loginUser.m_email,
            m_name: loginUser.m_name,
            m_pwd: "",
            c_contents: contents,
        };
        postPostCommentMutation.mutate(body, {
            onSuccess: () => {
                toast({
                    title: t("comment.createSuccess"),
                });
                setCommentValue("");
                setCompletePost(true);
            },
        });
    };

    // 댓글 수정
    const handleEditComment = (idx: number, contents: string) => {
        if (contents.length < 1) {
            return setConfirmPop(true, t("comment.required"), 1);
        }
        const body = {
            category: Number(category),
            idx,
            c_contents: contents,
        };
        putPostCommentMutation.mutate(body, {
            onSuccess: () => {
                toast({
                    title: t("comment.editSuccess"),
                });
                setCompletePost(true);
            },
        });
    };

    // 댓글 삭제 확인
    const handleConfirmDeleteComment = (idx: number) => {
        setConfirmPop(true, t("comment.deleteConfirm"), 2, () => handleDeleteComment(idx));
    };

    // 댓글 삭제
    const handleDeleteComment = (idx: number) => {
        const body = { category: Number(category), idx };
        delPostCommentMutation.mutate(body, {
            onSuccess: () => {
                toast({
                    title: t("comment.deleteSuccess"),
                });
            },
        });
    };

    return (
        <>
            <div className="flex flex-col gap-[8px] border-b-2 border-[#060606] pb-[24px] text-center md:items-center">
                <p className="text-[18px] font-[500] md:text-[24px] xl:text-[36px]">{info.b_title}</p>
                <p className="text-[14px] text-[#666] md:text-[16px]">{info.b_reg_date}</p>
                <div className="flex gap-[4px]">
                    {(loginUser.m_level === 9 || loginUser.m_email === configData?.data?.m_email) && ( // 관리자 또는 작성자만 수정 가능
                        <Link
                            href={`/${boardType}/${category}/${detailIdx}/edit`}
                            className="h-[34px] rounded-[8px] bg-[#F6F7FA] px-[18px] text-[16px] font-[500] leading-[33px] text-[#666]"
                        >
                            {t("edit")}
                        </Link>
                    )}
                    {!reply &&
                        ((boardSettingData.b_reply === "Y" && boardSettingData.b_reply_lv === 0) ||
                            (boardSettingData.b_reply === "Y" &&
                                boardSettingData.b_reply_lv &&
                                boardSettingData.b_reply_lv > 0 &&
                                loginUser.m_level &&
                                loginUser.m_level >= boardSettingData.b_reply_lv)) && (
                            <Link
                                href={`/${boardType}/${category}/${detailIdx}/reply`}
                                className="h-[34px] rounded-[8px] bg-[#F6F7FA] px-[18px] text-[16px] font-[500] leading-[33px] text-[#666]"
                            >
                                {t("reply")}
                            </Link>
                        )}
                    {(loginUser.m_level === 9 || loginUser.m_email === configData?.data?.m_email) && ( // 관리자 또는 작성자만 삭제 가능
                        <button
                            type="button"
                            className="h-[34px] rounded-[8px] bg-[#FEE2E2] px-[18px] text-[16px] font-[500] text-[#E5313D]"
                            onClick={() => handleConfirmDelete(false)}
                        >
                            {t("delete")}
                        </button>
                    )}
                </div>
            </div>
            <div className="min-h-[300px] border-b border-[#D9D9D9] py-[24px]">
                <Editor htmlValue={info.b_contents || ""} editable={false} />
            </div>
            {info.b_file.length > 0 && (
                <div className="flex border-b border-[#D9D9D9] p-[16px_20px]">
                    <p className="w-[120px] font-[500]">{t("attachments")}</p>
                    <ul className="flex flex-1 flex-col gap-[5px]">
                        {info.b_file.map((file, i) => (
                            <li key={`file_${i}`}>
                                <button
                                    type="button"
                                    className="text-left text-[14px] text-[#999]"
                                    onClick={() => handleFileDownload(file.idx.toString(), file.original_name)}
                                >
                                    {file.original_name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {((boardSettingData.b_comment === "Y" && boardSettingData.b_comment_lv === 0) ||
                (boardSettingData.b_comment === "Y" &&
                    boardSettingData.b_comment_lv &&
                    boardSettingData.b_comment_lv > 0 &&
                    loginUser.m_level &&
                    loginUser.m_level >= boardSettingData.b_comment_lv)) && (
                <>
                    {commentList.length > 0 && (
                        <ul className="bg-[#FAFAFD] p-[16px_20px]">
                            {commentList.map((comment, i) => (
                                <li key={`comment_${i}`}>
                                    <Comment
                                        item={comment}
                                        handlePost={handlePostComment}
                                        handleEdit={handleEditComment}
                                        completePost={completePost}
                                        onCompletePost={() => setCompletePost(false)}
                                        handleDelete={handleConfirmDeleteComment}
                                        collapsed={collapsedMap[comment.idx] ?? false}
                                        handleToggleCollapse={() =>
                                            setCollapsedMap(prev => ({
                                                ...prev,
                                                [comment.idx]: !prev[comment.idx],
                                            }))
                                        }
                                        collapsedMap={collapsedMap}
                                        setCollapsedMap={setCollapsedMap}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className="pt-[20px]">
                        <CommentForm
                            placeholder={t("comment.placeholder")}
                            value={commentValue}
                            handleChange={e => setCommentValue(e.currentTarget.value)}
                            handlePost={() => handlePostComment(0, commentValue)}
                        />
                    </div>
                </>
            )}
            {/* 답글 목록 */}
            {info.reply_idx.length > 0 && (
                <div className="mt-[80px] flex flex-col gap-[20px] md:mt-[120px]">
                    {info.reply_idx.map((reply, i) => (
                        <div key={`reply_${i}`}>
                            <PostDetail
                                boardType={boardType}
                                category={category}
                                detailIdx={reply.toString()}
                                reply={true}
                            />
                        </div>
                    ))}
                </div>
            )}
            {!reply && (
                <div className="relative mt-[40px] md:mt-[40px] md:flex md:flex-col md:gap-[40px]">
                    <div className="hidden justify-between md:flex">
                        {info.prev_board ? (
                            <Link
                                href={`/${boardType}/${category}/${info.prev_board.idx}`}
                                className="flex w-1/3 gap-[32px]"
                            >
                                <Image src={arrowPrev} alt="arrowPrev" width={22} height={58} className="-rotate-90" />
                                <div className="flex w-[70%] flex-col gap-[8px] text-[18px]">
                                    <p>{t("prevPost")}</p>
                                    <p className="truncate text-[#666]">{info.prev_board.b_title}</p>
                                </div>
                            </Link>
                        ) : (
                            <div />
                        )}
                        {info.next_board ? (
                            <Link
                                href={`/${boardType}/${category}/${info.next_board.idx}`}
                                className="flex w-1/3 justify-end gap-[32px]"
                            >
                                <div className="flex w-[70%] flex-col gap-[8px] text-[18px]">
                                    <p>{t("nextPost")}</p>
                                    <p className="truncate text-[#666]">{info.next_board.b_title}</p>
                                </div>
                                <Image src={arrowNext} alt="arrowNext" width={22} height={58} className="-rotate-90" />
                            </Link>
                        ) : (
                            <div />
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleBackToList}
                        className="xl: flex h-[60px] w-full items-center justify-between rounded-[8px] border border-[#D9D9D9] px-[24px] text-[18px] xl:absolute xl:left-1/2 xl:top-1/2 xl:w-[200px] xl:-translate-x-1/2 xl:-translate-y-1/2"
                    >
                        {t("backToList")}
                        <Image src={arrowUpRight} alt="arrowUpRight" width={20} height={21} />
                    </button>
                </div>
            )}
        </>
    );
}
