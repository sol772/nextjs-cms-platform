import Image from "next/image";
import React from "react";

import icAddSubConsole from "@/assets/images/console/icAddSubConsole.svg";

interface AddSubButtonProps {
    txt: string;
    handleClick?: () => void;
}

const AddSubButton = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & AddSubButtonProps
>(({ txt, handleClick, ...props }, ref) => (
    <button
        ref={ref}
        type="button"
        className="flex h-[34px] items-center justify-center gap-[8px] rounded-[8px] border border-[#DADEE4] bg-white px-[16px] font-[500] text-[#666]"
        onClick={handleClick}
        {...props}
    >
        <Image src={icAddSubConsole} alt="추가" className="size-[20px]" />
        <span>{txt}</span>
    </button>
));

AddSubButton.displayName = "AddSubButton";
export default AddSubButton;
