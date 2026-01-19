/**
 * Cleanup 유틸리티 훅 모음
 * 메모리 누수를 방지하기 위한 훅들을 제공합니다.
 */

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 컴포넌트 마운트 상태를 추적하는 훅
 * 비동기 작업에서 언마운트된 컴포넌트에 상태 업데이트를 방지합니다.
 *
 * @returns 마운트 상태를 나타내는 ref 객체
 *
 * @example
 * ```tsx
 * const isMounted = useMountedRef();
 *
 * useEffect(() => {
 *   fetchData().then(data => {
 *     if (isMounted.current) {
 *       setData(data);
 *     }
 *   });
 * }, []);
 * ```
 */
export function useMountedRef() {
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    return isMounted;
}

/**
 * 안전한 상태 업데이트를 위한 훅
 * 언마운트된 컴포넌트에서의 상태 업데이트를 자동으로 방지합니다.
 *
 * @param initialValue - 초기 상태 값
 * @returns [state, safeSetState] 튜플
 *
 * @example
 * ```tsx
 * const [data, setData] = useSafeState<User | null>(null);
 *
 * useEffect(() => {
 *   fetchUser().then(user => setData(user)); // 언마운트 시 무시됨
 * }, []);
 * ```
 */
export function useSafeState<T>(initialValue: T) {
    const [state, setState] = useState(initialValue);
    const isMounted = useMountedRef();

    const safeSetState = useCallback(
        (value: T | ((prev: T) => T)) => {
            if (isMounted.current) {
                setState(value);
            }
        },
        [isMounted],
    );

    return [state, safeSetState] as const;
}

/**
 * 이벤트 리스너 자동 정리 훅
 * 컴포넌트 언마운트 시 자동으로 이벤트 리스너를 제거합니다.
 *
 * @param eventName - 이벤트 이름
 * @param handler - 이벤트 핸들러
 * @param element - 이벤트를 등록할 요소 (기본값: window)
 * @param options - 이벤트 리스너 옵션
 *
 * @example
 * ```tsx
 * useEventListener('resize', () => {
 *   console.log('Window resized');
 * });
 *
 * useEventListener('click', handleClick, buttonRef.current);
 * ```
 */
export function useEventListener<K extends keyof WindowEventMap>(
    eventName: K,
    handler: (event: WindowEventMap[K]) => void,
    element?: HTMLElement | Window | null,
    options?: boolean | AddEventListenerOptions,
): void;

export function useEventListener<K extends keyof HTMLElementEventMap>(
    eventName: K,
    handler: (event: HTMLElementEventMap[K]) => void,
    element: HTMLElement | null,
    options?: boolean | AddEventListenerOptions,
): void;

export function useEventListener(
    eventName: string,
    handler: (event: Event) => void,
    element?: HTMLElement | Window | null,
    options?: boolean | AddEventListenerOptions,
) {
    const savedHandler = useRef(handler);

    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        const targetElement = element ?? window;

        if (!targetElement?.addEventListener) {
            return;
        }

        const eventListener = (event: Event) => savedHandler.current(event);

        targetElement.addEventListener(eventName, eventListener, options);

        return () => {
            targetElement.removeEventListener(eventName, eventListener, options);
        };
    }, [eventName, element, options]);
}

/**
 * 타임아웃 자동 정리 훅
 * 컴포넌트 언마운트 시 자동으로 타임아웃을 정리합니다.
 *
 * @returns setTimeout과 clearTimeout을 래핑한 함수들
 *
 * @example
 * ```tsx
 * const { setTimeout, clearAllTimeouts } = useTimeout();
 *
 * const handleClick = () => {
 *   setTimeout(() => {
 *     console.log('Delayed action');
 *   }, 1000);
 * };
 * ```
 */
export function useTimeout() {
    const timeoutIds = useRef<Set<NodeJS.Timeout>>(new Set());

    const setTimeoutSafe = useCallback((callback: () => void, delay: number) => {
        const id = setTimeout(() => {
            callback();
            timeoutIds.current.delete(id);
        }, delay);

        timeoutIds.current.add(id);
        return id;
    }, []);

    const clearTimeoutSafe = useCallback((id: NodeJS.Timeout) => {
        clearTimeout(id);
        timeoutIds.current.delete(id);
    }, []);

    const clearAllTimeouts = useCallback(() => {
        timeoutIds.current.forEach(id => clearTimeout(id));
        timeoutIds.current.clear();
    }, []);

    useEffect(() => {
        return () => {
            clearAllTimeouts();
        };
    }, [clearAllTimeouts]);

    return {
        setTimeout: setTimeoutSafe,
        clearTimeout: clearTimeoutSafe,
        clearAllTimeouts,
    };
}

/**
 * 인터벌 자동 정리 훅
 * 컴포넌트 언마운트 시 자동으로 인터벌을 정리합니다.
 *
 * @param callback - 인터벌마다 실행할 콜백
 * @param delay - 인터벌 간격 (ms), null이면 인터벌 중지
 *
 * @example
 * ```tsx
 * const [count, setCount] = useState(0);
 * const [isRunning, setIsRunning] = useState(true);
 *
 * useInterval(() => {
 *   setCount(c => c + 1);
 * }, isRunning ? 1000 : null);
 * ```
 */
export function useInterval(callback: () => void, delay: number | null) {
    const savedCallback = useRef(callback);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (delay === null) {
            return;
        }

        const id = setInterval(() => savedCallback.current(), delay);

        return () => clearInterval(id);
    }, [delay]);
}

/**
 * 이전 값 추적 훅
 * 이전 렌더링에서의 값을 추적합니다.
 *
 * @param value - 추적할 값
 * @returns 이전 렌더링에서의 값
 *
 * @example
 * ```tsx
 * const [count, setCount] = useState(0);
 * const prevCount = usePrevious(count);
 *
 * // count가 5이고 이전에 4였다면
 * // prevCount === 4
 * ```
 */
export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T | undefined>(undefined);

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}

/**
 * 디바운스 값 훅
 * 값의 변경을 지정된 시간만큼 지연시킵니다.
 *
 * @param value - 디바운스할 값
 * @param delay - 지연 시간 (ms)
 * @returns 디바운스된 값
 *
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     searchApi(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * AbortController를 자동으로 정리하는 훅
 * API 요청 취소에 사용됩니다.
 *
 * @returns AbortController와 signal을 생성하는 함수
 *
 * @example
 * ```tsx
 * const { getSignal, abort } = useAbortController();
 *
 * useEffect(() => {
 *   const signal = getSignal();
 *
 *   fetch('/api/data', { signal })
 *     .then(res => res.json())
 *     .then(setData)
 *     .catch(err => {
 *       if (err.name !== 'AbortError') {
 *         console.error(err);
 *       }
 *     });
 *
 *   return () => abort();
 * }, []);
 * ```
 */
export function useAbortController() {
    const controllerRef = useRef<AbortController | null>(null);

    const getSignal = useCallback(() => {
        // 이전 컨트롤러가 있으면 중단
        if (controllerRef.current) {
            controllerRef.current.abort();
        }

        // 새 컨트롤러 생성
        controllerRef.current = new AbortController();
        return controllerRef.current.signal;
    }, []);

    const abort = useCallback(() => {
        if (controllerRef.current) {
            controllerRef.current.abort();
            controllerRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => {
            abort();
        };
    }, [abort]);

    return { getSignal, abort };
}
