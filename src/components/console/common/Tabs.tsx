import { twMerge } from "tailwind-merge";

interface TabsProps {
    list: string[];
    activeIdx: number;
    handleClick: (idx: number) => void;
}

export default function Tabs({ list, activeIdx, handleClick }: TabsProps) {
    const liStyle =
        "flex-1 text-[#9F9FA5] font-[600] text-center p-[6px] cursor-pointer relative after:content-[''] after:absolute after:-bottom-[1px] after:left-0 after:w-full after:h-[1px] after:bg-[#181818] after:opacity-0";
    const liOnStyle = twMerge(liStyle, "active text-[#181818] after:opacity-100");

    return (
        <ul className="flex border-b border-[#D9D9D9]">
            {list.map((tab, i) => (
                <li key={`tab_${i}`} className={activeIdx === i ? liOnStyle : liStyle} onClick={() => handleClick(i)}>
                    {tab}
                </li>
            ))}
        </ul>
    );
}
