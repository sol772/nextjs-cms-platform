"use client";

import { useParams } from "next/navigation";
import { memo } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { usePostForm } from "@/hooks/console/usePostForm";

import PostFormBody from "./-components/PostFormBody";

interface BoardFormProps {
    detailIdx: string;
    onComplete: (edit?: boolean) => void;
    handleCancel: () => void;
    handleConfirmDelete: (idx: string) => void;
}

export default memo(function PostForm({ detailIdx, onComplete, handleCancel, handleConfirmDelete }: BoardFormProps) {
    const params = useParams<{ category: string }>();
    const category = params.category;
    const postForm = usePostForm(category, detailIdx, detailIdx ? "edit" : "create", onComplete);

    return (
        <div className="h-full rounded-[12px] bg-white">
            <form onSubmit={postForm.handleSubmit(postForm.handleConfirmSave)} className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-[#D9D9D9] p-[16px_20px]">
                    <p className="text-[20px] font-[700]">게시글 관리</p>
                    {/* 게시글 수정일때만 삭제버튼 노출 */}
                    {detailIdx && (
                        <button
                            type="button"
                            className="h-[34px] rounded-[8px] bg-[#FEE2E2] px-[16px] font-[500] text-[#E5313D]"
                            onClick={() => handleConfirmDelete(detailIdx)}
                        >
                            삭제
                        </button>
                    )}
                </div>
                <div className="min-h-0 flex-1">
                    <ScrollArea className="h-full">
                        <PostFormBody
                            register={postForm.register}
                            control={postForm.control}
                            errors={postForm.errors}
                            setValue={postForm.setValue}
                            values={postForm.values}
                            boardSettingData={postForm.boardSettingData}
                            boardGroupList={postForm.boardGroupList}
                            files={postForm.files}
                            setFiles={postForm.setFiles}
                            setFilesData={postForm.setFilesData}
                            imgFiles={postForm.imgFiles}
                            setImgFiles={postForm.setImgFiles}
                            setImgFilesData={postForm.setImgFilesData}
                            handleConfirmDeleteFile={postForm.handleConfirmDeleteFile}
                        />
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
        </div>
    );
});
