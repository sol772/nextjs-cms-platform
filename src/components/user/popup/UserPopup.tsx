"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import LoadingSpinner from "@/components/user/common/LoadingSpinner";
import { useSelectedLanguage } from "@/hooks/user/useSelectedLanguage";
import { useGetUserPopupList } from "@/service/user/popup";
import { useUserPopupStore } from "@/store/user/useUserPopupStore";

interface PopupListItem {
    idx: number;
    p_e_date: string;
    p_width_size: number;
    p_height_size: number;
    p_left_point: number;
    p_top_point: number;
    p_content: string;
    p_content_type: string;
    p_open: string[];
    p_one_day: string[];
    p_s_date: string;
    p_layer_pop: string[];
    p_link_target: string;
    p_link_url: string;
}

export default function UserPopup() {
    const router = useRouter();
    const t = useTranslations("Popup");
    const selectedLanguage = useSelectedLanguage();
    const [type, setType] = useState<string>("");
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 0);
    const { data: configData } = useGetUserPopupList(type, selectedLanguage, {
        enabled: Boolean(type) && Boolean(selectedLanguage),
    });
    const [popupList, setPopupList] = useState<PopupListItem[]>([]);
    const [isContentLoaded, setIsContentLoaded] = useState<{ [key: number]: boolean }>({});
    const { setClosedPopup, setOneDayClosedPopup, isPopupClosed } = useUserPopupStore();

    //화면사이즈 변경될때 width 체크---------
    useEffect(() => {
        if (typeof window === "undefined") return;

        const handleWindowResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener("resize", handleWindowResize);
        // 초기 화면 크기 설정
        setType(window.innerWidth >= 1280 ? "P" : "M");

        return () => {
            window.removeEventListener("resize", handleWindowResize);
        };
    }, []);

    // 화면 크기가 변경될 때마다 type 업데이트
    useEffect(() => {
        setType(windowWidth >= 1280 ? "P" : "M");
    }, [windowWidth]);

    // 새창 팝업 열기 함수
    const openPopups = (windowPopupList: PopupListItem[]) => {
        windowPopupList.forEach(item => {
            const { idx } = item;
            const popupUrl = `/popup/${idx}`;

            // 팝업 창 열기
            const popupWindow = window.open(popupUrl, `popup_${idx}`);

            // 팝업이 차단되었는지 확인
            if (!popupWindow || popupWindow.closed || typeof popupWindow.closed === "undefined") {
                alert("팝업이 차단되었습니다. 팝업 차단을 해제해주세요.");
            }
        });
    };

    // 팝업 목록 조회
    useEffect(() => {
        if (configData) {
            const data = configData.data.data_list;
            const list = data.reverse();

            const getDateString = (date: Date) => date.toISOString().slice(0, 10);

            const currentDateStr = getDateString(new Date());

            // 레이어 팝업 (p_layer_pop=1)과 새창 팝업 (p_layer_pop=2) 분리
            const validPopups = list.filter((item: PopupListItem) => {
                if (item.p_open.includes("N")) return false;

                // 시작일 체크
                if (item.p_s_date) {
                    const startDate = new Date(item.p_s_date.replace(/\./g, "-"));
                    const startDateStr = getDateString(startDate);
                    if (startDateStr > currentDateStr) return false;
                }

                // 종료일 체크
                if (item.p_e_date) {
                    const endDate = new Date(item.p_e_date.replace(/\./g, "-"));
                    const endDateStr = getDateString(endDate);
                    if (endDateStr < currentDateStr) return false; // 오늘까지 노출
                }

                return true;
            });

            // 레이어 팝업만 setPopupList에 설정
            const layerPopups = validPopups.filter((item: PopupListItem) => item.p_layer_pop.includes("1"));
            setPopupList(layerPopups);

            // 새창 팝업은 openPopups로 처리 (닫은 팝업 필터링 적용)
            const windowPopups = validPopups.filter(
                (item: PopupListItem) => item.p_layer_pop.includes("2") && !isPopupClosed(item.idx),
            );
            if (windowPopups.length > 0) {
                openPopups(windowPopups);
            }
        }
    }, [configData]); // eslint-disable-line react-hooks/exhaustive-deps

    // 컨텐츠 로딩 완료 체크
    useEffect(() => {
        popupList.forEach(popup => {
            if (popup.p_content && !isContentLoaded[popup.idx]) {
                // 먼저 컨텐츠를 렌더링
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = popup.p_content;
                const images = tempDiv.getElementsByTagName("img");

                if (images.length === 0) {
                    setIsContentLoaded(prev => ({ ...prev, [popup.idx]: true }));
                    return;
                }

                let loadedImages = 0;
                Array.from(images).forEach(img => {
                    if (img.complete) {
                        loadedImages++;
                        if (loadedImages === images.length) {
                            setIsContentLoaded(prev => ({ ...prev, [popup.idx]: true }));
                        }
                    } else {
                        img.onload = () => {
                            loadedImages++;
                            if (loadedImages === images.length) {
                                setIsContentLoaded(prev => ({ ...prev, [popup.idx]: true }));
                            }
                        };
                    }
                });
            }
        });
    }, [popupList, isContentLoaded]);

    // 닫은 팝업 필터링
    const filteredPopups = popupList.filter((item: PopupListItem) => !isPopupClosed(item.idx));

    return (
        <>
            {filteredPopups.map((popup, i) => (
                <div
                    key={`popup_${i}`}
                    className={`absolute z-[5]${type === "M" ? " left-1/2 top-0 -translate-x-1/2" : ""}`}
                    style={{
                        top: type === "P" ? popup.p_top_point : "80px",
                        left: type === "P" ? popup.p_left_point : "50%",
                        width: popup.p_width_size,
                    }}
                >
                    {!isContentLoaded[popup.idx] ? (
                        <LoadingSpinner />
                    ) : (
                        <>
                            <ScrollArea className="max-w-[90vw] bg-white" style={{ height: popup.p_height_size }}>
                                <div
                                    id={`popup_${popup.idx}`}
                                    className={`ql-container ql-snow !border-none${
                                        popup.p_link_url ? " cursor-pointer" : ""
                                    }`}
                                    onClick={() => {
                                        if (popup.p_link_url) {
                                            if (popup.p_link_target.includes("2")) {
                                                window.open(popup.p_link_url, "_blank", "noopener,noreferrer");
                                            } else {
                                                router.push(popup.p_link_url);
                                            }
                                        }
                                    }}
                                >
                                    <div dangerouslySetInnerHTML={{ __html: popup.p_content }} />
                                </div>
                            </ScrollArea>
                            <div className="flex flex-wrap justify-between bg-black">
                                {popup.p_one_day[0] === "Y" && (
                                    <button
                                        type="button"
                                        onClick={() => setOneDayClosedPopup(popup.idx)}
                                        className="h-[53px] px-[24px] text-[18px] font-[500] text-white"
                                    >
                                        {t("dontShowToday")}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setClosedPopup(popup.idx)}
                                    className="h-[53px] px-[24px] text-[18px] font-[500] text-white"
                                >
                                    {t("close")}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </>
    );
}
