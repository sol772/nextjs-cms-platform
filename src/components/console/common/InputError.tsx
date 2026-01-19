import { twMerge } from "tailwind-merge";

interface InputErrorProps {
    message?: string;
    className?: string;
}

export default function InputError({ message, className }: InputErrorProps) {
    if (!message) return null;

    return (
        <p
            className={twMerge(
                "text-[13px] text-[#FF5049] pt-[4px] text-left",
                className
            )}
        >
            {message}
        </p>
    );
}
