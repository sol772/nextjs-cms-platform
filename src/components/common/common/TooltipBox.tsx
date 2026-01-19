import Image from "next/image";

import icTooltip from "@/assets/images/common/icTooltip.png";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function TooltipBox({ text }: { text: string }) {
    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger type="button" tabIndex={-1}>
                    <Image src={icTooltip} alt="툴팁" width={20} height={20} />
                </TooltipTrigger>
                <TooltipContent
                    side="bottom"
                    align="start"
                    className="after:bg-tooltipArrow relative max-w-[490px] overflow-visible rounded-[8px] bg-white p-0 shadow-[0_2px_12px_2px_rgba(112,144,176,0.20)]"
                >
                    <div
                        className="p-[12px_16px] text-[14px] leading-[1.5] text-[#666]"
                        dangerouslySetInnerHTML={{ __html: text }}
                    />
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
