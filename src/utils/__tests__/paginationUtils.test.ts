/**
 * paginationUtils 테스트
 */

import { calculatePrevPage } from "../paginationUtils";

describe("paginationUtils", () => {
    describe("calculatePrevPage", () => {
        it("현재 페이지에 아이템이 2개 이상이면 현재 페이지를 반환해야 한다", () => {
            expect(calculatePrevPage(1, 10)).toBe(1);
            expect(calculatePrevPage(2, 5)).toBe(2);
            expect(calculatePrevPage(5, 2)).toBe(5);
        });

        it("첫 페이지에서는 아이템 개수와 관계없이 1을 반환해야 한다", () => {
            expect(calculatePrevPage(1, 1)).toBe(1);
            expect(calculatePrevPage(1, 0)).toBe(1);
        });

        it("현재 페이지에 아이템이 1개만 있고 첫 페이지가 아니면 이전 페이지를 반환해야 한다", () => {
            expect(calculatePrevPage(2, 1)).toBe(1);
            expect(calculatePrevPage(5, 1)).toBe(4);
            expect(calculatePrevPage(10, 1)).toBe(9);
        });

        it("현재 페이지에 아이템이 0개인 경우도 올바르게 처리해야 한다", () => {
            // 아이템이 0개면 삭제할 아이템이 없으므로 현재 페이지 유지
            expect(calculatePrevPage(3, 0)).toBe(3);
        });

        it("경계 조건을 올바르게 처리해야 한다", () => {
            // 2페이지에서 마지막 아이템 삭제 시 1페이지로
            expect(calculatePrevPage(2, 1)).toBe(1);

            // 3페이지에서 2개 이상 아이템이 있으면 현재 페이지 유지
            expect(calculatePrevPage(3, 2)).toBe(3);
        });
    });
});
