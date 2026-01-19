"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import AddButton from "@/components/console/button/AddButton";
import AddSubButton from "@/components/console/button/AddSubButton";
import LanguageTabs from "@/components/console/common/LanguageTabs";
import LoadingSpinner from "@/components/console/common/LoadingSpinner";
import NoData from "@/components/console/common/NoData";
import ResizableSplit from "@/components/console/common/ResizableSplit";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CategoryListParams } from "@/constants/console/listParams";
import { CONSOLE_CONFIRM_MESSAGES, CONSOLE_TOAST_MESSAGES } from "@/constants/console/messages";
import { useUrlParams } from "@/hooks/common/useUrlParams";
import { useLangTypes } from "@/hooks/console/useLangTypes";
import { useToast } from "@/hooks/use-toast";
import { useGetCategoryList, usePutCategoryOrder } from "@/service/console/menu/category";
import { useBoardStore } from "@/store/common/useBoardStore";
import { usePopupStore } from "@/store/console/usePopupStore";

import DraggableCategoryTree, {
    CategoryData,
    CategoryTreeItems,
    ExtendedItemChangedReason,
} from "./-components/DraggableCategoryTree";
import CategoryForm from "./CategoryForm";

export default function CategoryList() {
    const { langTypes, initialLang } = useLangTypes();
    const [items, setItems] = useState<CategoryData[]>([]);
    const [isSub, setIsSub] = useState(false);
    const [expandAll, setExpandAll] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [depth, setDepth] = useState(1);
    const { urlParams, updateUrlParams } = useUrlParams<CategoryListParams>({
        lang: { defaultValue: initialLang, type: "string", validValues: langTypes },
        detail: { defaultValue: "", type: "string" },
        create: { defaultValue: "0", type: "string" },
        isSub: { defaultValue: "0", type: "string" },
    });
    const [detailOn, setDetailOn] = useState("");
    const [createOn, setCreateOn] = useState(false);
    const { data: configData, isLoading: isInitialLoading } = useGetCategoryList(urlParams.lang);
    const putCategoryOrderMutation = usePutCategoryOrder();
    const { setConfirmPop } = usePopupStore();
    const { setRefreshBoardMenu } = useBoardStore();
    const { toast } = useToast();

    // detail 파라미터 동기화
    useEffect(() => {
        setDetailOn(urlParams.detail ? urlParams.detail : "");
    }, [urlParams.detail]);

    // create 파라미터 동기화
    useEffect(() => {
        setCreateOn(urlParams.create === "1");
    }, [urlParams.create]);

    // isSub 파라미터 동기화
    useEffect(() => {
        setIsSub(urlParams.isSub === "1");
    }, [urlParams.isSub]);

    // 언어탭 변경 시
    const handleChangeLangTab = (lang: string) => {
        updateUrlParams({ lang: lang, detail: undefined, create: undefined, isSub: undefined });
    };

    // 카테고리 목록 조회
    useEffect(() => {
        if (configData) {
            const data = configData.data.filter((item: CategoryData) => typeof item.id === "number");
            // 기존 데이터(1차 카테고리들)
            const originItems = data;

            // 최상위 더미 카테고리로 감싸기
            const wrappedItems = [
                {
                    id: "root-0",
                    c_depth: 0,
                    c_name: "root",
                    c_num: 1,
                    submenu: originItems,
                },
            ];

            // depth와 canHaveChildren을 자동 설정하는 함수
            const updateDepthAndChildren = (
                categoryItems: CategoryData[],
                parentDepth = 0,
                existingItems?: CategoryData[],
            ): CategoryData[] => {
                return categoryItems.map(item => {
                    // depth별 canHaveChildren 설정
                    let canHaveChildren: ((dragItem: CategoryData) => boolean) | boolean = false;

                    if (parentDepth === 0) {
                        canHaveChildren = dragItem => dragItem.c_depth === 1;
                    } else if (parentDepth === 1) {
                        canHaveChildren = dragItem => dragItem.c_depth > 1;
                    } else if (parentDepth === 2) {
                        canHaveChildren = dragItem => dragItem.c_depth > 1;
                    } else if (parentDepth === 3) {
                        canHaveChildren = dragItem => dragItem.c_depth > 1;
                    } else if (parentDepth === 4) {
                        canHaveChildren = false;
                    }

                    // 기존 items에서 collapsed 상태 찾기
                    const findCollapsedState = (
                        items: CategoryData[],
                        targetId: number | string,
                    ): boolean | undefined => {
                        for (const existingItem of items) {
                            if (existingItem.id === targetId) {
                                return existingItem.collapsed;
                            }
                            if (existingItem.children) {
                                const found = findCollapsedState(existingItem.children, targetId);
                                if (found !== undefined) return found;
                            }
                        }
                        return undefined;
                    };

                    const existingCollapsed = existingItems ? findCollapsedState(existingItems, item.id) : undefined;

                    return {
                        ...item,
                        c_depth: parentDepth,
                        collapsed: existingCollapsed ?? false,
                        canHaveChildren,
                        children: item.submenu
                            ? updateDepthAndChildren(item.submenu, parentDepth + 1, existingItems)
                            : undefined,
                    };
                });
            };

            setItems(prevItems => updateDepthAndChildren(wrappedItems, 0, prevItems));
        } else {
            setItems([]);
        }
    }, [configData]);

    // 카테고리 상세 열기
    const handleOpenDetail = (id: number | null, isSub: boolean) => {
        if (!id) return;

        if (detailOn === id.toString()) {
            updateUrlParams({
                ...urlParams,
                detail: undefined,
                create: undefined,
                isSub: undefined,
            });
        } else {
            updateUrlParams({
                ...urlParams,
                detail: id.toString(),
                create: undefined,
                isSub: isSub ? "1" : "0",
            });
        }
    };

    // 카테고리 전체 열기/닫기
    const handleToggleExpandAll = () => {
        const updatedItems = updateCollapsedState(items, !expandAll);
        setItems(updatedItems);
        setExpandAll(!expandAll);
    };

    // detailOn이 변경될 때 저장된 스크롤 위치로 복원
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollPosition;
        }
    }, [detailOn, depth, isSub, items]); // eslint-disable-line react-hooks/exhaustive-deps

    // items가 변경될 때 카테고리 정보 업데이트
    useEffect(() => {
        if (detailOn && items.length > 0) {
            const findCategoryRecursive = (items: CategoryData[]): CategoryData | null => {
                for (const item of items) {
                    if (item.id === Number(detailOn)) {
                        return item;
                    }
                    if (item.children) {
                        const found = findCategoryRecursive(item.children);
                        if (found) return found;
                    }
                }
                return null;
            };

            const findCategory = findCategoryRecursive(items);
            if (findCategory) {
                setIsSub(findCategory.c_depth > 1);
                setDepth(findCategory.c_depth);
            }
        }
    }, [detailOn, items]); // eslint-disable-line react-hooks/exhaustive-deps

    // 카테고리 등록 버튼클릭시
    const handleClickCreate = (isSubCategory?: boolean) => {
        // 하위 카테고리 등록
        if (isSubCategory) {
            if (detailOn && depth < 4) {
                updateUrlParams({
                    ...urlParams,
                    detail: createOn ? undefined : detailOn,
                    create: !createOn || (createOn && !isSub) ? "1" : undefined,
                    isSub: createOn && isSub ? undefined : "1",
                });
            }
            if (detailOn && depth >= 4) {
                setConfirmPop(true, "카테고리를 더이상 등록할 수 없습니다.", 1);
            }
            if (!detailOn) {
                setConfirmPop(true, CONSOLE_CONFIRM_MESSAGES.SELECT_ITEM("카테고리를"), 1);
            }
        }
        // 1차 카테고리 등록
        else {
            updateUrlParams({
                ...urlParams,
                detail: undefined,
                create: !createOn || (createOn && isSub) ? "1" : undefined,
                isSub: undefined,
            });
        }
    };

    // 카테고리 collapsed 값 변경
    const updateCollapsedState = (items: CategoryData[], collapsed: boolean): CategoryData[] => {
        return items.map(item => {
            // depth가 0(최상위 더미)은 collapsed 변경하지 않고, children만 재귀적으로 처리
            if (item.c_depth === 0) {
                return {
                    ...item,
                    children: item.children ? updateCollapsedState(item.children, collapsed) : undefined,
                };
            }
            // 나머지는 기존대로 collapsed 변경
            return {
                ...item,
                collapsed,
                children: item.children ? updateCollapsedState(item.children, collapsed) : undefined,
            };
        });
    };

    // dnd 변경시
    const handleItemsChanged = (items: CategoryTreeItems, reason: ExtendedItemChangedReason) => {
        // 순서변경일때만 api 호출
        if (reason.type === "dropped") {
            // children 배열에서 변경한 순서찾기
            const findNewPosition = (items: CategoryTreeItems, parentId: number | string): number => {
                for (const item of items) {
                    if (item.id === parentId && item.children) {
                        return item.children.findIndex(child => child.id === reason.draggedItem.id);
                    }
                    if (item.children) {
                        const found = findNewPosition(item.children, parentId);
                        if (found !== -1) return found;
                    }
                }
                return -1;
            };
            const newSort = findNewPosition(items, reason.droppedToParent.id);
            const body = {
                id: reason.draggedItem.id,
                move_depth: reason.droppedToParent.c_depth + 1,
                move_parent: reason.droppedToParent.id === "root-0" ? 0 : reason.droppedToParent.id,
                c_num: newSort + 1,
            };
            putCategoryOrderMutation.mutate(body, {
                onSuccess: () => {
                    toast({ title: CONSOLE_TOAST_MESSAGES.ORDER_CHANGED });
                },
            });
        } else {
            // 하위카테고리 열기닫기 일때는 그대로 상태 업데이트
            setItems(items);
        }
    };

    // 카테고리 수정 취소시
    const handleEditCancel = useCallback(() => {
        updateUrlParams({
            ...urlParams,
            detail: undefined,
            create: undefined,
            isSub: undefined,
        });
    }, [updateUrlParams, urlParams]);

    // 카테고리 등록/수정 완료시
    const onEditComplete = useCallback(
        (isSub?: boolean) => {
            updateUrlParams({
                ...urlParams,
                detail: detailOn ? detailOn : undefined,
                create: undefined,
                isSub: isSub ? "1" : undefined,
            });
            setRefreshBoardMenu(true);
        },
        [updateUrlParams, urlParams, detailOn, setRefreshBoardMenu],
    );

    // 카테고리 삭제 완료시
    const onDeleteComplete = useCallback(() => {
        updateUrlParams({
            ...urlParams,
            detail: undefined,
            create: undefined,
            isSub: undefined,
        });
    }, [updateUrlParams, urlParams]);

    return (
        <div className="flex h-[calc(100vh-90px)] flex-col">
            <div className="pr-[20px]">
                <LanguageTabs activeLang={urlParams.lang} handleLanguageChange={handleChangeLangTab} />
            </div>
            <div className="min-h-0 flex-1 pb-[20px]">
                <ResizableSplit
                    left={
                        <div className="mr-[7px] flex h-full flex-col rounded-[12px] bg-white p-[16px_20px]">
                            <div className="flex items-center gap-[12px]">
                                <p className="text-[20px] font-[600]">전체 카테고리</p>
                                {/* <ul className="flex items-center gap-[30px]">
                                <li>
                                    1차 카테고리 <span className="font-[500] text-[#0CB2AD]">10</span> 개
                                </li>
                                <li className="relative after:absolute after:-left-[18px] after:top-1/2 after:size-[6px] after:-translate-y-1/2 after:rounded-full after:bg-[#ddd] after:content-['']">
                                    2차 카테고리 <span className="font-[500] text-[#0CB2AD]">10</span> 개
                                </li>
                                <li className="relative after:absolute after:-left-[18px] after:top-1/2 after:size-[6px] after:-translate-y-1/2 after:rounded-full after:bg-[#ddd] after:content-['']">
                                    3차 카테고리 <span className="font-[500] text-[#0CB2AD]">10</span> 개
                                </li>
                                <li className="relative after:absolute after:-left-[18px] after:top-1/2 after:size-[6px] after:-translate-y-1/2 after:rounded-full after:bg-[#ddd] after:content-['']">
                                    4차 카테고리 <span className="font-[500] text-[#0CB2AD]">10</span> 개
                                </li>
                            </ul> */}
                            </div>
                            <div className="flex items-center justify-between p-[20px_0_12px]">
                                <div className="flex items-center gap-[8px]">
                                    <AddButton txt="카테고리 추가" onClick={() => handleClickCreate()} />
                                    <AddSubButton txt="하위 카테고리 추가" onClick={() => handleClickCreate(true)} />
                                </div>
                                <button
                                    type="button"
                                    className="h-[34px] rounded-[8px] border border-[#DADEE4] bg-white px-[16px] font-[500] text-[#666]"
                                    onClick={handleToggleExpandAll}
                                >
                                    전체 열기/닫기
                                </button>
                            </div>
                            <div className="min-h-0 flex-1 border border-[#ddd]">
                                {isInitialLoading ? (
                                    <div className="flex h-full items-center justify-center">
                                        <LoadingSpinner />
                                    </div>
                                ) : items[0] && items[0].submenu && items[0].submenu.length > 0 ? (
                                    <ScrollArea
                                        viewportRef={scrollRef as React.RefObject<HTMLDivElement>}
                                        className="h-full bg-white"
                                        onScroll={e => {
                                            setScrollPosition(e.currentTarget.scrollTop);
                                        }}
                                    >
                                        <DraggableCategoryTree
                                            items={items}
                                            categoryOn={Number(detailOn)}
                                            setCategoryOn={handleOpenDetail}
                                            handleItemsChanged={handleItemsChanged}
                                            setDepth={setDepth}
                                        />
                                    </ScrollArea>
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <NoData txt="카테고리가 없습니다." />
                                    </div>
                                )}
                            </div>
                            <p className="py-[8px] text-[14px] text-[#999]">
                                * 드래그앤드랍으로 카테고리 순서를 변경할 수 있습니다.
                            </p>
                        </div>
                    }
                    right={
                        <div className="h-full p-[0_20px_0_7px]">
                            {detailOn || createOn ? (
                                <CategoryForm
                                    lang={urlParams.lang || initialLang}
                                    mode={createOn ? "create" : "edit"}
                                    isSub={urlParams.isSub === "1"}
                                    detailIdx={detailOn}
                                    depth={depth}
                                    onComplete={onEditComplete}
                                    handleCancel={handleEditCancel}
                                    onDeleteComplete={onDeleteComplete}
                                />
                            ) : (
                                <NoData txt="선택된 컨텐츠가 없습니다." className="h-full rounded-[12px] bg-white" />
                            )}
                        </div>
                    }
                />
            </div>
        </div>
    );
}
