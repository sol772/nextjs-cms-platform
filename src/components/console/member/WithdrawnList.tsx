"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import LoadingSpinner from "@/components/console/common/LoadingSpinner";
import NoData from "@/components/console/common/NoData";
import Pagination from "@/components/console/common/Pagination";
import AllCheckbox from "@/components/console/form/AllCheckbox";
import Checkbox from "@/components/console/form/Checkbox";
import SearchInput from "@/components/console/form/SearchInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { initialListSize, initialPage, listSearchTypes, MemberListParams } from "@/constants/console/listParams";
import { CONSOLE_CONFIRM_MESSAGES, CONSOLE_TOAST_MESSAGES } from "@/constants/console/messages";
import { usePagination } from "@/hooks/common/usePagination";
import { useUrlParams } from "@/hooks/common/useUrlParams";
import { useCheckboxList } from "@/hooks/console/useCheckboxList";
import { useToast } from "@/hooks/use-toast";
import { useGetWithdrawnList, usePostWithdrawn } from "@/service/console/member";
import { usePopupStore } from "@/store/console/usePopupStore";
import { makeIntComma } from "@/utils/numberUtils";

const schema = z.object({
    search: z.string(),
    searchtxt: z.string().optional(),
});

type SearchValues = z.infer<typeof schema>;

interface Item {
    id: number;
    m_email: string;
    sec_date: string;
}

export default function WithdrawnList() {
    const [items, setItems] = useState<Item[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const { urlParams, updateUrlParams } = useUrlParams<MemberListParams>({
        page: { defaultValue: initialPage, type: "number" },
        search: { defaultValue: "m_email", type: "string", validValues: listSearchTypes.map(type => type.value) },
        searchtxt: { defaultValue: "", type: "string" },
    });
    const { currentPage, pages, setCurrentPage } = usePagination({ totalPages, initialPage: urlParams.page });
    const { allCheck, setCheckList, checkedList, setCheckedList, handleAllCheck, handleCheck } = useCheckboxList();
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
    } = useGetWithdrawnList(
        initialListSize.toString(),
        urlParams.page.toString(),
        urlParams.search,
        urlParams.searchtxt,
    );
    const postWithdrawnMutation = usePostWithdrawn();
    const { setConfirmPop, setLoadingPop } = usePopupStore();
    const { toast } = useToast();

    // urlParams.search, urlParams.searchtxt 변경 시만 동기화
    useEffect(() => {
        setValue("search", urlParams.search);
        setValue("searchtxt", urlParams.searchtxt);
    }, [urlParams.search, urlParams.searchtxt, setValue]);

    // currentPage 변경 시 URL 파라미터 업데이트
    const handleChangeCurrentPage = (page: number) => {
        updateUrlParams({
            page: page,
        });
        setCurrentPage(page);
    };

    // 검색 하기
    const handleSearch = () => {
        const searchTxtValue = searchFilterValues.searchtxt || "";

        updateUrlParams({
            page: 1,
            search: urlParams.search,
            searchtxt: searchTxtValue,
        });
        setCurrentPage(1);
    };

    // 데이터 삭제 중일 때 로딩 팝업 표시
    useEffect(() => {
        const isLoading = postWithdrawnMutation.isPending;
        setLoadingPop(isLoading);
        return () => setLoadingPop(false);
    }, [postWithdrawnMutation.isPending, setLoadingPop]);

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

    // 리스트 id 값만 배열로 (전체 체크박스리스트 만들기)
    useEffect(() => {
        setCheckList(items && items.length > 0 ? items.map(item => item.id) : []);
        setCheckedList([]);
    }, [items, setCheckList, setCheckedList]);

    // 삭제 확인
    const handleConfirmDelete = () => {
        if (checkedList.length > 0) {
            setConfirmPop(true, "회원정보를 영구삭제하시겠습니까?", 2, () => handleDelete(), undefined, "", "red");
        } else {
            setConfirmPop(true, CONSOLE_CONFIRM_MESSAGES.SELECT_ITEM("회원을"), 1);
        }
    };

    // 삭제하기
    const handleDelete = () => {
        const body = { id: checkedList };
        postWithdrawnMutation.mutate(body, {
            onSuccess: () => {
                toast({ title: CONSOLE_TOAST_MESSAGES.DELETED });
                refetch();
            },
        });
    };

    return (
        <div className="flex h-[calc(100vh-90px)] flex-col">
            <div className="min-h-0 flex-1">
                <ScrollArea className="h-full pr-[7px]">
                    <div className="flex min-h-full flex-col">
                        <div className="border-b border-[#D9D9D9] py-[8px]">
                            <p className="font-[500]">
                                <span className="text-console">{makeIntComma(totalCount)} </span>명
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
                                    회원정보 영구삭제
                                </button>
                            </div>
                            <SearchInput {...register("searchtxt")} handleClick={handleSearch} placeholder="이메일" />
                        </div>
                        {isInitialLoading ? (
                            <LoadingSpinner />
                        ) : items && items.length > 0 ? (
                            <ul className="flex flex-col gap-[10px]">
                                {items.map((item, i) => (
                                    <li
                                        key={`comment_${i}`}
                                        className="group flex cursor-pointer items-center rounded-[12px] border bg-white p-[8px] transition-all hover:border-console"
                                    >
                                        <Checkbox
                                            checked={checkedList.includes(item.id)}
                                            onChange={e => handleCheck(e.currentTarget.checked, item.id)}
                                        />
                                        <p className="flex-1 p-[0_16px_0_28px] text-left font-[500] text-[#222] transition-all group-hover:underline">
                                            {item.m_email}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <NoData className="flex-1" txt="데이터가 없습니다." subTxt={false} />
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
    );
}
