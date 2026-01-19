"use client";

import { memo, useEffect, useMemo, useState } from "react";

import { Editor } from "@/components/blocks/editor-x/editor";
import ConsoleDialogContent from "@/components/console/common/ConsoleDialogContent";
import LoadingSpinner from "@/components/console/common/LoadingSpinner";
import Comment, { CommentItem } from "@/components/console/form/Comment";
import CommentForm from "@/components/console/form/CommentForm";
import { FileData } from "@/components/console/form/FileUpload";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CONSOLE_CONFIRM_MESSAGES, CONSOLE_TOAST_MESSAGES } from "@/constants/console/messages";
import { useNotFoundOnError } from "@/hooks/common/useNotFoundOnError";
import { useCategoryType } from "@/hooks/console/useCategoryType";
import { useToast } from "@/hooks/use-toast";
import {
    useDelPost,
    useDelPostComment,
    useGetPost,
    useGetPostComment,
    useGetPostFileDownload,
    usePostPostComment,
    usePutPostComment,
} from "@/service/console/board/post";
import { useAuthStore } from "@/store/common/useAuthStore";
import { usePopupStore } from "@/store/console/usePopupStore";
import { makeIntComma } from "@/utils/numberUtils";

import ReplyForm from "./-components/ReplyForm";

interface InfoItem {
    b_title: string;
    m_name: string;
    b_reg_date: string;
    b_view: number;
    b_contents: string;
    b_file: FileData[];
    b_img: string | null;
    b_reply: number | null;
    b_depth: number;
    reply_count: number;
    reply_idx: number[];
    c_content_type: number;
    g_name: string | null;
}

interface PostDetailProps {
    category: string;
    detailIdx: string;
    handleEdit?: () => void;
    onDeleteComplete?: (reply: boolean) => void;
    onCompleteComment?: (del?: boolean) => void;
    commentPage?: boolean; // 댓글관리 페이지인지 여부
    reply?: boolean; // 답글달기 인지 여부
    refetch: boolean;
    onRefetched: () => void;
}

export default memo(function PostDetail({
    category,
    detailIdx,
    handleEdit,
    onDeleteComplete,
    onCompleteComment,
    commentPage = false,
    reply = false,
    refetch = false,
    onRefetched,
}: PostDetailProps) {
    const { loginUser } = useAuthStore();
    const [downloadFile, setDownloadFile] = useState<{ idx: string; name: string } | null>(null);
    const [commentList, setCommentList] = useState<CommentItem[]>([]);
    const [commentValue, setCommentValue] = useState("");
    const [completePost, setCompletePost] = useState(false);
    const [collapsedMap, setCollapsedMap] = useState<{ [idx: number]: boolean }>({});
    const [replyPop, setReplyPop] = useState(false);
    const [replyEditPop, setReplyEditPop] = useState(false);
    const { setCategoryType, categoryTypeTitle } = useCategoryType();
    const {
        data: configData,
        isLoading: isInitialLoading,
        error: getPostError,
        refetch: refetchPost,
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
            m_name: "",
            b_reg_date: "",
            b_view: 0,
            b_contents: "",
            b_file: [],
            b_img: null,
            b_reply: null,
            b_depth: 0,
            reply_count: 0,
            reply_idx: [],
            c_content_type: 0,
            g_name: null,
        }),
        [],
    );
    const [info, setInfo] = useState<InfoItem>(initialInfo);
    const { setConfirmPop } = usePopupStore();
    const { toast } = useToast();

    // 상세 조회
    useEffect(() => {
        if (configData) {
            setInfo(configData.data);
            setCategoryType(configData.data.c_content_type);
        } else {
            setInfo(initialInfo);
        }
    }, [configData, initialInfo]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (refetch) {
            refetchPost();
            onRefetched();
        }
    }, [refetch]); // eslint-disable-line react-hooks/exhaustive-deps

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

    // 삭제 확인
    const handleConfirmDelete = (reply: boolean) => {
        setConfirmPop(true, CONSOLE_CONFIRM_MESSAGES.DELETE, 2, () => handleDelete(reply), undefined, "", "red");
    };

    // 삭제하기
    const handleDelete = (reply: boolean) => {
        if (!category || !detailIdx) return;
        const body = { idx: [detailIdx], category: Number(category), pass: "T" };
        delPostMutation.mutate(body, {
            onSuccess: () => {
                toast({ title: CONSOLE_TOAST_MESSAGES.DELETED });
                onDeleteComplete?.(reply);
            },
        });
    };

    // 댓글 등록
    const handlePostComment = (depth: number, contents: string, parent_idx?: number) => {
        if (contents.length < 1) {
            return setConfirmPop(true, CONSOLE_CONFIRM_MESSAGES.COMMENT_REQUIRED, 1);
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
                toast({ title: CONSOLE_TOAST_MESSAGES.COMMENT_CREATED });
                setCommentValue("");
                setCompletePost(true);
            },
        });
    };

    // 댓글 수정
    const handleEditComment = (idx: number, contents: string) => {
        if (contents.length < 1) {
            return setConfirmPop(true, CONSOLE_CONFIRM_MESSAGES.COMMENT_REQUIRED, 1);
        }
        const body = {
            category: Number(category),
            idx,
            c_contents: contents,
        };
        putPostCommentMutation.mutate(body, {
            onSuccess: () => {
                toast({ title: CONSOLE_TOAST_MESSAGES.COMMENT_UPDATED });
                setCompletePost(true);
            },
        });
    };

    // 댓글 삭제 확인
    const handleConfirmDeleteComment = (idx: number) => {
        setConfirmPop(true, CONSOLE_CONFIRM_MESSAGES.DELETE, 2, () => handleDeleteComment(idx), undefined, "", "red");
    };

    // 댓글 삭제
    const handleDeleteComment = (idx: number) => {
        const body = { category: Number(category), idx };
        delPostCommentMutation.mutate(body, {
            onSuccess: () => {
                toast({ title: CONSOLE_TOAST_MESSAGES.COMMENT_DELETED });
            },
        });
    };

    return (
        <ScrollArea className="h-full">
            {isInitialLoading || isCommentLoading || isFileDownloadLoading || delPostMutation.isPending ? (
                <LoadingSpinner />
            ) : (
                <div className={`flex min-h-full flex-col${info.reply_idx.length > 0 ? " gap-[20px] pb-[20px]" : ""}`}>
                    {replyEditPop ? (
                        <div className="rounded-[12px] bg-white">
                            <div className="flex justify-between border-b border-[#D9D9D9] p-[16px_20px]">
                                <p className="flex-1 break-all text-[20px] font-[700]">게시글 관리</p>
                                <button
                                    type="button"
                                    className="h-[34px] rounded-[8px] bg-[#FEE2E2] px-[16px] font-[500] text-[#E5313D]"
                                    onClick={() => handleConfirmDelete(reply)}
                                >
                                    삭제
                                </button>
                            </div>
                            <ReplyForm
                                category={category}
                                detailIdx={detailIdx}
                                handleClose={() => setReplyEditPop(false)}
                                onComplete={() => {
                                    setReplyEditPop(false);
                                }}
                                mode="edit"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-1 flex-col rounded-[12px] bg-white">
                            <div className="flex flex-col gap-[20px] border-b border-[#D9D9D9] p-[16px_20px]">
                                <div className="flex items-center justify-between">
                                    <p className="flex-1 break-all text-[20px] font-[700]">{info.b_title}</p>
                                    {!commentPage && ( // 댓글관리 페이지에서는 미노출
                                        <div className="flex gap-[4px]">
                                            {(info.c_content_type === 4 ||
                                                info.c_content_type === 5 ||
                                                (info.c_content_type === 7 && info.reply_count === 0)) &&
                                                !reply && (
                                                    <Dialog open={replyPop} onOpenChange={setReplyPop}>
                                                        <DialogTrigger asChild>
                                                            <button
                                                                type="button"
                                                                className="h-[34px] rounded-[8px] bg-[#F6F7FA] px-[16px] font-[500] text-[#666]"
                                                            >
                                                                답글달기
                                                            </button>
                                                        </DialogTrigger>
                                                        {replyPop && (
                                                            <ConsoleDialogContent
                                                                title={`답글 등록`}
                                                                className="max-w-[640px]"
                                                            >
                                                                <ReplyForm
                                                                    category={category}
                                                                    detailIdx={detailIdx}
                                                                    handleClose={() => setReplyPop(false)}
                                                                    onComplete={() => {
                                                                        setReplyPop(false);
                                                                    }}
                                                                    mode="reply"
                                                                    className="max-h-[75vh] min-h-[300px]"
                                                                />
                                                            </ConsoleDialogContent>
                                                        )}
                                                    </Dialog>
                                                )}
                                            {reply ? ( // 답글 수정
                                                <button
                                                    type="button"
                                                    className="h-[34px] rounded-[8px] bg-[#F6F7FA] px-[16px] font-[500] text-[#666]"
                                                    onClick={() => setReplyEditPop(true)}
                                                >
                                                    수정
                                                </button>
                                            ) : (
                                                // 게시글 수정
                                                <button
                                                    type="button"
                                                    className="h-[34px] rounded-[8px] bg-[#F6F7FA] px-[16px] font-[500] text-[#666]"
                                                    onClick={handleEdit}
                                                >
                                                    수정
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                className="h-[34px] rounded-[8px] bg-[#FEE2E2] px-[16px] font-[500] text-[#E5313D]"
                                                onClick={() => handleConfirmDelete(reply)}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <ul className="flex gap-[8px]">
                                    <li className="flex flex-1 flex-col gap-[4px]">
                                        <p className="text-[14px] text-[#9F9FA5]">페이지뷰</p>
                                        <p>{makeIntComma(info.b_view)}</p>
                                    </li>
                                    {info.c_content_type < 6 && ( // FAQ, 문의 게시판은 답글/댓글 미노출
                                        <li className="flex flex-1 flex-col gap-[4px]">
                                            <p className="text-[14px] text-[#9F9FA5]">{!reply ? "답글 / " : ""}댓글</p>
                                            <p>
                                                {!reply && `${makeIntComma(info.reply_count)} / `}
                                                {makeIntComma(commentList.length)}
                                            </p>
                                        </li>
                                    )}
                                    <li className="flex flex-1 flex-col gap-[4px]">
                                        <p className="text-[14px] text-[#9F9FA5]">게시판 유형</p>
                                        <p>{categoryTypeTitle}</p>
                                    </li>
                                    {info.g_name && ( // 게시판 분류 사용시에만 노출
                                        <li className="flex flex-1 flex-col gap-[4px]">
                                            <p className="text-[14px] text-[#9F9FA5]">분류 유형</p>
                                            <p>{info.g_name}</p>
                                        </li>
                                    )}
                                    <li className="flex flex-1 flex-col gap-[4px]">
                                        <p className="text-[14px] text-[#9F9FA5]">작성자</p>
                                        <p>{info.m_name}</p>
                                    </li>
                                    <li className="flex flex-1 flex-col gap-[4px]">
                                        <p className="text-[14px] text-[#9F9FA5]">등록일자</p>
                                        <p>{info.b_reg_date}</p>
                                    </li>
                                </ul>
                            </div>
                            <div className="min-h-[300px] flex-1 p-[20px_40px]">
                                <Editor htmlValue={info.b_contents || ""} editable={false} />
                            </div>
                            {info.b_file.length > 0 && (
                                <div className="flex border-t border-[#D9D9D9] p-[16px_20px]">
                                    <p className="w-[120px] font-[500]">첨부파일</p>
                                    <ul className="flex flex-1 flex-col gap-[5px]">
                                        {info.b_file.map((file, i) => (
                                            <li key={`file_${i}`}>
                                                <button
                                                    type="button"
                                                    className="text-left text-[14px] text-[#999]"
                                                    onClick={() =>
                                                        handleFileDownload(file.idx.toString(), file.original_name)
                                                    }
                                                >
                                                    {file.original_name}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {commentList.length > 0 && (
                                <ul className="border-t border-[#D9D9D9] bg-[#FAFAFD] p-[16px_20px]">
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
                            {info.c_content_type < 6 && ( // FAQ, 문의 게시판은 댓글 미노출
                                <div className="border-t border-[#D9D9D9] p-[20px]">
                                    <CommentForm
                                        placeholder="댓글을 입력해주세요."
                                        value={commentValue}
                                        handleChange={e => setCommentValue(e.currentTarget.value)}
                                        handlePost={() => handlePostComment(0, commentValue)}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                    {/* 답글 목록 */}
                    {info.reply_idx.length > 0 &&
                        info.reply_idx.map((reply, i) => (
                            <div key={`reply_${i}`}>
                                <PostDetail
                                    category={category}
                                    detailIdx={reply.toString()}
                                    onDeleteComplete={onDeleteComplete}
                                    onCompleteComment={onCompleteComment}
                                    reply={true}
                                    refetch={false}
                                    onRefetched={() => {}}
                                />
                            </div>
                        ))}
                </div>
            )}
        </ScrollArea>
    );
});
