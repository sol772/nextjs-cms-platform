"use client";

import { useTranslations } from "next-intl";

import { ScrollArea } from "@/components/ui/scroll-area";
import { usePopupStore } from "@/store/user/usePopupStore";

export default function ConfirmPop() {
    const t = useTranslations("Common");
    const { confirmPopTitle, confirmPopBtn, setConfirmPop, handleClickConfirmPop, handleCloseConfirmPop } =
        usePopupStore();

    //팝업닫기
    const handleClosePop = () => {
        if (handleCloseConfirmPop) {
            handleCloseConfirmPop();
        }
        setConfirmPop(false, "", null, undefined, undefined);
    };

    return (
        <div className="pointer-events-auto fixed inset-0 z-[300] flex items-center justify-center">
            <div className="absolute left-0 top-0 h-full w-full bg-[rgba(0,0,0,0.6)]"></div>
            <div className="relative w-[270px] overflow-hidden rounded-[14px] border border-[#AFB1B6] bg-white">
                <ScrollArea className="max-h-[80vh] p-[20px_16px]">
                    <p
                        className="text-center text-[14px] text-[#666]"
                        dangerouslySetInnerHTML={{ __html: confirmPopTitle }}
                    ></p>
                </ScrollArea>
                <div className="border-t border-[rgba(0,0,0,0.1)]">
                    {confirmPopBtn === 1 && (
                        <button
                            type="button"
                            className="h-[44px] w-full text-[17px] text-[#0A7AFF]"
                            onClick={() => {
                                if (handleClickConfirmPop) {
                                    handleClickConfirmPop();
                                }
                                handleClosePop();
                            }}
                        >
                            {t("confirm")}
                        </button>
                    )}
                    {confirmPopBtn === 2 && (
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                className={`h-[44px] w-1/2 border-r border-[rgba(0,0,0,0.1)] text-[17px] text-[#FF5049]`}
                                onClick={handleClosePop}
                            >
                                {t("cancel")}
                            </button>
                            <button
                                type="button"
                                className={`h-[44px] w-1/2 text-[17px] text-[#0A7AFF]`}
                                onClick={() => {
                                    if (handleClickConfirmPop) {
                                        handleClickConfirmPop();
                                    }
                                    handleClosePop();
                                }}
                            >
                                {t("confirm")}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
