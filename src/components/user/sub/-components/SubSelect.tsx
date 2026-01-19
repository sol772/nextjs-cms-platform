import Image from "next/image";
import { useState } from "react";

import arrowDown from "@/assets/images/user/arrowDown.png";
import arrowUpGreen from "@/assets/images/user/arrowUpGreen.png";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface SubSelectItem {
    value: string;
    label: string;
}

interface SubSelectProps {
    list: SubSelectItem[];
    value: string;
    onChange: (value: string) => void;
}

export default function SubSelect({ list, value, onChange }: SubSelectProps) {
    const [open, setOpen] = useState(false);

    return (
        <div
            className={`relative border border-[#ddd] ${
                open ? "rounded-[20px_20px_0_0] border-b-0" : "rounded-[30px]"
            }`}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <button
                type="button"
                className={`flex w-full items-center justify-between px-[20px] ${open ? "h-[50px]" : "h-[60px]"}`}
                onClick={() => setOpen(!open)}
            >
                <p className="flex-1 truncate text-left text-[18px] font-[700] text-primary">
                    {list.find(item => item.value === value)?.label || "선택"}
                </p>
                <Image src={open ? arrowUpGreen : arrowDown} alt="화살표" width={24} height={24} />
            </button>
            {open && (
                <div
                    className={`absolute -left-[1px] top-[50px] w-[calc(100%+2px)] bg-white${
                        open ? " rounded-[0_0_20px_20px] border border-t-0 border-[#ddd]" : ""
                    }`}
                >
                    <ScrollArea className="max-h-[300px]">
                        <ul className="flex flex-col gap-[24px] py-[12px]">
                            {list.map(item => (
                                <li key={item.value}>
                                    <button
                                        type="button"
                                        className={`w-full text-[18px] font-[500] ${
                                            value === item.value ? "text-[#222] underline" : "text-[#666]"
                                        }`}
                                        onClick={() => onChange(item.value)}
                                    >
                                        {item.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </ScrollArea>
                </div>
            )}
        </div>
    );
}
