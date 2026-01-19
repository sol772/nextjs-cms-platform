"use client";

import Portal from "@/components/common/common/Portal";
import { usePopupStore } from "@/store/user/usePopupStore";

import ConfirmPop from "./ConfirmPop";
import LoadingPop from "./LoadingPop";

export default function Popup() {
    const { loadingPop, confirmPop } = usePopupStore();

    return (
        <Portal>
            {/* 알림 팝업 */}
            {confirmPop && <ConfirmPop />}

            {/* 로딩 팝업 */}
            {loadingPop && <LoadingPop />}
        </Portal>
    );
}
