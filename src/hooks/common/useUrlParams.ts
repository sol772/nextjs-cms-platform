"use client";

import { useRouter,useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

interface IUrlParamsConfig {
    [key: string]: {
        defaultValue: string | number;
        type: "string" | "number";
        validValues?: (string | number)[];
    };
}

interface IUseUrlParamsReturn<T extends Record<string, string | number>> {
    urlParams: T;
    initialUrlParams: T;
    updateUrlParams: (newParams: Partial<T>) => void;
    resetUrlParams: () => void;
}

export const useUrlParams = <T extends Record<string, string | number>>(
    config: IUrlParamsConfig,
): IUseUrlParamsReturn<T> => {
    const searchParams = useSearchParams();
    const router = useRouter();

    // URL에서 현재 파라미터 값들 읽기
    const urlParams = useMemo(() => {
        const result = {} as T;

        Object.entries(config).forEach(([key, { defaultValue, type, validValues }]) => {
            const urlValue = searchParams.get(key);

            if (urlValue !== null) {
                if (type === "number") {
                    const numValue = Number(urlValue);
                    // 유효한 숫자인지 확인 (NaN, Infinity 제외)
                    if (!isNaN(numValue) && isFinite(numValue)) {
                        // validValues가 있으면 허용된 값인지 확인
                        if (validValues && !validValues.includes(numValue)) {
                            console.warn(
                                `Invalid number value for ${key}: "${urlValue}" (not in allowed values) → using default: ${defaultValue}`,
                            );
                            result[key as keyof T] = defaultValue as T[keyof T];
                        } else {
                            result[key as keyof T] = numValue as T[keyof T];
                        }
                    } else {
                        console.warn(`Invalid number value for ${key}: "${urlValue}" → using default: ${defaultValue}`);
                        result[key as keyof T] = defaultValue as T[keyof T];
                    }
                } else if (type === "string") {
                    // validValues가 있으면 허용된 값인지 확인
                    if (validValues && !validValues.includes(urlValue)) {
                        console.warn(
                            `Invalid string value for ${key}: "${urlValue}" (not in allowed values) → using default: ${defaultValue}`,
                        );
                        result[key as keyof T] = defaultValue as T[keyof T];
                    } else {
                        result[key as keyof T] = urlValue as T[keyof T];
                    }
                }
            } else {
                result[key as keyof T] = defaultValue as T[keyof T];
            }
        });

        return result;
    }, [searchParams, config]);

    // 초기값들 (컴포넌트가 처음 마운트될 때의 값들)
    const initialUrlParams = useMemo(() => {
        const result = {} as T;

        Object.entries(config).forEach(([key, { defaultValue }]) => {
            result[key as keyof T] = defaultValue as T[keyof T];
        });

        return result;
    }, [config]);

    // URL 파라미터 업데이트 함수
    const updateUrlParams = useCallback(
        (newParams: Partial<T>) => {
            const urlParams = new URLSearchParams(searchParams.toString());

            Object.entries(newParams).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    urlParams.set(key, String(value));
                } else {
                    urlParams.delete(key);
                }
            });

            router.replace(`?${urlParams.toString()}`);
        },
        [searchParams, router],
    );

    // 기본값으로 리셋
    const resetUrlParams = useCallback(() => {
        const defaultParams = {} as Partial<T>;

        Object.entries(config).forEach(([key, { defaultValue }]) => {
            defaultParams[key as keyof T] = defaultValue as T[keyof T];
        });

        updateUrlParams(defaultParams);
    }, [config, updateUrlParams]);

    return {
        urlParams,
        initialUrlParams,
        updateUrlParams,
        resetUrlParams,
    };
};
