"use client";

import { useEffect, useMemo, useState } from "react";

import LoadingSpinner from "@/components/console/common/LoadingSpinner";
import Comment, { CommentItem } from "@/components/console/form/Comment";
import CommentForm from "@/components/console/form/CommentForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CONSOLE_CONFIRM_MESSAGES, CONSOLE_TOAST_MESSAGES } from "@/constants/console/messages";
import { useNotFoundOnError } from "@/hooks/common/useNotFoundOnError";
import { useToast } from "@/hooks/use-toast";
import {
    useGetMaint,
    useGetMaintComment,
    useGetMaintFileDownload,
    usePostMaintComment,
} from "@/service/console/maintenance";
import { usePopupStore } from "@/store/console/usePopupStore";
import { makeIntComma } from "@/utils/numberUtils";

interface InfoItem {
    subject: string;
    name: string;
    w_date: string;
    counter: number;
    process: string | null;
    contents: string;
    b_file: string;
}

interface MaintDetailProps {
    maintName: string;
    detailIdx: string;
}

export default function MaintDetail({ maintName, detailIdx }: MaintDetailProps) {
    const [downloadFile, setDownloadFile] = useState<string | null>(null);
    const [commentList, setCommentList] = useState<CommentItem[]>([]);
    const [commentValue, setCommentValue] = useState("");
    const {
        data: configData,
        isLoading: isInitialLoading,
        error: getMaintError,
    } = useGetMaint(maintName, detailIdx, {
        enabled: Boolean(maintName) && Boolean(detailIdx),
    });
    const { data: downloadData } = useGetMaintFileDownload(downloadFile && detailIdx ? detailIdx : "");
    const { data: postComment } = useGetMaintComment(detailIdx || "", {
        enabled: Boolean(detailIdx),
    });
    const postMaintCommentMutation = usePostMaintComment();
    const initialInfo = useMemo<InfoItem>(
        () => ({
            subject: "",
            name: "",
            w_date: "",
            counter: 0,
            process: null,
            contents: "",
            b_file: "",
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
        } else {
            setInfo(initialInfo);
        }
    }, [configData, initialInfo]);

    // 404 에러 처리
    useNotFoundOnError(getMaintError);

    // 게시글 댓글 조회
    useEffect(() => {
        if (postComment) {
            setCommentList(postComment.data);
        } else {
            setCommentList([]);
        }
    }, [postComment]);

    // 파일다운로드 데이터가 있을 때 실행
    useEffect(() => {
        if (downloadData && downloadFile) {
            const url = window.URL.createObjectURL(new Blob([downloadData.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", downloadFile);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setDownloadFile(null); // 다운로드 완료 후 초기화
        }
    }, [downloadData, downloadFile]);

    // 첨부파일 다운로드 버튼 클릭시
    const handleFileDownload = (file_name: string) => {
        if (!maintName || !detailIdx) return;
        setDownloadFile(file_name);
    };

    // 댓글 등록
    const handlePostComment = () => {
        if (commentValue.length < 1) {
            return setConfirmPop(true, CONSOLE_CONFIRM_MESSAGES.COMMENT_REQUIRED, 1);
        }
        const body = {
            c_content: commentValue,
            c_name: maintName,
            c_password: "",
            c_table: "admin",
            list_no: Number(detailIdx),
            m_id: "",
        };
        postMaintCommentMutation.mutate(body, {
            onSuccess: () => {
                toast({ title: CONSOLE_TOAST_MESSAGES.COMMENT_CREATED });
                setCommentValue("");
            },
        });
    };

    return (
        <ScrollArea className="h-full">
            {isInitialLoading ? (
                <LoadingSpinner />
            ) : (
                <div className="flex min-h-full flex-col">
                    <div className="flex flex-1 flex-col rounded-[12px] bg-white">
                        <div className="flex flex-col gap-[20px] border-b border-[#D9D9D9] p-[16px_20px]">
                            <p className="break-all text-[20px] font-[700]">{info.subject}</p>
                            <ul className="flex gap-[8px]">
                                <li className="flex flex-1 flex-col gap-[4px]">
                                    <p className="text-[14px] text-[#9F9FA5]">페이지뷰</p>
                                    <p>{makeIntComma(info.counter)}</p>
                                </li>
                                <li className="flex flex-1 flex-col gap-[4px]">
                                    <p className="text-[14px] text-[#9F9FA5]">댓글</p>
                                    <p>{makeIntComma(commentList.length)}</p>
                                </li>
                                <li className="flex flex-1 flex-col gap-[4px]">
                                    <p className="text-[14px] text-[#9F9FA5]">작성자</p>
                                    <p>{info.name}</p>
                                </li>
                                <li className="flex flex-1 flex-col gap-[4px]">
                                    <p className="text-[14px] text-[#9F9FA5]">등록일자</p>
                                    <p>{info.w_date}</p>
                                </li>
                                <li className="flex flex-1 flex-col gap-[4px]">
                                    <p className="text-[14px] text-[#9F9FA5]">진행상황</p>
                                    <p>{info.process || "-"}</p>
                                </li>
                            </ul>
                        </div>
                        <div className="min-h-[300px] flex-1 p-[20px_40px]">
                            <div dangerouslySetInnerHTML={{ __html: info.contents }} />
                        </div>
                        {info.b_file && (
                            <div className="flex border-t border-[#D9D9D9] p-[16px_20px]">
                                <p className="w-[120px] font-[500]">첨부파일</p>
                                <ul className="flex flex-1 flex-col gap-[5px]">
                                    <li>
                                        <button
                                            type="button"
                                            className="text-left text-[14px] text-[#999]"
                                            onClick={() => handleFileDownload(info.b_file)}
                                        >
                                            {info.b_file}
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                        {commentList.length > 0 && (
                            <ul className="border-t border-[#D9D9D9] bg-[#FAFAFD] p-[16px_20px]">
                                {commentList.map((comment, i) => (
                                    <li key={`comment_${i}`}>
                                        <Comment item={comment} maintPage={true} />
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="border-t border-[#D9D9D9] p-[20px]">
                            <CommentForm
                                placeholder="댓글을 입력해주세요."
                                value={commentValue}
                                handleChange={e => setCommentValue(e.currentTarget.value)}
                                handlePost={handlePostComment}
                            />
                        </div>
                    </div>
                </div>
            )}
        </ScrollArea>
    );
}
