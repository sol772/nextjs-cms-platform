import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

import { useAuthStore } from "@/store/common/useAuthStore";

import Textarea from "./Textarea";

interface CommentFormProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string;
    value: string;
    handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handlePost: () => void;
}

const CommentForm = forwardRef<HTMLTextAreaElement, CommentFormProps>(
    ({ className, value, handleChange, handlePost, ...props }, ref) => {
        const { loginUser } = useAuthStore();

        return (
            <div className={twMerge("flex justify-between gap-[12px]", className)}>
                <Textarea
                    boxClassName="flex-1 h-[100px]"
                    value={value}
                    onChange={handleChange}
                    {...props}
                    ref={ref}
                    disabled={!loginUser.m_email}
                    placeholder={!loginUser.m_email ? "로그인 후 이용해주세요." : props.placeholder}
                />
                <button
                    type="button"
                    className="size-[100px] rounded-[5px] bg-console-2 text-[20px] font-[500] text-white disabled:bg-[#ddd]"
                    onClick={handlePost}
                    disabled={!loginUser.m_email}
                >
                    등록
                </button>
            </div>
        );
    },
);

CommentForm.displayName = "CommentForm";
export default CommentForm;
