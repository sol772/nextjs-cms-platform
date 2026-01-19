"use client";

import { useRouter } from "next/navigation";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetUserPopup } from "@/service/user/popup";
import { useUserPopupStore } from "@/store/user/useUserPopupStore";

export default function WindowPopup({ popupIdx }: { popupIdx: string }) {
    const router = useRouter();
    const { data: popupData } = useGetUserPopup(popupIdx, { enabled: Boolean(popupIdx) });
    const { setClosedPopup, setOneDayClosedPopup } = useUserPopupStore();

    if (!popupData?.data) return null;
    return (
        <div style={{ width: popupData.data.p_width_size }}>
            <ScrollArea className="w-full bg-white" style={{ height: popupData.data.p_height_size }}>
                <div
                    id={`popup_${popupData.data.idx}`}
                    className={`ql-container ql-snow !border-none${popupData.data.p_link_url ? " cursor-pointer" : ""}`}
                    onClick={() => {
                        if (popupData.data.p_link_url) {
                            if (popupData.data.p_link_target.includes("2")) {
                                window.open(popupData.data.p_link_url, "_blank", "noopener,noreferrer");
                            } else {
                                router.push(popupData.data.p_link_url);
                            }
                        }
                    }}
                >
                    <div dangerouslySetInnerHTML={{ __html: popupData.data.p_content }} />
                </div>
            </ScrollArea>
            <div className="flex justify-between bg-black">
                {popupData.data.p_one_day[0] === "Y" && (
                    <button
                        type="button"
                        onClick={() => {
                            setOneDayClosedPopup(popupData.data.idx);
                            window.close();
                        }}
                        className="h-[53px] px-[24px] text-[18px] font-[500] text-white"
                    >
                        오늘은 그만보기
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => {
                        setClosedPopup(popupData.data.idx);
                        window.close();
                    }}
                    className="h-[53px] px-[24px] text-[18px] font-[500] text-white"
                >
                    닫기
                </button>
            </div>
        </div>
    );
}
