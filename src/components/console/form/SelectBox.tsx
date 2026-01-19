import React from "react";
import { twMerge } from "tailwind-merge";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface SelectItem {
    value: string;
    label: string;
}

interface SelectBoxProps {
    onChange?: (value: string) => void;
    triggerClassName?: string;
    placeholder?: string;
    contentClassName?: string;
    list: SelectItem[];
    value?: string;
    defaultValue?: string;
    level?: boolean;
}

const SelectBox = React.forwardRef<HTMLButtonElement, SelectBoxProps>(
    (
        {
            onChange,
            triggerClassName,
            placeholder = "선택",
            contentClassName,
            list,
            value,
            defaultValue,
            level = false,
        },
        ref,
    ) => {
        const boxClass = twMerge(
            "h-[48px] w-auto min-w-[160px] bg-[#fff] px-[12px] shadow-none border-none text-[16px] ring-[#D9D9D9] rounded-[8px] leading-1 ring-inset ring-1 focus:ring-1 focus:ring-console focus:ring-offset-0 data-[state=open]:ring-console data-[placeholder]:text-[#999]",
            triggerClassName,
        );
        const selectClass = twMerge("bg-[#fff] text-[15px] border-[#D9D9D9]", contentClassName);

        return (
            <Select onValueChange={onChange} value={value} defaultValue={defaultValue}>
                <SelectTrigger className={boxClass} ref={ref}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent className={selectClass}>
                    {list.map((item, i) => {
                        return (
                            <SelectItem key={i} value={item.value} className="pl-[12px]">
                                {item.label}
                                {level && (
                                    <span className="pl-[8px] text-[12px] font-[700] text-console">
                                        lv.{item.value}
                                    </span>
                                )}
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>
        );
    },
);

SelectBox.displayName = "SelectBox";

export default SelectBox;
