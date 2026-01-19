import { twMerge } from "tailwind-merge";

import { DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function ConsoleDialogContent({
    children,
    title,
    className,
    titleClassName,
}: {
    children: React.ReactNode;
    title: React.ReactNode | string;
    className?: string;
    titleClassName?: string;
}) {
    return (
        <DialogContent
            className={twMerge(
                "max-w-[800px] bg-white p-0 overflow-hidden gap-0 block !rounded-[20px] [&>button]:z-[1] [&>button]:right-[20px] [&>button]:opacity-100 [&>button]:!ring-0 [&>button]:!ring-offset-0 [&>button>svg]:hidden [&>button]:size-[32px] [&>button]:bg-console-pop-close",
                className,
            )}
        >
            {title && (
                <DialogTitle
                    className={twMerge(
                        "p-[16px_52px_16px_20px] border-b border-[#D9D9D9] text-[20px] font-[700] relative z-[1]",
                        titleClassName,
                    )}
                >
                    {title}
                </DialogTitle>
            )}
            {children}
        </DialogContent>
    );
}
