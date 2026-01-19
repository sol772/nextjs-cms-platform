import { notFound } from "next/navigation";

import Sub from "@/components/user/sub/Sub";
import { CATEGORY_TYPES } from "@/constants/user/categoryTypes";

export default async function PostCreatePage({
    params,
}: {
    params: Promise<{ categoryType: string; category: string }>;
}) {
    const { categoryType: rawCategoryType, category } = await params;
    const categoryType = CATEGORY_TYPES.find(item => item.type === rawCategoryType)?.type;
    const categoryNumber = Number(category);
    if (!categoryType || !Number.isFinite(categoryNumber)) notFound();
    return <Sub categoryType={categoryType} category={category} mode="create" />;
}
