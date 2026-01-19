import { PopoverClose } from "@radix-ui/react-popover";
import Image from "next/image";
import { useEffect, useState } from "react";

import icBell from "@/assets/images/console/icBell.svg";
import popClose from "@/assets/images/console/popClose.svg";
import LoadingSpinner from "@/components/console/common/LoadingSpinner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CONSOLE_CONFIRM_MESSAGES } from "@/constants/console/messages";
import { useGetAlarm, usePutAlarm } from "@/service/console/common";
import { usePopupStore } from "@/store/console/usePopupStore";
import { makeIntComma } from "@/utils/numberUtils";

import NotiItem from "./NotiItem";

export interface Item {
    idx: number;
    follow: string;
    c_name: string;
    m_name: string;
    title: string;
    content: string;
    reg_date: string;
    a_read: string[];
}

export default function NotiPopup() {
    const [tabOn, setTabOn] = useState(0);
    const [items, setItems] = useState<Item[]>([]);
    const [totalCnt, setTotalCnt] = useState(0);
    const {
        data: configData,
        isLoading: isInitialLoading,
        refetch,
    } = useGetAlarm(tabOn === 0 ? "all" : tabOn === 1 ? "board" : "comment");
    const putAlarmMutation = usePutAlarm();
    const { setConfirmPop } = usePopupStore();

    useEffect(() => {
        if (configData) {
            setItems(configData.data.list);
            setTotalCnt(configData.data.totalCnt);
        }
    }, [configData]);

    const handleConfirmDelete = () => {
        setConfirmPop(
            true,
            CONSOLE_CONFIRM_MESSAGES.DELETE_ITEM("읽은 알림을 모두"),
            2,
            () => handleRead("delete"),
            undefined,
            "",
            "red",
        );
    };

    // 알림 읽음처리 및 삭제
    const handleRead = (follow: string, idx?: number, flg?: string) => {
        putAlarmMutation.mutate({ follow, idx: idx ?? "", flg: flg ?? "" }, { onSuccess: () => refetch() });
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={`flex size-[48px] items-center justify-center rounded-full bg-[#F2F3F8] data-[state=open]:bg-white${
                        totalCnt
                            ? " relative after:absolute after:right-[14px] after:top-[14px] after:h-[6px] after:w-[6px] after:rounded-full after:bg-[#FF5049] after:content-['']"
                            : ""
                    }`}
                >
                    <Image src={icBell} alt="알림" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="mr-[20px] w-[640px] rounded-[20px] border border-[#ddd] bg-white p-0">
                <div className="flex items-center justify-between border-b border-[#ddd] p-[16px_20px]">
                    <p className="text-[20px] font-[600]">알림</p>
                    <PopoverClose>
                        <Image src={popClose} alt="닫기" />
                    </PopoverClose>
                </div>
                <ScrollArea className="flex max-h-[600px] flex-col overflow-y-auto p-[20px]">
                    <ScrollArea className="w-full pb-[8px]">
                        <ul className="flex w-max gap-[12px]">
                            {["전체", "게시판", "댓글"].map((tab, idx) => (
                                <li key={`tab_${idx}`}>
                                    <button
                                        type="button"
                                        className={`h-[32px] rounded-[20px] bg-[#F7F6FB] px-[16px] text-[14px] ${
                                            tabOn === idx
                                                ? "border border-[#222] bg-white font-[500] text-[#222]"
                                                : "text-[#666]"
                                        }`}
                                        onClick={() => setTabOn(idx)}
                                    >
                                        {tab}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                    <div className="flex items-center justify-between border-b border-[#D9D9D9] p-[4px_0_12px]">
                        <p className="font-[500] text-[#666]">
                            알림이 총 <span className="text-[#0CB2AD]">{makeIntComma(totalCnt)}</span>개가 있습니다.
                        </p>
                        {items.length > 0 && (
                            <ul className="flex gap-[33px]">
                                <li>
                                    <button type="button" className="text-[#9F9FA5]" onClick={() => handleRead("read")}>
                                        전체 읽기
                                    </button>
                                </li>
                                <li className="relative after:absolute after:-left-[16px] after:top-1/2 after:h-[16px] after:w-[1px] after:-translate-y-1/2 after:bg-[#D9D9D9] after:content-['']">
                                    <button type="button" className="text-[#9F9FA5]" onClick={handleConfirmDelete}>
                                        읽은 알림 삭제
                                    </button>
                                </li>
                            </ul>
                        )}
                    </div>
                    {isInitialLoading ? (
                        <div className="py-[60px]">
                            <LoadingSpinner />
                        </div>
                    ) : items && items.length > 0 ? (
                        <ul className="flex flex-col gap-[32px] py-[32px]">
                            {items.map(item => (
                                <li
                                    key={`noti_${item.idx}`}
                                    className={`${item.a_read[0] === "Y" ? "opacity-[0.5]" : ""}`}
                                >
                                    <NotiItem item={item} handleRead={handleRead} />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="py-[60px] text-center text-[18px]">알림이 없습니다.</div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
