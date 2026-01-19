import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UserPopupStore {
    closedPopups: Set<string>;
    setClosedPopup: (index: number) => void;
    setOneDayClosedPopup: (index: number) => void;
    isPopupClosed: (index: number) => boolean;
}

export const useUserPopupStore = create<UserPopupStore>()(
    devtools((set, get) => ({
        closedPopups: new Set(),
        setClosedPopup: index =>
            set(state => ({
                closedPopups: new Set(Array.from(state.closedPopups).concat(`likeweb-popup-${index}`)),
            })),
        setOneDayClosedPopup: index => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            localStorage.setItem(`likeweb-popup-${index}-hide-until`, tomorrow.toISOString());
            get().setClosedPopup(index);
        },
        isPopupClosed: index => {
            const popupKey = `likeweb-popup-${index}`;
            const hideUntil = localStorage.getItem(`${popupKey}-hide-until`);

            if (hideUntil) {
                const hideDate = new Date(hideUntil);
                const now = new Date();
                if (now < hideDate) {
                    return true;
                }
                localStorage.removeItem(`${popupKey}-hide-until`);
            }

            return get().closedPopups.has(popupKey);
        },
    })),
);
