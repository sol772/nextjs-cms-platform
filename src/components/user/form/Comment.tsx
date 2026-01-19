"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Image from "next/image";
import { useEffect, useState } from "react";

import icMember from "@/assets/images/console/icMember.svg";
import icMinusCircle from "@/assets/images/console/icMinusCircle.svg";
import icPlusCircle from "@/assets/images/console/icPlusCircle.svg";
import { useAuthStore } from "@/store/common/useAuthStore";

import Textarea from "./Textarea";

export interface CommentItem {
    idx: number;
    depth: number;
    m_name: string;
    m_email: string;
    c_reg_date?: string;
    c_contents?: string;
    children?: CommentItem[];
}

interface CommentProps {
    item: CommentItem;
    handlePost?: (depth: number, contents: string, parent_idx: number) => void;
    handleEdit?: (idx: number, contents: string) => void;
    completePost?: boolean;
    onCompletePost?: () => void;
    handleDelete?: (idx: number) => void;
    collapsed?: boolean;
    handleToggleCollapse?: () => void;
    collapsedMap?: { [idx: number]: boolean };
    setCollapsedMap?: React.Dispatch<React.SetStateAction<{ [idx: number]: boolean }>>;
}

export default function Comment({
    item,
    handlePost,
    handleEdit,
    completePost,
    onCompletePost,
    handleDelete,
    collapsed,
    handleToggleCollapse,
    collapsedMap,
    setCollapsedMap,
}: CommentProps) {
    const { loginUser } = useAuthStore();
    const [editOn, setEditOn] = useState(false);
    const [replyOn, setReply] = useState(false);
    const [editValue, setEditValue] = useState(item.c_contents || "");
    const [replyValue, setReplyValue] = useState("");

    useEffect(() => {
        if (completePost) {
            setEditOn(false);
            setReply(false);
            onCompletePost?.();
            setReplyValue("");
        }
    }, [completePost]); // eslint-disable-line react-hooks/exhaustive-deps

    // 댓글 수정 on,off
    const handleEditToggle = () => {
        setEditOn(prev => !prev);
    };

    // 댓글 더보기 토글
    const handleMoreToggle = () => {
        handleToggleCollapse?.();
    };

    // 댓글달기 토글
    const handleReplyToggle = () => {
        setReply(prev => !prev);
    };

    return (
        <>
            <div
                className={`min-h-[90px]${
                    replyOn
                        ? " relative before:absolute before:bottom-[128px] before:left-[12px] before:h-[calc(100%-140px)] before:w-[1px] before:bg-[#D9D9D9] before:content-['']"
                        : ""
                }${
                    item.children && item.children.length > 0
                        ? " relative after:absolute after:left-[12px] after:top-[4px] after:h-[calc(100%-4px)] after:w-[1px] after:bg-[#D9D9D9] after:content-['']"
                        : ""
                }`}
            >
                <div className="relative z-[2] flex flex-wrap justify-between">
                    <div className="flex items-center gap-[16px]">
                        <div className="bg-[#FAFAFD]">
                            <Image src={icMember} alt="회원" />
                        </div>
                        <p className="font-[500]">{item.m_name}</p>
                        <div className="h-[16px] w-[1px] bg-[#D9D9D9]" />
                        {item.c_reg_date && (
                            <p className="text-[14px] text-[#999]">
                                {format(new Date(item.c_reg_date), "yyyy.MM.dd a hh:mm", {
                                    locale: ko,
                                })}
                            </p>
                        )}
                        {loginUser.m_email &&
                            item.depth < 3 && ( // depth 3 이상은 댓글달기 버튼 노출 안함
                                <>
                                    <div className="h-[16px] w-[1px] bg-[#D9D9D9]" />
                                    <button
                                        type="button"
                                        className="text-[14px] text-[#666] underline"
                                        onClick={handleReplyToggle}
                                    >
                                        {replyOn ? "취소" : "댓글달기"}
                                    </button>
                                </>
                            )}
                    </div>
                    {loginUser.m_email &&
                        (loginUser.m_level === 9 || loginUser.m_email === item.m_email) && ( // 관리자 또는 작성자만 수정 가능
                            <div className="flex gap-[4px]">
                                <button
                                    type="button"
                                    className="h-[34px] rounded-[8px] bg-[#F6F7FA] px-[16px] font-[500] text-[#666]"
                                    onClick={handleEditToggle}
                                >
                                    {editOn ? "취소" : "수정"}
                                </button>
                                <button
                                    type="button"
                                    className="h-[34px] rounded-[8px] bg-[#FEE2E2] px-[16px] font-[500] text-[#E5313D]"
                                    onClick={() => handleDelete?.(item.idx)}
                                >
                                    삭제
                                </button>
                            </div>
                        )}
                </div>
                <div className="p-[8px_0_8px_40px]">
                    {!editOn && <p className="text-[15px] text-[#666]">{item.c_contents}</p>}
                    {/* 댓글 수정 */}
                    {editOn && (
                        <div className="flex justify-between gap-[12px]">
                            <Textarea
                                boxClassName="flex-1 h-[100px]"
                                value={editValue}
                                onChange={e => setEditValue(e.currentTarget.value)}
                            />
                            <button
                                type="button"
                                className="size-[100px] rounded-[5px] bg-console-2 text-[20px] font-[500] text-white"
                                onClick={() => handleEdit?.(item.idx, editValue)}
                            >
                                등록
                            </button>
                        </div>
                    )}
                </div>

                {/* 댓글달기 */}
                {replyOn && (
                    <div className="relative p-[8px_0_8px_40px] before:absolute before:left-[12px] before:top-[20px] before:h-[1px] before:w-[12px] before:bg-[#D9D9D9] before:content-['']">
                        <div className="flex items-center justify-between pb-[8px]">
                            <p className="text-[18px] font-[500]">{loginUser.m_name}</p>
                            <div className="flex w-[100px] justify-center">
                                <button
                                    type="button"
                                    className="text-[14px] text-[#666] underline"
                                    onClick={handleReplyToggle}
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between gap-[12px]">
                            <Textarea
                                boxClassName="flex-1 h-[100px]"
                                value={replyValue}
                                onChange={e => setReplyValue(e.currentTarget.value)}
                            />
                            <button
                                type="button"
                                className="size-[100px] rounded-[5px] bg-console-2 text-[20px] font-[500] text-white"
                                onClick={() => handlePost?.(item.depth + 1, replyValue, item.idx)}
                            >
                                등록
                            </button>
                        </div>
                    </div>
                )}
                {/* // 댓글달기 */}

                {/* 답댓글 목록 더보기 */}
                {item.children && item.children.length > 0 && collapsed && (
                    <div className="relative z-[2] bg-[#FAFAFD]">
                        <button
                            type="button"
                            className="flex size-[24px] items-center justify-center"
                            onClick={handleMoreToggle}
                        >
                            <Image src={icPlusCircle} alt="댓글더보기" />
                        </button>
                        <button
                            type="button"
                            className="relative pl-[40px] text-[14px] text-[#666] underline before:absolute before:left-[12px] before:top-[12px] before:h-[1px] before:w-[12px] before:bg-[#D9D9D9] before:content-[''] after:absolute after:left-[12px] after:top-[0px] after:h-[12px] after:w-[1px] after:bg-[#D9D9D9] after:content-['']"
                            onClick={handleMoreToggle}
                        >
                            댓글 더 보기
                        </button>
                    </div>
                )}
                {/* 답댓글 목록 닫기 */}
                {item.children && item.children.length > 0 && !collapsed && (
                    <button
                        type="button"
                        className="relative z-[2] flex size-[24px] items-center justify-center bg-[#FAFAFD]"
                        onClick={handleMoreToggle}
                    >
                        <Image src={icMinusCircle} alt="댓글닫기" />
                    </button>
                )}
            </div>
            {/* 답댓글 목록 */}
            {item.children && item.children.length > 0 && !collapsed && (
                <ul
                    className={`relative pl-[24px] before:absolute before:left-[12px] before:top-0 before:w-[1px] before:bg-[#D9D9D9] before:content-[''] ${
                        item.children.length > 1 ? "before:h-[100%]" : "before:h-[15px]"
                    }`}
                >
                    {item.children.map((comment, i) => (
                        <li
                            key={`comment_${i}`}
                            className={`relative before:absolute before:-left-[12px] before:top-[15px] before:h-[1px] before:w-[12px] before:bg-[#D9D9D9] before:content-['']${
                                item.children && i === item.children.length - 1
                                    ? " after:absolute after:-left-[12px] after:top-[16px] after:h-[calc(100%-16px)] after:w-[1px] after:bg-[#FAFAFD] after:content-['']"
                                    : ""
                            }`}
                        >
                            <Comment
                                item={comment}
                                handlePost={handlePost}
                                handleEdit={handleEdit}
                                completePost={completePost}
                                onCompletePost={onCompletePost}
                                handleDelete={handleDelete}
                                collapsed={collapsedMap?.[comment.idx] ?? false}
                                handleToggleCollapse={() =>
                                    setCollapsedMap?.(prev => ({
                                        ...prev,
                                        [comment.idx]: !prev[comment.idx],
                                    })) || {}
                                }
                                collapsedMap={collapsedMap}
                                setCollapsedMap={setCollapsedMap}
                            />
                        </li>
                    ))}
                </ul>
            )}
            {/* // 답댓글 목록 */}
        </>
    );
}
