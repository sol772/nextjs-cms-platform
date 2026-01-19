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

// 공통 타입 파라미터 타입
export interface TypeParams {
    type: string;
    [key: string]: string | number;
}

// 공통 검색타입 파라미터 타입
export interface SearchParams {
    search: string;
    [key: string]: string | number;
}

// 공통 상세 파라미터 타입
export interface DetailParams {
    detail: string;
    [key: string]: string | number;
}

// 공통 생성 파라미터 타입
export interface CreateParams {
    create: string;
    [key: string]: string | number;
}

// 공통 날짜 파라미터 타입
export interface DateParams {
    sdate: string;
    edate: string;
    [key: string]: string | number;
}

// 공통 게시판분류 파라미터 타입
export interface BoardGroupParams {
    group: string;
    [key: string]: string | number;
}

// 게시글관리 리스트 파라미터 타입
export interface PostListParams extends ListParams, SearchParams, DetailParams, CreateParams, BoardGroupParams {
    edit: string; // 게시글 수정 ["0","1"]
}

// 댓글관리 리스트 파라미터 타입
export interface CommentListParams extends ListParams, SearchParams {
    idx: string;
    category: string;
    boardIdx: string;
}

// 카테고리 리스트 파라미터 타입
export interface CategoryListParams extends LanguageParams, DetailParams, CreateParams {
    isSub: string;
}

// 회원관리 리스트 파라미터 타입
export interface MemberListParams extends ListParams, SearchParams, DetailParams, DateParams {
    mLevel: string;
}

// 배너 리스트 파라미터 타입
export interface BannerListParams extends ListParams, TypeParams, DetailParams, CreateParams, LanguageParams {
}

// 팝업 리스트 파라미터 타입
export interface PopupListParams extends ListParams, LanguageParams, TypeParams, DetailParams, CreateParams {
}

// 운영정책 리스트 파라미터 타입
export interface PolicyListParams extends ListParams, LanguageParams, TypeParams, DetailParams {
}

// 전체 통계 리스트 파라미터 타입
export interface StatisticsListParams extends DateParams, TypeParams {
}

// 방문자 이력 통계 리스트 파라미터 타입
export interface VisitorListParams extends ListParams, DateParams {
}

// 유지보수 리스트 파라미터 타입
export interface MaintListParams extends ListParams, DetailParams, CreateParams {
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

// 리스트 페이지 크기 옵션
export const listSizes = [10, 20, 30, 50];

// 리스트 페이지 크기 초기값
export const initialListSize = 10;

// 디바이스 탭 타입
export const deviceTypes = ["P", "M"];

// 디바이스 탭 초기값
export const initialDeviceType = "P";

// 통계 날짜 타입
export const statisticsDateTypes = ["daily", "monthly"];

// 통계 날짜 초기값
export const initialStatisticsDateType = "daily";