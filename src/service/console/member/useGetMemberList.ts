import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { CONSOLE_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";
import { ApiResponse, MemberListData } from "@/types/api";

/**
 * 회원 목록 조회 훅
 * @param limit - 페이지당 회원 수
 * @param page - 현재 페이지 번호
 * @param search - 검색 필드 (email, name 등)
 * @param searchtxt - 검색어
 * @param sdate - 검색 시작일
 * @param edate - 검색 종료일
 * @param m_level - 회원 레벨 필터
 */
export const useGetMemberList = (
    limit: string,
    page: string,
    search?: string,
    searchtxt?: string,
    sdate?: string,
    edate?: string,
    m_level?: string,
) => {
    return useQuery<ApiResponse<MemberListData>, AxiosError>({
        queryKey: ["memberList", limit, page, search, searchtxt, sdate, edate, m_level],
        queryFn: async () => {
            const res = await consoleAxios.get<ApiResponse<MemberListData>>(
                `${CONSOLE_API_ROUTES.MEMBER.GET_LIST}?getLimit=${limit}&page=${page}${search ? `&search=${search}` : ""}${searchtxt ? `&searchtxt=${searchtxt}` : ""}${sdate ? `&sdate=${sdate}` : ""}${edate ? `&edate=${edate}` : ""}${m_level ? `&m_level=${m_level}` : ""}`,
            );
            return res.data;
        },
    });
};

