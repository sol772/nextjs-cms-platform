"use client";

import Image from "next/image";
import { forwardRef, useState } from "react";
import { twMerge } from "tailwind-merge";

import icEye from "@/assets/images/console/icEye.svg";
import icEyeOff from "@/assets/images/console/icEyeOff.svg";

import Input from "./Input";

const PasswordInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ ...props }, ref) => {
    const [type, setType] = useState<"password" | "text">("password");
    const inputStyle = twMerge("pr-[42px]", props.className);

    //비밀번호 보기 토글
    const handleShowPassword = () => {
        setType(prevType => (prevType === "password" ? "text" : "password"));
    };

    return (
        <div className="relative">
            <Input ref={ref} type={type} {...props} className={inputStyle} autoComplete="on" />
            <button type="button" className="absolute right-0 top-0 h-full w-[42px]" onClick={handleShowPassword}>
                <Image src={type === "text" ? icEye : icEyeOff} alt="비밀번호보기" />
            </button>
        </div>
    );
});

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
