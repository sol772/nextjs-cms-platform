import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

import Textarea from "./Textarea";

interface CommentFormProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string;
    value: string;
    handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handlePost: () => void;
}

const CommentForm = forwardRef<HTMLTextAreaElement, CommentFormProps>(
    ({ className, value, handleChange, handlePost, ...props }, ref) => {
        return (
            <div className={twMerge("flex justify-between gap-[12px]", className)}>
                <Textarea boxClassName="flex-1 h-[100px]" value={value} onChange={handleChange} {...props} ref={ref} />
                <button
                    type="button"
                    className="size-[100px] rounded-[5px] bg-console-2 text-[20px] font-[500] text-white"
                    onClick={handlePost}
                >
                    등록
                </button>
            </div>
        );
    },
);

CommentForm.displayName = "CommentForm";
export default CommentForm;
