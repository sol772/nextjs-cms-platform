"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import LoadingSpinner from "@/components/console/common/LoadingSpinner";
import NoData from "@/components/console/common/NoData";
import Pagination from "@/components/console/common/Pagination";
import ResizableSplit from "@/components/console/common/ResizableSplit";
import AllCheckbox from "@/components/console/form/AllCheckbox";
import Checkbox from "@/components/console/form/Checkbox";
import SelectBox from "@/components/console/form/SelectBox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { initialListSize, initialPage, MemberListParams, memberListSearchTypes } from "@/constants/console/listParams";
import { CONSOLE_CONFIRM_MESSAGES, CONSOLE_TOAST_MESSAGES } from "@/constants/console/messages";
import { usePagination } from "@/hooks/common/usePagination";
import { useUrlParams } from "@/hooks/common/useUrlParams";
import { useCheckboxList } from "@/hooks/console/useCheckboxList";
import { useLevelSelectOptions } from "@/hooks/console/useLevelSelectOptions";
import { useToast } from "@/hooks/use-toast";
import { useDelMember, useGetMemberList, usePutMemberLevel } from "@/service/console/member";
import { usePopupStore } from "@/store/console/usePopupStore";
import { makeIntComma } from "@/utils/numberUtils";
import { calculatePrevPage } from "@/utils/paginationUtils";

import MemberSearchFilterPop from "./-components/MemberSearchFilterPop";
import MemberForm from "./MemberForm";

const schema = z.object({
    search: z.string(),
    searchtxt: z.string().optional(),
    sdate: z.date().optional(),
    edate: z.date().optional(),
    mLevel: z.string().optional(),
});

export type SearchFormValues = z.infer<typeof schema>;

interface Item {
    idx: number;
    m_name: string;
    m_level: number;
    m_mobile: string;
    m_email: string;
    reg_date: string;
}

export default function MemberList() {
    const [items, setItems] = useState<Item[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const { urlParams, updateUrlParams } = useUrlParams<MemberListParams>({
        page: { defaultValue: initialPage, type: "number" },
        search: { defaultValue: "email", type: "string", validValues: memberListSearchTypes.map(type => type.value) },
        searchtxt: { defaultValue: "", type: "string" },
        sdate: { defaultValue: "", type: "string" },
        edate: { defaultValue: "", type: "string" },
        mLevel: { defaultValue: "", type: "string" },
        detail: { defaultValue: "", type: "string" },
    });
    const { currentPage, pages, setCurrentPage } = usePagination({ totalPages, initialPage: urlParams.page });
    const { allCheck, setCheckList, checkedList, setCheckedList, handleAllCheck, handleCheck } = useCheckboxList();
    const { levelOptions } = useLevelSelectOptions();
    const [detailOn, setDetailOn] = useState("");
    const [level, setLevel] = useState("");
    const [searchFilterOpen, setSearchFilterOpen] = useState(false);
    const { setValue, control, register, reset } = useForm<SearchFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            search: urlParams.search,
            searchtxt: urlParams.searchtxt,
            sdate: urlParams.sdate ? new Date(urlParams.sdate) : undefined,
            edate: urlParams.edate ? new Date(urlParams.edate) : undefined,
            mLevel: urlParams.mLevel,
        },
    });
    const searchFilterValues = useWatch({ control });
    const { data: configData, isLoading: isInitialLoading } = useGetMemberList(
        initialListSize.toString(),
        urlParams.page.toString(),
        urlParams.search,
        urlParams.searchtxt,
        urlParams.sdate,
        urlParams.edate,
        urlParams.mLevel,
    );
    const delMemberMutation = useDelMember();
    const putMemberLevelMutation = usePutMemberLevel();
    const { setConfirmPop, setLoadingPop } = usePopupStore();
    const { toast } = useToast();

    // urlParams 변경 시 동기화
    useEffect(() => {
        setValue("search", urlParams.search);
        setValue("searchtxt", urlParams.searchtxt);
        setValue("sdate", urlParams.sdate ? new Date(urlParams.sdate) : undefined);
        setValue("edate", urlParams.edate ? new Date(urlParams.edate) : undefined);
        setValue("mLevel", urlParams.mLevel);
    }, [urlParams.search, urlParams.searchtxt, urlParams.sdate, urlParams.edate, urlParams.mLevel, setValue]);

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

    // 검색 하기
    const handleSearch = () => {
        setSearchFilterOpen(false);
        const searchValue = searchFilterValues.search || "title";
        const searchTxtValue = searchFilterValues.searchtxt || "";
        const sdateValue = searchFilterValues.sdate ? format(searchFilterValues.sdate, "yyyy.MM.dd") : "";
        const edateValue = searchFilterValues.edate ? format(searchFilterValues.edate, "yyyy.MM.dd") : "";

        updateUrlParams({
            page: 1,
            search: searchValue,
            searchtxt: searchTxtValue,
            sdate: sdateValue,
            edate: edateValue,
            mLevel: searchFilterValues.mLevel,
            detail: undefined,
        });
        setCurrentPage(1);
    };

    // 데이터 수정,삭제 중일 때 로딩 팝업 표시
    useEffect(() => {
        const isLoading = delMemberMutation.isPending || putMemberLevelMutation.isPending;
        setLoadingPop(isLoading);
        return () => setLoadingPop(false);
    }, [delMemberMutation.isPending, putMemberLevelMutation.isPending, setLoadingPop]);

    // 회원 목록 조회
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
    }, [configData, urlParams.mLevel]);

    // 리스트 idx 값만 배열로 (전체 체크박스리스트 만들기)
    useEffect(() => {
        setCheckList(items && items.length > 0 ? items.map(item => item.idx) : []);
        setCheckedList([]);
    }, [items, setCheckList, setCheckedList]);

    // 회원 상세 열기
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

    // 회원등급 변경 확인
    const handleConfirmLevelChange = () => {
        if (checkedList.length === 0) {
            setConfirmPop(true, CONSOLE_CONFIRM_MESSAGES.SELECT_ITEM("회원을"), 1);
        } else if (!level) {
            setConfirmPop(true, CONSOLE_CONFIRM_MESSAGES.SELECT_ITEM("변경하실 등급을"), 1);
        } else {
            setConfirmPop(true, CONSOLE_CONFIRM_MESSAGES.CHANGE_EXPOSURE("회원의 등급을", "변경"), 2, () =>
                handleLevelChange(),
            );
        }
    };

    // 회원등급 변경하기
    const handleLevelChange = () => {
        const body = { idx: checkedList, m_level: Number(level) };
        putMemberLevelMutation.mutate(body, {
            onSuccess: () => {
                toast({ title: CONSOLE_TOAST_MESSAGES.LEVEL_CHANGED });
                setLevel("");
            },
        });
    };

    // 회원탈퇴 확인
    const handleConfirmDelete = () => {
        if (checkedList.length > 0) {
            setConfirmPop(
                true,
                CONSOLE_CONFIRM_MESSAGES.WITHDRAW_MEMBER,
                2,
                () => handleDelete(),
                undefined,
                CONSOLE_CONFIRM_MESSAGES.WITHDRAW_MEMBER_CONTENT,
                "red",
            );
        } else {
            setConfirmPop(true, CONSOLE_CONFIRM_MESSAGES.SELECT_ITEM("회원을"), 1);
        }
    };

    // 회원 탈퇴하기
    const handleDelete = () => {
        const body = { idx: checkedList };
        delMemberMutation.mutate(body, {
            onSuccess: () => {
                toast({ title: CONSOLE_TOAST_MESSAGES.WITHDRAWN });

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

    // 회원 정보수정 취소시
    const handleEditCancel = () => {
        updateUrlParams({
            ...urlParams,
            detail: undefined,
        });
    };

    // 회원탈퇴 완료시
    const onDeleteComplete = () => {
        // 삭제 후 refetch 전에 페이지 이동 처리
        const prevPage = calculatePrevPage(urlParams.page, items.length);

        updateUrlParams({
            ...urlParams,
            page: prevPage,
            detail: undefined,
        });
        setCurrentPage(prevPage);
    };

    return (
        <ResizableSplit
            left={
                <div className="flex h-[calc(100vh-90px)] flex-col">
                    <div className="min-h-0 flex-1">
                        <ScrollArea className="h-full pr-[7px]">
                            <div className="flex h-full flex-col">
                                <div className="border-b border-[#D9D9D9] py-[8px]">
                                    <p className="font-[500]">
                                        <span className="text-console">{makeIntComma(totalCount)} </span>명
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center justify-between py-[8px]">
                                    <div className="flex items-center gap-[8px]">
                                        <AllCheckbox
                                            checked={allCheck}
                                            onChange={e => handleAllCheck(e.currentTarget.checked)}
                                        />
                                        <SelectBox
                                            list={levelOptions}
                                            value={level}
                                            onChange={value => setLevel(value)}
                                            triggerClassName="h-[34px]"
                                        />
                                        <button
                                            type="button"
                                            className="h-[34px] rounded-[8px] border border-[#181818] bg-white px-[16px] font-[500]"
                                            onClick={handleConfirmLevelChange}
                                        >
                                            변경
                                        </button>
                                        <button
                                            type="button"
                                            className="h-[34px] rounded-[8px] bg-[#FEE2E2] px-[16px] font-[500] text-[#E5313D]"
                                            onClick={handleConfirmDelete}
                                        >
                                            회원탈퇴
                                        </button>
                                        <Link
                                            href="/console/member/withdrawn"
                                            className="font-[500] text-[#E5313D] underline"
                                        >
                                            탈퇴회원 목록
                                        </Link>
                                    </div>
                                    <div className="flex items-center gap-[8px]">
                                        {/* <button
                                            type="button"
                                            className="h-[34px] rounded-[8px] bg-console-2 px-[16px] font-[500] text-white"
                                        >
                                            단체문자 전송
                                        </button> */}
                                        <MemberSearchFilterPop
                                            control={control}
                                            register={register}
                                            values={searchFilterValues}
                                            setValue={setValue}
                                            searchTypes={memberListSearchTypes}
                                            handleSearch={handleSearch}
                                            handleReset={() => reset()}
                                            open={searchFilterOpen}
                                            setOpen={setSearchFilterOpen}
                                        />
                                    </div>
                                </div>
                                {isInitialLoading ? (
                                    <LoadingSpinner />
                                ) : items && items.length > 0 ? (
                                    <ul className="flex flex-col gap-[10px]">
                                        {items.map((item, i) => (
                                            <li
                                                key={`member_${i}`}
                                                className={`group flex cursor-pointer items-center rounded-[12px] border bg-white p-[8px_20px] transition-all hover:border-console${
                                                    detailOn === item.idx.toString() ? " border-console" : ""
                                                }`}
                                                onClick={() => handleOpenDetail(item.idx)}
                                            >
                                                <Checkbox
                                                    checked={checkedList.includes(item.idx)}
                                                    onChange={e => handleCheck(e.currentTarget.checked, item.idx)}
                                                />
                                                <p
                                                    className={`w-[25%] truncate px-[16px] text-left font-[500] text-[#222] transition-all group-hover:underline${
                                                        detailOn === item.idx.toString() ? " underline" : ""
                                                    }`}
                                                >
                                                    {item.m_name}
                                                </p>
                                                <ul className="flex flex-1 gap-[20px]">
                                                    <li className="flex w-1/4 flex-col gap-[4px]">
                                                        <p className="text-[12px] text-[#9F9FA5]">회원등급</p>
                                                        <p className="text-[14px]">{item.m_level}</p>
                                                    </li>
                                                    <li className="flex w-1/4 flex-col gap-[4px]">
                                                        <p className="text-[12px] text-[#9F9FA5]">휴대폰번호</p>
                                                        <p className="text-[14px]">{item.m_mobile}</p>
                                                    </li>
                                                    <li className="flex w-1/4 flex-col gap-[4px]">
                                                        <p className="text-[12px] text-[#9F9FA5]">이메일</p>
                                                        <p className="truncate text-[14px]">{item.m_email}</p>
                                                    </li>
                                                    <li className="flex w-1/4 flex-col gap-[4px]">
                                                        <p className="text-[12px] text-[#9F9FA5]">가입일자</p>
                                                        <p className="text-[14px]">{item.reg_date}</p>
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
                        {detailOn ? (
                            <MemberForm
                                detailIdx={detailOn}
                                handleCancel={handleEditCancel}
                                onDeleteComplete={onDeleteComplete}
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
