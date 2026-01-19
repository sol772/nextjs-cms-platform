"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface PopupStore {
    // 안내,알림 팝업
    confirmPop: boolean;
    confirmPopTitle: string;
    confirmPopContent: string;
    confirmPopBtn: number | null;
    confirmPopBtnColor: "red" | "blue";
    handleClickConfirmPop?: () => void;
    handleCloseConfirmPop?: () => void;
    setConfirmPop: (
        show: boolean,
        title: string,
        btn: number | null,
        handleClick?: () => void,
        handleClose?: () => void,
        content?: string,
        btnColor?: "red" | "blue",
    ) => void;

    // 로딩 팝업
    loadingPop: boolean;
    setLoadingPop: (show: boolean) => void;
}

export const usePopupStore = create<PopupStore>()(
    devtools(set => ({
        // 안내,알림 팝업
        confirmPop: false,
        confirmPopTitle: "",
        confirmPopContent: "",
        confirmPopBtn: null,
        confirmPopBtnColor: "blue",
        handleClickConfirmPop: undefined,
        handleCloseConfirmPop: undefined,
        setConfirmPop: (show, title, btn, handleClick, handleClose, content, btnColor) =>
            set({
                confirmPop: show,
                confirmPopTitle: title,
                confirmPopBtn: btn,
                handleClickConfirmPop: handleClick ?? undefined, // 없으면 undefined로 초기화
                handleCloseConfirmPop: handleClose ?? undefined, // 없으면 undefined로 초기화
                confirmPopContent: content ?? "",
                confirmPopBtnColor: btnColor ?? "blue",
            }),

        // 로딩 팝업
        loadingPop: false,
        setLoadingPop: (loadingPop) => set({ loadingPop }),
    })),
);
