import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

import Input, { InputProps } from "./Input";

interface InputWithButtonProps extends InputProps {
    boxClassName?: string;
    btnText: string;
    handleClick: () => void;
    btnDisabled?: boolean;
    children?: React.ReactNode;
}

const InputWithButton = forwardRef<HTMLInputElement, InputWithButtonProps>(
    ({ boxClassName, btnText, handleClick, btnDisabled, children, ...props }, ref) => {
        return (
            <div className={twMerge("relative", boxClassName)}>
                <Input ref={ref} {...props} className="pr-[110px]" />
                <div className="absolute right-[12px] top-0 flex h-full items-center">
                    {children}
                    <button
                        type="button"
                        className={twMerge(
                            "px-[14px] h-[32px] transition-colors duration-200 text-[12px] rounded-[5px] border",
                            btnDisabled
                                ? "text-[#666] bg-[#F8F8F8] border-[#F8F8F8]"
                                : "bg-white text-primary border-primary",
                        )}
                        onClick={handleClick}
                        disabled={btnDisabled}
                    >
                        {btnText}
                    </button>
                </div>
            </div>
        );
    },
);

InputWithButton.displayName = "InputWithButton";

export default InputWithButton;
