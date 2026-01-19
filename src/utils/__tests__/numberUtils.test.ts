/**
 * numberUtils 테스트
 */

import { makeIntComma } from "../numberUtils";

describe("numberUtils", () => {
    describe("makeIntComma", () => {
        it("숫자에 천 단위 콤마를 추가해야 한다", () => {
            expect(makeIntComma(1000)).toBe("1,000");
            expect(makeIntComma(1000000)).toBe("1,000,000");
            expect(makeIntComma(123456789)).toBe("123,456,789");
        });

        it("0을 올바르게 처리해야 한다", () => {
            expect(makeIntComma(0)).toBe("0");
        });

        it("음수도 올바르게 처리해야 한다", () => {
            expect(makeIntComma(-1000)).toBe("-1,000");
            expect(makeIntComma(-1000000)).toBe("-1,000,000");
        });

        it("1000 미만의 숫자는 콤마 없이 반환해야 한다", () => {
            expect(makeIntComma(1)).toBe("1");
            expect(makeIntComma(10)).toBe("10");
            expect(makeIntComma(100)).toBe("100");
            expect(makeIntComma(999)).toBe("999");
        });

        it("null 값은 '0'을 반환해야 한다", () => {
            expect(makeIntComma(null)).toBe("0");
        });

        it("undefined 값은 '0'을 반환해야 한다", () => {
            expect(makeIntComma(undefined)).toBe("0");
        });

        it("소수점이 있는 숫자도 올바르게 처리해야 한다", () => {
            expect(makeIntComma(1000.5)).toBe("1,000.5");
            expect(makeIntComma(1234567.89)).toBe("1,234,567.89");
        });
    });
});
