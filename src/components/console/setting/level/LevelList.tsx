"use client";

import { useEffect, useState } from "react";

import LoadingSpinner from "@/components/console/common/LoadingSpinner";
import NoData from "@/components/console/common/NoData";
import Input from "@/components/console/form/Input";
import InputWithButton from "@/components/console/form/InputWithButton";
import SelectBox, { SelectItem } from "@/components/console/form/SelectBox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CONSOLE_TOAST_MESSAGES } from "@/constants/console/messages";
import { useToast } from "@/hooks/use-toast";
import { useGetLevelList, usePutLevel } from "@/service/console/setting/level";
import { usePopupStore } from "@/store/console/usePopupStore";

interface Item {
    l_level: number;
    signup_lv: string | null;
    l_name: string | null;
}

export default function LevelList() {
    const [items, setItems] = useState<Item[]>([]);
    const [levelList, setLevelList] = useState<SelectItem[]>([]);
    const [selectLevel, setSelectLevel] = useState<SelectItem | null>(null);
    const { data: configData, isLoading: isInitialLoading, refetch } = useGetLevelList();
    const putLevelMutation = usePutLevel();
    const { setConfirmPop, setLoadingPop } = usePopupStore();
    const { toast } = useToast();

    // 데이터 수정 중일 때 로딩 팝업 표시
    useEffect(() => {
        const isLoading = putLevelMutation.isPending;
        setLoadingPop(isLoading);
        return () => setLoadingPop(false);
    }, [putLevelMutation.isPending, setLoadingPop]);

    // 목록 조회
    useEffect(() => {
        if (configData) {
            const data = configData.data;
            setItems(data);
            const list = data.filter((item: Item) => item.l_name);
            setLevelList(list.map((item: Item) => ({ value: item.l_level.toString(), label: item.l_name || "" })));
        } else {
            setItems([]);
        }
    }, [configData]);

    // 초기등급 설정 확인
    const handleConfirmChangeLevel = () => {
        if (selectLevel) {
            setConfirmPop(true, `${selectLevel.label} 등급으로 설정하시겠습니까?`, 2, () =>
                handleChangeLevel(selectLevel.label, Number(selectLevel.value), "Y"),
            );
        } else {
            setConfirmPop(true, "등급을 선택해주세요.", 1);
        }
    };

    // 초기등급 설정하기
    const handleChangeLevel = (l_name: string, l_level: number, signup_lv: string | null) => {
        const body = { l_name, l_level, signup_lv };
        putLevelMutation.mutate(body, {
            onSuccess: () => {
                toast({ title: CONSOLE_TOAST_MESSAGES.LEVEL_SET });
                refetch();
            },
        });
    };

    return (
        <div className="h-[calc(100vh-90px)]">
            <ScrollArea className="h-full pr-[27px]">
                <div className="flex items-center justify-between py-[8px]">
                    <div className="flex items-center gap-[8px]">
                        <p className="text-[14px] font-[500]">회원가입시 초기등급으로 설정</p>
                        <SelectBox
                            list={levelList}
                            value={selectLevel?.value || ""}
                            onChange={value => setSelectLevel(levelList.find(item => item.value === value) || null)}
                            triggerClassName="h-[34px]"
                        />
                        <button
                            type="button"
                            className="h-[34px] rounded-[8px] border border-black bg-white px-[16px] font-[500]"
                            onClick={handleConfirmChangeLevel}
                        >
                            설정
                        </button>
                    </div>
                </div>
                {isInitialLoading ? (
                    <div className="py-[50px]">
                        <LoadingSpinner />
                    </div>
                ) : items && items.length > 0 ? (
                    <ul className="flex flex-col gap-[8px] pb-[20px]">
                        {items.map((item, i) => (
                            <li
                                key={`comment_${i}`}
                                className="group flex cursor-pointer items-center gap-[16px] rounded-[12px] border bg-white p-[8px_20px] transition-all hover:border-console"
                            >
                                <ul className="flex flex-1 gap-[20px]">
                                    <li className="flex flex-1 flex-col gap-[4px]">
                                        <p className="text-[14px] text-[#9F9FA5]">등급레벨</p>
                                        <p>{item.l_level}</p>
                                    </li>
                                    <li className="flex flex-1 flex-col gap-[4px]">
                                        <p className="text-[14px] text-[#9F9FA5]">회원가입 초기등급</p>
                                        <p className={item.signup_lv === "Y" ? "text-[#E5313D]" : "text-[#9F9FA5]"}>
                                            {item.signup_lv === "Y" ? "설정" : "미설정"}
                                        </p>
                                    </li>
                                </ul>
                                {item.l_level === 9 ? (
                                    <Input
                                        className="w-[60%]"
                                        placeholder="등급레벨을 입력해주세요."
                                        defaultValue={item.l_name || ""}
                                        disabled
                                    />
                                ) : (
                                    <InputWithButton
                                        boxClassName="w-[60%]"
                                        placeholder="등급레벨을 입력해주세요."
                                        btnText={item.l_name ? "수정" : "저장"}
                                        defaultValue={item.l_name || ""}
                                        handleClick={(inputValue: string) => {
                                            setConfirmPop(true, "등급레벨을 수정하시겠습니까?", 2, () =>
                                                handleChangeLevel(inputValue, item.l_level, item.signup_lv || null),
                                            );
                                        }}
                                    />
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex h-[calc(100%-50px)] items-center justify-center">
                        <NoData />
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
