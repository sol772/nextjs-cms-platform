import Image from "next/image";

import icCloseBlack from "@/assets/images/console/icCloseBlack.svg";

import { Item } from "./NotiPopup";

export default function NotiItem({
    item,
    handleRead,
}: {
    item: Item;
    handleRead: (follow: string, idx: number, flg: string) => void;
}) {
    const { idx, follow, c_name, m_name, title, content, reg_date } = item;

    return (
        <div className="flex items-start">
            <div className="flex w-[calc(100%-20px)] cursor-pointer">
                <p className="w-[64px] text-[18px] font-[500] text-[#0CB2AD]">{follow}</p>
                <div className="flex w-[calc(100%-64px)] flex-col gap-[4px]">
                    <p className="text-[#999]">{`[${c_name}] ‘${title}‘${
                        follow === "게시글" ? " 새 글 작성" : follow === "댓글" ? " 댓글 작성" : ""
                    }`}</p>
                    <p className="flex items-center gap-[8px] text-[18px]">
                        <strong className="max-w-[20%] truncate">{m_name}</strong>
                        <span className="max-w-[80%] truncate">{content}</span>
                    </p>
                    <p className="text-[14px] text-[#999]">{reg_date}</p>
                </div>
            </div>
            <button type="button" className="size-[20px] p-[4px]" onClick={() => handleRead("delete", idx, follow)}>
                <Image src={icCloseBlack} alt="읽음처리" />
            </button>
        </div>
    );
}
