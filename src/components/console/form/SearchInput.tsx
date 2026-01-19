import Image from "next/image";
import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

import icSearch from "@/assets/images/console/icSearch.svg";
import Input, { InputProps } from "@/components/console/form/Input";

interface SearchInputProps extends InputProps {
    boxClassName?: string;
    handleClick?: () => void;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({ boxClassName, handleClick, ...props }, ref) => {
    return (
        <div className={twMerge("relative w-[240px]", boxClassName)}>
            <Input
                ref={ref}
                {...props}
                placeholder={props.placeholder || "제목+내용"}
                className={twMerge("pr-[40px] h-[34px]", props.className)}
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
