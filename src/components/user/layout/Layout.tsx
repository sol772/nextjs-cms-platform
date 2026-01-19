"use client";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Suspense, useEffect } from "react";

import ScrollToTop from "@/components/common/common/ScrollToTop";
import Header from "@/components/user/layout/Header";
import LoadingPop from "@/components/user/popup/LoadingPop";
import { SITE_ID } from "@/constants/common/site";
import { useSelectedLanguage } from "@/hooks/user/useSelectedLanguage";
import { useGetSiteInfo } from "@/service/user/common";
import { useGetCategoryList } from "@/service/user/menu";
import { initialSiteInfo, MenuItem, useSiteStore } from "@/store/common/useSiteStore";

import Footer from "./Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
    const selectedLanguage = useSelectedLanguage(); // API 호출용 언어 코드
    const { setSiteInfoData, menuList, setMenuList, siteInfoData, setSiteLanguages } = useSiteStore();
    const { data: configData } = useGetCategoryList(selectedLanguage);
    const { data: configSiteInfoData } = useGetSiteInfo(SITE_ID, selectedLanguage, { enabled: !!SITE_ID });

    useEffect(() => {
        if (configSiteInfoData) {
            const { c_site_name, c_address, c_tel, c_fax, c_email, c_num, c_num2, c_ceo, c_site_lang } =
                configSiteInfoData.data;
            setSiteInfoData({
                c_site_name,
                c_ceo,
                c_address,
                c_tel,
                c_fax,
                c_email,
                c_num,
                c_num2,
            });
            setSiteLanguages(c_site_lang);
        } else {
            setSiteInfoData(initialSiteInfo);
            setSiteLanguages([]);
        }
    }, [configSiteInfoData]); // eslint-disable-line react-hooks/exhaustive-deps

    // 메뉴 목록 조회
    useEffect(() => {
        if (configData) {
            const filterMenuRecursively = (items: MenuItem[]): MenuItem[] => {
                return items.map((item: MenuItem) => ({
                    ...item,
                    submenu: item.submenu ? filterMenuRecursively(item.submenu) : undefined,
                }));
            };
            const newAllMenuList = filterMenuRecursively(configData.data);
            const newMenuList = newAllMenuList.filter((item: MenuItem) => item.c_use_yn === "Y");
            setMenuList(newMenuList);
        } else {
            setMenuList([]);
        }
    }, [configData]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
            <ScrollToTop />
            <div className="min-w-[320px]">
                <Suspense fallback={<LoadingPop />}>
                    <div className="flex min-h-screen flex-col">
                        <Header menuList={menuList} />
                        <div className="min-h-0 flex-1">{children}</div>
                        <Footer siteInfo={siteInfoData} />
                    </div>
                </Suspense>
            </div>
        </>
    );
}
