import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { CATEGORY_TYPES } from "@/constants/user/categoryTypes";
import { MenuItem } from "@/store/common/useSiteStore";
import { usePopupStore } from "@/store/user/usePopupStore";

export const useMenuNavigation = () => {
    const router = useRouter();
    const currentLocale = useLocale();
    const t = useTranslations("Common");
    const { setConfirmPop } = usePopupStore();

    //하위메뉴들중 빈메뉴아닌메뉴 찾기
    const findSubMenu = (menu: MenuItem): MenuItem | null => {
        if (menu.submenu && menu.submenu.length > 0) {
            for (const item of menu.submenu) {
                if (item.c_content_type && item.c_content_type[0] !== 2) {
                    return item;
                }
                if (item.submenu && item.submenu.length > 0) {
                    const subItem: MenuItem | null = findSubMenu(item);
                    if (subItem && subItem.c_content_type && subItem.c_content_type[0] !== 2) {
                        return subItem;
                    }
                }
            }
        }
        return null;
    };

    // 메뉴 타입에 따라 라우팅
    const typeRouter = (type: number | null, id: number) => {
        const categoryType = CATEGORY_TYPES.find(item => item.idx === type)?.type;
        if(categoryType){
            router.push(`/${currentLocale}/${categoryType}/${id}`);
            return;
        }
    };

    // 메뉴 클릭시
    const handleCategoryClick = (menu: MenuItem) => {
        const depth = menu.c_depth;
        const type = menu.c_content_type ? menu.c_content_type[0] : null;

        // 1차 메뉴
        if (depth === 1) {
            // 링크 있을때 바로 링크 이동
            if (menu.c_link_url) {
                if (menu.c_link_target[0] === "2") {
                    window.open(menu.c_link_url, "_blank", "noopener,noreferrer");
                } else {
                    window.location.href = menu.c_link_url;
                }
                return;
            }

            const foundSubMenu = findSubMenu(menu);
            // 하위메뉴 있을때
            if (foundSubMenu) {
                const type = foundSubMenu.c_content_type ? foundSubMenu.c_content_type[0] : null;
                typeRouter(type, foundSubMenu.id);
            } else {
                setConfirmPop(true, t("preparing"), 1);
            }
        }
        // 하위 메뉴
        else {
            // 링크 있을때 바로 링크 이동
            if (menu.c_link_url) {
                if (menu.c_link_target[0] === "2") {
                    window.open(menu.c_link_url, "_blank", "noopener,noreferrer");
                } else {
                    window.location.href = menu.c_link_url;
                }
                return;
            }

            // 빈메뉴 일때
            if (type === 2) {
                const foundSubMenu = findSubMenu(menu);
                // 하위메뉴 있을때
                if (foundSubMenu) {
                    const type = foundSubMenu.c_content_type ? foundSubMenu.c_content_type[0] : null;
                    typeRouter(type, foundSubMenu.id);
                } else {
                    setConfirmPop(true, t("preparing"), 1);
                }
            } else {
                typeRouter(type, menu.id);
            }
        }
    };

    return {
        handleCategoryClick,
        findSubMenu,
        typeRouter,
    };
};
