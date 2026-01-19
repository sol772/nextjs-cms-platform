import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

import Input, { InputProps } from "./Input";

interface InputBoxProps extends InputProps {
    children: React.ReactNode;
    boxClassName?: string;
}

const InputBox = forwardRef<HTMLInputElement, InputBoxProps>(({ children, boxClassName, ...props }, ref) => {
    return (
        <div className={twMerge("relative", boxClassName)}>
            {children}
            <Input ref={ref} {...props} />
        </div>
    );
});

InputBox.displayName = "InputBox";

export default InputBox;
