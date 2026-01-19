import Image from "next/image";
import Link from "next/link";

import icFile from "@/assets/images/user/icFile.png";
import NoImage from "@/components/user/common/NoImage";
import { API_URL } from "@/config/apiConfig";
import { useBoardStore } from "@/store/common/useBoardStore";
import { makeIntComma } from "@/utils/numberUtils";

import { PostItem } from "../PostList";

export default function GalleryList({
    items,
    boardType,
    category,
    handlePostClick,
}: {
    items: PostItem[];
    boardType: string;
    category: string;
    handlePostClick: (item: PostItem, e: React.MouseEvent) => void;
}) {
    const { boardSettingData } = useBoardStore();
    return (
        <ul className="border-t border-[#ddd]">
            {items.map((item, i) => {
                return (
                    <li key={`post_${i}`} className="border-b border-[#ddd]">
                        <Link
                            href={`/${boardType}/${category}/${item.idx}`}
                            onClick={e => handlePostClick(item, e)}
                            className="flex flex-col gap-[12px] p-[20px_12px] md:flex-row md:justify-between md:p-[40px_20px]"
                        >
                            <div className="flex flex-col gap-[8px] md:min-w-0 md:flex-1 md:flex-row md:items-center md:gap-[32px]">
                                <p
                                    className={`text-[14px] font-[500] md:min-w-[100px] md:text-center md:text-[20px] ${
                                        typeof item.num === "number"
                                            ? "text-[#666]"
                                            : "rounded-[22px] bg-primary p-[4px_12px] text-white"
                                    }`}
                                >
                                    {item.num}
                                </p>
                                <div className="relative h-[160px] w-full overflow-hidden rounded-[16px] md:h-[120px] md:w-[200px] md:rounded-[20px]">
                                    {item.b_img ? (
                                        <img
                                            src={`${API_URL}/${item.b_img}`}
                                            alt="이미지"
                                            className="absolute inset-0 h-full w-full object-cover"
                                        />
                                    ) : (
                                        <NoImage />
                                    )}
                                </div>
                                {boardSettingData.b_column_title === "Y" && (
                                    <p className="min-w-0 flex-1 truncate font-[500] md:text-[20px]">{item.b_title}</p>
                                )}
                            </div>
                            <ul className="flex items-center">
                                {boardSettingData.b_column_file === "Y" && item.b_file > 0 && (
                                    <li className="relative px-[8px] text-[14px] text-[#999] after:absolute after:left-0 after:top-1/2 after:h-[12px] after:w-[1px] after:-translate-y-1/2 after:bg-[#ddd] after:content-[''] first:after:hidden md:px-[12px] md:text-[18px] md:after:h-[16px]">
                                        <Image src={icFile} alt="file" width={24} height={24} />
                                    </li>
                                )}
                                <li className="relative px-[8px] text-[14px] text-[#999] after:absolute after:left-0 after:top-1/2 after:h-[12px] after:w-[1px] after:-translate-y-1/2 after:bg-[#ddd] after:content-[''] first:after:hidden md:px-[12px] md:text-[18px] md:after:h-[16px]">
                                    {item.m_name}
                                </li>
                                {boardSettingData.b_column_view === "Y" && (
                                    <li className="relative min-w-[40px] px-[8px] text-center text-[14px] text-[#999] after:absolute after:left-0 after:top-1/2 after:h-[12px] after:w-[1px] after:-translate-y-1/2 after:bg-[#ddd] after:content-[''] first:after:hidden md:min-w-[60px] md:px-[12px] md:text-[18px] md:after:h-[16px]">
                                        {makeIntComma(item.b_view)}
                                    </li>
                                )}
                                {boardSettingData.b_column_date === "Y" && (
                                    <li className="relative px-[8px] text-[14px] text-[#999] after:absolute after:left-0 after:top-1/2 after:h-[12px] after:w-[1px] after:-translate-y-1/2 after:bg-[#ddd] after:content-[''] first:after:hidden md:px-[12px] md:text-[18px] md:after:h-[16px]">
                                        {item.b_reg_date}
                                    </li>
                                )}
                            </ul>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}
