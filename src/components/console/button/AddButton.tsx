import Image from "next/image";
import React from "react";

import icPlusConsole from "@/assets/images/console/icPlusConsole.svg";

interface AddButtonProps {
    txt: string;
    handleClick?: () => void;
}

const AddButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & AddButtonProps>(
    ({ txt, handleClick, ...props }, ref) => (
        <button
            ref={ref}
            type="button"
            className="flex h-[34px] items-center justify-center gap-[8px] rounded-[8px] border border-[#DADEE4] bg-white px-[16px] font-[500] text-[#666]"
            onClick={handleClick}
            {...props}
        >
            <Image src={icPlusConsole} alt="추가" className="size-[20px]" />
            <span>{txt}</span>
        </button>
    ),
);

AddButton.displayName = "AddButton";
export default AddButton;
