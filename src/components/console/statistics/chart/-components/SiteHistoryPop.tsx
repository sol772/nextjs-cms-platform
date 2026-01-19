import { PopoverClose } from "@radix-ui/react-popover";
import Image from "next/image";

import popClose from "@/assets/images/console/popClose.svg";
import LoadingSpinner from "@/components/console/common/LoadingSpinner";
import NoData from "@/components/console/common/NoData";
import { PopoverContent } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetAgent, useGetUrl } from "@/service/console/statistics";
import { makeIntComma } from "@/utils/numberUtils";

interface SiteHistoryPopProps {
    url?: boolean;
}

interface Item {
    row_number: number;
    previousUrl?: string;
    userAgent?: string;
    cnt: number;
}

export default function SiteHistoryPop({ url = false }: SiteHistoryPopProps) {
    const { data: urlData, isLoading: urlLoading } = useGetUrl({ enabled: url });
    const { data: agentData, isLoading: agentLoading } = useGetAgent({ enabled: !url });

    // 공통 렌더링 함수
    const renderTableRows = (
        data: { data?: Item[] } | undefined,
        isLoading: boolean,
        dataKey: "previousUrl" | "userAgent",
    ) => {
        if (isLoading) {
            return (
                <tr>
                    <td colSpan={3} className="py-[50px]">
                        <LoadingSpinner />
                    </td>
                </tr>
            );
        }

        if (data?.data && data.data.length > 0) {
            return data.data.map((item: Item, index: number) => (
                <tr key={`${dataKey}_item_${index}`} className="border-b border-[#D9D9D9] text-center">
                    <td className="py-[16px] font-[500] text-[#666]">{item.row_number}</td>
                    <td className="py-[16px] font-[500] text-[#666]">{item[dataKey]}</td>
                    <td className="py-[16px] font-[500] text-[#666]">{makeIntComma(item.cnt)}</td>
                </tr>
            ));
        }

        if (data?.data && data.data.length === 0) {
            return (
                <tr>
                    <td colSpan={3} className="py-[50px]">
                        <NoData txt="데이터가 없습니다." subTxt={false} />
                    </td>
                </tr>
            );
        }

        return null;
    };

    const title = url ? "최다 접속 경로" : "최다 브라우저";
    const columnTitle = url ? "경로" : "브라우저";

    return (
        <PopoverContent className="w-[680px] rounded-[12px] bg-white p-0 shadow-[0_0_16px_0_rgba(0,0,0,0.12)]">
            <div className="flex items-center justify-between border-b border-[#ddd] p-[16px_20px]">
                <p className="text-[20px] font-[600]">{title}</p>
                <PopoverClose>
                    <Image src={popClose} alt="닫기" />
                </PopoverClose>
            </div>
            <ScrollArea className="max-h-[400px] min-h-[200px] p-[20px]">
                <p className="pb-[12px] font-[500] text-[#666]">* 최대 20개까지 확인할 수 있습니다.</p>
                <table>
                    <thead className="border-b border-t border-[#D9D9D9]">
                        <tr>
                            <th className="bg-[#FBFBFC] py-[16px] font-[500] text-[#666]">순위</th>
                            <th className="bg-[#FBFBFC] py-[16px] font-[500] text-[#666]">{columnTitle}</th>
                            <th className="bg-[#FBFBFC] py-[16px] font-[500] text-[#666]">횟수</th>
                        </tr>
                    </thead>
                    <tbody>
                        {url
                            ? renderTableRows(urlData, urlLoading, "previousUrl")
                            : renderTableRows(agentData, agentLoading, "userAgent")}
                    </tbody>
                </table>
            </ScrollArea>
        </PopoverContent>
    );
}
