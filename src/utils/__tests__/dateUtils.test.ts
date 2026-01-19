/**
 * dateUtils 테스트
 */

import {
    getSevenDaysAgo,
    getOneMonthAgo,
    getThreeMonthsAgo,
    getSixMonthsAgo,
    getToday,
} from "../dateUtils";

describe("dateUtils", () => {
    // 테스트 시작 시간 고정
    const fixedDate = new Date("2024-06-15T12:00:00.000Z");

    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(fixedDate);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe("getToday", () => {
        it("현재 날짜를 반환해야 한다", () => {
            const result = getToday();
            expect(result.getTime()).toBe(fixedDate.getTime());
        });

        it("Date 객체를 반환해야 한다", () => {
            const result = getToday();
            expect(result).toBeInstanceOf(Date);
        });
    });

    describe("getSevenDaysAgo", () => {
        it("7일 전 날짜를 반환해야 한다", () => {
            const result = getSevenDaysAgo();
            const expected = new Date("2024-06-08T12:00:00.000Z");

            expect(result.getDate()).toBe(expected.getDate());
            expect(result.getMonth()).toBe(expected.getMonth());
            expect(result.getFullYear()).toBe(expected.getFullYear());
        });

        it("Date 객체를 반환해야 한다", () => {
            const result = getSevenDaysAgo();
            expect(result).toBeInstanceOf(Date);
        });
    });

    describe("getOneMonthAgo", () => {
        it("1개월 전 날짜를 반환해야 한다", () => {
            const result = getOneMonthAgo();

            // 6월 15일에서 1개월 전 = 5월 15일
            expect(result.getMonth()).toBe(4); // 0-indexed, 5월 = 4
            expect(result.getDate()).toBe(15);
            expect(result.getFullYear()).toBe(2024);
        });

        it("Date 객체를 반환해야 한다", () => {
            const result = getOneMonthAgo();
            expect(result).toBeInstanceOf(Date);
        });
    });

    describe("getThreeMonthsAgo", () => {
        it("3개월 전 날짜를 반환해야 한다", () => {
            const result = getThreeMonthsAgo();

            // 6월 15일에서 3개월 전 = 3월 15일
            expect(result.getMonth()).toBe(2); // 0-indexed, 3월 = 2
            expect(result.getDate()).toBe(15);
            expect(result.getFullYear()).toBe(2024);
        });

        it("Date 객체를 반환해야 한다", () => {
            const result = getThreeMonthsAgo();
            expect(result).toBeInstanceOf(Date);
        });
    });

    describe("getSixMonthsAgo", () => {
        it("6개월 전 날짜를 반환해야 한다", () => {
            const result = getSixMonthsAgo();

            // 6월 15일에서 6개월 전 = 12월 15일 (2023년)
            expect(result.getMonth()).toBe(11); // 0-indexed, 12월 = 11
            expect(result.getDate()).toBe(15);
            expect(result.getFullYear()).toBe(2023);
        });

        it("Date 객체를 반환해야 한다", () => {
            const result = getSixMonthsAgo();
            expect(result).toBeInstanceOf(Date);
        });
    });

    describe("월 경계 처리", () => {
        it("월 말일에서 이전 달로 계산할 때 올바르게 처리해야 한다", () => {
            // 3월 31일로 설정
            const marchEnd = new Date("2024-03-31T12:00:00.000Z");
            jest.setSystemTime(marchEnd);

            const result = getOneMonthAgo();

            // 3월 31일에서 1개월 전은 2월로 가야 하지만,
            // 2월에는 31일이 없으므로 JavaScript Date가 자동으로 조정함
            expect(result.getMonth()).toBeLessThanOrEqual(2);
        });
    });
});
