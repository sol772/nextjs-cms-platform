"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { z } from "zod";

import InputError from "@/components/console/common/InputError";
import Checkbox from "@/components/console/form/Checkbox";
import DateRangePicker from "@/components/console/form/DateRangePicker";
import SelectBox from "@/components/console/form/SelectBox";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { initialStatisticsDateType, statisticsDateTypes, StatisticsListParams } from "@/constants/console/listParams";
import { useUrlParams } from "@/hooks/common/useUrlParams";
import { useGetAllStatistics, useGetChart, useGetData } from "@/service/console/statistics";
import { usePopupStore } from "@/store/console/usePopupStore";
import { getOneMonthAgo, getSevenDaysAgo, getSixMonthsAgo, getThreeMonthsAgo, getToday } from "@/utils/dateUtils";
import { makeIntComma } from "@/utils/numberUtils";

import SiteHistoryPop from "./-components/SiteHistoryPop";

const schema = z
    .object({
        dateType: z.string(),
        sdate: z.date().optional(),
        edate: z.date().optional(),
        type: z.string(),
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

interface ChartDataset {
    label: string;
    data: number[];
}

interface ChartData {
    type: string;
    scales: string;
    legendPosition: string;
    label: string;
    labels: string[];
    datasets: ChartDataset[];
}

interface SiteData {
    date: string;
    logsCnt: number;
    userCnt: number;
    boardCnt: number;
    commentCnt: number;
}

export default function Chart() {
    const initialValues = useMemo<SearchFormValues>(
        () => ({
            dateType: "1",
            sdate: getSevenDaysAgo(),
            edate: getToday(),
            type: initialStatisticsDateType,
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
    const [currentDate, setCurrentDate] = useState("");
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [activeSeries, setActiveSeries] = useState<Array<string>>([]);
    const [urlPopOpen, setUrlPopOpen] = useState(false);
    const [agentPopOpen, setAgentPopOpen] = useState(false);
    const { urlParams, updateUrlParams } = useUrlParams<StatisticsListParams>({
        sdate: { defaultValue: format(getSevenDaysAgo(), "yyyy.MM.dd"), type: "string" },
        edate: { defaultValue: format(getToday(), "yyyy.MM.dd"), type: "string" },
        type: { defaultValue: initialStatisticsDateType, type: "string", validValues: statisticsDateTypes },
    });
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
    const { data: configAllData, isLoading: isAllStatisticsLoading } = useGetAllStatistics();
    const { data: configChartData, isLoading: isChartLoading } = useGetChart(
        urlParams.sdate,
        urlParams.edate,
        urlParams.type,
    );
    const { data: configSiteData, isLoading: isSiteDataLoading } = useGetData(urlParams.sdate, urlParams.edate);
    const { setLoadingPop } = usePopupStore();

    // 데이터 조회,수정 중일 때 로딩 팝업 표시
    useEffect(() => {
        const isLoading = isAllStatisticsLoading || isChartLoading || isSiteDataLoading;
        setLoadingPop(isLoading);
        return () => {
            setLoadingPop(false);
            setCurrentDate(format(new Date(), "yyyy.MM.dd HH:mm"));
        };
    }, [isAllStatisticsLoading, isChartLoading, isSiteDataLoading]); // eslint-disable-line react-hooks/exhaustive-deps

    // urlParams sdate 변경 시 동기화
    useEffect(() => {
        setValue("sdate", urlParams.sdate ? new Date(urlParams.sdate) : undefined);
    }, [urlParams.sdate]); // eslint-disable-line react-hooks/exhaustive-deps

    // urlParams edate 변경 시 동기화
    useEffect(() => {
        setValue("edate", urlParams.edate ? new Date(urlParams.edate) : undefined);
    }, [urlParams.edate]); // eslint-disable-line react-hooks/exhaustive-deps

    // urlParams type 변경 시 동기화
    useEffect(() => {
        setValue("type", urlParams.type);
    }, [urlParams.type]); // eslint-disable-line react-hooks/exhaustive-deps

    // API 데이터를 Recharts 형식으로 변환하는 함수
    const transformChartData = (data: ChartData) => {
        if (!data?.labels || !data?.datasets) return [];

        return data.labels.map((label: string, index: number) => {
            const dataPoint: Record<string, string | number> = { name: label };

            data.datasets.forEach((dataset: ChartDataset) => {
                dataPoint[dataset.label] = dataset.data[index] || 0;
            });

            return dataPoint;
        });
    };

    // 통계 차트 데이터 조회
    useEffect(() => {
        if (configChartData) {
            setChartData(configChartData.data);
        }
    }, [configChartData]);

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
            sdate: sdateValue,
            edate: edateValue,
            type: searchFilterValues.type,
        });
    };

    const handleLegendClick = (dataKey: string) => {
        if (activeSeries.includes(dataKey)) {
            setActiveSeries(activeSeries.filter(el => el !== dataKey));
        } else {
            setActiveSeries(prev => [...prev, dataKey]);
        }
    };

    return (
        <div className="h-[calc(100vh-90px)]">
            <ScrollArea className="h-full pr-[20px]">
                <div className="pb-[20px]">
                    <div className="flex flex-col gap-[20px] rounded-[20px] bg-white p-[20px_40px]">
                        <div className="flex items-center gap-[12px]">
                            <p className="text-[24px] font-[600]">전체 통계</p>
                            <p className="text-[18px] font-[500] text-[#666]">
                                사이트 개설 이후 <span className="text-black">{currentDate}</span>까지의 기준 누적
                                수치입니다.
                            </p>
                        </div>
                        <ul className="flex items-center justify-between">
                            <li className="flex w-[calc(50%-12px)] items-center py-[8px]">
                                <p className="min-w-[140px] font-[500]">최다 접속 경로</p>
                                <p className="flex-1 text-[#666]">
                                    {configAllData?.data?.logsTopUrl?.previousUrl || "-"}
                                </p>
                                <Popover open={urlPopOpen} onOpenChange={setUrlPopOpen}>
                                    <PopoverTrigger asChild>
                                        <button
                                            type="button"
                                            className="h-[34px] rounded-[8px] bg-[#F6F7FA] px-[16px] text-[#666]"
                                        >
                                            상세보기
                                        </button>
                                    </PopoverTrigger>
                                    {urlPopOpen && <SiteHistoryPop url={true} />}
                                </Popover>
                            </li>
                            <li className="flex w-[calc(50%-12px)] items-center py-[8px]">
                                <p className="min-w-[140px] font-[500]">최다 브라우저</p>
                                <p className="flex-1 text-[#666]">
                                    {configAllData?.data?.logsTopAgent?.userAgent || "-"}
                                </p>
                                <Popover open={agentPopOpen} onOpenChange={setAgentPopOpen}>
                                    <PopoverTrigger asChild>
                                        <button
                                            type="button"
                                            className="h-[34px] rounded-[8px] bg-[#F6F7FA] px-[16px] text-[#666]"
                                        >
                                            상세보기
                                        </button>
                                    </PopoverTrigger>
                                    {agentPopOpen && <SiteHistoryPop />}
                                </Popover>
                            </li>
                        </ul>
                        <ul className="flex items-center rounded-[12px] border border-[#D9D9D9] py-[32px]">
                            <li className="flex w-1/4 flex-col items-center gap-[16px] border-r border-[#D9D9D9]">
                                <p className="text-[18px] font-[500] text-[#666]">총 방문</p>
                                <p className="flex items-center gap-[8px] text-[30px] font-[600]">
                                    {makeIntComma(configAllData?.data?.logsTotalCnt || 0)}
                                    <span className="text-[24px]">명</span>
                                </p>
                            </li>
                            <li className="flex w-1/4 flex-col items-center gap-[16px] border-r border-[#D9D9D9]">
                                <p className="text-[18px] font-[500] text-[#666]">총 가입회원</p>
                                <p className="flex items-center gap-[8px] text-[30px] font-[600]">
                                    {makeIntComma(configAllData?.data?.userTotalCnt || 0)}
                                    <span className="text-[24px]">명</span>
                                </p>
                            </li>
                            <li className="flex w-1/4 flex-col items-center gap-[16px] border-r border-[#D9D9D9]">
                                <p className="text-[18px] font-[500] text-[#666]">총 게시글</p>
                                <p className="flex items-center gap-[8px] text-[30px] font-[600]">
                                    {makeIntComma(configAllData?.data?.boardTotalCnt || 0)}
                                    <span className="text-[24px]">개</span>
                                </p>
                            </li>
                            <li className="flex w-1/4 flex-col items-center gap-[16px]">
                                <p className="text-[18px] font-[500] text-[#666]">총 댓글</p>
                                <p className="flex items-center gap-[8px] text-[30px] font-[600]">
                                    {makeIntComma(configAllData?.data?.commentTotalCnt || 0)}
                                    <span className="text-[24px]">개</span>
                                </p>
                            </li>
                        </ul>
                        <div className="flex flex-col gap-[20px]">
                            <p className="text-[24px] font-[600]">기간별 종합통계</p>
                            <form onSubmit={handleSubmit(handleSearch)}>
                                <div className="flex justify-between">
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
                                                    searchFilterValues.dateType !== "5"
                                                        ? searchFilterValues.sdate
                                                        : undefined
                                                }
                                                startMaxDate={
                                                    searchFilterValues.dateType !== "5"
                                                        ? searchFilterValues.sdate
                                                        : undefined
                                                }
                                                endMinDate={
                                                    searchFilterValues.dateType !== "5"
                                                        ? searchFilterValues.edate
                                                        : undefined
                                                }
                                                endMaxDate={
                                                    searchFilterValues.dateType !== "5"
                                                        ? searchFilterValues.edate
                                                        : new Date()
                                                }
                                            />
                                            <InputError message={errors.sdate?.message} />
                                        </div>
                                        <Controller
                                            name="type"
                                            control={control}
                                            render={({ field }) => (
                                                <Checkbox
                                                    {...field}
                                                    checked={field.value === "monthly"}
                                                    txt="월별로 보기"
                                                    className="mt-[16px] items-start"
                                                    onChange={e => {
                                                        const check = e.currentTarget.checked;
                                                        setValue("type", check ? "monthly" : "daily");
                                                    }}
                                                />
                                            )}
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
                        <div className="h-[1px] w-full bg-[#D9D9D9]" />
                        <div className="h-[460px] overflow-hidden rounded-[8px] bg-[#1E293B] p-[20px]">
                            {chartData && chartData.datasets.length > 0 && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={transformChartData(chartData)}
                                        margin={{
                                            top: 5,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend
                                            iconType="circle"
                                            onClick={props => {
                                                handleLegendClick(props.dataKey as string);
                                            }}
                                        />
                                        {chartData.datasets.map((dataset: ChartDataset, index: number) => (
                                            <Line
                                                key={dataset.label}
                                                hide={activeSeries.includes(dataset.label)}
                                                type="monotone"
                                                dataKey={dataset.label}
                                                stroke={["#8884d8", "#82ca9d", "#ffc658", "#ff7300"][index % 4]}
                                                activeDot={{ r: 8 }}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                        <ul className="flex items-center rounded-[12px] border border-[#D9D9D9] py-[32px]">
                            <li className="flex w-1/4 flex-col items-center gap-[16px] border-r border-[#D9D9D9]">
                                <p className="text-[18px] font-[500] text-[#666]">최근 1주 누적 방문</p>
                                <p className="flex items-center gap-[8px] text-[30px] font-[600]">
                                    {makeIntComma(configSiteData?.data?.totalLogCnt || 0)}
                                    <span className="text-[24px]">명</span>
                                </p>
                            </li>
                            <li className="flex w-1/4 flex-col items-center gap-[16px] border-r border-[#D9D9D9]">
                                <p className="text-[18px] font-[500] text-[#666]">최근 1주 누적 가입회원</p>
                                <p className="flex items-center gap-[8px] text-[30px] font-[600]">
                                    {makeIntComma(configSiteData?.data?.userTotalCnt || 0)}
                                    <span className="text-[24px]">명</span>
                                </p>
                            </li>
                            <li className="flex w-1/4 flex-col items-center gap-[16px] border-r border-[#D9D9D9]">
                                <p className="text-[18px] font-[500] text-[#666]">최근 1주 누적 게시글</p>
                                <p className="flex items-center gap-[8px] text-[30px] font-[600]">
                                    {makeIntComma(configSiteData?.data?.boardTotalCnt || 0)}
                                    <span className="text-[24px]">개</span>
                                </p>
                            </li>
                            <li className="flex w-1/4 flex-col items-center gap-[16px]">
                                <p className="text-[18px] font-[500] text-[#666]">최근 1주 누적 댓글</p>
                                <p className="flex items-center gap-[8px] text-[30px] font-[600]">
                                    {makeIntComma(configSiteData?.data?.commentTotalCnt || 0)}
                                    <span className="text-[24px]">개</span>
                                </p>
                            </li>
                        </ul>
                        {configSiteData?.data?.list && configSiteData?.data?.list?.length > 0 && (
                            <table>
                                <thead className="border-b border-t border-[#D9D9D9]">
                                    <tr>
                                        <th className="bg-[#FBFBFC] py-[16px] font-[500] text-[#666]">일자</th>
                                        <th className="bg-[#FBFBFC] py-[16px] font-[500] text-[#666]">방문자</th>
                                        <th className="bg-[#FBFBFC] py-[16px] font-[500] text-[#666]">가입회원</th>
                                        <th className="bg-[#FBFBFC] py-[16px] font-[500] text-[#666]">게시글</th>
                                        <th className="bg-[#FBFBFC] py-[16px] font-[500] text-[#666]">댓글</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {configSiteData?.data?.list?.map((item: SiteData, index: number) => (
                                        <tr key={`list_${index}`} className="border-b border-[#D9D9D9] text-center">
                                            <td className="py-[16px] text-[#666]">{item.date}</td>
                                            <td className="py-[16px] text-[#666]">{makeIntComma(item.logsCnt)}</td>
                                            <td className="py-[16px] text-[#666]">{makeIntComma(item.userCnt)}</td>
                                            <td className="py-[16px] text-[#666]">{makeIntComma(item.boardCnt)}</td>
                                            <td className="py-[16px] text-[#666]">{makeIntComma(item.commentCnt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
