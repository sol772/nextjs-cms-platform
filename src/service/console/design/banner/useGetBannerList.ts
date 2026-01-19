import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";
import { ApiResponse, BannerListData } from "@/types/api";

/**
 * 배너 목록 조회 훅
 * @param limit - 페이지당 배너 수
 * @param page - 현재 페이지 번호
 * @param b_type - 배너 타입 (P: PC, M: Mobile)
 * @param b_lang - 언어 코드
 * @param searchtxt - 검색어
 */
export const useGetBannerList = (
    limit: string,
    page: string,
    b_type: string,
    b_lang: string,
    searchtxt?: string,
) => {
    return useQuery<ApiResponse<BannerListData>, AxiosError>({
        queryKey: ["bannerList", limit, page, b_type, b_lang, searchtxt],
        queryFn: async () => {
            const res = await consoleAxios.get<ApiResponse<BannerListData>>(
                `${CONSOLE_API_ROUTES.BANNER.CRUD}?limit=${limit}&page=${page}&b_type=${b_type}&b_lang=${b_lang}${searchtxt ? `&searchtxt=${searchtxt}` : ""}`,
            );
            return res.data;
        },
    });
};

