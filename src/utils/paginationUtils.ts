/**
 * 삭제 후 이전 페이지 번호를 계산하는 함수
 * @param currentPage 현재 페이지 번호
 * @param itemsCount 현재 페이지의 아이템 개수
 * @returns 이전 페이지 번호
 */
export const calculatePrevPage = (currentPage: number, itemsCount: number): number => {
    const isLastItemOnPage = itemsCount === 1; // 현재 페이지에 1개만 있을 때
    const isNotFirstPage = currentPage > 1;

    if (isLastItemOnPage && isNotFirstPage) {
        return currentPage - 1;
    }

    return currentPage;
};
