import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
    txt: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(({ txt, ...props }, ref) => {
    const boxStyle = "block size-[20px] bg-white rounded-full border border-[#D9D9D9] relative";
    const boxCheckedStyle = twMerge(
        boxStyle,
        "border-none after:absolute after:content-[''] after:w-full after:h-full after:rounded-full after:top-0 after:left-0 after:border-[6px] after:border-console-2",
    );
    const labelStyle = twMerge("flex items-center gap-[8px]", props.disabled ? "cursor-default" : "cursor-pointer");

    return (
        <label className={labelStyle}>
            <input
                type={"radio"}
                className="hidden"
                ref={ref} // react-hook-form의 ref와 연결
                {...props}
            />
            <span className={props.checked ? boxCheckedStyle : boxStyle} />
            <span className="leading-[1]">{txt}</span>
        </label>
    );
});

Radio.displayName = "Radio"; // forwardRef 사용 시 필요
export default Radio;
