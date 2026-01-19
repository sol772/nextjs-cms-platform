import Image from "next/image";

import icCloseGray from "@/assets/images/console/icCloseGray.png";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePopupStore } from "@/store/console/usePopupStore";

export default function ConfirmPop() {
    const {
        confirmPopTitle,
        confirmPopContent,
        confirmPopBtn,
        confirmPopBtnColor,
        setConfirmPop,
        handleClickConfirmPop,
        handleCloseConfirmPop,
    } = usePopupStore();

    //팝업닫기
    const handleClosePop = () => {
        if (handleCloseConfirmPop) {
            handleCloseConfirmPop();
        }
        setConfirmPop(false, "", null, undefined, undefined, "", "blue");
    };

    return (
        <div className="pointer-events-auto fixed inset-0 z-[300] flex items-center justify-center">
            <div className="absolute left-0 top-0 h-full w-full bg-[rgba(0,0,0,0.6)]"></div>
            <div className="relative w-[320px] overflow-hidden rounded-[14px] bg-white">
                <div className="flex justify-end p-[8px]">
                    <button type="button" onClick={handleClosePop}>
                        <Image src={icCloseGray} alt="닫기" width={24} height={24} />
                    </button>
                </div>
                <ScrollArea className="max-h-[80vh] p-[0_16px_16px]">
                    <p
                        className="text-center text-[20px] font-[700]"
                        dangerouslySetInnerHTML={{ __html: confirmPopTitle }}
                    ></p>
                    {confirmPopContent && (
                        <p
                            className="pt-[8px] text-center text-[18px] text-[#353535]"
                            dangerouslySetInnerHTML={{ __html: confirmPopContent }}
                        ></p>
                    )}
                </ScrollArea>
                <div>
                    {confirmPopBtn === 1 && (
                        <button
                            type="button"
                            className="h-[52px] w-full bg-[#E5313D] text-[18px] font-[700] text-white"
                            onClick={() => {
                                if (handleClickConfirmPop) {
                                    handleClickConfirmPop();
                                }
                                handleClosePop();
                            }}
                        >
                            확인
                        </button>
                    )}
                    {confirmPopBtn === 2 && (
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                className={`h-[52px] w-1/2 bg-[#F2F3F8] text-[18px] font-[700] text-[#353535]`}
                                onClick={handleClosePop}
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                className={`h-[52px] w-1/2 text-[18px] font-[700] text-white ${
                                    confirmPopBtnColor === "red" ? "bg-[#E5313D]" : "bg-console-2"
                                }`}
                                onClick={() => {
                                    if (handleClickConfirmPop) {
                                        handleClickConfirmPop();
                                    }
                                    handleClosePop();
                                }}
                            >
                                확인
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
