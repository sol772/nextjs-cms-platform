import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

export interface AllCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}

const AllCheckbox = forwardRef<HTMLInputElement, AllCheckboxProps>(({ className, ...props }, ref) => {
    const boxStyle = twMerge("cursor-pointer flex justify-center items-center gap-[8px]", className);

    return (
        <label className={boxStyle}>
            <input
                type={"checkbox"}
                className="hidden"
                ref={ref} // react-hook-form의 ref와 연결
                {...props}
            />
            <span className="text-[14px] font-[500] leading-[1] underline">전체 선택</span>
        </label>
    );
});

AllCheckbox.displayName = "AllCheckbox"; // forwardRef 사용 시 필요
export default AllCheckbox;
