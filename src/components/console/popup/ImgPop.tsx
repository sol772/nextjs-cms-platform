import ConsoleDialogContent from "@/components/console/common/ConsoleDialogContent";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ImgPop({ src }: { src: string }) {
    return (
        <ConsoleDialogContent title="이미지" className="w-max min-w-0 min-w-[500px] max-w-[90vw]">
            <ScrollArea className="max-h-[75vh] min-h-[300px] border-b border-[#D9D9D9] p-[20px_20px_40px]">
                <img src={src} alt="이미지" className="mx-auto" />
            </ScrollArea>
        </ConsoleDialogContent>
    );
}
