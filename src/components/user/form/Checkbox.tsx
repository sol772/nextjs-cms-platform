import Image from "next/image";
import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

import checkbox from "@/assets/images/console/checkbox.svg";
import checkboxOn from "@/assets/images/console/checkboxOn.svg";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
    txt?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ className, txt, ...props }, ref) => {
    const boxStyle = twMerge("cursor-pointer flex justify-center items-center gap-[8px]", className);

    return (
        <label
            className={boxStyle}
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
        >
            <input
                type={"checkbox"}
                className="hidden"
                ref={ref} // react-hook-form의 ref와 연결
                {...props}
            />
            <div>
                <Image src={props.checked ? checkboxOn : checkbox} alt="체크박스" />
            </div>
            {txt && <span className="leading-[1]">{txt}</span>}
        </label>
    );
});

Checkbox.displayName = "Checkbox"; // forwardRef 사용 시 필요
export default Checkbox;
