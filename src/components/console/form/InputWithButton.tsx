import { forwardRef, useState } from "react";
import { twMerge } from "tailwind-merge";

import Input, { InputProps } from "./Input";

interface InputWithButtonProps extends InputProps {
    boxClassName?: string;
    btnText: string;
    handleClick: (value: string) => void;
}

const InputWithButton = forwardRef<HTMLInputElement, InputWithButtonProps>(
    ({ boxClassName, btnText, handleClick, ...props }, ref) => {
        const [isFocused, setIsFocused] = useState(false);
        const [inputValue, setInputValue] = useState(props.defaultValue || "");

        const handleButtonClick = () => {
            handleClick?.(inputValue?.toString() || "");
        };

        return (
            <div className={twMerge("relative", boxClassName)}>
                <Input
                    ref={ref}
                    {...props}
                    className="pr-[50px]"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={e => setInputValue(e.currentTarget.value)}
                />
                <button
                    type="button"
                    className={twMerge(
                        "absolute right-0 top-0 h-full px-[12px] underline transition-colors duration-200",
                        isFocused ? "text-[#007AFF]" : "text-[#9F9FA5]",
                    )}
                    onClick={handleButtonClick}
                >
                    {btnText}
                </button>
            </div>
        );
    },
);

InputWithButton.displayName = "InputWithButton";

export default InputWithButton;
