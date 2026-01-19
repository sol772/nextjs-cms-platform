import Image from "next/image";
import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

import icSearch from "@/assets/images/user/icSearch.png";

import Input, { InputProps } from "./Input";

interface SearchInputProps extends InputProps {
    boxClassName?: string;
    handleClick?: () => void;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({ boxClassName, handleClick, ...props }, ref) => {
    return (
        <div className={twMerge("relative w-full", boxClassName)}>
            <Input
                ref={ref}
                {...props}
                placeholder={props.placeholder || "검색어를 입력해 주세요."}
                className={twMerge(
                    "pr-[40px] rounded-full bg-[#F5F6FA] focus:border-2 focus:border-primary",
                    props.className,
                )}
                onKeyDown={e => {
                    if (e.key === "Enter" && handleClick) {
                        e.preventDefault();
                        handleClick();
                    }
                }}
            />
            <button type="button" className="absolute right-0 top-0 h-full w-[40px] py-[7px]" onClick={handleClick}>
                <Image src={icSearch} alt="검색하기" className="max-h-full" />
            </button>
        </div>
    );
});

SearchInput.displayName = "SearchInput";

export default SearchInput;
