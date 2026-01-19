import { useEffect, useState } from "react";

import { Editor } from "@/components/blocks/editor-x/editor";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { COMMON_API_ROUTES } from "@/config/apiConfig";
import userAxios from "@/service/axios/userAxios";
import { usePopupStore } from "@/store/user/usePopupStore";

import { PostItem } from "../PostList";

export default function InquiryList({
    category,
    items,
    handlePostClick,
    authIdx,
    onAuthClose,
}: {
    category: string;
    items: PostItem[];
    handlePostClick: (item: PostItem, e: React.MouseEvent) => void;
    authIdx: number | null;
    onAuthClose?: () => void;
}) {
    const [inquiryItems, setInquiryItems] = useState<PostItem[]>([]);
    const [openItems, setOpenItems] = useState<string[]>([]);
    const [replyDataMap, setReplyDataMap] = useState<{ [key: number]: PostItem }>({});
    const [isLoading, setIsLoading] = useState(false);
    const { setLoadingPop } = usePopupStore();

    useEffect(() => {
        setInquiryItems(items);
    }, [items]);

    // authIdx 변경 시 답글 데이터 로드 및 아코디언 열기
    useEffect(() => {
        if (authIdx && items.length > 0) {
            // const findItem = items.find(item => item.idx === authIdx);
            // const replyIdx = findItem?.childBoard?.[0];

            // if (replyIdx && !replyDataMap[authIdx]) {
            //     fetchReplyData(authIdx, replyIdx);
            //
            // }

            fetchPostData(authIdx);

            // 아코디언 열기
            setOpenItems(prev => [...prev, `inquiry_${authIdx}`]);
        }
    }, [authIdx, items]); // eslint-disable-line react-hooks/exhaustive-deps

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
            setInquiryItems(prev => {
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

    // 답글 데이터 추가
    const fetchReplyData = async (parentIdx: number, replyIdx: number) => {
        const data = await getPostData(replyIdx);
        if (data) {
            setReplyDataMap(prev => ({ ...prev, [parentIdx]: data }));
        }
    };

    // 아코디언 열릴 때 답글 데이터 로드
    const handleOpenChange = (value: string[]) => {
        // 닫힌 아이템 찾기
        const closedItems = openItems.filter(v => !value.includes(v));
        closedItems.forEach(itemValue => {
            const idx = parseInt(itemValue.replace("inquiry_", ""));
            if (authIdx === idx && onAuthClose) {
                // authIdx로 열린 아코디언이 닫히면 초기화
                onAuthClose();
            }
        });

        setOpenItems(value);

        // 새로 열린 아이템 찾기
        const newOpenItems = value.filter(v => !openItems.includes(v));
        newOpenItems.forEach(itemValue => {
            const idx = parseInt(itemValue.replace("inquiry_", ""));
            const item = items.find(i => i.idx === idx);
            const replyIdx = item?.childBoard?.[0];

            // 비밀글이 아닌 경우에만 게시글 데이터 조회
            if (item && item.b_secret !== "Y") {
                fetchPostData(item.idx);
            }

            if (replyIdx && !replyDataMap[idx]) {
                fetchReplyData(idx, replyIdx);
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
            {inquiryItems.map((item, i) => (
                <AccordionItem key={`inquiry_${i}`} value={`inquiry_${item.idx}`}>
                    <AccordionTrigger
                        className="group w-full p-0 p-[16px_0] hover:no-underline md:p-[24px_20px] [&>svg]:hidden"
                        onClick={e => {
                            const isCurrentlyOpen = openItems.includes(`inquiry_${item.idx}`);

                            if (item.b_secret === "Y" && !isCurrentlyOpen) {
                                e.preventDefault();
                                handlePostClick(item, e);
                            }
                        }}
                    >
                        <div className="flex w-full flex-col gap-[8px]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-[8px]">
                                    <p className="rounded-full bg-[#F2F3F8] p-[4px_16px] text-[14px] font-[500] text-[#666]">
                                        {item.b_reg_date}
                                    </p>
                                    <p className="text-primary-2 text-[14px] font-[500]">{item.m_name}</p>
                                </div>
                                <p
                                    className={`font-[700] md:text-[18px] ${
                                        item.g_status === "답변완료" ? "text-primary" : "text-[#9F9FA5]"
                                    }`}
                                >
                                    {item.g_status}
                                </p>
                            </div>
                            <div className="flex flex-col gap-[16px] leading-[1.5]">
                                <p className="text-[18px] font-[500] group-data-[state=closed]:truncate md:text-[20px]">
                                    {item.b_secret === "Y" ? "비밀글" : item.b_title}
                                </p>
                                <div className="hidden group-data-[state=open]:block">
                                    <div className="text-[#666] md:text-[18px]">
                                        <Editor htmlValue={item.b_contents_tag || ""} editable={false} />
                                    </div>
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
                                </div>
                            </div>
                        </div>
                    </AccordionTrigger>
                    {replyDataMap[item.idx] && (
                        <AccordionContent className="border-t border-[#D9D9D9] bg-[#F2F3F8] p-[16px] md:p-[24px_40px]">
                            {(() => {
                                const replyData = replyDataMap[item.idx];
                                if (!replyData) return null;
                                return (
                                    <>
                                        <div className="flex items-center gap-[8px]">
                                            <p className="rounded-full bg-[#F2F3F8] p-[4px_16px] text-[14px] font-[500] text-[#666]">
                                                {replyData.b_reg_date}
                                            </p>
                                            <p className="text-primary-2 text-[14px] font-[500]">{replyData.m_name}</p>
                                        </div>
                                        <div className="flex flex-col gap-[16px] leading-[1.5]">
                                            <p className="text-[18px] font-[500] md:text-[20px]">{replyData.b_title}</p>
                                            <div className="text-[#666] md:text-[18px]">
                                                <Editor htmlValue={replyData.b_contents || ""} editable={false} />
                                            </div>
                                        </div>
                                        {replyData.b_file_list && replyData.b_file_list.length > 0 && (
                                            <div className="mt-[16px] flex border-b border-t border-[#D9D9D9] py-[16px]">
                                                <p className="w-[120px] font-[500]">첨부파일</p>
                                                <ul className="flex flex-1 flex-col gap-[5px]">
                                                    {replyData.b_file_list.map((file, i) => (
                                                        <li key={`file_${i}`}>
                                                            <button
                                                                type="button"
                                                                className="text-left text-[14px] text-[#999]"
                                                                onClick={() =>
                                                                    handleFileDownload(
                                                                        replyData.idx.toString(),
                                                                        file.idx.toString(),
                                                                        file.original_name,
                                                                    )
                                                                }
                                                            >
                                                                {file.original_name}
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </AccordionContent>
                    )}
                </AccordionItem>
            ))}
        </Accordion>
    );
}
