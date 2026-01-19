/**
 * errors 모듈 테스트
 */

import axios, { AxiosError } from "axios";

import {
    ApiError,
    ApiErrorCode,
    BusinessError,
    BusinessErrorCode,
    DEFAULT_ERROR_MESSAGES,
    getDefaultErrorMessage,
    getErrorMessage,
    isApiError,
    isBusinessError,
    isValidationError,
    ValidationError,
} from "../errors";

describe("errors", () => {
    describe("ApiError", () => {
        it("올바른 속성으로 생성되어야 한다", () => {
            const error = new ApiError(404, "리소스를 찾을 수 없습니다.");

            expect(error.code).toBe(404);
            expect(error.message).toBe("리소스를 찾을 수 없습니다.");
            expect(error.name).toBe("ApiError");
            expect(error.isApiError).toBe(true);
        });

        it("details를 포함하여 생성할 수 있어야 한다", () => {
            const details = { email: ["이메일 형식이 올바르지 않습니다."] };
            const error = new ApiError(422, "유효성 검사 실패", details);

            expect(error.details).toEqual(details);
        });

        describe("fromAxiosError", () => {
            it("Axios 에러를 ApiError로 변환해야 한다", () => {
                const axiosError = {
                    response: {
                        status: 400,
                        data: {
                            message: "잘못된 요청입니다.",
                            details: { field: ["필수 항목입니다."] },
                        },
                    },
                    isAxiosError: true,
                } as AxiosError;

                // axios.isAxiosError 모킹
                jest.spyOn(axios, "isAxiosError").mockReturnValue(true);

                const error = ApiError.fromAxiosError(axiosError);

                expect(error.code).toBe(400);
                expect(error.message).toBe("잘못된 요청입니다.");
                expect(error.details).toEqual({ field: ["필수 항목입니다."] });
            });

            it("일반 Error를 ApiError로 변환해야 한다", () => {
                jest.spyOn(axios, "isAxiosError").mockReturnValue(false);

                const error = new Error("네트워크 에러");
                const apiError = ApiError.fromAxiosError(error);

                expect(apiError.code).toBe(500);
                expect(apiError.message).toBe("네트워크 에러");
            });

            it("알 수 없는 에러를 기본 ApiError로 변환해야 한다", () => {
                jest.spyOn(axios, "isAxiosError").mockReturnValue(false);

                const apiError = ApiError.fromAxiosError("unknown error");

                expect(apiError.code).toBe(500);
                expect(apiError.message).toBe("알 수 없는 에러가 발생했습니다.");
            });
        });

        describe("isAuthError", () => {
            it("401 에러에 대해 true를 반환해야 한다", () => {
                const error = new ApiError(401, "인증 필요");
                expect(error.isAuthError()).toBe(true);
            });

            it("403 에러에 대해 true를 반환해야 한다", () => {
                const error = new ApiError(403, "권한 없음");
                expect(error.isAuthError()).toBe(true);
            });

            it("다른 에러 코드에 대해 false를 반환해야 한다", () => {
                const error = new ApiError(404, "찾을 수 없음");
                expect(error.isAuthError()).toBe(false);
            });
        });

        describe("isRetryable", () => {
            it("500 에러에 대해 true를 반환해야 한다", () => {
                const error = new ApiError(500, "서버 에러");
                expect(error.isRetryable()).toBe(true);
            });

            it("503 에러에 대해 true를 반환해야 한다", () => {
                const error = new ApiError(503, "서비스 이용 불가");
                expect(error.isRetryable()).toBe(true);
            });

            it("400 에러에 대해 false를 반환해야 한다", () => {
                const error = new ApiError(400, "잘못된 요청");
                expect(error.isRetryable()).toBe(false);
            });
        });

        describe("isNotFound", () => {
            it("404 에러에 대해 true를 반환해야 한다", () => {
                const error = new ApiError(404, "찾을 수 없음");
                expect(error.isNotFound()).toBe(true);
            });

            it("다른 에러 코드에 대해 false를 반환해야 한다", () => {
                const error = new ApiError(500, "서버 에러");
                expect(error.isNotFound()).toBe(false);
            });
        });
    });

    describe("BusinessError", () => {
        it("올바른 속성으로 생성되어야 한다", () => {
            const error = new BusinessError(BusinessErrorCode.INVALID_PASSWORD, "비밀번호가 올바르지 않습니다.");

            expect(error.code).toBe(BusinessErrorCode.INVALID_PASSWORD);
            expect(error.message).toBe("비밀번호가 올바르지 않습니다.");
            expect(error.name).toBe("BusinessError");
            expect(error.isBusinessError).toBe(true);
        });

        it("context를 포함하여 생성할 수 있어야 한다", () => {
            const context = { attemptCount: 3 };
            const error = new BusinessError(
                BusinessErrorCode.RATE_LIMIT_EXCEEDED,
                "요청 횟수 초과",
                context,
            );

            expect(error.context).toEqual(context);
        });
    });

    describe("ValidationError", () => {
        it("올바른 속성으로 생성되어야 한다", () => {
            const fieldErrors = {
                email: ["이메일 형식이 올바르지 않습니다."],
                password: ["비밀번호는 8자 이상이어야 합니다."],
            };
            const error = new ValidationError("유효성 검사 실패", fieldErrors);

            expect(error.message).toBe("유효성 검사 실패");
            expect(error.fieldErrors).toEqual(fieldErrors);
            expect(error.name).toBe("ValidationError");
            expect(error.isValidationError).toBe(true);
        });

        describe("getFieldError", () => {
            it("특정 필드의 첫 번째 에러 메시지를 반환해야 한다", () => {
                const error = new ValidationError("유효성 검사 실패", {
                    email: ["이메일 형식이 올바르지 않습니다.", "이미 사용 중인 이메일입니다."],
                });

                expect(error.getFieldError("email")).toBe("이메일 형식이 올바르지 않습니다.");
            });

            it("존재하지 않는 필드에 대해 undefined를 반환해야 한다", () => {
                const error = new ValidationError("유효성 검사 실패", {
                    email: ["이메일 형식이 올바르지 않습니다."],
                });

                expect(error.getFieldError("password")).toBeUndefined();
            });
        });

        describe("getErrorFields", () => {
            it("에러가 있는 필드 목록을 반환해야 한다", () => {
                const error = new ValidationError("유효성 검사 실패", {
                    email: ["에러"],
                    password: ["에러"],
                    name: ["에러"],
                });

                expect(error.getErrorFields()).toEqual(["email", "password", "name"]);
            });
        });
    });

    describe("타입 가드 함수", () => {
        describe("isApiError", () => {
            it("ApiError 인스턴스에 대해 true를 반환해야 한다", () => {
                const error = new ApiError(400, "에러");
                expect(isApiError(error)).toBe(true);
            });

            it("일반 Error에 대해 false를 반환해야 한다", () => {
                const error = new Error("에러");
                expect(isApiError(error)).toBe(false);
            });

            it("isApiError 속성이 있는 객체에 대해 true를 반환해야 한다", () => {
                const error = { isApiError: true, code: 400, message: "에러" };
                expect(isApiError(error)).toBe(true);
            });
        });

        describe("isBusinessError", () => {
            it("BusinessError 인스턴스에 대해 true를 반환해야 한다", () => {
                const error = new BusinessError(BusinessErrorCode.INVALID_PASSWORD, "에러");
                expect(isBusinessError(error)).toBe(true);
            });

            it("일반 Error에 대해 false를 반환해야 한다", () => {
                const error = new Error("에러");
                expect(isBusinessError(error)).toBe(false);
            });
        });

        describe("isValidationError", () => {
            it("ValidationError 인스턴스에 대해 true를 반환해야 한다", () => {
                const error = new ValidationError("에러", {});
                expect(isValidationError(error)).toBe(true);
            });

            it("일반 Error에 대해 false를 반환해야 한다", () => {
                const error = new Error("에러");
                expect(isValidationError(error)).toBe(false);
            });
        });
    });

    describe("getDefaultErrorMessage", () => {
        it("정의된 에러 코드에 대해 기본 메시지를 반환해야 한다", () => {
            expect(getDefaultErrorMessage(400)).toBe(DEFAULT_ERROR_MESSAGES[400]);
            expect(getDefaultErrorMessage(401)).toBe(DEFAULT_ERROR_MESSAGES[401]);
            expect(getDefaultErrorMessage(403)).toBe(DEFAULT_ERROR_MESSAGES[403]);
            expect(getDefaultErrorMessage(404)).toBe(DEFAULT_ERROR_MESSAGES[404]);
            expect(getDefaultErrorMessage(500)).toBe(DEFAULT_ERROR_MESSAGES[500]);
        });

        it("정의되지 않은 에러 코드에 대해 기본 메시지를 반환해야 한다", () => {
            expect(getDefaultErrorMessage(999)).toBe("알 수 없는 에러가 발생했습니다.");
        });
    });

    describe("getErrorMessage", () => {
        it("ApiError에서 메시지를 추출해야 한다", () => {
            const error = new ApiError(400, "API 에러 메시지");
            expect(getErrorMessage(error)).toBe("API 에러 메시지");
        });

        it("BusinessError에서 메시지를 추출해야 한다", () => {
            const error = new BusinessError(BusinessErrorCode.INVALID_PASSWORD, "비즈니스 에러 메시지");
            expect(getErrorMessage(error)).toBe("비즈니스 에러 메시지");
        });

        it("ValidationError에서 메시지를 추출해야 한다", () => {
            const error = new ValidationError("유효성 에러 메시지", {});
            expect(getErrorMessage(error)).toBe("유효성 에러 메시지");
        });

        it("일반 Error에서 메시지를 추출해야 한다", () => {
            const error = new Error("일반 에러 메시지");
            expect(getErrorMessage(error)).toBe("일반 에러 메시지");
        });

        it("알 수 없는 에러 타입에 대해 기본 메시지를 반환해야 한다", () => {
            expect(getErrorMessage("string error")).toBe("알 수 없는 에러가 발생했습니다.");
            expect(getErrorMessage(null)).toBe("알 수 없는 에러가 발생했습니다.");
            expect(getErrorMessage(undefined)).toBe("알 수 없는 에러가 발생했습니다.");
        });
    });
});
