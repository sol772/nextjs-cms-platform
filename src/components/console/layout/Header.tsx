"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import icAddImage from "@/assets/images/console/icAddImage.png";
import icArrowOut from "@/assets/images/console/icArrowOut.svg";
import NotiPopup from "@/components/console/layout/-components/NotiPopup";
import ImgUploadPop from "@/components/console/popup/ImgUploadPop";
import { DEFAULT_LANGUAGE } from "@/constants/common/site";
import { useGetSiteInfo } from "@/service/console/common";
import { useAuthStore } from "@/store/common/useAuthStore";
import { useSiteStore } from "@/store/common/useSiteStore";

const LocaMapper: Record<string, string[]> = {
    "/console/main": ["대시보드"],
    // 게시판 관리
    "/console/board/post": ["게시판 관리", "게시글 관리"],
    "/console/board/comment": ["게시판 관리", "댓글 관리"],
    // 메뉴 관리
    "/console/menu/category": ["메뉴 관리", "카테고리 관리"],
    // 회원 관리
    "/console/member": ["회원 관리"],
    // 디자인 관리
    "/console/design/banner": ["디자인 관리", "메인 배너 관리"],
    "/console/design/popup": ["디자인 관리", "팝업 관리"],
    // 환경설정
    "/console/setting/site": ["환경설정", "사이트정보"],
    "/console/setting/policy": ["환경설정", "시스템 운영정책"],
    "/console/setting/level": ["환경설정", "회원 등급 관리"],
    // 통계관리
    "/console/statistics/chart": ["통계관리", "전체 통계"],
    "/console/statistics/visitor": ["통계관리", "접속자 이력 통계"],
    // 유지보수 게시판
    "/console/maintenance": ["유지보수 게시판"],
};

export default function Header() {
    const pathname = usePathname();
    const { loginUser } = useAuthStore();
    const { setSiteLanguages } = useSiteStore();
    const { data: configData } = useGetSiteInfo(loginUser.siteId, DEFAULT_LANGUAGE, { enabled: !!loginUser.siteId });

    // 사이트 언어 설정
    useEffect(() => {
        if (configData) {
            setSiteLanguages(configData.data.c_site_lang);
        }
    }, [configData]); // eslint-disable-line react-hooks/exhaustive-deps

    const locaList =
        Object.keys(LocaMapper)
            .sort((a, b) => b.length - a.length) // 긴 prefix 우선
            .find(key => pathname.startsWith(key)) || "";

    return (
        <header className="flex items-center justify-between p-[20px_20px_20px_0]">
            <ul className="flex items-center gap-[16px]">
                {(LocaMapper[locaList] || []).map((loca, i) => (
                    <li
                        key={`loca_${i}`}
                        className={i === 0 ? "text-[30px] font-[700]" : "text-[20px] font-[500] text-[#666]"}
                    >
                        <p>{loca}</p>
                    </li>
                ))}
            </ul>
            <div className="flex items-center gap-[8px]">
                <ImgUploadPop
                    button={
                        <button
                            type="button"
                            className="flex h-[50px] items-center justify-center gap-[10px] rounded-full bg-white px-[12px] text-[18px] font-[500] leading-[34px]"
                        >
                            <span>이미지 관리</span>
                            <Image src={icAddImage} alt="이미지 등록" />
                        </button>
                    }
                />
                <button
                    type="button"
                    onClick={() => window.open("/", "_blank")}
                    className="flex h-[50px] items-center justify-center gap-[10px] rounded-full bg-white px-[12px] text-[18px] font-[500] leading-[34px]"
                >
                    <span>사용자 페이지</span>
                    <Image src={icArrowOut} alt="화살표" />
                </button>
                <NotiPopup />
            </div>
        </header>
    );
}
