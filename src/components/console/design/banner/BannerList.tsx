"use client";

import { DragEndEvent } from "@dnd-kit/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import DraggableList from "@/components/console/common/DraggableList";
import LanguageTabs from "@/components/console/common/LanguageTabs";
import LoadingSpinner from "@/components/console/common/LoadingSpinner";
import NoData from "@/components/console/common/NoData";
import Pagination from "@/components/console/common/Pagination";
import ResizableSplit from "@/components/console/common/ResizableSplit";
import Tabs from "@/components/console/common/Tabs";
import AllCheckbox from "@/components/console/form/AllCheckbox";
import Checkbox from "@/components/console/form/Checkbox";
import SearchInput from "@/components/console/form/SearchInput";
import Toggle from "@/components/console/form/Toggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { API_URL } from "@/config/apiConfig";
import {
    BannerListParams,
    deviceTypes,
    initialDeviceType,
    initialListSize,
    initialPage,
} from "@/constants/console/listParams";
import { CONSOLE_CONFIRM_MESSAGES, CONSOLE_TOAST_MESSAGES } from "@/constants/console/messages";
import { usePagination } from "@/hooks/common/usePagination";
import { useUrlParams } from "@/hooks/common/useUrlParams";
import { useCheckboxList } from "@/hooks/console/useCheckboxList";
import { useLangTypes } from "@/hooks/console/useLangTypes";
import { useToast } from "@/hooks/use-toast";
import { useDelBanner, useGetBannerList, usePostBannerOpen, usePutBannerOrder } from "@/service/console/design/banner";
import { usePopupStore } from "@/store/console/usePopupStore";
import { makeIntComma } from "@/utils/numberUtils";
import { calculatePrevPage } from "@/utils/paginationUtils";

import BannerForm from "./BannerForm";

const schema = z.object({
    type: z.string(),
    searchtxt: z.string().optional(),
});

export type SearchFormValues = z.infer<typeof schema>;

interface Item {
    idx: number;
    b_file: string | null;
    b_title: string;
    b_s_date: string;
    b_e_date: string;
    b_size: string[];
    b_open: string[];
    b_moveNum: number;
    b_c_type: string;
}

export default function BannerList() {
    const { langTypes, initialLang } = useLangTypes();
    const tabList = ["PC 배너", "모바일 배너"];
    const [items, setItems] = useState<Item[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const { urlParams, updateUrlParams } = useUrlParams<BannerListParams>({
        lang: { defaultValue: initialLang, type: "string", validValues: langTypes },
        page: { defaultValue: initialPage, type: "number" },
        type: { defaultValue: initialDeviceType, type: "string", validValues: deviceTypes },
        searchtxt: { defaultValue: "", type: "string" },
        detail: { defaultValue: "", type: "string" },
        create: { defaultValue: "0", type: "string" },
    });
    const [tabOn, setTabOn] = useState(urlParams.type === "P" ? 0 : 1);
    const { currentPage, pages, setCurrentPage } = usePagination({ totalPages, initialPage: urlParams.page });
    const { allCheck, setCheckList, checkedList, setCheckedList, handleAllCheck, handleCheck } = useCheckboxList();
    const [detailOn, setDetailOn] = useState("");
    const [createOn, setCreateOn] = useState(false);
    const { setValue, control, register } = useForm<SearchFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            searchtxt: urlParams.searchtxt,
        },
    });
    const searchFilterValues = useWatch({ control });
    const { data: configData, isLoading: isInitialLoading } = useGetBannerList(
        initialListSize.toString(),
        urlParams.page.toString(),
        urlParams.type,
        urlParams.lang,
        urlParams.searchtxt,
    );
    const postBannerOpenMutation = usePostBannerOpen();
    const putBannerOrderMutation = usePutBannerOrder();
    const delBannerMutation = useDelBanner();
    const { setConfirmPop, setLoadingPop } = usePopupStore();
    const { toast } = useToast();

    // urlParams 변경 시 동기화
    useEffect(() => {
        setValue("searchtxt", urlParams.searchtxt);
    }, [urlParams.searchtxt, setValue]);

    // type 파라미터 동기화
    useEffect(() => {
        setTabOn(urlParams.type === "P" ? 0 : 1);
    }, [urlParams.type]);

    // detail 파라미터 동기화
    useEffect(() => {
        setDetailOn(urlParams.detail ? urlParams.detail : "");
    }, [urlParams.detail]);

    // create 파라미터 동기화
    useEffect(() => {
        setCreateOn(urlParams.create === "1");
    }, [urlParams.create]);

    // 언어탭 변경 시
    const handleChangeLangTab = (lang: string) => {
        updateUrlParams({
            lang: lang,
            page: 1,
            type: initialDeviceType,
            searchtxt: undefined,
            detail: undefined,
            create: undefined,
        });
    };

    // currentPage 변경 시 URL 파라미터 업데이트
    const handleChangeCurrentPage = (page: number) => {
        updateUrlParams({
            page: page,
        });
        setCurrentPage(page);
    };

    // 탭 변경 시 URL 파라미터 업데이트
    const handleChangeTab = (idx: number) => {
        updateUrlParams({
            type: idx === 0 ? "P" : "M",
            page: 1,
            searchtxt: undefined,
            detail: undefined,
        });
        setCurrentPage(1);
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

    // 데이터 수정,삭제 중일 때 로딩 팝업 표시
    useEffect(() => {
        const isLoading = delBannerMutation.isPending;
        setLoadingPop(isLoading);
        return () => setLoadingPop(false);
    }, [delBannerMutation.isPending, setLoadingPop]);

    // 배너 목록 조회
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

    // 배너 상세 열기
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

    // 배너 등록 열기
    const handleOpenCreate = () => {
        const create = createOn ? "0" : "1";
        updateUrlParams({
            ...urlParams,
            detail: undefined,
            create,
        });
    };

    // 순서 변경 처리
    const handleChangeOrder = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const body = {
            idx: Number(active.id),
            moveNum: over.data.current?.b_moveNum,
        };
        putBannerOrderMutation.mutate(body, {
            onSuccess: () => {
                toast({ title: CONSOLE_TOAST_MESSAGES.ORDER_CHANGED });
            },
        });
    };

    // 노출설정 변경 확인
    const handleConfirmOpenChange = (open: boolean) => {
        if (checkedList.length === 0) {
            setConfirmPop(true, CONSOLE_CONFIRM_MESSAGES.SELECT_ITEM("배너를"), 1);
        } else {
            setConfirmPop(true, CONSOLE_CONFIRM_MESSAGES.CHANGE_EXPOSURE("배너를", open ? "노출" : "중단"), 2, () =>
                handleChangeOpen(open),
            );
        }
    };

    // 노출설정 변경
    const handleChangeOpen = (checked: boolean, idx?: number) => {
        const body = {
            idx: idx ? [idx] : checkedList,
            b_open: checked ? "Y" : "N",
        };
        postBannerOpenMutation.mutate(body, {
            onSuccess: () => {
                toast({ title: CONSOLE_TOAST_MESSAGES.EXPOSURE_CHANGED });
            },
        });
    };

    // 삭제 확인
    const handleConfirmDelete = () => {
        if (checkedList.length > 0) {
            setConfirmPop(
                true,
                CONSOLE_CONFIRM_MESSAGES.DELETE_ITEM("배너를"),
                2,
                () => handleDelete(),
                undefined,
                "",
                "red",
            );
        } else {
            setConfirmPop(true, CONSOLE_CONFIRM_MESSAGES.SELECT_ITEM("배너를"), 1);
        }
    };

    // 삭제하기
    const handleDelete = () => {
        const body = { idx: checkedList };
        delBannerMutation.mutate(body, {
            onSuccess: () => {
                toast({ title: CONSOLE_TOAST_MESSAGES.DELETED });

                const detail = checkedList.includes(Number(detailOn)) ? undefined : detailOn;
                // 삭제 후 refetch 전에 페이지 이동 처리
                const prevPage = calculatePrevPage(urlParams.page, items.length);

                updateUrlParams({
                    ...urlParams,
                    page: prevPage,
                    detail,
                });
                setCurrentPage(prevPage);
            },
        });
    };

    // 배너정보 수정 취소시
    const handleEditCancel = useCallback(() => {
        updateUrlParams({
            ...urlParams,
            detail: undefined,
        });
    }, [updateUrlParams, urlParams]);

    // 배너 등록/수정 완료시
    const onEditComplete = useCallback(() => {
        updateUrlParams({
            ...urlParams,
            detail: detailOn ? detailOn : undefined,
            create: undefined,
        });
    }, [updateUrlParams, urlParams, detailOn]);

    // 배너 삭제 완료시
    const onDeleteComplete = useCallback(() => {
        // 삭제 후 refetch 전에 페이지 이동 처리
        const prevPage = calculatePrevPage(urlParams.page, items.length);

        updateUrlParams({
            ...urlParams,
            page: prevPage,
            detail: undefined,
        });
        setCurrentPage(prevPage);
    }, [updateUrlParams, urlParams, items.length, setCurrentPage]);

    return (
        <div className="flex h-[calc(100vh-90px)] flex-col">
            <div className="pr-[20px]">
                <LanguageTabs activeLang={urlParams.lang} handleLanguageChange={handleChangeLangTab} />
            </div>
            <div className="min-h-0 flex-1 pb-[20px]">
                <ResizableSplit
                    left={
                        <div className="flex h-full flex-col">
                            <div className="min-h-0 flex-1">
                                <ScrollArea className="h-full pr-[7px]">
                                    <div className="flex h-full flex-col">
                                        <Tabs list={tabList} activeIdx={tabOn} handleClick={handleChangeTab} />
                                        <div className="flex items-center justify-between border-b border-[#D9D9D9] py-[8px]">
                                            <p className="font-[500]">
                                                <span className="text-console">{makeIntComma(totalCount)} </span>개
                                            </p>
                                            <button
                                                type="button"
                                                className="h-[40px] rounded-[8px] bg-black px-[20px] text-[18px] font-[700] text-white"
                                                onClick={handleOpenCreate}
                                            >
                                                배너 등록
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between py-[8px]">
                                            <div className="flex items-center gap-[8px]">
                                                <AllCheckbox
                                                    checked={allCheck}
                                                    onChange={e => handleAllCheck(e.currentTarget.checked)}
                                                />
                                                <button
                                                    type="button"
                                                    className="h-[34px] rounded-[8px] bg-console-2 px-[16px] font-[500] text-white"
                                                    onClick={() => handleConfirmOpenChange(true)}
                                                >
                                                    노출
                                                </button>
                                                <button
                                                    type="button"
                                                    className="h-[34px] rounded-[8px] bg-[#F6F7FA] px-[16px] font-[500] text-[#666]"
                                                    onClick={() => handleConfirmOpenChange(false)}
                                                >
                                                    중단
                                                </button>
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
                                                placeholder="배너명"
                                            />
                                        </div>
                                        {isInitialLoading ? (
                                            <LoadingSpinner />
                                        ) : items && items.length > 0 ? (
                                            <DraggableList
                                                items={items}
                                                getItemId={item => item.idx}
                                                getItemData={item => ({
                                                    b_moveNum: item.b_moveNum,
                                                })}
                                                renderRow={item => (
                                                    <div
                                                        className={`group flex min-h-[60px] cursor-pointer items-center justify-between gap-[16px] rounded-[12px] border bg-white p-[8px_20px_8px_8px] transition-all hover:border-console ${
                                                            detailOn === item.idx.toString()
                                                                ? "border-console"
                                                                : "border-white"
                                                        }`}
                                                        onClick={() => handleOpenDetail(item.idx)}
                                                    >
                                                        <div className="flex min-w-0 flex-1 items-center gap-[16px]">
                                                            <div className="flex justify-center pl-[24px]">
                                                                <Checkbox
                                                                    checked={checkedList.includes(item.idx)}
                                                                    onChange={e =>
                                                                        handleCheck(e.currentTarget.checked, item.idx)
                                                                    }
                                                                />
                                                            </div>
                                                            {item.b_file && (
                                                                <div className="flex size-[80px] justify-center overflow-hidden rounded-[8px] border border-[#D9D9D9] bg-[#353535]">
                                                                    {item.b_c_type === "1" ? (
                                                                        <img
                                                                            src={`${API_URL}/${item.b_file}`}
                                                                            alt="이미지"
                                                                            className="h-full max-w-full"
                                                                        />
                                                                    ) : (
                                                                        item.b_c_type === "2" && (
                                                                            <video src={`${API_URL}/${item.b_file}`} />
                                                                        )
                                                                    )}
                                                                </div>
                                                            )}
                                                            <div className="flex flex-1 flex-col gap-[8px]">
                                                                <p
                                                                    className={`truncate text-left font-[500] text-[#222] transition-all group-hover:underline${
                                                                        detailOn === item.idx.toString()
                                                                            ? " underline"
                                                                            : ""
                                                                    }`}
                                                                >
                                                                    {item.b_title}
                                                                </p>
                                                                <ul className="flex gap-[8px]">
                                                                    <li className="flex w-1/2 flex-col gap-[4px]">
                                                                        <p className="text-[12px] text-[#9F9FA5]">
                                                                            노출기간
                                                                        </p>
                                                                        <p className="text-[14px]">
                                                                            {!item.b_s_date && !item.b_e_date
                                                                                ? "-"
                                                                                : `${item.b_s_date}${
                                                                                      item.b_e_date
                                                                                          ? " ~ " + item.b_e_date
                                                                                          : ""
                                                                                  }`}
                                                                        </p>
                                                                    </li>
                                                                    <li className="flex w-1/2 flex-col gap-[4px]">
                                                                        <p className="text-[12px] text-[#9F9FA5]">
                                                                            배너 노출 사이즈
                                                                        </p>
                                                                        <p className="text-[14px]">{item.b_size[1]}</p>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                        <Toggle
                                                            txt="노출"
                                                            checked={item.b_open[0] === "Y"}
                                                            handleChange={checked =>
                                                                handleChangeOpen(checked, item.idx)
                                                            }
                                                        />
                                                    </div>
                                                )}
                                                handleChangeOrder={handleChangeOrder}
                                            />
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
                        <div className="h-full p-[0_20px_0_7px]">
                            {detailOn || createOn ? (
                                <BannerForm
                                    lang={urlParams.lang || initialLang}
                                    type={tabOn === 0 ? "P" : "M"}
                                    mode={detailOn ? "edit" : "create"}
                                    detailIdx={detailOn}
                                    onComplete={onEditComplete}
                                    handleCancel={handleEditCancel}
                                    onDeleteComplete={onDeleteComplete}
                                />
                            ) : (
                                <NoData txt="선택된 컨텐츠가 없습니다." className="h-full rounded-[12px] bg-white" />
                            )}
                        </div>
                    }
                />
            </div>
        </div>
    );
}
