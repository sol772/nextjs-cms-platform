"use client";

import { SimpleTreeItemWrapper, TreeItemComponentProps, TreeItems } from "dnd-kit-sortable-tree";
import { ItemChangedReason } from "dnd-kit-sortable-tree/dist/types";
import dynamic from "next/dynamic";
import Image from "next/image";
import { forwardRef } from "react";

import icDrag from "@/assets/images/console/icDrag.svg";
import icEyeOff from "@/assets/images/console/icEyeOff.svg";
import icTurnRightGray from "@/assets/images/console/icTurnRightGray.svg";
import { makeIntComma } from "@/utils/numberUtils";

export interface CategoryData {
    id: number | string;
    c_use_yn?: string;
    c_depth: number;
    c_depth_parent?: number;
    c_num: number;
    c_name: string;
    c_main_banner?: string;
    c_main_banner_file?: string;
    c_menu_ui?: string | null;
    c_menu_on_img?: string | null;
    c_menu_off_img?: string | null;
    c_content_type?: string | null;
    submenu?: CategoryData[];
    children?: CategoryData[];
    canHaveChildren?: ((dragItem: CategoryData) => boolean) | boolean;
    collapsed?: boolean;
}

export type CategoryTreeItems = TreeItems<CategoryData>;

export type ExtendedItemChangedReason = ItemChangedReason<CategoryData> & {
    draggedItem: CategoryData;
    draggedFromParent: CategoryData;
    droppedToParent: CategoryData;
};

// SortableTree를 클라이언트에서만 로드하도록 설정 (SSR 비활성화)
const SortableTree = dynamic(
    () =>
        import("dnd-kit-sortable-tree").then(mod => {
            const Component = mod.SortableTree as unknown as typeof mod.SortableTree<CategoryData, HTMLDivElement>;
            return Component;
        }),
    {
        ssr: false, // 서버 사이드 렌더링 비활성화
    },
);

interface DraggableCategoryListProps {
    items: CategoryTreeItems;
    categoryOn: number | null;
    setCategoryOn: (id: number | null, isSub: boolean) => void;
    handleItemsChanged: (items: CategoryTreeItems, reason: ExtendedItemChangedReason) => void;
    setDepth: (depth: number) => void;
}

interface CategoryItemProps extends TreeItemComponentProps<CategoryData> {
    categoryOn: number | null;
    setCategoryOn: (id: number | null, isSub: boolean) => void;
    setDepth: (depth: number) => void;
}

export const CategoryItem = forwardRef<HTMLDivElement, CategoryItemProps>(
    ({ categoryOn, setCategoryOn, setDepth, ...props }, ref) => {
        // 클릭시 해당 id 값 넘겨주기
        const handleClick = () => {
            if (categoryOn === props.item.id) {
                setCategoryOn(Number(props.item.id), false);
                if (setDepth) setDepth(1);
            } else {
                setCategoryOn(Number(props.item.id), props.item.c_depth > 1);
                if (setDepth) setDepth(props.item.c_depth);
            }
        };

        // 전체 하위 항목 개수 구하는 함수 (드래그 앤 드롭으로 변경된 실제 구조 반영)
        const countAllChildren = (item: CategoryData): number => {
            const children = (item as CategoryData & { children?: CategoryData[] }).children;
            if (!children || children.length === 0) return 0;

            return children.reduce((acc: number, child: CategoryData) => {
                return acc + 1 + countAllChildren(child);
            }, 0);
        };

        return (
            <SimpleTreeItemWrapper
                {...props}
                ref={ref}
                showDragHandle={false}
                indentationWidth={20}
                className={`group [&>div]:block [&>div]:border-none [&>div]:p-0${
                    props.item.c_depth && props.item.c_depth > 0 ? " menu_" + props.item.c_depth : " menu"
                }${props.item.c_use_yn === "N" ? " bg-[#F8F8F8]" : ""}${
                    categoryOn === props.item.id ? " !bg-[#E0F1F0]" : ""
                }`}
            >
                <div
                    className="flex items-center justify-between gap-[8px] p-[16px_20px_16px_0]"
                    onClick={e => {
                        e.stopPropagation(); // 내부 토글 동작 차단
                        handleClick();
                    }}
                >
                    <div
                        {...props.handleProps}
                        className="menu-drag opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    >
                        <Image src={icDrag} alt="이동" />
                    </div>
                    <div className="flex w-[calc(100%-32px)] flex-wrap items-center gap-[8px] font-[500]">
                        {props.item.c_depth > 1 && <Image src={icTurnRightGray} alt="하위테고리" />}
                        <p
                            className={`max-w-[78%] truncate font-[500] transition-all duration-300${
                                categoryOn === props.item.id ? " underline" : ""
                            }`}
                        >
                            {props.item.c_name}
                        </p>
                        <p>({makeIntComma(countAllChildren(props.item))})</p>
                        {props.item.c_use_yn === "N" && <Image src={icEyeOff} alt="비활성화" />}
                    </div>
                </div>
            </SimpleTreeItemWrapper>
        );
    },
);

CategoryItem.displayName = "CategoryItem"; // forwardRef 사용 시 필요

export default function DraggableCategoryTree({
    items,
    categoryOn,
    setCategoryOn,
    handleItemsChanged,
    setDepth,
}: DraggableCategoryListProps) {
    const CustomTreeItem = forwardRef<HTMLDivElement, TreeItemComponentProps<CategoryData>>((props, ref) => (
        <CategoryItem {...props} ref={ref} categoryOn={categoryOn} setCategoryOn={setCategoryOn} setDepth={setDepth} />
    ));

    CustomTreeItem.displayName = "CustomTreeItem";

    return (
        <ul className="dnd_category">
            <SortableTree
                items={items}
                onItemsChanged={handleItemsChanged}
                TreeItemComponent={CustomTreeItem}
                canRootHaveChildren={false}
            />
        </ul>
    );
}
