import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    boxClassName?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ boxClassName, ...props }, ref) => {
    const boxStyle = twMerge(`h-[200px]${props.maxLength ? " flex-1 flex items-end gap-[8px]" : ""}`, boxClassName);
    const textareaStyle = twMerge(
        "w-full h-full resize-none border border-[#D9D9D9] rounded-[5px] focus:border-[#0CB2AD] p-[12px] text-[14px] placeholder:text-[#999]",
        props.className,
    );
    return (
        <div className={boxStyle}>
            <textarea className={textareaStyle} {...props} ref={ref} maxLength={props.maxLength} />
            {props.maxLength && (
                <p className="w-[76px] whitespace-nowrap text-center text-[14px]">
                    <span className="text-[#0CB2AD]">{props.value?.toString().length ?? 0} </span> / {props.maxLength}
                </p>
            )}
        </div>
    );
});

Textarea.displayName = "Textarea";
export default Textarea;
