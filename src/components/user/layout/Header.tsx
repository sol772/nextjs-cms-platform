"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import arrowDown from "@/assets/images/user/arrowDown.png";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import SelectBox from "@/components/user/form/SelectBox";
import { LANGUAGES } from "@/constants/common/site";
import { useMenuNavigation } from "@/hooks/user/useMenuNavigation";
import { useSelectedLanguage } from "@/hooks/user/useSelectedLanguage";
import { useAuthStore } from "@/store/common/useAuthStore";
import { MenuItem, useSiteStore } from "@/store/common/useSiteStore";

interface HeaderProps {
    menuList: MenuItem[];
}

export default function Header({ menuList = [] }: HeaderProps) {
    const t = useTranslations("Header");
    const tLanguage = useTranslations("Language");
    const router = useRouter();
    const currentLocale = useLocale();
    const selectedLanguage = useSelectedLanguage();
    const [open, setOpen] = useState(false);
    const [menuOn, setMenuOn] = useState<number | null>(null);
    const { siteLanguages } = useSiteStore();
    const { handleCategoryClick } = useMenuNavigation();
    const { loginUser, clearUser } = useAuthStore();

    // 디바이스 크기에 따른 타입 설정
    useEffect(() => {
        const handleResize = () => {
            setOpen(false);
            setMenuOn(null);
        };

        // 초기 설정
        handleResize();

        // 리사이즈 이벤트 리스너 등록
        window.addEventListener("resize", handleResize);
        window.addEventListener("scroll", handleResize);

        // 클린업
        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("scroll", handleResize);
        };
    }, []);

    // 메뉴 클릭시
    const categoryClick = (menu: MenuItem) => {
        handleCategoryClick(menu);
        setOpen(false);
    };

    // 언어 변경시 (next-intl 표준 방법: URL만 변경)
    const handleLanguageChange = (value: string) => {
        const language = LANGUAGES.find(lang => lang.code === value);
        if (language) {
            // URL만 변경하면 next-intl이 자동으로 locale을 인식하고 번역을 제공
            router.push(`/${language.locale}`);
        }
    };

    const handleLogout = () => {
        clearUser();
        router.push(`/${currentLocale}`);
    };

    return (
        <header className="sticky top-0 z-50 bg-white">
            <div className="mx-auto flex h-[60px] max-w-[1720px] items-center justify-between px-[20px] md:px-[28px] xl:h-[80px] xl:gap-[20px] min-[1760px]:px-0">
                <Link
                    href={`/${currentLocale}`}
                    className="w-[100px] text-center text-[20px] font-[700] md:w-[180px]"
                >
                    기본솔루션
                </Link>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <button className="size-[40px] bg-icMenu bg-contain bg-center bg-no-repeat xl:hidden">
                            <span className="sr-only">메뉴 열기</span>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-screen border-none bg-transparent p-0 shadow-none" sideOffset={-50}>
                        <div className="relative flex h-screen w-full justify-end bg-[rgba(0,0,0,0.5)]">
                            <div className="flex h-full w-[90%] flex-col bg-white p-[0_20px_40px] md:w-[70%] md:p-[0_40px_60px]">
                                <div className="flex h-[60px] items-center justify-end md:mb-[20px]">
                                    <button
                                        type="button"
                                        className="size-[40px] bg-icClose bg-contain bg-center bg-no-repeat"
                                        onClick={() => setOpen(false)}
                                    >
                                        <span className="sr-only">메뉴 닫기</span>
                                    </button>
                                </div>
                                <ScrollArea className="h-[calc(100%-60px)]">
                                    <ul className="flex flex-col gap-[16px] md:gap-[24px]">
                                        {menuList.map((menu, idx) => (
                                            <li key={`menu_${idx}`}>
                                                <div
                                                    className={`relative flex items-center justify-between py-[8px] after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:bg-[#222] after:transition-all after:duration-300 md:py-[20px] ${
                                                        menuOn === idx ? "after:opacity-100" : "after:opacity-0"
                                                    }`}
                                                >
                                                    <button
                                                        type="button"
                                                        className={`w-[calc(100%-24px)] text-left text-[20px] font-[700] leading-[1.5] md:text-[36px]${
                                                            menuOn === idx ? " text-primary" : ""
                                                        }`}
                                                        onClick={() => categoryClick(menu)}
                                                    >
                                                        {menu.c_name}
                                                    </button>
                                                    {menu.submenu && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (menuOn === idx) {
                                                                    setMenuOn(null);
                                                                } else {
                                                                    setMenuOn(idx);
                                                                }
                                                            }}
                                                        >
                                                            <Image
                                                                src={arrowDown}
                                                                alt="화살표"
                                                                width={24}
                                                                height={24}
                                                                className={menuOn === 1 ? "rotate-180" : ""}
                                                            />
                                                        </button>
                                                    )}
                                                </div>
                                                {menuOn === idx && menu.submenu && (
                                                    <div className="flex flex-col gap-[16px] pt-[24px] md:flex-row md:flex-wrap md:gap-x-[6px] md:gap-y-[20px]">
                                                        {menu.submenu.map((submenu, _) => (
                                                            <button
                                                                type="button"
                                                                key={`submenu_${submenu.id}`}
                                                                className="text-left text-[18px] font-[500] text-[#666] md:w-[calc(50%-3px)]"
                                                                onClick={() => categoryClick(submenu)}
                                                            >
                                                                {submenu.c_name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </ScrollArea>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
                <div className="hidden flex-1 items-center justify-between xl:flex">
                    <ul className="flex flex-1 items-center">
                        {menuList.map((menu, idx) => (
                            <li className="group relative max-w-[150px] flex-1" key={`menu_${idx}`}>
                                <button
                                    type="button"
                                    className="relative h-[80px] w-full text-[20px] font-[500] transition-all duration-300 after:absolute after:bottom-[8px] after:left-1/2 after:h-[4px] after:w-0 after:-translate-x-1/2 after:rounded-[4px] after:bg-primary after:transition-all after:duration-300 group-hover:font-[700] group-hover:text-primary group-hover:after:w-[50px]"
                                    onClick={() => categoryClick(menu)}
                                >
                                    {menu.c_name}
                                </button>
                                {menu.submenu && (
                                    <div className="absolute left-1/2 top-[calc(100%+10px)] flex max-h-0 w-max min-w-[200px] -translate-x-1/2 flex-col gap-[20px] overflow-hidden rounded-[20px] bg-[rgba(255,255,255,0.80)] backdrop-blur-sm transition-all duration-300 group-hover:max-h-[500px]">
                                        <ul className="flex flex-col gap-[20px] p-[34px_24px_24px]">
                                            {menu.submenu.map((submenu, _) => (
                                                <li key={`submenu_${submenu.id}`}>
                                                    <button
                                                        type="button"
                                                        className="w-full text-[18px] font-[300] transition-all duration-300 hover:font-[500]"
                                                        onClick={() => categoryClick(submenu)}
                                                    >
                                                        {submenu.c_name}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                    <div className="flex items-center gap-[16px]">
                        {loginUser.m_name ? (
                            <div className="flex items-center gap-[16px]">
                                <p className="text-[20px] font-[500]">{loginUser.m_name}</p>
                                <button type="button" onClick={handleLogout}>
                                    {t("logout")}
                                </button>
                            </div>
                        ) : (
                            <Link href={`/${currentLocale}/login`}>{t("login")}</Link>
                        )}
                        {siteLanguages.length > 1 && (
                            <SelectBox
                                list={siteLanguages.map(lang => ({
                                    value: lang.site_lang,
                                    label: tLanguage(lang.site_lang as "KR" | "EN" | "JP" | "CH"),
                                }))}
                                value={selectedLanguage}
                                onChange={handleLanguageChange}
                            />
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
