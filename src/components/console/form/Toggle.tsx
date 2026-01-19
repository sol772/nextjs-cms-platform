import React from "react";
import { twMerge } from "tailwind-merge";

import { Switch } from "@/components/ui/switch";

interface ToggleProps {
    checked: boolean;
    handleChange: (checked: boolean) => void;
    txt?: string;
    onLabel?: string;
    offLabel?: string;
    id?: string;
    className?: string;
    switchClassName?: string;
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
    ({ checked, handleChange, txt, onLabel, offLabel, id, className, switchClassName }, ref) => (
        <div className={twMerge("flex items-center gap-[8px]", className)}>
            <Switch
                className={twMerge(
                    "w-[48px] h-[24px] border-none data-[state=checked]:bg-[#0CB2AD] data-[state=unchecked]:bg-[#D9D9D9] [&>span]:size-[18px] [&>span]:bg-white [&>span]:data-[state=checked]:translate-x-[27px] [&>span]:data-[state=unchecked]:translate-x-[3px]",
                    switchClassName,
                )}
                checked={checked}
                onCheckedChange={handleChange}
                id={id}
                ref={ref}
                onClick={e => e.stopPropagation()}
                onPointerDown={e => e.stopPropagation()}
                onMouseDown={e => e.stopPropagation()}
            />
            {(txt || onLabel || offLabel) && (
                <label className="cursor-pointer text-[16px] font-[400] text-[#666]" htmlFor={id}>
                    {txt ? txt : checked ? onLabel : offLabel}
                </label>
            )}
        </div>
    ),
);

Toggle.displayName = "Toggle";
export default Toggle;
