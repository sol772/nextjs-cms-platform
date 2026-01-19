import { useEffect, useState } from "react";

import { Editor } from "@/components/blocks/editor-x/editor";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { COMMON_API_ROUTES } from "@/config/apiConfig";
import userAxios from "@/service/axios/userAxios";
import { usePopupStore } from "@/store/user/usePopupStore";

import { PostItem } from "../PostList";

export default function FaqList({ category, items }: { category: string; items: PostItem[] }) {
    const [faqItems, setFaqItems] = useState<PostItem[]>([]);
    const [openItems, setOpenItems] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { setLoadingPop } = usePopupStore();

    useEffect(() => {
        setFaqItems(items);
    }, [items]);

    // 로딩 상태 변경 시 팝업 표시
    useEffect(() => {
        setLoadingPop(isLoading);
        return () => setLoadingPop(false);
    }, [isLoading, setLoadingPop]);

    // 게시글 데이터 조회
    const getPostData = async (idx: number): Promise<PostItem | undefined> => {
        try {
            setIsLoading(true);
            const res = await userAxios.get(
                COMMON_API_ROUTES.POST.GET_DETAIL.replace(":category", category).replace(":idx", idx.toString()) +
                    "?pass=T",
            );
            const data = res.data.data as PostItem & { b_file: unknown };

            // b_file 값을 b_file_list로 변환
            if (data && Array.isArray(data.b_file)) {
                data.b_file_list = data.b_file as PostItem["b_file_list"];
            }

            return data as PostItem;
        } catch (error) {
            console.error("게시글 조회 실패:", error);
            return undefined;
        } finally {
            setIsLoading(false);
        }
    };

    // 게시글 데이터 추가
    const fetchPostData = async (idx: number) => {
        const data = await getPostData(idx);
        if (data) {
            setFaqItems(prev => {
                const existingIndex = prev.findIndex(item => item.idx === data.idx);
                if (existingIndex !== -1) {
                    // 기존 항목이 있으면 b_file_list 값만 할당
                    const updated = [...prev];
                    updated[existingIndex] = {
                        ...updated[existingIndex],
                        b_file_list: data.b_file_list,
                    };
                    return updated;
                }
                // 기존 항목이 없으면 변경하지 않음
                return prev;
            });
        }
    };

    // 아코디언 열릴 때 게시글 데이터 로드
    const handleOpenChange = (value: string[]) => {
        setOpenItems(value);

        // 새로 열린 아이템 찾기
        const newOpenItems = value.filter(v => !openItems.includes(v));
        newOpenItems.forEach(itemValue => {
            const idx = parseInt(itemValue.replace("faq_", ""));
            const item = faqItems.find(i => i.idx === idx);
            if (item) {
                fetchPostData(item.idx);
            }
        });
    };

    // 첨부파일 다운로드
    const handleFileDownload = async (parent_idx: string, idx: string, file_name: string) => {
        try {
            setIsLoading(true);
            const res = await userAxios.get(
                `${COMMON_API_ROUTES.POST_FILE.DOWNLOAD.replace(":category", category)
                    .replace(":parent_idx", parent_idx)
                    .replace(":idx", idx)}`,
                { responseType: "blob" }, // 요청 데이터 형식을 blob으로 설정
            );
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", file_name);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("첨부파일 다운로드 실패:", error);
            return undefined;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Accordion
            type="multiple"
            className="border-t-2 border-[#353535]"
            value={openItems}
            onValueChange={handleOpenChange}
        >
            {faqItems.map((item, i) => (
                <AccordionItem key={`faq_${i}`} value={`faq_${item.idx}`} className="p-[16px_0] md:p-[24px_20px]">
                    <AccordionTrigger className="p-0 hover:no-underline">
                        <div className="flex items-start gap-[8px]">
                            <p className="text-[18px] font-[700] text-primary md:text-[24px]">Q.</p>
                            <p className="text-[18px] font-[500] md:text-[20px]">{item.b_title}</p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="mt-[16px] rounded-[20px] bg-[#F7F7F7] p-[16px] md:p-[20px_24px]">
                        <Editor htmlValue={item.b_contents_tag || ""} editable={false} />
                        {item.b_file_list && item.b_file_list.length > 0 && (
                            <div className="mt-[16px] flex border-b border-t border-[#D9D9D9] py-[16px]">
                                <p className="w-[120px] font-[500]">첨부파일</p>
                                <ul className="flex flex-1 flex-col gap-[5px]">
                                    {item.b_file_list.map((file, i) => (
                                        <li key={`file_${i}`}>
                                            <div
                                                className="cursor-pointer text-left text-[14px] text-[#999]"
                                                onClick={() =>
                                                    handleFileDownload(
                                                        item.idx.toString(),
                                                        file.idx.toString(),
                                                        file.original_name,
                                                    )
                                                }
                                            >
                                                {file.original_name}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
