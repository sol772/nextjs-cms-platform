"use client";

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface Language {
    site_lang_hangul: string;
    site_lang: string;
}

export interface MenuItem {
    id: number;
    c_depth: number;
    c_name: string;
    c_use_yn: string;
    c_main_banner_file: string | null;
    c_link_target: string[];
    c_link_url: string;
    c_content_type: [number, string] | null;
    submenu?: MenuItem[];
}

export interface SiteInfoItem {
    c_site_name: string;
    c_ceo: string;
    c_address: string;
    c_tel: string;
    c_fax: string;
    c_email: string;
    c_num: string;
    c_num2: string;
}

export const initialSiteInfo: SiteInfoItem = {
    c_site_name: "",
    c_ceo: "",
    c_address: "",
    c_tel: "",
    c_fax: "",
    c_email: "",
    c_num: "",
    c_num2: "",
};

interface SiteStore {
  siteLanguages: Language[];
  menuList: MenuItem[];
  setSiteLanguages: (data: Language[]) => void;
  setMenuList: (data: MenuItem[]) => void;
  clearSiteLanguages: () => void;
  siteInfoData: SiteInfoItem;
  setSiteInfoData: (data: SiteInfoItem) => void;
}

export const useSiteStore = create<SiteStore>()(
    persist(
        (set) => ({
            siteLanguages: [],
            menuList: [],
            setSiteLanguages: (data: Language[]) => set({ siteLanguages: data }),
            setMenuList: (data: MenuItem[]) => set({ menuList: data }),
            clearSiteLanguages: () => set({ siteLanguages: [] }),
            siteInfoData: initialSiteInfo,
            setSiteInfoData: (data: SiteInfoItem) => set({ siteInfoData: data }),
        }),
        {
            name: "cms-site-storage",
            storage: createJSONStorage(() => localStorage),
        },
    ),
); 