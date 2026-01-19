"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import InputError from "@/components/console/common/InputError";
import LoadingSpinner from "@/components/console/common/LoadingSpinner";
import NoData from "@/components/console/common/NoData";
import Pagination from "@/components/console/common/Pagination";
import DateRangePicker from "@/components/console/form/DateRangePicker";
import Input from "@/components/console/form/Input";
import SelectBox from "@/components/console/form/SelectBox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { initialPage, VisitorListParams } from "@/constants/console/listParams";
import { usePagination } from "@/hooks/common/usePagination";
import { useUrlParams } from "@/hooks/common/useUrlParams";
import { useGetVisitor } from "@/service/console/statistics";
import { getOneMonthAgo, getSevenDaysAgo, getSixMonthsAgo, getThreeMonthsAgo, getToday } from "@/utils/dateUtils";

const schema = z
    .object({
        searchtxt: z.string().optional(),
        dateType: z.string(),
        sdate: z.date().optional(),
        edate: z.date().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.dateType === "5" && (!data.sdate || !data.edate)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "기간을 설정해주세요.",
                path: ["sdate"],
            });
        }
    });

export type SearchFormValues = z.infer<typeof schema>;

interface Item {
    id: number;
    user: string | null;
    clientIp: string;
    previousUrl: string;
    userAgent: string;
    reg_date: string;
}

export default function Visitor() {
    const [items, setItems] = useState<Item[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const initialValues = useMemo<SearchFormValues>(
        () => ({
            searchtxt: "",
            dateType: "1",
            sdate: getSevenDaysAgo(),
            edate: getToday(),
        }),
        [],
    );
    const dateTypeList = [
        { value: "1", label: "최근 1주" },
        { value: "2", label: "1개월" },
        { value: "3", label: "3개월" },
        { value: "4", label: "6개월" },
        { value: "5", label: "직접 입력" },
    ];
    const { urlParams, updateUrlParams } = useUrlParams<VisitorListParams>({
        page: { defaultValue: initialPage, type: "number" },
        searchtxt: { defaultValue: "", type: "string" },
        sdate: { defaultValue: format(getSevenDaysAgo(), "yyyy.MM.dd"), type: "string" },
        edate: { defaultValue: format(getToday(), "yyyy.MM.dd"), type: "string" },
    });
    const { currentPage, pages, setCurrentPage } = usePagination({ totalPages, initialPage: urlParams.page });
    const {
        handleSubmit,
        reset,
        control,
        setValue,
        formState: { errors },
    } = useForm<SearchFormValues>({
        resolver: zodResolver(schema),
        defaultValues: initialValues,
    });
    const searchFilterValues = useWatch({ control });
    const { data: configData, isLoading } = useGetVisitor(
        urlParams.page.toString(),
        urlParams.sdate,
        urlParams.edate,
        urlParams.searchtxt,
    );

    // urlParams sdate 변경 시 동기화
    useEffect(() => {
        setValue("sdate", urlParams.sdate ? new Date(urlParams.sdate) : undefined);
    }, [urlParams.sdate]); // eslint-disable-line react-hooks/exhaustive-deps

    // urlParams edate 변경 시 동기화
    useEffect(() => {
        setValue("edate", urlParams.edate ? new Date(urlParams.edate) : undefined);
    }, [urlParams.edate]); // eslint-disable-line react-hooks/exhaustive-deps

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

    // currentPage 변경 시 URL 파라미터 업데이트
    const handleChangeCurrentPage = (page: number) => {
        updateUrlParams({
            page: page,
        });
        setCurrentPage(page);
    };

    // 기간 날짜 설정
    useEffect(() => {
        if (searchFilterValues.dateType === "1") {
            setValue("sdate", getSevenDaysAgo());
            setValue("edate", getToday());
        }
        if (searchFilterValues.dateType === "2") {
            setValue("sdate", getOneMonthAgo());
            setValue("edate", getToday());
        }
        if (searchFilterValues.dateType === "3") {
            setValue("sdate", getThreeMonthsAgo());
            setValue("edate", getToday());
        }
        if (searchFilterValues.dateType === "4") {
            setValue("sdate", getSixMonthsAgo());
            setValue("edate", getToday());
        }
        if (searchFilterValues.dateType === "5") {
            setValue("sdate", undefined);
            setValue("edate", undefined);
        }
    }, [searchFilterValues.dateType]); // eslint-disable-line react-hooks/exhaustive-deps

    // 검색 하기
    const handleSearch = () => {
        const sdateValue = searchFilterValues.sdate ? format(searchFilterValues.sdate, "yyyy.MM.dd") : "";
        const edateValue = searchFilterValues.edate ? format(searchFilterValues.edate, "yyyy.MM.dd") : "";
        updateUrlParams({
            page: 1,
            searchtxt: searchFilterValues.searchtxt || "",
            sdate: sdateValue,
            edate: edateValue,
        });
    };

    return (
        <div className="h-[calc(100vh-90px)] p-[0_20px_20px_0]">
            <div className="flex h-full w-full flex-col gap-[20px] rounded-[20px] bg-white p-[20px_40px]">
                <div className="flex flex-col gap-[20px]">
                    <p className="text-[24px] font-[600]">방문자 이력 통계</p>
                    <form onSubmit={handleSubmit(handleSearch)}>
                        <div className="flex items-center justify-between">
                            <div className="flex gap-[16px]">
                                <SelectBox
                                    list={dateTypeList}
                                    value={searchFilterValues.dateType}
                                    onChange={value => setValue("dateType", value)}
                                />
                                <div>
                                    <DateRangePicker
                                        startDate={searchFilterValues.sdate ?? null}
                                        endDate={searchFilterValues.edate ?? null}
                                        setStartDate={date => date && setValue("sdate", date)}
                                        setEndDate={date => date && setValue("edate", date)}
                                        startMinDate={
                                            searchFilterValues.dateType !== "5" ? searchFilterValues.sdate : undefined
                                        }
                                        startMaxDate={
                                            searchFilterValues.dateType !== "5" ? searchFilterValues.sdate : undefined
                                        }
                                        endMinDate={
                                            searchFilterValues.dateType !== "5" ? searchFilterValues.edate : undefined
                                        }
                                        endMaxDate={
                                            searchFilterValues.dateType !== "5" ? searchFilterValues.edate : new Date()
                                        }
                                    />
                                    <InputError message={errors.sdate?.message} />
                                </div>
                                <Input
                                    className="max-w-[200px]"
                                    placeholder="접속자를 입력해주세요."
                                    value={searchFilterValues.searchtxt}
                                    onChange={e => setValue("searchtxt", e.currentTarget.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-[10px]">
                                <button
                                    type="button"
                                    className="h-[52px] w-[160px] rounded-[12px] bg-[#F6F7FA] text-[18px] font-[700] text-[#666]"
                                    onClick={() => reset(initialValues)}
                                >
                                    초기화
                                </button>
                                <button
                                    type="submit"
                                    className="h-[52px] w-[160px] rounded-[12px] bg-console-2 text-[18px] font-[700] text-white"
                                >
                                    검색
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="min-h-0 flex-1">
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : items && items.length > 0 ? (
                        <ScrollArea className="h-full">
                            <table>
                                <thead className="border-b border-t border-[#D9D9D9]">
                                    <tr>
                                        <th className="bg-[#FBFBFC] py-[16px] font-[500] text-[#666]">접속자</th>
                                        <th className="bg-[#FBFBFC] py-[16px] font-[500] text-[#666]">접속 IP</th>
                                        <th className="bg-[#FBFBFC] py-[16px] font-[500] text-[#666]">접속 경로</th>
                                        <th className="bg-[#FBFBFC] py-[16px] font-[500] text-[#666]">접속 브라우저</th>
                                        <th className="bg-[#FBFBFC] py-[16px] font-[500] text-[#666]">접근일시</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, i) => (
                                        <tr key={`list_${i}`} className="border-b border-[#D9D9D9] text-center">
                                            <td className="py-[16px] text-[#666]">{item.user || "-"}</td>
                                            <td className="py-[16px] text-[#666]">{item.clientIp}</td>
                                            <td className="py-[16px] text-[#666]">{item.previousUrl}</td>
                                            <td className="py-[16px] text-[#666]">{item.userAgent}</td>
                                            <td className="py-[16px] text-[#666]">{item.reg_date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </ScrollArea>
                    ) : (
                        <NoData className="h-full" txt="데이터가 없습니다." subTxt={false} />
                    )}
                </div>
                {!isLoading && totalCount > 0 && (
                    <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                        pages={pages}
                        handleChangePage={handleChangeCurrentPage}
                    />
                )}
            </div>
        </div>
    );
}
