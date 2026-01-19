"use client";

import { DragEndEvent } from "@dnd-kit/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { SelectItem } from "@/components/console/form/SelectBox";
import { initialListSize, initialPage, listSearchTypes, PostListParams } from "@/constants/console/listParams";
import { CONSOLE_CONFIRM_MESSAGES, CONSOLE_TOAST_MESSAGES } from "@/constants/console/messages";
import { useNotFoundOnError } from "@/hooks/common/useNotFoundOnError";
import { usePagination } from "@/hooks/common/usePagination";
import { useUrlParams } from "@/hooks/common/useUrlParams";
import { useCheckboxList } from "@/hooks/console/useCheckboxList";
import { useToast } from "@/hooks/use-toast";
import { useDelPost, useGetPostList } from "@/service/console/board/post";
import { usePutPostMove, usePutPostNotice, usePutPostOrder } from "@/service/console/board/post";
import { useGetBoardGroupList } from "@/service/console/menu/category";
import { initialBoardSettingData, useBoardStore } from "@/store/common/useBoardStore";
import { usePopupStore } from "@/store/console/usePopupStore";
import { calculatePrevPage } from "@/utils/paginationUtils";

// ============================================================================
// 타입 정의
// ============================================================================

const schema = z.object({
    search: z.string(),
    searchtxt: z.string().optional(),
});

type SearchValues = z.infer<typeof schema>;

export interface BoardItem {
    idx: number;
    category: number;
    b_title: string;
    b_notice: string;
    b_num: number;
    b_img: string | null;
    g_name: string | null;
    g_status: string;
    comment_count: number;
    b_view: number;
    b_reg_date: string;
    m_name: string;
}

interface BoardGroupItem {
    id: number;
    g_num: number;
    g_name: string;
    use_yn: string[];
}

// ============================================================================
// usePostList 훅
// ============================================================================

/**
 * 게시글 목록 관리를 위한 커스텀 훅
 * 상태 관리, API 호출, 이벤트 핸들러를 캡슐화합니다.
 */
export function usePostList() {
    // === 라우트 파라미터 ===
    const params = useParams<{ category: string }>();
    const category = params.category;
    const prevCategoryRef = useRef(category);

    // === 스토어 ===
    const { setBoardSettingData, boardSettingData } = useBoardStore();
    const { setConfirmPop, setLoadingPop } = usePopupStore();
    const { toast } = useToast();

    // === 로컬 상태 ===
    const [boardGroupList, setBoardGroupList] = useState<SelectItem[]>([]);
    const [boardGroup, setBoardGroup] = useState("");
    const [groupEnabled, setGroupEnabled] = useState(false);
    const [items, setItems] = useState<BoardItem[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [moveBoardList, setMoveBoardList] = useState<SelectItem[]>([]);
    const [moveCategory, setMoveCategory] = useState("");
    const [detailOn, setDetailOn] = useState("");
    const [createOn, setCreateOn] = useState(false);
    const [editOn, setEditOn] = useState(false);
    const [detailRefetch, setDetailRefetch] = useState(false);

    // === URL 파라미터 ===
    const { urlParams, updateUrlParams, resetUrlParams } = useUrlParams<PostListParams>({
        page: { defaultValue: initialPage, type: "number" },
        search: { defaultValue: "titlecontents", type: "string", validValues: listSearchTypes.map(type => type.value) },
        searchtxt: { defaultValue: "", type: "string" },
        detail: { defaultValue: "", type: "string" },
        create: { defaultValue: "0", type: "string" },
        edit: { defaultValue: "0", type: "string" },
        group: { defaultValue: "all", type: "string" },
    });

    // === 페이지네이션 ===
    const { currentPage, pages, setCurrentPage } = usePagination({ totalPages, initialPage: urlParams.page });

    // === 체크박스 ===
    const { allCheck, setCheckList, checkedList, setCheckedList, handleAllCheck, handleCheck } = useCheckboxList();

    // === 폼 ===
    const { control, setValue, register } = useForm<SearchValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            search: urlParams.search,
            searchtxt: urlParams.searchtxt,
        },
    });
    const searchFilterValues = useWatch({ control });

    // === API 호출 ===
    const { data: boardGroupListData, isLoading: isBoardGroupListLoading } = useGetBoardGroupList(category, {
        enabled: groupEnabled,
    });

    const {
        data: configData,
        isLoading: isInitialLoading,
        error: getPostListError,
    } = useGetPostList(
        category || "",
        initialListSize.toString(),
        urlParams.page.toString(),
        { enabled: Boolean(category) },
        urlParams.search,
        urlParams.searchtxt,
        urlParams.group === "all" ? "" : urlParams.group,
    );

    const putBoardOrderMutation = usePutPostOrder();
    const putBoardNoticeMutation = usePutPostNotice();
    const putBoardMoveMutation = usePutPostMove();
    const delBoardMutation = useDelPost();

    // ========================================================================
    // Effects
    // ========================================================================

    // category 변경 시 초기화
    useEffect(() => {
        if (prevCategoryRef.current !== category) {
            resetUrlParams();
            setCurrentPage(1);
            setValue("search", "title");
            setValue("searchtxt", "");
            prevCategoryRef.current = category;
        }
    }, [category, resetUrlParams, setCurrentPage, setValue]);

    // urlParams.search, urlParams.searchtxt 변경 시만 동기화
    useEffect(() => {
        setValue("search", urlParams.search);
        setValue("searchtxt", urlParams.searchtxt);
    }, [urlParams.search, urlParams.searchtxt, setValue]);

    // detail 파라미터 동기화
    useEffect(() => {
        setDetailOn(urlParams.detail ? urlParams.detail : "");
    }, [urlParams.detail]);

    // create 파라미터 동기화
    useEffect(() => {
        setCreateOn(urlParams.create === "1");
    }, [urlParams.create]);

    // edit 파라미터 동기화
    useEffect(() => {
        setEditOn(urlParams.edit === "1");
    }, [urlParams.edit]);

    // urlParams.group 변경 시만 동기화
    useEffect(() => {
        setBoardGroup(urlParams.group);
    }, [urlParams.group]); // eslint-disable-line react-hooks/exhaustive-deps

    // 데이터 수정,삭제 중일 때 로딩 팝업 표시
    useEffect(() => {
        const isLoading =
            isBoardGroupListLoading ||
            putBoardNoticeMutation.isPending ||
            delBoardMutation.isPending ||
            putBoardOrderMutation.isPending;
        setLoadingPop(isLoading);
        return () => setLoadingPop(false);
    }, [
        isBoardGroupListLoading,
        putBoardNoticeMutation.isPending,
        delBoardMutation.isPending,
        putBoardOrderMutation.isPending,
        setLoadingPop,
    ]);

    // 게시판 분류 목록 조회
    useEffect(() => {
        if (boardGroupListData) {
            const list = boardGroupListData.data.filter((item: BoardGroupItem) => item.use_yn[0] === "Y");
            const newList = list.map((item: BoardGroupItem) => ({
                value: item.id.toString(),
                label: item.g_name,
            }));
            setBoardGroupList([{ value: "all", label: "전체" }, ...newList]);
        } else {
            setBoardGroupList([]);
            updateUrlParams({
                ...urlParams,
                group: "",
            });
        }
    }, [boardGroupListData]); // eslint-disable-line react-hooks/exhaustive-deps

    // 게시글 목록 조회
    useEffect(() => {
        if (configData) {
            const data = configData.data;
            setItems(data.data_list);
            setTotalPages(data.last_page);
            setTotalCount(data.total_count);
            setBoardSettingData({
                c_content_type: data.c_content_type,
                b_column_title: data.b_column_title,
                b_column_date: data.b_column_date,
                b_column_view: data.b_column_view,
                b_column_file: data.b_column_file,
                limit: data.limit,
                b_read_lv: data.b_read_lv,
                b_write_lv: data.b_write_lv,
                b_secret: data.b_secret,
                b_reply: data.b_reply,
                b_reply_lv: data.b_reply_lv,
                b_comment: data.b_comment,
                b_comment_lv: data.b_comment_lv,
                b_top_html: data.b_top_html,
                b_template: data.b_template,
                b_template_text: data.b_template_text,
                b_thumbnail_with: data.b_thumbnail_with,
                b_thumbnail_height: data.b_thumbnail_height,
                b_group: data.b_group,
            });
            setMoveBoardList(
                data.board_Name.map((item: { category: number; c_name: string }) => ({
                    value: item.category.toString(),
                    label: item.c_name,
                })),
            );
            setGroupEnabled(data.b_group === "Y");
        } else {
            setItems([]);
            setTotalPages(1);
            setTotalCount(0);
            setBoardSettingData(initialBoardSettingData);
            setMoveBoardList([]);
            setMoveCategory("");
            setGroupEnabled(false);
        }
    }, [configData]); // eslint-disable-line react-hooks/exhaustive-deps

    // 404 에러 처리
    useNotFoundOnError(getPostListError);

    // 리스트 idx 값만 배열로 (전체 체크박스리스트 만들기)
    useEffect(() => {
        setCheckList(items && items.length > 0 ? items.map(item => item.idx) : []);
        setCheckedList([]);
    }, [items, setCheckList, setCheckedList]);

    // ========================================================================
    // 이벤트 핸들러
    // ========================================================================

    // currentPage 변경 시 URL 파라미터 업데이트
    const handleChangeCurrentPage = (page: number) => {
        updateUrlParams({
            page: page,
        });
        setCurrentPage(page);
    };

    // 검색 하기
    const handleSearch = () => {
        const searchValue = searchFilterValues.search || "title";
        const searchTxtValue = searchFilterValues.searchtxt || "";

        updateUrlParams({
            page: 1,
            search: searchValue,
            searchtxt: searchTxtValue,
            detail: undefined,
        });
        setCurrentPage(1);
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

    // 게시글 상세 열기
    const handleOpenDetail = (idx: number) => {
        if (detailOn === idx.toString()) {
            updateUrlParams({
                ...urlParams,
                detail: undefined,
                create: undefined,
                edit: undefined,
            });
        } else {
            updateUrlParams({
                ...urlParams,
                detail: idx.toString(),
                create: undefined,
                edit: undefined,
            });
        }
    };

    // 게시글 등록 열기
    const handleOpenCreate = () => {
        const create = createOn ? "0" : "1";
        updateUrlParams({
            ...urlParams,
            detail: undefined,
            create,
            edit: undefined,
        });
    };

    // 순서 변경 처리
    const handleChangeOrder = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!category) return;
        if (!over || active.id === over.id) return;

        const body = {
            idx: Number(active.id),
            category: Number(category),
            b_num: over.data.current?.b_num,
        };

        putBoardOrderMutation.mutate(body, {
            onSuccess: () => {
                toast({ title: CONSOLE_TOAST_MESSAGES.ORDER_CHANGED });
            },
        });
    };

    // 공지설정 변경
    const handleChangeNotice = (idx: number, checked: boolean) => {
        if (!category) return;
        const body = {
            idx: [idx],
            category: Number(category),
            notice: checked ? "1" : "0",
        };

        putBoardNoticeMutation.mutate(body, {
            onSuccess: () => {
                toast({ title: CONSOLE_TOAST_MESSAGES.NOTICE_CHANGED });
            },
        });
    };

    // 게시글 이동 확인
    const handleConfirmMove = () => {
        if (checkedList.length === 0) {
            setConfirmPop(true, CONSOLE_CONFIRM_MESSAGES.SELECT_ITEM("게시글을"), 1);
        } else if (!moveCategory) {
            setConfirmPop(true, CONSOLE_CONFIRM_MESSAGES.SELECT_ITEM("이동할 게시판을"), 1);
        } else {
            setConfirmPop(true, CONSOLE_CONFIRM_MESSAGES.CHANGE_EXPOSURE("게시글을", "이동"), 2, () => handleMove());
        }
    };

    // 게시글 이동하기
    const handleMove = () => {
        const body = { idx: checkedList, category: Number(moveCategory) };
        putBoardMoveMutation.mutate(body, {
            onSuccess: () => {
                if (checkedList.includes(Number(detailOn))) {
                    updateUrlParams({
                        ...urlParams,
                        detail: undefined,
                        edit: undefined,
                    });
                }
                toast({ title: CONSOLE_TOAST_MESSAGES.MOVED });
            },
        });
    };

    // 삭제 확인
    const handleConfirmDelete = (idx?: string) => {
        if (idx || checkedList.length > 0) {
            setConfirmPop(true, CONSOLE_CONFIRM_MESSAGES.DELETE, 2, () => handleDelete(idx), undefined, "", "red");
        } else {
            setConfirmPop(true, CONSOLE_CONFIRM_MESSAGES.SELECT_ITEM("게시글을"), 1);
        }
    };

    // 삭제하기
    const handleDelete = (idx?: string) => {
        if (!category) return;
        const body = { idx: idx ? [idx] : checkedList, category: Number(category), pass: "T" };
        delBoardMutation.mutate(body, {
            onSuccess: () => {
                toast({ title: CONSOLE_TOAST_MESSAGES.DELETED });

                const detail =
                    idx && idx === detailOn ? undefined : checkedList.includes(Number(detailOn)) ? undefined : detailOn;
                // 삭제 후 refetch 전에 페이지 이동 처리
                const prevPage = calculatePrevPage(urlParams.page, items.length);

                updateUrlParams({
                    ...urlParams,
                    page: prevPage,
                    detail,
                    edit: detail && editOn ? "1" : undefined,
                });
                setCurrentPage(prevPage);
            },
        });
    };

    // 게시글 수정 열기
    const handleOpenEdit = useCallback(() => {
        updateUrlParams({
            ...urlParams,
            create: undefined,
            edit: "1",
        });
    }, [updateUrlParams, urlParams]);

    // 게시글 등록/수정 취소시
    const handlePostCancel = useCallback(() => {
        updateUrlParams({
            ...urlParams,
            create: undefined,
            edit: undefined,
        });
    }, [updateUrlParams, urlParams]);

    // 게시글 등록/수정 완료시
    const onPostComplete = useCallback(
        (edit?: boolean) => {
            updateUrlParams({
                ...urlParams,
                detail: edit ? detailOn : undefined,
                create: undefined,
                edit: undefined,
            });
        },
        [updateUrlParams, urlParams, detailOn],
    );

    // 게시글 삭제 완료시
    const onDeleteComplete = useCallback(
        (reply: boolean) => {
            // 삭제 후 refetch 전에 페이지 이동 처리
            const prevPage = calculatePrevPage(urlParams.page, items.length);

            // 답글 삭제일때
            if (reply) {
                setDetailRefetch(true);
            }
            // 답글 삭제 아닐때만 게시글상세 닫기
            else {
                updateUrlParams({
                    ...urlParams,
                    page: prevPage,
                    detail: undefined,
                    edit: undefined,
                });
            }
            setCurrentPage(prevPage);
        },
        [updateUrlParams, urlParams, items.length, setCurrentPage],
    );

    // ========================================================================
    // 반환값
    // ========================================================================

    return {
        // 라우트
        category,

        // 상태
        items,
        totalCount,
        totalPages,
        isLoading: isInitialLoading,
        boardGroupList,
        boardGroup,
        groupEnabled,
        moveBoardList,
        moveCategory,
        detailOn,
        createOn,
        editOn,
        detailRefetch,
        boardSettingData,

        // 페이지네이션
        currentPage,
        pages,

        // 체크박스
        allCheck,
        checkedList,

        // 폼
        register,
        control,

        // 핸들러
        handleSearch,
        handleChangePage: handleChangeCurrentPage,
        handleChangeBoardGroup,
        handleOpenDetail,
        handleOpenCreate,
        handleChangeOrder,
        handleChangeNotice,
        handleConfirmMove,
        handleConfirmDelete,
        handleOpenEdit,
        handlePostCancel,
        onPostComplete,
        onDeleteComplete,
        handleAllCheck,
        handleCheck,
        setMoveCategory,
        setDetailRefetch,
    };
}
