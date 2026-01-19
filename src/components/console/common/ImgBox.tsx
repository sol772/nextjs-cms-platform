import Image from "next/image";

import icCloseWhite from "@/assets/images/console/icCloseWhite.svg";
import ImgPop from "@/components/console/popup/ImgPop";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

export default function ImgBox({ src, handleDelete }: { src: string; handleDelete: () => void }) {
    return (
        <div className="relative mx-auto size-[100px] overflow-hidden rounded-[5px] border border-[#DADEE4]">
            <Dialog>
                <DialogTrigger asChild>
                    <div className="h-full w-full cursor-pointer">
                        <img src={src} alt="이미지" className="h-full w-full object-cover" />
                    </div>
                </DialogTrigger>
                <ImgPop src={src} />
            </Dialog>
            <button
                type="button"
                className="absolute right-0 top-0 flex size-[25px] items-center justify-center bg-[rgba(0,0,0,0.6)]"
                onClick={handleDelete}
            >
                <Image src={icCloseWhite} alt="삭제" />
            </button>
        </div>
    );
}
