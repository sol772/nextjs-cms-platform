import * as React from "react";

import SelectBox from "@/components/console/form/SelectBox";

interface ListSizeSelectProps {
    value: number;
    onChange: (value: number) => void;
    options?: { value: string; label: string }[];
    className?: string;
}

const ListSizeSelect = React.forwardRef<HTMLButtonElement, ListSizeSelectProps>(
    (
        {
            value,
            onChange,
            options = [
                { value: "10", label: "10개씩" },
                { value: "20", label: "20개씩" },
                { value: "30", label: "30개씩" },
                { value: "50", label: "50개씩" },
            ],
            className = "w-[160px]",
        },
        ref,
    ) => {
        return (
            <SelectBox
                ref={ref}
                list={options}
                triggerClassName={className}
                value={String(value)}
                onChange={value => onChange(Number(value))}
            />
        );
    },
);

ListSizeSelect.displayName = "ListSizeSelect";

export default ListSizeSelect;
