"use client";

import Image from "next/image";

import toastSuccess from "@/assets/images/console/toastSuccess.png";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

export default function ConsoleToaster() {
    const { toasts } = useToast();

    return (
        <ToastProvider duration={1000}>
            {toasts.map(function ({ id, title, description, action, ...props }) {
                return (
                    <Toast
                        key={id}
                        {...props}
                        className="relative rounded-[10px] border-none p-[0_0_0_4px] before:absolute before:inset-0 before:h-full before:w-1/2 before:bg-[#10B981] before:content-['']"
                    >
                        <div className="relative z-10 flex w-full items-start gap-[8px] rounded-[12px_0_0_12px] bg-white p-[20px_16px]">
                            <Image src={toastSuccess} alt="성공" />
                            <div className="grid gap-[4px]">
                                {title && (
                                    <ToastTitle className="text-[16px] font-bold leading-[24px]">{title}</ToastTitle>
                                )}
                                {description && (
                                    <ToastDescription className="text-[14px] text-[#666]">
                                        {description}
                                    </ToastDescription>
                                )}
                            </div>
                            {action}
                            <ToastClose className="!ring-0" />
                        </div>
                    </Toast>
                );
            })}
            <ToastViewport />
        </ToastProvider>
    );
}
