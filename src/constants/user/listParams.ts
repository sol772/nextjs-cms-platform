// 공통 리스트 파라미터 타입
export interface ListParams {
    page: number;
    searchtxt: string;
    [key: string]: string | number;
}

// 공통 언어 파라미터 타입
export interface LanguageParams {
    lang: string;
    [key: string]: string | number;
}

// 공통 검색 파라미터 타입
export interface SearchParams {
    search: string;
    [key: string]: string | number;
}

// 공통 게시판분류 파라미터 타입
export interface BoardGroupParams {
    group: string;
    [key: string]: string | number;
}

// 게시글 리스트 파라미터 타입
export interface PostListParams extends ListParams, SearchParams, BoardGroupParams {
}

// 세미나 리스트 파라미터 타입
export interface SeminarListParams {
    date: string;
    [key: string]: string;
}

// 리스트 검색 타입
export const listSearchTypes = [
    { value: "title", label: "제목만" },
    { value: "titlecontents", label: "제목+내용" },
    { value: "name", label: "작성자" },
    { value: "email", label: "이메일" },
];

// 회원리스트 검색 타입
export const memberListSearchTypes = [
    { value: "email", label: "이메일" },
    { value: "name", label: "회원명" },
    { value: "phone", label: "휴대폰번호" },
];

// 리스트 페이지 초기값
export const initialPage = 1;

// 리스트 페이지 크기 초기값
export const initialListSize = 10;

export const initialGalleryListSize = 8;