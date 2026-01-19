import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { COMMON_API_ROUTES } from "@/config/apiConfig";
import consoleAxios from "@/service/axios/consoleAxios";
import { ApiResponse, PostListData } from "@/types/api";

/**
 * 게시글 목록 조회 훅
 * @param category - 게시판 카테고리 ID
 * @param limit - 페이지당 게시글 수
 * @param page - 현재 페이지 번호
 * @param options - 쿼리 옵션 (enabled 등)
 * @param search - 검색 필드 (title, contents 등)
 * @param searchtxt - 검색어
 * @param group - 게시판 그룹 ID
 */
export const useGetPostList = (
    category: string,
    limit: string,
    page: string,
    options: { enabled: boolean },
    search?: string,
    searchtxt?: string,
    group?: string,
) => {
    return useQuery<ApiResponse<PostListData>, AxiosError>({
        queryKey: ["postList", category, limit, page, search, searchtxt, group],
        queryFn: async () => {
            const res = await consoleAxios.get<ApiResponse<PostListData>>(
                `${COMMON_API_ROUTES.POST.GET_LIST.replace(":category", category).replace(":limit", limit)}?page=${page}${search ? `&search=${search}` : ""}${searchtxt ? `&searchtxt=${searchtxt}` : ""}${group ? `&group_id=${group}` : ""}`,
            );
            return res.data;
        },
        enabled: options.enabled,
        retry: (failureCount, error) => {
            // 404 에러는 재시도하지 않음 (게시판 카테고리 없을때)
            if (error?.response?.status === 404) {
                return false;
            }
            // 다른 에러는 최대 3번(기본값)까지 재시도
            return failureCount < 3;
        },
    });
};

