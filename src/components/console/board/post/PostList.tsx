"use client";

import DraggableList from "@/components/console/common/DraggableList";
import LoadingSpinner from "@/components/console/common/LoadingSpinner";
import NoData from "@/components/console/common/NoData";
import Pagination from "@/components/console/common/Pagination";
import ResizableSplit from "@/components/console/common/ResizableSplit";
import AllCheckbox from "@/components/console/form/AllCheckbox";
import Checkbox from "@/components/console/form/Checkbox";
import SearchInput from "@/components/console/form/SearchInput";
import SelectBox from "@/components/console/form/SelectBox";
import Toggle from "@/components/console/form/Toggle";
import BoardGroupPop from "@/components/console/popup/BoardGroupPop";
import { ScrollArea } from "@/components/ui/scroll-area";
import { API_URL } from "@/config/apiConfig";
import { BoardItem, usePostList } from "@/hooks/console/usePostList";
import { BoardSetting } from "@/store/common/useBoardStore";
import { makeIntComma } from "@/utils/numberUtils";

import PostDetail from "./PostDetail";
import PostForm from "./PostForm";

/**
 * 게시글 목록 컴포넌트
 * usePostList 훅을 사용하여 로직과 UI를 분리합니다.
 */
export default function PostList() {
    const {
        // 라우트
        category,
        // 상태
        items,
        totalCount,
        totalPages,
        isLoading,
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
        // 핸들러
        handleSearch,
        handleChangePage,
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
    } = usePostList();

    return (
        <ResizableSplit
            left={
                <PostListPanel
                    items={items}
                    totalCount={totalCount}
                    totalPages={totalPages}
                    isLoading={isLoading}
                    boardGroupList={boardGroupList}
                    boardGroup={boardGroup}
                    groupEnabled={groupEnabled}
                    moveBoardList={moveBoardList}
                    moveCategory={moveCategory}
                    detailOn={detailOn}
                    boardSettingData={boardSettingData}
                    currentPage={currentPage}
                    pages={pages}
                    allCheck={allCheck}
                    checkedList={checkedList}
                    category={category}
                    register={register}
                    handleSearch={handleSearch}
                    handleChangePage={handleChangePage}
                    handleChangeBoardGroup={handleChangeBoardGroup}
                    handleOpenDetail={handleOpenDetail}
                    handleOpenCreate={handleOpenCreate}
                    handleChangeOrder={handleChangeOrder}
                    handleChangeNotice={handleChangeNotice}
                    handleConfirmMove={handleConfirmMove}
                    handleConfirmDelete={handleConfirmDelete}
                    handleAllCheck={handleAllCheck}
                    handleCheck={handleCheck}
                    setMoveCategory={setMoveCategory}
                />
            }
            right={
                <PostDetailPanel
                    category={category}
                    detailOn={detailOn}
                    createOn={createOn}
                    editOn={editOn}
                    detailRefetch={detailRefetch}
                    handleOpenEdit={handleOpenEdit}
                    handlePostCancel={handlePostCancel}
                    handleConfirmDelete={handleConfirmDelete}
                    onPostComplete={onPostComplete}
                    onDeleteComplete={onDeleteComplete}
                    setDetailRefetch={setDetailRefetch}
                />
            }
        />
    );
}

// ============================================================================
// 서브 컴포넌트
// ============================================================================

interface PostListPanelProps {
    items: BoardItem[];
    totalCount: number;
    totalPages: number;
    isLoading: boolean;
    boardGroupList: { value: string; label: string }[];
    boardGroup: string;
    groupEnabled: boolean;
    moveBoardList: { value: string; label: string }[];
    moveCategory: string;
    detailOn: string;
    boardSettingData: BoardSetting;
    currentPage: number;
    pages: number[];
    allCheck: boolean;
    checkedList: (string | number)[];
    category: string;
    register: ReturnType<typeof usePostList>["register"];
    handleSearch: () => void;
    handleChangePage: (page: number) => void;
    handleChangeBoardGroup: (value: string) => void;
    handleOpenDetail: (idx: number) => void;
    handleOpenCreate: () => void;
    handleChangeOrder: ReturnType<typeof usePostList>["handleChangeOrder"];
    handleChangeNotice: (idx: number, checked: boolean) => void;
    handleConfirmMove: () => void;
    handleConfirmDelete: (idx?: string) => void;
    handleAllCheck: (checked: boolean) => void;
    handleCheck: (checked: boolean, idx: number) => void;
    setMoveCategory: (value: string) => void;
}

function PostListPanel({
    items,
    totalCount,
    totalPages,
    isLoading,
    boardGroupList,
    boardGroup,
    groupEnabled,
    moveBoardList,
    moveCategory,
    detailOn,
    boardSettingData,
    currentPage,
    pages,
    allCheck,
    checkedList,
    category,
    register,
    handleSearch,
    handleChangePage,
    handleChangeBoardGroup,
    handleOpenDetail,
    handleOpenCreate,
    handleChangeOrder,
    handleChangeNotice,
    handleConfirmMove,
    handleConfirmDelete,
    handleAllCheck,
    handleCheck,
    setMoveCategory,
}: PostListPanelProps) {
    return (
        <div className="flex h-[calc(100vh-90px)] flex-col">
            <div className="min-h-0 flex-1">
                <ScrollArea className="h-full pr-[7px]">
                    <div className="flex h-full flex-col">
                        {/* 헤더 */}
                        <div className="flex items-center justify-between border-b border-[#D9D9D9] py-[8px]">
                            <div className="flex items-center gap-2">
                                <p className="min-w-[48px] font-[500]">
                                    <span className="text-console">{makeIntComma(totalCount)} </span>개
                                </p>
                                {groupEnabled && (
                                    <>
                                        <SelectBox
                                            list={boardGroupList}
                                            value={boardGroup}
                                            onChange={handleChangeBoardGroup}
                                            triggerClassName="h-[34px]"
                                        />
                                        <BoardGroupPop parentId={category} />
                                    </>
                                )}
                            </div>
                            <button
                                type="button"
                                className="h-[40px] rounded-[8px] bg-black px-[20px] text-[18px] font-[700] text-white"
                                onClick={handleOpenCreate}
                            >
                                게시글 등록
                            </button>
                        </div>

                        {/* 툴바 */}
                        <div className="flex flex-wrap items-center justify-between gap-2 py-[8px]">
                            <div className="flex items-center gap-[8px]">
                                <AllCheckbox checked={allCheck} onChange={e => handleAllCheck(e.currentTarget.checked)} />
                                {moveBoardList.length > 0 && (
                                    <>
                                        <SelectBox
                                            list={moveBoardList}
                                            value={moveCategory}
                                            onChange={setMoveCategory}
                                            triggerClassName="h-[34px]"
                                        />
                                        <button
                                            type="button"
                                            className="h-[34px] rounded-[8px] border border-[#181818] bg-white px-[16px] font-[500]"
                                            onClick={handleConfirmMove}
                                        >
                                            이동
                                        </button>
                                    </>
                                )}
                                <button
                                    type="button"
                                    className="h-[34px] rounded-[8px] bg-[#FEE2E2] px-[16px] font-[500] text-[#E5313D]"
                                    onClick={() => handleConfirmDelete()}
                                >
                                    삭제
                                </button>
                            </div>
                            <SearchInput {...register("searchtxt")} handleClick={handleSearch} />
                        </div>

                        {/* 리스트 */}
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : items && items.length > 0 ? (
                            <DraggableList
                                items={items}
                                getItemId={item => item.idx}
                                getItemData={item => ({ b_num: item.b_num })}
                                renderRow={item => (
                                    <PostListItem
                                        item={item}
                                        detailOn={detailOn}
                                        groupEnabled={groupEnabled}
                                        boardSettingData={boardSettingData}
                                        checkedList={checkedList}
                                        handleOpenDetail={handleOpenDetail}
                                        handleCheck={handleCheck}
                                        handleChangeNotice={handleChangeNotice}
                                    />
                                )}
                                handleChangeOrder={handleChangeOrder}
                            />
                        ) : (
                            <NoData className="flex-1" />
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* 페이지네이션 */}
            {totalCount > 0 && (
                <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    pages={pages}
                    handleChangePage={handleChangePage}
                />
            )}
        </div>
    );
}

// ============================================================================
// PostListItem 컴포넌트
// ============================================================================

interface PostListItemProps {
    item: BoardItem;
    detailOn: string;
    groupEnabled: boolean;
    boardSettingData: BoardSetting;
    checkedList: (string | number)[];
    handleOpenDetail: (idx: number) => void;
    handleCheck: (checked: boolean, idx: number) => void;
    handleChangeNotice: (idx: number, checked: boolean) => void;
}

function PostListItem({
    item,
    detailOn,
    groupEnabled,
    boardSettingData,
    checkedList,
    handleOpenDetail,
    handleCheck,
    handleChangeNotice,
}: PostListItemProps) {
    return (
        <div
            className={`group flex min-h-[60px] cursor-pointer items-center justify-between gap-[16px] rounded-[12px] border bg-white p-[8px_20px_8px_8px] transition-all hover:border-console ${
                detailOn === item.idx.toString() ? "border-console" : "border-white"
            }`}
            onClick={() => handleOpenDetail(item.idx)}
        >
            <div className="flex min-w-0 flex-1 items-center gap-[16px]">
                <div className="flex shrink-0 justify-center pl-[24px]">
                    <Checkbox
                        checked={checkedList.includes(item.idx)}
                        onChange={e => handleCheck(e.currentTarget.checked, item.idx)}
                    />
                </div>

                {/* 갤러리 게시판일때만 게시글 썸네일 노출 */}
                {boardSettingData.c_content_type === 5 && item.b_img && (
                    <div className="flex size-[80px] shrink-0 justify-center overflow-hidden rounded-[8px] border border-[#D9D9D9] bg-[#353535]">
                        <img
                            src={`${API_URL}/${item.b_img}`}
                            alt="게시글 이미지"
                            className="h-full max-w-full object-cover"
                        />
                    </div>
                )}

                <div className="flex min-w-0 flex-1 basis-0 flex-col gap-[8px]">
                    <div className="flex w-full items-center gap-[4px]">
                        <p
                            className={`min-w-0 truncate text-left font-[500] text-[#222] transition-all group-hover:underline${
                                detailOn === item.idx.toString() ? " underline" : ""
                            }`}
                        >
                            {`${groupEnabled ? `[${item.g_name || "분류없음"}] ` : ""}${item.b_title}`}
                        </p>
                        {item.comment_count > 0 && <p className="shrink-0">({makeIntComma(item.comment_count)})</p>}
                    </div>

                    <ul className="flex gap-[20px]">
                        {/* 문의 게시판일때만 노출 */}
                        {boardSettingData.c_content_type === 7 && (
                            <li className="flex max-w-[100px] flex-1 flex-col gap-[4px]">
                                <p className="text-[12px] text-[#9F9FA5]">답변상태</p>
                                <p
                                    className={`text-[14px] font-[700] ${
                                        item.g_status === "답변완료" ? "text-console-2" : "text-[#9F9FA5]"
                                    }`}
                                >
                                    {item.g_status}
                                </p>
                            </li>
                        )}
                        <li className="flex max-w-[100px] flex-1 flex-col gap-[4px]">
                            <p className="text-[12px] text-[#9F9FA5]">페이지뷰</p>
                            <p className="text-[14px]">{makeIntComma(item.b_view)}</p>
                        </li>
                        <li className="flex max-w-[100px] flex-1 flex-col gap-[4px]">
                            <p className="text-[12px] text-[#9F9FA5]">등록일자</p>
                            <p className="text-[14px]">{item.b_reg_date}</p>
                        </li>
                        <li className="flex max-w-[100px] flex-1 flex-col gap-[4px]">
                            <p className="text-[12px] text-[#9F9FA5]">작성자</p>
                            <p className="text-[14px]">{item.m_name}</p>
                        </li>
                    </ul>
                </div>
            </div>

            <Toggle txt="공지" checked={item.b_notice === "1"} handleChange={checked => handleChangeNotice(item.idx, checked)} />
        </div>
    );
}

// ============================================================================
// PostDetailPanel 컴포넌트
// ============================================================================

interface PostDetailPanelProps {
    category: string;
    detailOn: string;
    createOn: boolean;
    editOn: boolean;
    detailRefetch: boolean;
    handleOpenEdit: () => void;
    handlePostCancel: () => void;
    handleConfirmDelete: (idx?: string) => void;
    onPostComplete: (edit?: boolean) => void;
    onDeleteComplete: (reply: boolean) => void;
    setDetailRefetch: (value: boolean) => void;
}

function PostDetailPanel({
    category,
    detailOn,
    createOn,
    editOn,
    detailRefetch,
    handleOpenEdit,
    handlePostCancel,
    handleConfirmDelete,
    onPostComplete,
    onDeleteComplete,
    setDetailRefetch,
}: PostDetailPanelProps) {
    return (
        <div className="h-[calc(100vh-90px)]">
            {!createOn && detailOn && !editOn ? (
                <div className="h-full p-[0_20px_20px_7px]">
                    <PostDetail
                        category={category}
                        detailIdx={detailOn}
                        handleEdit={handleOpenEdit}
                        onDeleteComplete={onDeleteComplete}
                        refetch={detailRefetch}
                        onRefetched={() => setDetailRefetch(false)}
                    />
                </div>
            ) : createOn || (editOn && detailOn) ? (
                <div className="h-full p-[0_20px_20px_7px]">
                    <PostForm
                        detailIdx={detailOn}
                        onComplete={onPostComplete}
                        handleCancel={handlePostCancel}
                        handleConfirmDelete={handleConfirmDelete}
                    />
                </div>
            ) : (
                <div className="h-full p-[0_20px_20px_7px]">
                    <NoData txt="선택된 컨텐츠가 없습니다." className="h-full rounded-[12px] bg-white" />
                </div>
            )}
        </div>
    );
}
