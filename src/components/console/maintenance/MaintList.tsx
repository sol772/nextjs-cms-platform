"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import LoadingSpinner from "@/components/console/common/LoadingSpinner";
import NoData from "@/components/console/common/NoData";
import Pagination from "@/components/console/common/Pagination";
import ResizableSplit from "@/components/console/common/ResizableSplit";
import SearchInput from "@/components/console/form/SearchInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { initialListSize, initialPage, MaintListParams } from "@/constants/console/listParams";
import { usePagination } from "@/hooks/common/usePagination";
import { useUrlParams } from "@/hooks/common/useUrlParams";
import { useGetMaintList } from "@/service/console/maintenance";
import { useAuthStore } from "@/store/common/useAuthStore";
import { makeIntComma } from "@/utils/numberUtils";

import MaintDetail from "./MaintDetail";
import MaintForm from "./MaintForm";

const schema = z.object({
    type: z.string(),
    searchtxt: z.string().optional(),
});

export type SearchFormValues = z.infer<typeof schema>;

interface Item {
    list_no: number;
    subject: string;
    comment_count: number;
    process: string | null;
    w_date: string;
}

export default function MaintList() {
    const { loginUser } = useAuthStore();
    const [items, setItems] = useState<Item[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const { urlParams, updateUrlParams } = useUrlParams<MaintListParams>({
        page: { defaultValue: initialPage, type: "number" },
        searchtxt: { defaultValue: "", type: "string" },
        detail: { defaultValue: "", type: "string" },
        create: { defaultValue: "0", type: "string" },
    });
    const { currentPage, pages, setCurrentPage } = usePagination({ totalPages, initialPage: urlParams.page });
    const [detailOn, setDetailOn] = useState("");
    const [createOn, setCreateOn] = useState(false);
    const { setValue, control, register } = useForm<SearchFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            searchtxt: urlParams.searchtxt,
        },
    });
    const searchFilterValues = useWatch({ control });
    const { data: configData, isLoading: isInitialLoading } = useGetMaintList(
        loginUser.maintName,
        initialListSize.toString(),
        urlParams.page.toString(),
        { enabled: Boolean(loginUser.maintName) },
        urlParams.searchtxt,
    );

    // urlParams 변경 시 동기화
    useEffect(() => {
        setValue("searchtxt", urlParams.searchtxt);
    }, [urlParams.searchtxt, setValue]);

    // detail 파라미터 동기화
    useEffect(() => {
        setDetailOn(urlParams.detail ? urlParams.detail : "");
    }, [urlParams.detail]);

    // create 파라미터 동기화
    useEffect(() => {
        setCreateOn(urlParams.create === "1");
    }, [urlParams.create]);

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
            searchtxt: searchTxtValue,
            detail: undefined,
        });
        setCurrentPage(1);
    };

    // 유지보수 목록 조회
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

    // 유지보수 상세 열기
    const handleOpenDetail = (idx: number) => {
        if (detailOn === idx.toString()) {
            updateUrlParams({
                ...urlParams,
                detail: undefined,
                create: undefined,
            });
        } else {
            updateUrlParams({
                ...urlParams,
                detail: idx.toString(),
                create: undefined,
            });
        }
    };

    // 유지보수 등록 열기
    const handleOpenCreate = () => {
        const create = createOn ? "0" : "1";
        updateUrlParams({
            ...urlParams,
            detail: undefined,
            create,
        });
    };

    // 유지보수 등록 취소시
    const handleEditCancel = useCallback(() => {
        updateUrlParams({
            ...urlParams,
            create: undefined,
        });
    }, [updateUrlParams, urlParams]);

    // 유지보수 게시글 등록 완료시
    const onEditComplete = useCallback(() => {
        updateUrlParams({
            ...urlParams,
            detail: detailOn ? detailOn : undefined,
            create: undefined,
        });
    }, [updateUrlParams, urlParams, detailOn]);

    return (
        <ResizableSplit
            left={
                <div className="flex h-[calc(100vh-90px)] flex-col">
                    <div className="min-h-0 flex-1">
                        <ScrollArea className="h-full pr-[7px]">
                            <div className="flex h-full flex-col">
                                <div className="flex justify-center bg-white">
                                    <div
                                        className="relative max-w-[800px] cursor-pointer"
                                        onClick={() => window.open("https://www.likeweb.co.kr/", "_blank")}
                                    >
                                        <img src="https://likeweb.co.kr/admin/banner2.jpg" alt="유지보수 서비스" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between border-b border-[#D9D9D9] py-[8px]">
                                    <p className="font-[500]">
                                        <span className="text-console">{makeIntComma(totalCount)} </span>개
                                    </p>
                                    <button
                                        type="button"
                                        className="h-[40px] rounded-[8px] bg-black px-[20px] text-[18px] font-[700] text-white"
                                        onClick={handleOpenCreate}
                                    >
                                        유지보수 작성
                                    </button>
                                </div>
                                <div className="flex justify-end py-[8px]">
                                    <SearchInput
                                        {...register("searchtxt")}
                                        handleClick={handleSearch}
                                        placeholder="제목,내용"
                                    />
                                </div>
                                {isInitialLoading ? (
                                    <LoadingSpinner />
                                ) : items && items.length > 0 ? (
                                    <ul className="flex flex-col gap-[10px]">
                                        {items.map((item, i) => (
                                            <li
                                                key={`maint_${i}`}
                                                className={`group flex cursor-pointer items-center justify-between gap-[16px] rounded-[12px] border bg-white p-[8px_20px] transition-all hover:border-console${
                                                    detailOn === item.list_no.toString() ? " border-console" : ""
                                                }`}
                                                onClick={() => handleOpenDetail(item.list_no)}
                                            >
                                                <div className="flex min-w-0 flex-1 items-center gap-[4px]">
                                                    <p
                                                        className={`min-w-0 truncate text-left font-[500] text-[#222] transition-all group-hover:underline${
                                                            detailOn === item.list_no.toString() ? " underline" : ""
                                                        }`}
                                                    >
                                                        {item.subject}
                                                    </p>
                                                    {item.comment_count > 0 && (
                                                        <p>({makeIntComma(item.comment_count)})</p>
                                                    )}
                                                </div>
                                                <ul className="flex gap-[20px]">
                                                    <li className="flex min-w-[80px] flex-col gap-[4px]">
                                                        <p className="text-[14px] text-[#9F9FA5]">진행상황</p>
                                                        <p>{item.process || "-"}</p>
                                                    </li>
                                                    <li className="flex min-w-[80px] flex-col gap-[4px]">
                                                        <p className="text-[14px] text-[#9F9FA5]">등록일자</p>
                                                        <p>{item.w_date}</p>
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
                <div className="h-[calc(100vh-90px)]">
                    <div className="h-full p-[0_20px_20px_7px]">
                        {!createOn && detailOn ? (
                            <MaintDetail maintName={loginUser.maintName} detailIdx={detailOn} />
                        ) : createOn || detailOn ? (
                            <MaintForm
                                maintName={loginUser.maintName}
                                siteId={loginUser.siteId}
                                handleCancel={handleEditCancel}
                                onComplete={onEditComplete}
                            />
                        ) : (
                            <NoData txt="선택된 컨텐츠가 없습니다." className="h-full rounded-[12px] bg-white" />
                        )}
                    </div>
                </div>
            }
        />
    );
}
