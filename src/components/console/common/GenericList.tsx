"use client";

import { DragEndEvent } from "@dnd-kit/core";
import { ReactNode } from "react";

import DraggableList from "./DraggableList";
import LoadingSpinner from "./LoadingSpinner";
import NoData from "./NoData";
import Pagination from "./Pagination";

// ============================================================================
// 타입 정의
// ============================================================================

interface PaginationConfig {
    totalPages: number;
    currentPage: number;
    pages: number[];
    onChangePage: (page: number) => void;
}

interface GenericListProps<T> {
    /** 표시할 아이템 배열 */
    items: T[];
    /** 로딩 상태 */
    isLoading: boolean;
    /** 전체 아이템 수 */
    totalCount: number;
    /** 개별 아이템 렌더링 함수 */
    renderItem: (item: T, index: number) => ReactNode;
    /** 아이템 고유 ID 추출 함수 */
    getItemId: (item: T, index: number) => number | string;
    /** 드래그 앤 드롭 활성화 여부 */
    draggable?: boolean;
    /** 드래그 종료 시 호출되는 핸들러 */
    onDragEnd?: (event: DragEndEvent) => void;
    /** 드래그 시 전달할 추가 데이터 추출 함수 */
    getItemData?: (item: T, index: number) => Record<string, unknown>;
    /** 페이지네이션 설정 */
    pagination?: PaginationConfig;
    /** 리스트 상단에 표시할 툴바 */
    toolbar?: ReactNode;
    /** 데이터 없을 때 표시할 메시지 */
    emptyMessage?: string;
    /** 리스트 컨테이너 className */
    className?: string;
    /** 아이템 간격 className (기본: gap-[8px]) */
    gapClassName?: string;
}

// ============================================================================
// GenericList 컴포넌트
// ============================================================================

/**
 * 범용 리스트 컴포넌트
 * 로딩, 빈 데이터, 드래그 앤 드롭, 페이지네이션을 지원합니다.
 *
 * @example
 * ```tsx
 * <GenericList
 *   items={users}
 *   isLoading={isLoading}
 *   totalCount={totalCount}
 *   renderItem={(user) => <UserCard user={user} />}
 *   getItemId={(user) => user.id}
 *   draggable
 *   onDragEnd={handleDragEnd}
 *   pagination={{
 *     totalPages,
 *     currentPage,
 *     pages,
 *     onChangePage: handleChangePage,
 *   }}
 * />
 * ```
 */
export default function GenericList<T>({
    items,
    isLoading,
    totalCount,
    renderItem,
    getItemId,
    draggable = false,
    onDragEnd,
    getItemData,
    pagination,
    toolbar,
    emptyMessage = "데이터가 없습니다.",
    className = "",
    gapClassName = "gap-[8px]",
}: GenericListProps<T>) {
    // 로딩 상태
    if (isLoading) {
        return (
            <div className={className}>
                {toolbar}
                <LoadingSpinner />
            </div>
        );
    }

    // 빈 데이터 상태
    if (!items || items.length === 0) {
        return (
            <div className={className}>
                {toolbar}
                <NoData txt={emptyMessage} className="flex-1" />
            </div>
        );
    }

    return (
        <div className={`flex flex-col ${className}`}>
            {toolbar}

            {/* 리스트 영역 */}
            {draggable && onDragEnd ? (
                <DraggableList
                    items={items}
                    renderRow={renderItem}
                    getItemId={getItemId}
                    getItemData={getItemData}
                    handleChangeOrder={onDragEnd}
                />
            ) : (
                <ul className={`flex flex-col ${gapClassName}`}>
                    {items.map((item, index) => (
                        <li key={getItemId(item, index)}>{renderItem(item, index)}</li>
                    ))}
                </ul>
            )}

            {/* 페이지네이션 */}
            {pagination && totalCount > 0 && (
                <Pagination
                    totalPages={pagination.totalPages}
                    currentPage={pagination.currentPage}
                    pages={pagination.pages}
                    handleChangePage={pagination.onChangePage}
                />
            )}
        </div>
    );
}
