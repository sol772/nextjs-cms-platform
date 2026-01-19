"use client";

import { useEffect } from "react";

import { useNotFoundOnError } from "@/hooks/common/useNotFoundOnError";
import { useGetSubCategory } from "@/service/user/menu";
import { initialBoardSettingData, useBoardStore } from "@/store/common/useBoardStore";
import { usePopupStore } from "@/store/user/usePopupStore";

import PostDetail from "../board/PostDetail";
import PostForm from "../board/PostForm";
import PostList from "../board/PostList";
import Html from "../html/Html";
import ContentLayout from "../layout/ContentLayout";
import SubTop from "./-components/SubTop";

export default function Sub({
    categoryType,
    category,
    postId,
    mode,
}: {
    categoryType: string;
    category: string;
    postId?: string;
    mode?: "create" | "edit" | "reply";
}) {
    const { setBoardSettingData } = useBoardStore();
    const {
        data: configData,
        isLoading,
        error: getSubCategoryError,
    } = useGetSubCategory(category, {
        enabled: Boolean(category),
    });
    const { setLoadingPop } = usePopupStore();

    // 데이터 수정,삭제 중일 때 로딩 팝업 표시
    useEffect(() => {
        setLoadingPop(isLoading);
        return () => setLoadingPop(false);
    }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

    // 게시글 목록 조회
    useEffect(() => {
        if (configData) {
            const data = configData.data;

            setBoardSettingData({
                c_content_type: data.c_content_type[0],
                b_column_title: data.b_column_title,
                b_column_date: data.b_column_date,
                b_column_view: data.b_column_view,
                b_column_file: data.b_column_file,
                limit: data.limit,
                b_read_lv: data.b_read_lv,
                b_write_lv: data.b_write_lv,
                b_secret: data.b_secret,
                b_reply: data.b_reply,
                b_reply_lv: data.b_reply_lv,
                b_comment: data.b_comment,
                b_comment_lv: data.b_comment_lv,
                b_top_html: data.b_top_html,
                b_template: data.b_template,
                b_template_text: data.b_template_text,
                b_thumbnail_with: data.b_thumbnail_with,
                b_thumbnail_height: data.b_thumbnail_height,
                b_group: data.b_group,
            });
        } else {
            setBoardSettingData(initialBoardSettingData);
        }
    }, [configData]); // eslint-disable-line react-hooks/exhaustive-deps

    // 에러 시 notFound 페이지로 이동
    useNotFoundOnError(getSubCategoryError);

    return (
        <>
            <SubTop category={category} topHtml={configData?.data?.b_top_html || ""} />
            {mode &&
            (categoryType === "board" ||
                categoryType === "gallery" ||
                categoryType === "faq" ||
                categoryType === "inquiry") ? (
                <ContentLayout>
                    <PostForm category={category} detailIdx={postId} mode={mode} boardType={categoryType} />
                </ContentLayout>
            ) : postId && (categoryType === "board" || categoryType === "gallery") ? (
                <ContentLayout>
                    <PostDetail boardType={categoryType} category={category} detailIdx={postId} />
                </ContentLayout>
            ) : categoryType === "board" ||
              categoryType === "gallery" ||
              categoryType === "faq" ||
              categoryType === "inquiry" ? (
                <PostList category={category} boardType={categoryType} />
            ) : null}
            {categoryType === "html" && <Html category={category} />}
        </>
    );
}
