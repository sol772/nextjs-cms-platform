"use client";

import CryptoJS from 'crypto-js';
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY ?? "";

// 암호화 함수
const encrypt = (data: string): string => {
    if (!ENCRYPTION_KEY) throw new Error("ENCRYPTION_KEY is not set");
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

// 복호화 함수
const decrypt = (encryptedData: string): string => {
    if (!ENCRYPTION_KEY) throw new Error("ENCRYPTION_KEY is not set");
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
};

export interface BoardSetting {
    // 일반 게시판
    c_content_type: number | null;
    b_column_title: string;
    b_column_date: string;
    b_column_view: string;
    b_column_file: string;
    limit: number | null;
    b_read_lv: number | null;
    b_write_lv: number | null;
    b_secret: string;
    b_reply: string;
    b_reply_lv: number | null;
    b_comment: string;
    b_comment_lv: number | null;
    b_top_html: string;
    b_template: string;
    b_template_text: string;
    // 갤러리 게시판
    b_thumbnail_with: number | null;
    b_thumbnail_height: number | null;
    // FAQ, 문의게시판
    b_group: string;
}

interface BoardMenu {
    category: number;
    c_name: string;
    c_content_type: number;
}

interface BoardStore {
    boardSettingData: BoardSetting;
    setBoardSettingData: (data: BoardSetting) => void;
    clearBoardSettingData: () => void;
    boardMenuList: BoardMenu[];
    setBoardMenuList: (data: BoardMenu[]) => void;
    clearBoardMenuList: () => void;
    refreshBoardMenu: boolean;
    setRefreshBoardMenu: (refresh: boolean) => void;
}

export const initialBoardSettingData: BoardSetting = {
    c_content_type: null,
    b_column_title: "",
    b_column_date: "",
    b_column_view: "",
    b_column_file: "",
    limit: null,
    b_read_lv: null,
    b_write_lv: null,
    b_secret: "",
    b_reply: "",
    b_reply_lv: null,
    b_comment: "",
    b_comment_lv: null,
    b_top_html: "",
    b_template: "",
    b_template_text: "",
    b_thumbnail_with: null,
    b_thumbnail_height: null,
    b_group: "",
};

// 커스텀 스토리지 (암호화/복호화만 담당)
const customStorage = {
    getItem: (name: string): string | null => {
        const encryptedData = localStorage.getItem(name);
        if (encryptedData) {
            try {
                return decrypt(encryptedData);
            } catch (error) {
                // 복호화 실패 시 localStorage 값 삭제 (조용히 처리)
                localStorage.removeItem(name);
                console.warn("세션 데이터 복호화 실패:", error);
                return null;
            }
        }
        return null;
    },
    setItem: (name: string, value: string) => {
        const encryptedData = encrypt(value);
        localStorage.setItem(name, encryptedData);
    },
    removeItem: (name: string) => {
        localStorage.removeItem(name);
    },
};

export const useBoardStore = create<BoardStore>()(
    persist(
        set => ({
            boardSettingData: initialBoardSettingData,
            boardMenuList: [],

            setBoardSettingData: (data: BoardSetting) =>
                set({ boardSettingData: data }),

            clearBoardSettingData: () =>
                set({ boardSettingData: initialBoardSettingData }),

            setBoardMenuList: (data: BoardMenu[]) =>
                set({ boardMenuList: data }),

            clearBoardMenuList: () => set({ boardMenuList: [] }),
            refreshBoardMenu: false,
            setRefreshBoardMenu: (refresh: boolean) => set({ refreshBoardMenu: refresh }),
        }),
        {
            name: "cms-board-storage",
            storage: createJSONStorage(() => customStorage),
        },
    ),
);
