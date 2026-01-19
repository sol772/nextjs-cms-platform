"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import LoadingSpinner from "@/components/console/common/LoadingSpinner";
import NoData from "@/components/console/common/NoData";
import Pagination from "@/components/console/common/Pagination";
import ResizableSplit from "@/components/console/common/ResizableSplit";
import AllCheckbox from "@/components/console/form/AllCheckbox";
import Checkbox from "@/components/console/form/Checkbox";
import SearchInput from "@/components/console/form/SearchInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CommentListParams, initialListSize, initialPage, listSearchTypes } from "@/constants/console/listParams";
import { CONSOLE_CONFIRM_MESSAGES, CONSOLE_TOAST_MESSAGES } from "@/constants/console/messages";
import { usePagination } from "@/hooks/common/usePagination";
import { useUrlParams } from "@/hooks/common/useUrlParams";
import { useCheckboxList } from "@/hooks/console/useCheckboxList";
import { useToast } from "@/hooks/use-toast";
import { useDelComment, useGetComment } from "@/service/console/board/comment";
import { usePopupStore } from "@/store/console/usePopupStore";
import { makeIntComma } from "@/utils/numberUtils";
import { calculatePrevPage } from "@/utils/paginationUtils";

import PostDetail from "../post/PostDetail";

const schema = z.object({
    search: z.string(),
    searchtxt: z.string().optional(),
});

type SearchValues = z.infer<typeof schema>;

interface Item {
    idx: number;
    board_idx: number;
    category: number;
    c_contents: string;
    boardName: string;
    boardTitle: string;
    m_name: string;
    c_reg_date: string;
}

export default function CommentList() {
    const [items, setItems] = useState<Item[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const { urlParams, updateUrlParams } = useUrlParams<CommentListParams>({
        page: { defaultValue: initialPage, type: "number" },
        search: { defaultValue: "titlecontents", type: "string", validValues: listSearchTypes.map(type => type.value) },
        searchtxt: { defaultValue: "", type: "string" },
        idx: { defaultValue: "", type: "string" },
        category: { defaultValue: "", type: "string" },
        boardIdx: { defaultValue: "", type: "string" },
    });
    const { currentPage, pages, setCurrentPage } = usePagination({ totalPages, initialPage: urlParams.page });
    const { allCheck, setCheckList, checkedList, setCheckedList, handleAllCheck, handleCheck } = useCheckboxList();
    const [detailOn, setDetailOn] = useState<{ idx: string; category: string; boardIdx: string }>({
        idx: "",
        category: "",
        boardIdx: "",
    });
    const { control, setValue, register } = useForm<SearchValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            search: urlParams.search,
            searchtxt: urlParams.searchtxt,
        },
    });
    const searchFilterValues = useWatch({ control });
    const {
        data: configData,
        isLoading: isInitialLoading,
        refetch,
    } = useGetComment(initialListSize.toString(), urlParams.page.toString(), urlParams.search, urlParams.searchtxt);
    const delCommentMutation = useDelComment();
    const { setConfirmPop } = usePopupStore();
    const { toast } = useToast();

    // urlParams.search, urlParams.searchtxt 변경 시만 동기화
    useEffect(() => {
        setValue("search", urlParams.search);
        setValue("searchtxt", urlParams.searchtxt);
    }, [urlParams.search, urlParams.searchtxt, setValue]);

    // 파라미터 동기화
    useEffect(() => {
        setDetailOn({ idx: urlParams.idx, category: urlParams.category, boardIdx: urlParams.boardIdx });
    }, [urlParams.idx, urlParams.category, urlParams.boardIdx]);

    // currentPage 변경 시 URL 파라미터 업데이트
    const handleChangeCurrentPage = (page: number) => {
        updateUrlParams({
            page: page,
        });
        setCurrentPage(page);
    };

    // 검색 하기
    const handleSearch = () => {
        const searchValue = searchFilterValues.search;
        const searchTxtValue = searchFilterValues.searchtxt;

        updateUrlParams({
            page: 1,
            ...(searchValue && { search: searchValue }),
            ...(searchTxtValue && { searchtxt: searchTxtValue }),
        });
        setCurrentPage(1);
    };

    // 게시글 목록 조회
    useEffect(() => {
        if (configData) {
            const data = configData.data;
            setItems(data.data_list);
            setTotalPages(data.last_page);
            setTotalCount(data.total_count);
        } else {
            setItems([]);
            setTotalPages(1);
            setTotalCount(0);
        }
    }, [configData]);

    // 리스트 idx 값만 배열로 (전체 체크박스리스트 만들기)
    useEffect(() => {
        setCheckList(items && items.length > 0 ? items.map(item => item.idx) : []);
        setCheckedList([]);
    }, [items, setCheckList, setCheckedList]);

    // 게시글 상세 열기
    const handleOpenDetail = (idx: number, category: number, board_idx: number) => {
        if (detailOn.idx === idx.toString()) {
            updateUrlParams({
                ...urlParams,
                idx: undefined,
                category: undefined,
                boardIdx: undefined,
            });
        } else {
            updateUrlParams({
                ...urlParams,
                idx: idx.toString(),
                category: category.toString(),
                boardIdx: board_idx.toString(),
            });
        }
    };

    // 삭제 확인
    const handleConfirmDelete = () => {
        if (checkedList.length > 0) {
            setConfirmPop(true, CONSOLE_CONFIRM_MESSAGES.DELETE, 2, () => handleDelete(), undefined, "", "red");
        } else {
            setConfirmPop(true, CONSOLE_CONFIRM_MESSAGES.SELECT_ITEM("댓글을"), 1);
        }
    };

    // 삭제하기
    const handleDelete = () => {
        const body = { idx: checkedList };
        delCommentMutation.mutate(body, {
            onSuccess: () => {
                toast({ title: CONSOLE_TOAST_MESSAGES.DELETED });
                // 삭제 후 refetch 전에 페이지 이동 처리
                const prevPage = calculatePrevPage(urlParams.page, items.length);

                updateUrlParams({
                    ...urlParams,
                    page: prevPage,
                    idx: undefined,
                    category: undefined,
                    boardIdx: undefined,
                });
                refetch();
                setCurrentPage(prevPage);
            },
        });
    };

    // 상세에서 댓글 등록,수정,삭제 완료시
    const onCompleteComment = (del?: boolean) => {
        // 삭제일때
        if (del) {
            // 삭제 후 refetch 전에 페이지 이동 처리
            const prevPage = calculatePrevPage(urlParams.page, items.length);

            updateUrlParams({
                ...urlParams,
                page: prevPage,
                idx: undefined,
                category: undefined,
                boardIdx: undefined,
            });
            refetch();
            setCurrentPage(prevPage);
        } else {
            refetch();
        }
    };

    return (
        <>
            <ResizableSplit
                left={
                    <div className="flex h-[calc(100vh-90px)] flex-col">
                        <div className="min-h-0 flex-1">
                            <ScrollArea className="h-full pr-[7px]">
                                <div className="flex h-full flex-col">
                                    <div className="border-b border-[#D9D9D9] py-[8px]">
                                        <p className="font-[500]">
                                            <span className="text-console">{makeIntComma(totalCount)} </span>개
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between py-[8px]">
                                        <div className="flex items-center gap-[8px]">
                                            <AllCheckbox
                                                checked={allCheck}
                                                onChange={e => handleAllCheck(e.currentTarget.checked)}
                                            />
                                            <button
                                                type="button"
                                                className="h-[34px] rounded-[8px] bg-[#FEE2E2] px-[16px] font-[500] text-[#E5313D]"
                                                onClick={handleConfirmDelete}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                        <SearchInput
                                            {...register("searchtxt")}
                                            handleClick={handleSearch}
                                            placeholder="댓글 내용"
                                        />
                                    </div>
                                    {isInitialLoading || delCommentMutation.isPending ? (
                                        <LoadingSpinner />
                                    ) : items && items.length > 0 ? (
                                        <ul className="flex flex-col gap-[10px]">
                                            {items.map((item, i) => (
                                                <li
                                                    key={`comment_${i}`}
                                                    className={`group flex cursor-pointer items-center rounded-[12px] border bg-white p-[8px_20px] transition-all hover:border-console${
                                                        detailOn.idx === item.idx.toString() ? " border-console" : ""
                                                    }`}
                                                    onClick={() =>
                                                        handleOpenDetail(item.idx, item.category, item.board_idx)
                                                    }
                                                >
                                                    <Checkbox
                                                        checked={checkedList.includes(item.idx)}
                                                        onChange={e => handleCheck(e.currentTarget.checked, item.idx)}
                                                    />
                                                    <p
                                                        className={`flex-1 truncate px-[16px] text-left font-[500] text-[#222] transition-all group-hover:underline${
                                                            detailOn.idx === item.idx.toString() ? " underline" : ""
                                                        }`}
                                                    >
                                                        {item.c_contents}
                                                    </p>
                                                    <ul className="flex gap-[8px]">
                                                        <li className="flex min-w-[80px] max-w-[120px] flex-col gap-[4px]">
                                                            <p className="text-[12px] text-[#9F9FA5]">게시판명</p>
                                                            <p className="text-[14px]">{item.boardName}</p>
                                                        </li>
                                                        <li className="flex min-w-[80px] max-w-[120px] flex-col gap-[4px]">
                                                            <p className="text-[12px] text-[#9F9FA5]">원문제목</p>
                                                            <p className="truncate text-[14px]">{item.boardTitle}</p>
                                                        </li>
                                                        <li className="flex min-w-[80px] max-w-[120px] flex-col gap-[4px]">
                                                            <p className="text-[12px] text-[#9F9FA5]">작성자</p>
                                                            <p className="text-[14px]">{item.m_name}</p>
                                                        </li>
                                                        <li className="flex min-w-[80px] max-w-[120px] flex-col gap-[4px]">
                                                            <p className="text-[12px] text-[#9F9FA5]">등록일자</p>
                                                            <p className="text-[14px]">{item.c_reg_date}</p>
                                                        </li>
                                                    </ul>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <NoData className="flex-1" />
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                        {totalCount > 0 && (
                            <Pagination
                                totalPages={totalPages}
                                currentPage={currentPage}
                                pages={pages}
                                handleChangePage={handleChangeCurrentPage}
                            />
                        )}
                    </div>
                }
                right={
                    <ScrollArea className="h-[calc(100vh-90px)]">
                        {detailOn.idx && detailOn.category && detailOn.boardIdx ? (
                            <div className="h-full p-[0_20px_20px_7px]">
                                <PostDetail
                                    category={detailOn.category}
                                    detailIdx={detailOn.boardIdx}
                                    onCompleteComment={onCompleteComment}
                                    commentPage={true}
                                    refetch={false}
                                    onRefetched={() => {}}
                                />
                            </div>
                        ) : (
                            <div className="h-full p-[0_20px_20px_7px]">
                                <NoData txt="선택된 컨텐츠가 없습니다." className="h-full rounded-[12px] bg-white" />
                            </div>
                        )}
                    </ScrollArea>
                }
            />
        </>
    );
}
