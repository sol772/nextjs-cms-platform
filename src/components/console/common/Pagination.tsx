import Image from "next/image";

import pagingFirst from "@/assets/images/common/pagingFirst.png";
import pagingLast from "@/assets/images/common/pagingLast.png";
import pagingNext from "@/assets/images/common/pagingNext.png";
import pagingPrev from "@/assets/images/common/pagingPrev.png";

interface PaginationProps {
    totalPages: number;
    currentPage: number;
    pages: number[];
    handleChangePage: (page: number) => void;
}

export default function Pagination({ totalPages, currentPage, pages, handleChangePage }: PaginationProps) {
    return (
        <div className="flex items-center justify-center gap-[20px] py-[20px]">
            <ul className="flex items-center gap-[5px]">
                <li>
                    <button
                        onClick={() => handleChangePage(1)}
                        className="flex size-[24px] items-center justify-center disabled:opacity-50"
                        disabled={currentPage === 1}
                    >
                        <Image src={pagingFirst} alt="첫페이지" />
                    </button>
                </li>
                <li>
                    <button
                        onClick={() => handleChangePage(currentPage - 1)}
                        className="flex size-[24px] items-center justify-center disabled:opacity-50"
                        disabled={currentPage === 1}
                    >
                        <Image src={pagingPrev} alt="이전페이지" />
                    </button>
                </li>
            </ul>
            <ul className="flex items-center gap-[12px]">
                {pages.map((page, i) => (
                    <li key={`page_${i}`}>
                        <button
                            key={page}
                            onClick={() => handleChangePage(page)}
                            className={`size-[30px] rounded-[8px] text-[18px] font-[500]${
                                currentPage === page ? " bg-console-2 text-white" : ""
                            }`}
                        >
                            {page}
                        </button>
                    </li>
                ))}
            </ul>
            <ul className="flex items-center gap-[5px]">
                <li>
                    <button
                        onClick={() => handleChangePage(currentPage + 1)}
                        className="flex size-[24px] items-center justify-center disabled:opacity-50"
                        disabled={currentPage === totalPages}
                    >
                        <Image src={pagingNext} alt="다음페이지" />
                    </button>
                </li>
                <li>
                    <button
                        onClick={() => handleChangePage(totalPages)}
                        className="flex size-[24px] items-center justify-center disabled:opacity-50"
                        disabled={currentPage === totalPages}
                    >
                        <Image src={pagingLast} alt="마지막페이지" />
                    </button>
                </li>
            </ul>
        </div>
    );
}
