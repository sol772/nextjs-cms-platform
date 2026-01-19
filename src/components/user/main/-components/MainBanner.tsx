"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { API_URL } from "@/config/apiConfig";
import { useSelectedLanguage } from "@/hooks/user/useSelectedLanguage";
import { useGetBannerList } from "@/service/user/main";

interface BannerItem {
    idx: number;
    b_open: string[];
    b_width_size: number;
    b_height_size: number;
    b_size: string[];
    b_s_date: string;
    b_e_date: string;
    b_c_type: string;
    b_file: string;
    b_url: string;
    b_url_target: string;
    b_mov_type: string[];
    b_mov_url: string;
    b_mov_play: string;
    b_content: string;
}

const swiperStyle = `
    [&>.swiper-pagination]:leading-[0]
    [&>.swiper-pagination]:!bottom-[10px]
    [&>.swiper-pagination>.swiper-pagination-bullet-active]:!bg-primary 
    xl:[&>.swiper-pagination>.swiper-pagination-bullet]:size-[12px]
    xl:[&>.swiper-pagination]:!bottom-[20px]
`;

export default function MainBanner() {
    const router = useRouter();
    const selectedLanguage = useSelectedLanguage();
    const [type, setType] = useState<"P" | "M">("P");
    const [bannerList, setBannerList] = useState<BannerItem[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data: configBannerData } = useGetBannerList("100", type, selectedLanguage);

    // 디바이스 크기에 따른 타입 설정
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 1280) {
                setType("M");
            } else {
                setType("P");
            }
        };

        // 초기 설정
        handleResize();

        // 리사이즈 이벤트 리스너 등록
        window.addEventListener("resize", handleResize);

        // 클린업
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // 메인 배너 목록 조회
    useEffect(() => {
        if (configBannerData) {
            const list = configBannerData.data.data_list;

            const getDateString = (date: Date) => date.toISOString().slice(0, 10);

            const currentDateStr = getDateString(new Date());

            const updatedList = list.filter((item: BannerItem) => {
                if (item.b_open.includes("N")) return false;

                // 시작일 체크
                if (item.b_s_date) {
                    const startDate = new Date(item.b_s_date.replace(/\./g, "-"));
                    const startDateStr = getDateString(startDate);
                    if (startDateStr > currentDateStr) return false;
                }

                // 종료일 체크
                if (item.b_e_date) {
                    const endDate = new Date(item.b_e_date.replace(/\./g, "-"));
                    const endDateStr = getDateString(endDate);
                    if (endDateStr < currentDateStr) return false; // 오늘까지 노출
                }

                return true;
            });
            setBannerList(updatedList);
        } else {
            setBannerList([]);
        }
    }, [configBannerData]);

    return (
        <>
            {bannerList.length > 0 && (
                <Swiper
                    loop={true}
                    className={swiperStyle}
                    pagination={{
                        clickable: true,
                    }}
                    autoplay={{
                        delay: 8000,
                        disableOnInteraction: false,
                    }}
                    modules={[Autoplay, Pagination]}
                    observer={true}
                    observeParents={true}
                    onSlideChange={swiper => {
                        setActiveIndex(swiper.realIndex);
                    }}
                >
                    {bannerList.map((item, index) => {
                        return (
                            <SwiperSlide
                                key={`main_banner_${index}`}
                                className={`${item.b_url ? "cursor-pointer" : ""}`}
                                onClick={() => {
                                    if (item.b_url) {
                                        if (item.b_url_target === "2") {
                                            window.open(item.b_url, "_blank", "noopener,noreferrer");
                                        } else {
                                            router.push(item.b_url);
                                        }
                                    }
                                }}
                            >
                                <div
                                    className="relative mx-auto max-w-full overflow-hidden"
                                    style={{ width: item.b_width_size, height: item.b_height_size }}
                                >
                                    {item.b_c_type === "1" && (
                                        <img
                                            src={`${API_URL}/${item.b_file}`}
                                            alt={`배너_${index}`}
                                            className={`${item.b_size[0] === "1" ? "h-full w-full object-cover" : ""}`}
                                        />
                                    )}
                                    {item.b_c_type === "2" && item.b_mov_type[0] === "1" && (
                                        <video
                                            src={`${API_URL}/${item.b_file}`}
                                            className={`${item.b_size[0] === "1" ? "h-full w-full object-cover" : ""}`}
                                            controls={true}
                                            autoPlay={item.b_mov_play === "Y"}
                                            muted={true}
                                            loop={true}
                                            playsInline={true}
                                        />
                                    )}
                                    {item.b_c_type === "2" && item.b_mov_type[0] === "2" && (
                                        <div
                                            style={{ width: item.b_width_size, height: item.b_height_size }}
                                            className="max-w-full"
                                        >
                                            {activeIndex === index && (
                                                <iframe
                                                    key={`youtube_${item.idx}_${activeIndex}`}
                                                    width="100%"
                                                    height="100%"
                                                    src={item.b_mov_url}
                                                    allowFullScreen
                                                />
                                            )}
                                        </div>
                                    )}
                                    {item.b_c_type === "3" && (
                                        <div
                                            className="h-full w-full"
                                            dangerouslySetInnerHTML={{ __html: item.b_content }}
                                        />
                                    )}
                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            )}
        </>
    );
}
