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

interface UserItem {
    accessToken: string;
    refreshToken: string;
    m_email: string;
    m_level: number | null;
    m_name: string;
    m_menu_auth: string | null;
    siteId: string;
    maintName: string;
}

interface AuthStore {
    loginUser: UserItem;
    setUser: (data: UserItem) => void;
    clearUser: () => void;
}

const initialLoginUser: UserItem = {
    accessToken: "",
    refreshToken: "",
    m_email: "",
    m_level: null,
    m_name: "",
    m_menu_auth: null,
    siteId: "",
    maintName: "",
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

const store = create<AuthStore>()(
    persist(
        set => ({
            loginUser: initialLoginUser,
            setUser: (data: UserItem) => set({ loginUser: data }),
            clearUser: () => set({ loginUser: initialLoginUser }),
        }),
        {
            name: "cms-auth-storage",
            storage: createJSONStorage(() => customStorage),
        },
    ),
);

// 다른 탭/페이지에서 localStorage 변경 감지
if (typeof window !== "undefined") {
    window.addEventListener("storage", event => {
        if (event.key === "cms-auth-storage") {
            const encryptedData = event.newValue;
            const currentUser = store.getState().loginUser;
            
            if (!encryptedData) {
                // 삭제된 경우 (로그아웃) - 현재 상태와 다를 때만 업데이트
                if (currentUser.accessToken || currentUser.m_email) {
                    store.setState({ loginUser: initialLoginUser });
                }
            } else {
                // 업데이트된 경우 - 값이 실제로 변경되었을 때만 업데이트
                try {
                    const decryptedData = decrypt(encryptedData);
                    const parsedData = JSON.parse(decryptedData);
                    const newUser = parsedData.state?.loginUser;
                    
                    if (newUser) {
                        // 값이 실제로 변경되었는지 확인
                        const isChanged = 
                            newUser.accessToken !== currentUser.accessToken ||
                            newUser.m_email !== currentUser.m_email;
                        
                        if (isChanged) {
                            store.setState({ loginUser: newUser });
                        }
                    }
                } catch (error) {
                    console.warn("스토리지 동기화 실패:", error);
                }
            }
        }
    });
}

export const useAuthStore = store;
