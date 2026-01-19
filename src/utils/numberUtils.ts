// 숫자에 콤마 추가 (천 단위 구분)
export function makeIntComma(intVal: number | null | undefined): string {
    if (typeof intVal !== "number") return "0";
    return intVal.toLocaleString("ko-KR");
}
