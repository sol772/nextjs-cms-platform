import TooltipBox from "@/components/common/common/TooltipBox";
import ConsoleDialogContent from "@/components/console/common/ConsoleDialogContent";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ImgUploadContentPop({
    children,
    open,
    setOpen,
    button,
    title = "이미지 등록",
    tooltip = true,
}: {
    children: React.ReactNode;
    open: boolean;
    setOpen: (open: boolean) => void;
    button?: React.ReactNode;
    title?: string;
    tooltip?: boolean;
}) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {button ? (
                    button
                ) : (
                    <button
                        type="button"
                        className="h-[34px] w-full rounded-[8px] border border-[#DADEE4] font-[500] text-[#666]"
                    >
                        이미지 등록
                    </button>
                )}
            </DialogTrigger>
            <ConsoleDialogContent title={title} className="max-w-[640px]">
                <ScrollArea className="max-h-[80vh] min-h-[300px] border-b border-[#D9D9D9] p-[20px]">
                    {tooltip && (
                        <div className="flex items-center gap-[8px]">
                            <p className="font-[700] text-console-2">이미지를 왜 등록해야 될까요? + 등록 방법</p>
                            <TooltipBox
                                text={`<div class="flex flex-col gap-[24px]">
                        <div>
                            <p class="font-[700] text-console-2">이미지 등록 주의사항</p>
                            <ul class="text-[#51535B] list-decimal pl-[14px]">
                                <li>한글, 띄어쓰기, 특수문자(예: #, %, &) 포함된 파일명은 오류를 유발할 수 있습니다.</li>
                                <li>너무 큰 이미지(5MB 이상)는 로딩이 느리고, 모바일에서 깨질 수 있습니다.</li>
                                <li class="text-[#E5313D]">동일한 이미지명 등록은 불가합니다.</li>
                                <li>등록한 이미지는 함부로 삭제하지 말 것<br />삭제하면 해당 이미지를 사용 중인 모든 게시글/페이지에서 이미지가 사라집니다.</li>
                            </ul>
                        </div>
                        <div>
                            <p class="font-[700] text-console-2">이미지 등록 방법</p>
                            <ul class="text-[#51535B] list-decimal pl-[14px]">
                                <li>이미지를 등록한 뒤, [추가] 버튼을 클릭합니다.</li>
                                <li>업로드가 완료되면, 해당 이미지의 링크(URL)가 자동으로 생성됩니다.</li>
                                <li>URL을 복사해서, 홈페이지 이미지 삽입 시 사용하시면 됩니다.</li>
                                <li>게시글, 상품 설명, 팝업 등 원하는 위치에 이미지 삽입 시<br />이미지 URL만 붙여넣으면 자동으로 불러와집니다.</li>
                            </ul>
                        </div>
                    </div>`}
                            />
                        </div>
                    )}
                    {children}
                </ScrollArea>
            </ConsoleDialogContent>
        </Dialog>
    );
}
