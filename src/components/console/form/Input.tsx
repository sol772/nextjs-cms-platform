import { forwardRef } from "react";
import { NumberFormatBaseProps, NumericFormat, NumericFormatProps, PatternFormat } from "react-number-format";
import { twMerge } from "tailwind-merge";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    formattedInput?: boolean; // 기본패턴 핸드폰 번호
    format?: string; // 패턴지정
    numberInput?: boolean; // 숫자만 입력
    thousandSeparator?: boolean; // 천 단위 콤마
}

// forwardRef를 사용해서 react-hook-form과 연결
const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            type = "text",
            placeholder = "",
            className,
            disabled = false,
            formattedInput,
            format,
            numberInput,
            thousandSeparator,
            ...props
        },
        ref,
    ) => {
        const inputStyle = twMerge(
            "w-full h-[48px] px-[12px] text-[#222] border border-[#D9D9D9] rounded-[8px] focus:border-console placeholder:text-[#9F9FA5] disabled:bg-[#F8F8F8] transition duration-200",
            className,
        );
        return (
            <>
                {formattedInput ? (
                    <PatternFormat
                        format={format ? format : "###-####-####"}
                        className={inputStyle}
                        placeholder={placeholder}
                        disabled={disabled}
                        getInputRef={ref} // react-hook-form의 ref와 연결
                        {...props}
                        defaultValue={props.defaultValue as NumberFormatBaseProps["defaultValue"]}
                        value={props.value as NumberFormatBaseProps["value"]}
                    />
                ) : numberInput ? (
                    <NumericFormat
                        className={inputStyle}
                        allowLeadingZeros={thousandSeparator ? false : true}
                        thousandSeparator={thousandSeparator ? "," : false}
                        placeholder={placeholder}
                        disabled={disabled}
                        getInputRef={ref} // react-hook-form의 ref와 연결
                        {...props}
                        defaultValue={props.defaultValue as NumericFormatProps["defaultValue"]}
                        value={props.value as NumericFormatProps["value"]}
                    />
                ) : (
                    <input
                        type={type}
                        placeholder={placeholder}
                        className={inputStyle}
                        disabled={disabled}
                        ref={ref} // react-hook-form의 ref와 연결
                        {...props}
                    />
                )}
            </>
        );
    },
);

Input.displayName = "Input"; // forwardRef 사용 시 필요
export default Input;
