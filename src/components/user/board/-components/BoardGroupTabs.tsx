import { twMerge } from "tailwind-merge";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface BoardGroupTabsProps {
    list: { value: string; label: string }[];
    active: string;
    handleClick: (value: string) => void;
}

export default function BoardGroupTabs({ list, active, handleClick }: BoardGroupTabsProps) {
    const liStyle =
        "cursor-pointer font-[500] text-[#666] md:text-[18px] relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-[102%] after:bg-primary after:opacity-0";
    const liOnStyle = twMerge(liStyle, "text-primary font-[700] after:opacity-100");

    return (
        <ScrollArea>
            <div className="mx-auto w-full max-w-[1400px] md:p-[20px_28px] xl:px-[20px]">
                <ul className="flex w-max items-center gap-[20px] p-[16px_20px] md:gap-[60px] md:rounded-[30px] md:px-[24px] md:shadow-[0_0_20px_0_rgba(0,0,0,0.08)] xl:w-full xl:flex-wrap xl:px-[94px]">
                    {list.map((tab, i) => (
                        <li
                            key={`tab_${i}`}
                            className={active === tab.value ? liOnStyle : liStyle}
                            onClick={() => handleClick(tab.value)}
                        >
                            {tab.label}
                        </li>
                    ))}
                </ul>
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
}
