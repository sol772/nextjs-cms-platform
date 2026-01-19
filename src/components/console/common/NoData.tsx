import { twMerge } from "tailwind-merge";

export default function NoData({
    txt = "등록된 콘텐츠가 없습니다.",
    className = "",
    subTxt = true,
}: {
    txt?: string;
    className?: string;
    subTxt?: boolean;
}) {
    return (
        <div className={twMerge("flex items-center justify-center", className)}>
            <div className="flex flex-col items-center gap-[8px]">
                <p className="text-[20px]">{txt}</p>
                {subTxt && <p className="text-[#666]">새로운 콘텐츠를 등록해 주세요.</p>}
            </div>
        </div>
    );
}
