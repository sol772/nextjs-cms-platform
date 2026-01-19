"use client";

import { useEffect, useState } from "react";

const categoryTypeList = [
    {
        type: 1,
        title: "HTML",
    },
    {
        type: 2,
        title: "빈 메뉴",
    },
    {
        type: 3,
        title: "고객맞춤",
    },
    {
        type: 4,
        title: "일반 게시판",
    },
    {
        type: 5,
        title: "갤러리 게시판",
    },
    {
        type: 6,
        title: "FAQ",
    },
    {
        type: 7,
        title: "문의게시판",
    },
];

export const useCategoryType = () => {
    const [categoryType, setCategoryType] = useState<number | null>(null);
    const [categoryTypeTitle, setCategoryTypeTitle] = useState("");

    useEffect(() => {
        if(categoryType){
            const foundCategory = categoryTypeList.find(item => item.type === categoryType);
            const newCategoryTypeTitle = foundCategory?.title ?? "";
            setCategoryTypeTitle(newCategoryTypeTitle);
        }
    }, [categoryType]);

    return { setCategoryType, categoryTypeTitle };
};