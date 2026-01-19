import { DragEndEvent } from "@dnd-kit/core";
import { useEffect, useRef, useState } from "react";

import ConsoleDialogContent from "@/components/console/common/ConsoleDialogContent";
import DraggableList from "@/components/console/common/DraggableList";
import LoadingSpinner from "@/components/console/common/LoadingSpinner";
import NoData from "@/components/console/common/NoData";
import AllCheckbox from "@/components/console/form/AllCheckbox";
import Checkbox from "@/components/console/form/Checkbox";
import InputWithButton from "@/components/console/form/InputWithButton";
import Toggle from "@/components/console/form/Toggle";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CONSOLE_CONFIRM_MESSAGES, CONSOLE_TOAST_MESSAGES } from "@/constants/console/messages";
import { useCheckboxList } from "@/hooks/console/useCheckboxList";
import { useToast } from "@/hooks/use-toast";
import {
    useGetBoardGroupList,
    usePostBoardGroup,
    usePutBoardGroup,
    usePutBoardGroupGrade,
    usePutBoardGroupOrder,
} from "@/service/console/menu/category";
import { usePopupStore } from "@/store/console/usePopupStore";
import { makeIntComma } from "@/utils/numberUtils";

interface BoardGroupPopProps {
    parentId: string;
    showAllUseCheck?: boolean;
    allUseCheck?: boolean;
    handleAllUseCheck?: (checked: boolean) => void;
}

interface Item {
    id: number;
    parent_id: number;
    g_num: number;
    g_name: string;
    use_yn: string;
}

export default function BoardGroupPop({
    parentId,
    showAllUseCheck,
    allUseCheck,
    handleAllUseCheck,
}: BoardGroupPopProps) {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<Item[]>([]);
    const { allCheck, setCheckList, checkedList, setCheckedList, handleAllCheck, handleCheck } = useCheckboxList();
    const [addGroup, setAddGroup] = useState(false);
    const addGroupRef = useRef<HTMLInputElement>(null);
    const { data: configData, isLoading: isInitialLoading } = useGetBoardGroupList(parentId, {
        enabled: Boolean(parentId && open),
        key: "popup",
    });
    const postBoardGroupMutation = usePostBoardGroup();
    const putBoardGroupMutation = usePutBoardGroup();
    const putBoardGroupOrderMutation = usePutBoardGroupOrder();
    const putBoardGroupGradeMutation = usePutBoardGroupGrade();
    const { setConfirmPop } = usePopupStore();
    const { toast } = useToast();

    // 게시판 분류 목록 조회
    useEffect(() => {
        if (configData) {
            setItems(
                configData.data.map((item: Item) => ({
                    ...item,
                    use_yn: item.use_yn[0],
                })),
            );
        } else {
            setItems([]);
        }
    }, [configData]);

    // 리스트 idx 값만 배열로 (전체 체크박스리스트 만들기)
    useEffect(() => {
        setCheckList(items && items.length > 0 ? items.map(item => item.id) : []);
        setCheckedList([]);
    }, [items, setCheckList, setCheckedList]);

    // addInput이 true일 때 포커스
    useEffect(() => {
        if (addGroup && addGroupRef.current) {
            addGroupRef.current.focus();
        }
    }, [addGroup]);

    // 순서 변경 처리
    const handleChangeOrder = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const body = {
            id: Number(active.id),
            parent_id: Number(parentId),
            g_num: over.data.current?.g_num,
        };
        putBoardGroupOrderMutation.mutate(body, {
            onSuccess: () => {
                toast({ title: CONSOLE_TOAST_MESSAGES.ORDER_CHANGED });
            },
        });
    };

    // 노출설정 변경/삭제 확인
    const handleConfirmStatusChange = (status: "Y" | "N" | "D") => {
        if (checkedList.length === 0) {
            setConfirmPop(true, CONSOLE_CONFIRM_MESSAGES.SELECT_ITEM("분류를"), 1);
        } else {
            if (status === "D") {
                setConfirmPop(
                    true,
                    CONSOLE_CONFIRM_MESSAGES.DELETE,
                    2,
                    () => handleChangeStatus(status),
                    undefined,
                    "",
                    "red",
                );
            } else {
                setConfirmPop(
                    true,
                    CONSOLE_CONFIRM_MESSAGES.CHANGE_EXPOSURE("분류를", status === "Y" ? "노출" : "중단"),
                    2,
                    () => handleChangeStatus(status),
                );
            }
        }
    };

    // 노출설정 변경/삭제
    const handleChangeStatus = (status: "Y" | "N" | "D", id?: number) => {
        const body = {
            parent_id: Number(parentId),
            id: id ? [id] : checkedList,
            g_grade: status,
        };
        putBoardGroupGradeMutation.mutate(body, {
            onSuccess: () => {
                toast({
                    title:
                        status === "Y"
                            ? CONSOLE_TOAST_MESSAGES.STATUS_EXPOSED
                            : status === "N"
                            ? CONSOLE_TOAST_MESSAGES.STATUS_STOPPED
                            : CONSOLE_TOAST_MESSAGES.STATUS_DELETED,
                });
            },
        });
    };

    // 게시판 분류 수정
    const handleEditGroup = (id: number, inputValue: string) => {
        const body = {
            id,
            g_name: inputValue,
        };
        putBoardGroupMutation.mutate(body, {
            onSuccess: () => {
                setAddGroup(false);
                toast({ title: CONSOLE_TOAST_MESSAGES.UPDATED });
            },
        });
    };

    // 게시판 분류 추가
    const handleAddGroup = (inputValue: string) => {
        const body = {
            parent_id: Number(parentId),
            g_name: inputValue,
            use_yn: "Y",
        };
        postBoardGroupMutation.mutate(body, {
            onSuccess: () => {
                setAddGroup(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="bg h-[34px] rounded-[8px] border border-[#181818] bg-white px-[16px] font-[500]"
                >
                    분류 설정
                </button>
            </DialogTrigger>
            <ConsoleDialogContent title="분류 설정" className="max-w-[640px]">
                <ScrollArea className="max-h-[75vh] min-h-[300px] border-b border-[#D9D9D9] p-[20px_20px_40px]">
                    {showAllUseCheck && (
                        <ul className="flex flex-col gap-[20px] pb-[20px]">
                            <li className="flex flex-col gap-[8px]">
                                <p className="text-[#666]">전체분류 사용</p>
                                <div className="flex h-[48px] items-center justify-start">
                                    <Checkbox
                                        checked={allUseCheck ?? false}
                                        txt="체크 시 해당 게시판에 등록한 게시글을 모두 볼 수 있는 전체 게시판 분류 사용"
                                        onChange={e => handleAllUseCheck?.(e.currentTarget.checked)}
                                    />
                                </div>
                            </li>
                        </ul>
                    )}
                    <div className="flex items-center justify-between border-b border-[#D9D9D9] pb-[8px]">
                        <p className="font-[500]">
                            <span className="text-console">{makeIntComma(items.length)}</span> 개
                        </p>
                        <button
                            type="button"
                            className="h-[40px] rounded-[8px] bg-[#181818] px-[20px] text-[18px] font-[700] text-white"
                            onClick={() => setAddGroup(!addGroup)}
                        >
                            추가
                        </button>
                    </div>
                    <div className="flex items-center justify-between py-[8px]">
                        <div className="flex items-center gap-[8px]">
                            <AllCheckbox checked={allCheck} onChange={e => handleAllCheck(e.currentTarget.checked)} />
                            <button
                                type="button"
                                className="h-[34px] rounded-[8px] bg-console-2 px-[16px] font-[500] text-white"
                                onClick={() => handleConfirmStatusChange("Y")}
                            >
                                노출
                            </button>
                            <button
                                type="button"
                                className="h-[34px] rounded-[8px] bg-[#F6F7FA] px-[16px] font-[500] text-[#666]"
                                onClick={() => handleConfirmStatusChange("N")}
                            >
                                중단
                            </button>
                            <button
                                type="button"
                                className="h-[34px] rounded-[8px] bg-[#FEE2E2] px-[16px] font-[500] text-[#E5313D]"
                                onClick={() => handleConfirmStatusChange("D")}
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                    {isInitialLoading ? (
                        <div className="flex h-[300px] items-center justify-center">
                            <LoadingSpinner />
                        </div>
                    ) : items && items.length > 0 ? (
                        <DraggableList
                            items={items}
                            getItemId={item => item.id}
                            getItemData={item => ({
                                g_num: item.g_num,
                            })}
                            renderRow={item => (
                                <div className="flex cursor-pointer items-center justify-between gap-[16px] rounded-[12px] border bg-white p-[8px_20px_8px_8px] transition-all hover:border-console">
                                    <div className="flex justify-center pl-[24px]">
                                        <Checkbox
                                            checked={checkedList.includes(item.id)}
                                            onChange={e => handleCheck(e.currentTarget.checked, item.id)}
                                        />
                                    </div>
                                    <InputWithButton
                                        boxClassName="flex-1"
                                        placeholder="분류명을 입력해주세요."
                                        btnText="수정"
                                        defaultValue={item.g_name || ""}
                                        handleClick={(inputValue: string) => handleEditGroup(item.id, inputValue)}
                                    />
                                    <Toggle
                                        txt="노출"
                                        checked={item.use_yn === "Y"}
                                        handleChange={checked => handleChangeStatus(checked ? "Y" : "N", item.id)}
                                    />
                                </div>
                            )}
                            handleChangeOrder={handleChangeOrder}
                        />
                    ) : (
                        <div className="flex h-[300px] items-center justify-center">
                            <NoData className="flex-1" />
                        </div>
                    )}
                    {addGroup && (
                        <InputWithButton
                            ref={addGroupRef}
                            boxClassName="flex-1 mt-[8px]"
                            placeholder="추가할 분류명을 입력하고 저장을 눌러주세요"
                            btnText="저장"
                            handleClick={handleAddGroup}
                        />
                    )}
                </ScrollArea>
            </ConsoleDialogContent>
        </Dialog>
    );
}
