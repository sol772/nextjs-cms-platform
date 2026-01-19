"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Dialog } from "@/components/ui/dialog";
import BoardGroupTabs from "@/components/user/board/-components/BoardGroupTabs";
import NoData from "@/components/user/common/NoData";
import Pagination from "@/components/user/common/Pagination";
import { FileData } from "@/components/user/form/FileUpload";
import SearchInput from "@/components/user/form/SearchInput";
import { SelectItem } from "@/components/user/form/SelectBox";
import LoadingPop from "@/components/user/popup/LoadingPop";
import SecretPostAuthPop from "@/components/user/popup/SecretPostAuthPop";
import {
    initialGalleryListSize,
    initialListSize,
    initialPage,
    listSearchTypes,
    PostListParams,
} from "@/constants/user/listParams";
import { usePagination } from "@/hooks/common/usePagination";
import { useUrlParams } from "@/hooks/common/useUrlParams";
import { useGetPostGroupList, useGetPostList } from "@/service/user/board";
import { useAuthStore } from "@/store/common/useAuthStore";
import { useBoardStore } from "@/store/common/useBoardStore";
import { useNavigationStore } from "@/store/user/useNavigationStore";
import { usePopupStore } from "@/store/user/usePopupStore";
import { makeIntComma } from "@/utils/numberUtils";

import BasicList from "./-components/BasicList";
import FaqList from "./-components/FaqList";
import GalleryList from "./-components/GalleryList";
import InquiryList from "./-components/InquiryList";

const schema = z.object({
    search: z.string(),
    searchtxt: z.string().optional(),
});

type SearchValues = z.infer<typeof schema>;

export interface PostItem {
    idx: number;
    num: number | string;
    b_title: string;
    b_contents: string;
    b_contents_tag: string;
    b_reg_date: string;
    b_secret: string;
    m_name: string;
    b_view: number;
    g_status?: string;
    b_file: number;
    b_file_list?: FileData[]; // 게시글 첨부파일 목록(임의로 추가)
    b_img: string | null;
    childBoard: number[];
}

export default function PostList({ category, boardType }: { category: string; boardType: string }) {
    const t = useTranslations("PostList");
    const router = useRouter();
    const currentLocale = useLocale();
    const { boardSettingData } = useBoardStore();
    const { setCurrentPath } = useNavigationStore();
    const { loginUser } = useAuthStore();
    const [boardGroupList, setBoardGroupList] = useState<SelectItem[]>([]);
    const [boardGroup, setBoardGroup] = useState("");
    const [useGroup, setUseGroup] = useState(false);
    const [items, setItems] = useState<PostItem[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [authIdx, setAuthIdx] = useState<number | null>(null);
    const [authPop, setAuthPop] = useState(false);
    const [inquiryAuthIdx, setInquiryAuthIdx] = useState<number | null>(null);
    const { urlParams, updateUrlParams } = useUrlParams<PostListParams>({
        page: { defaultValue: initialPage, type: "number" },
        search: { defaultValue: "titlecontents", type: "string", validValues: listSearchTypes.map(type => type.value) },
        searchtxt: { defaultValue: "", type: "string" },
        group: { defaultValue: "", type: "string" },
    });
    const { currentPage, pages, setCurrentPage } = usePagination({ totalPages, initialPage: urlParams.page });
    const { control, setValue, register } = useForm<SearchValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            search: urlParams.search,
            searchtxt: urlParams.searchtxt,
        },
    });
    const { data: configData, isLoading: isInitialLoading } = useGetPostList(
        category || "",
        boardType === "board" || boardType === "faq" || boardType === "inquiry"
            ? initialListSize.toString()
            : initialGalleryListSize.toString(),
        urlParams.page.toString(),
        { enabled: Boolean(category) },
        urlParams.search,
        urlParams.searchtxt,
        urlParams.group === "all" ? "" : urlParams.group,
    );
    const { data: configBoardGroupList } = useGetPostGroupList(category, {
        enabled: Boolean(category && useGroup),
    });
    const { setLoadingPop, setConfirmPop } = usePopupStore();

    // urlParams.search, urlParams.searchtxt 변경 시만 동기화
    useEffect(() => {
        setValue("search", urlParams.search);
        setValue("searchtxt", urlParams.searchtxt);
    }, [urlParams.search, urlParams.searchtxt]); // eslint-disable-line react-hooks/exhaustive-deps

    // urlParams.group 변경 시만 동기화
    useEffect(() => {
        setBoardGroup(urlParams.group || "");
    }, [urlParams.group]);

    // currentPage 변경 시 URL 파라미터 업데이트
    const handleChangeCurrentPage = (page: number) => {
        updateUrlParams({
            page: page,
        });
        setCurrentPage(page);
    };

    // 검색 하기
    const handleSearch = () => {
        const formValues = control._formValues;
        const searchValue = formValues.search || "titlecontents";
        const searchTxtValue = formValues.searchtxt || "";

        updateUrlParams({
            page: 1,
            search: searchValue,
            searchtxt: searchTxtValue,
            group: urlParams.group,
        });
        setCurrentPage(1);
    };

    // 데이터 수정,삭제 중일 때 로딩 팝업 표시
    useEffect(() => {
        const isLoading = isInitialLoading;
        setLoadingPop(isLoading);
        return () => setLoadingPop(false);
    }, [isInitialLoading]); // eslint-disable-line react-hooks/exhaustive-deps

    // 게시글 분류 목록 조회 (b_group === "Y"일 때만)
    useEffect(() => {
        if (configBoardGroupList) {
            const list = configBoardGroupList.data.filter(
                (item: { g_name: string; use_yn?: string[] }) =>
                    !item.use_yn || (item.use_yn && item.use_yn[0] === "Y"),
            );
            const newList = list.map((item: { id: number | null; g_name: string }) => ({
                value: !item.id ? "all" : item.id.toString(),
                label: item.g_name,
            }));
            setBoardGroupList(newList);

            // urlParams.group이 없을 때만 첫 번째 값을 기본값으로 설정
            if (newList.length > 0 && urlParams.group === "") {
                updateUrlParams({
                    ...urlParams,
                    group: newList[0].value,
                });
            }
        }
    }, [configBoardGroupList]); // eslint-disable-line react-hooks/exhaustive-deps

    // 게시글 목록 조회
    useEffect(() => {
        if (configData) {
            const data = configData.data;

            // b_group 설정
            const bGroupUse = data.b_group === "Y";
            setUseGroup(bGroupUse);

            // b_group === "N"이면 바로 목록 표시
            // b_group === "Y"이고 urlParams.group이 있으면 목록 표시
            if (!bGroupUse || (bGroupUse && urlParams.group !== "")) {
                setItems(data.data_list);
                setTotalPages(data.last_page);
                setTotalCount(data.total_count);
            }
        } else {
            setItems([]);
            setTotalPages(1);
            setTotalCount(0);
            setUseGroup(false);
        }
    }, [configData, urlParams.group]); // eslint-disable-line react-hooks/exhaustive-deps

    // 게시글 클릭 시 비밀글 비밀번호 확인 팝업 열기
    const handlePostClick = (item: PostItem, e: React.MouseEvent, inquiry?: boolean) => {
        if (
            boardSettingData.b_read_lv === 0 ||
            (boardSettingData.b_read_lv &&
                boardSettingData.b_read_lv > 0 &&
                loginUser.m_level &&
                loginUser.m_level >= boardSettingData.b_read_lv)
        ) {
            if (!inquiry) {
                setCurrentPath(window.location.pathname + window.location.search);
            }
            if (item.b_secret === "Y") {
                e.preventDefault();
                setAuthIdx(item.idx);
                setAuthPop(true);
            }
        } else {
            e.preventDefault();
            setConfirmPop(true, t("noReadPermission"), 1);
        }
    };

    // 게시글 분류 탭 변경 시 URL 파라미터 업데이트
    const handleChangeBoardGroup = (value: string) => {
        updateUrlParams({
            ...urlParams,
            page: 1,
            group: value,
        });
        setCurrentPage(1);
    };

    return (
        <>
            <div
                className={`flex flex-col gap-[6px] pb-[80px] md:gap-[30px] md:pb-[120px]${
                    boardGroupList.length > 0 ? " md:-mt-[20px]" : ""
                }`}
            >
                {boardGroupList.length > 0 && (
                    <BoardGroupTabs list={boardGroupList} active={boardGroup} handleClick={handleChangeBoardGroup} />
                )}
                <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-[16px] px-[20px] md:gap-[24px] md:px-[28px] min-[1400px]:px-0">
                    <div className="flex flex-col gap-[8px] md:flex-row md:items-center md:justify-between">
                        <p className="font-[500]">
                            {t("total")}
                            <span className="px-[4px] text-primary">{makeIntComma(totalCount)}</span>
                            {t("count")}
                        </p>
                        <div className="flex flex-col gap-[8px] md:flex-row md:items-center md:gap-[20px]">
                            <SearchInput
                                {...register("searchtxt")}
                                handleClick={handleSearch}
                                boxClassName="md:w-[400px]"
                                placeholder={t("searchPlaceholder")}
                            />
                            {(boardType === "faq" && loginUser.m_level === 9) ||
                            (boardType !== "faq" &&
                                (boardSettingData.b_write_lv === 0 ||
                                    (boardSettingData.b_write_lv &&
                                        boardSettingData.b_write_lv > 0 &&
                                        loginUser.m_level &&
                                        loginUser.m_level >= boardSettingData.b_write_lv))) ? (
                                <Link
                                    href={`/${currentLocale}/${boardType}/${category}/create`}
                                    className="h-[48px] w-full rounded-[12px] bg-primary text-center font-[700] leading-[48px] text-white md:w-[160px]"
                                >
                                    {boardType === "inquiry" ? t("inquiry") : t("post")} {t("register")}
                                </Link>
                            ) : null}
                        </div>
                    </div>
                    {isInitialLoading ? (
                        <LoadingPop />
                    ) : items && items.length > 0 ? (
                        boardType === "board" ? (
                            <BasicList
                                items={items}
                                boardType={boardType}
                                category={category}
                                handlePostClick={handlePostClick}
                            />
                        ) : boardType === "gallery" ? (
                            <GalleryList
                                items={items}
                                boardType={boardType}
                                category={category}
                                handlePostClick={handlePostClick}
                            />
                        ) : boardType === "faq" ? (
                            <FaqList category={category} items={items} />
                        ) : boardType === "inquiry" ? (
                            <InquiryList
                                category={category}
                                items={items}
                                handlePostClick={(item, e) => handlePostClick(item, e, true)}
                                authIdx={inquiryAuthIdx}
                                onAuthClose={() => setInquiryAuthIdx(null)}
                            />
                        ) : null
                    ) : (
                        <NoData />
                    )}
                    {totalCount > 0 && (
                        <Pagination
                            totalPages={totalPages}
                            currentPage={currentPage}
                            pages={pages}
                            handleChangePage={handleChangeCurrentPage}
                        />
                    )}
                </div>
            </div>

            {/* 비밀글 비밀번호 확인 팝업 */}
            <Dialog open={authPop} onOpenChange={setAuthPop}>
                {authPop && (
                    <SecretPostAuthPop
                        detailIdx={authIdx}
                        onComplete={() => {
                            if (boardType === "inquiry") {
                                setInquiryAuthIdx(authIdx);
                            } else {
                                router.push(`/${currentLocale}/${boardType}/${category}/${authIdx}`);
                            }
                            setAuthIdx(null);
                            setAuthPop(false);
                        }}
                    />
                )}
            </Dialog>
        </>
    );
}
