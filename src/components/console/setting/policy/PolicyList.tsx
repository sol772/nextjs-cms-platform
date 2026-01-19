"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import LanguageTabs from "@/components/console/common/LanguageTabs";
import LoadingSpinner from "@/components/console/common/LoadingSpinner";
import NoData from "@/components/console/common/NoData";
import Pagination from "@/components/console/common/Pagination";
import ResizableSplit from "@/components/console/common/ResizableSplit";
import AllCheckbox from "@/components/console/form/AllCheckbox";
import Checkbox from "@/components/console/form/Checkbox";
import SearchInput from "@/components/console/form/SearchInput";
import Toggle from "@/components/console/form/Toggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    deviceTypes,
    initialDeviceType,
    initialListSize,
    initialPage,
    PolicyListParams,
} from "@/constants/console/listParams";
import { CONSOLE_CONFIRM_MESSAGES, CONSOLE_TOAST_MESSAGES } from "@/constants/console/messages";
import { usePagination } from "@/hooks/common/usePagination";
import { useUrlParams } from "@/hooks/common/useUrlParams";
import { useCheckboxList } from "@/hooks/console/useCheckboxList";
import { useLangTypes } from "@/hooks/console/useLangTypes";
import { useToast } from "@/hooks/use-toast";
import { useGetPolicyList, usePostPolicyUse } from "@/service/console/setting/policy";
import { usePopupStore } from "@/store/console/usePopupStore";
import { makeIntComma } from "@/utils/numberUtils";

import PolicyForm from "./PolicyForm";

const schema = z.object({
    type: z.string(),
    searchtxt: z.string().optional(),
});

export type SearchFormValues = z.infer<typeof schema>;

interface Item {
    idx: number;
    p_title: string;
    p_reg_date: string;
    p_use_yn: string;
}

export default function PolicyList() {
    const { langTypes, initialLang } = useLangTypes();
    const [items, setItems] = useState<Item[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const { urlParams, updateUrlParams } = useUrlParams<PolicyListParams>({
        lang: { defaultValue: initialLang, type: "string", validValues: langTypes },
        page: { defaultValue: initialPage, type: "number" },
        type: { defaultValue: initialDeviceType, type: "string", validValues: deviceTypes },
        searchtxt: { defaultValue: "", type: "string" },
        detail: { defaultValue: "", type: "string" },
    });
    const { currentPage, pages, setCurrentPage } = usePagination({ totalPages, initialPage: urlParams.page });
    const { allCheck, setCheckList, checkedList, setCheckedList, handleAllCheck, handleCheck } = useCheckboxList();
    const [detailOn, setDetailOn] = useState("");
    const { setValue, control, register } = useForm<SearchFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            searchtxt: urlParams.searchtxt,
        },
    });
    const searchFilterValues = useWatch({ control });
    const { data: configData, isLoading: isInitialLoading } = useGetPolicyList(
        initialListSize.toString(),
        urlParams.page.toString(),
        urlParams.lang,
        urlParams.searchtxt,
    );
    const postPolicyUseMutation = usePostPolicyUse();
    const { setConfirmPop } = usePopupStore();
    const { toast } = useToast();

    // urlParams 변경 시 동기화
    useEffect(() => {
        setValue("searchtxt", urlParams.searchtxt);
    }, [urlParams.searchtxt, setValue]);

    // detail 파라미터 동기화
    useEffect(() => {
        setDetailOn(urlParams.detail ? urlParams.detail : "");
    }, [urlParams.detail]);

    // currentPage 변경 시 URL 파라미터 업데이트
    const handleChangeCurrentPage = (page: number) => {
        updateUrlParams({
            page: page,
        });
        setCurrentPage(page);
    };

    // 언어탭 변경 시
    const handleChangeLangTab = (lang: string) => {
        updateUrlParams({ lang: lang, page: 1, detail: undefined });
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

    // 운영정책 목록 조회
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

    // 운영정책 상세 열기
    const handleOpenDetail = (idx: number) => {
        if (detailOn === idx.toString()) {
            updateUrlParams({
                ...urlParams,
                detail: undefined,
            });
        } else {
            updateUrlParams({
                ...urlParams,
                detail: idx.toString(),
            });
        }
    };

    // 노출설정 변경 확인
    const handleConfirmOpenChange = (open: boolean) => {
        if (checkedList.length === 0) {
            setConfirmPop(true, CONSOLE_CONFIRM_MESSAGES.SELECT_ITEM("운영정책을"), 1);
        } else {
            setConfirmPop(true, CONSOLE_CONFIRM_MESSAGES.CHANGE_EXPOSURE("운영정책을", open ? "노출" : "중단"), 2, () =>
                handleChangeOpen(open),
            );
        }
    };

    // 노출설정 변경
    const handleChangeOpen = (checked: boolean, idx?: number) => {
        const body = {
            idx: idx ? [idx] : checkedList,
            p_use_yn: checked ? "Y" : "N",
        };
        postPolicyUseMutation.mutate(body, {
            onSuccess: () => {
                toast({ title: CONSOLE_TOAST_MESSAGES.EXPOSURE_CHANGED });
            },
        });
    };

    // 운영정책 정보 수정 취소시
    const handleEditCancel = useCallback(() => {
        updateUrlParams({
            ...urlParams,
            detail: undefined,
        });
    }, [updateUrlParams, urlParams]);

    // 운영정책 수정 완료시
    const onEditComplete = useCallback(() => {
        updateUrlParams({
            ...urlParams,
            detail: detailOn ? detailOn : undefined,
        });
    }, [updateUrlParams, urlParams, detailOn]);

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
                                            </div>
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
                                                        key={`popup_${i}`}
                                                        className={`group flex min-h-[60px] cursor-pointer items-center justify-between gap-[16px] rounded-[12px] border bg-white p-[8px_20px] transition-all hover:border-console ${
                                                            detailOn === item.idx.toString()
                                                                ? "border-console"
                                                                : "border-white"
                                                        }`}
                                                        onClick={() => handleOpenDetail(item.idx)}
                                                    >
                                                        <div className="flex min-w-0 flex-1 items-center gap-[16px]">
                                                            <Checkbox
                                                                checked={checkedList.includes(item.idx)}
                                                                onChange={e =>
                                                                    handleCheck(e.currentTarget.checked, item.idx)
                                                                }
                                                            />
                                                            <p
                                                                className={`flex-1 truncate text-left font-[500] text-[#222] transition-all group-hover:underline${
                                                                    detailOn === item.idx.toString() ? " underline" : ""
                                                                }`}
                                                            >
                                                                {item.p_title}
                                                            </p>
                                                        </div>
                                                        <Toggle
                                                            txt="노출"
                                                            checked={item.p_use_yn === "Y"}
                                                            handleChange={checked =>
                                                                handleChangeOpen(checked, item.idx)
                                                            }
                                                        />
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
                        <div className="h-full p-[0_20px_0_7px]">
                            {detailOn ? (
                                <PolicyForm
                                    detailIdx={detailOn}
                                    lang={urlParams.lang}
                                    onComplete={onEditComplete}
                                    handleCancel={handleEditCancel}
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
