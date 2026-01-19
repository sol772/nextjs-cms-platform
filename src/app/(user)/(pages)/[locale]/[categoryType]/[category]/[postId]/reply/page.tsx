import { notFound } from "next/navigation";

import Sub from "@/components/user/sub/Sub";
import { CATEGORY_TYPES } from "@/constants/user/categoryTypes";

export default async function PostReplyPage({
    params,
}: {
    params: Promise<{ categoryType: string; category: string; postId: string }>;
}) {
    const { categoryType: rawCategoryType, category, postId } = await params;
    const categoryType = CATEGORY_TYPES.find(item => item.type === rawCategoryType)?.type;
    const categoryNumber = Number(category);
    if (!categoryType || !Number.isFinite(categoryNumber)) notFound();
    return <Sub categoryType={categoryType} category={category} postId={postId} mode="reply" />;
}
