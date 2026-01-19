/**
 * API 관련 공통 상수
 */

// ============================================================================
// HTTP 상태 코드
// ============================================================================

/**
 * HTTP 상태 코드 상수
 */
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
} as const;

export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

// ============================================================================
// HTTP 메서드
// ============================================================================

/**
 * HTTP 메서드 상수
 */
export const HTTP_METHODS = {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    PATCH: "PATCH",
    DELETE: "DELETE",
} as const;

export type HttpMethod = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];

// ============================================================================
// 페이지네이션
// ============================================================================

/**
 * 페이지네이션 기본값
 */
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIST_SIZE: 10,
    DEFAULT_GALLERY_SIZE: 12,
    MAX_PAGE_BUTTONS: 10,
} as const;

// ============================================================================
// 캐시 시간
// ============================================================================

/**
 * 캐시 유지 시간 (밀리초)
 */
export const CACHE_TIME = {
    /** 1분 */
    SHORT: 1000 * 60 * 1,
    /** 5분 */
    MEDIUM: 1000 * 60 * 5,
    /** 30분 */
    LONG: 1000 * 60 * 30,
    /** 1시간 */
    VERY_LONG: 1000 * 60 * 60,
    /** 24시간 */
    DAY: 1000 * 60 * 60 * 24,
} as const;

// ============================================================================
// 로컬 스토리지 키
// ============================================================================

/**
 * 로컬 스토리지 키
 */
export const STORAGE_KEYS = {
    AUTH: "cms-auth-storage",
    BOARD: "cms-board-storage",
    SITE: "cms-site-storage",
} as const;

// ============================================================================
// 게시판 타입
// ============================================================================

/**
 * 게시판 콘텐츠 타입
 */
export const BOARD_CONTENT_TYPES = {
    BASIC: 1,
    GALLERY: 2,
    FAQ: 3,
    INQUIRY: 4,
    HTML: 5,
} as const;

export type BoardContentType = (typeof BOARD_CONTENT_TYPES)[keyof typeof BOARD_CONTENT_TYPES];

/**
 * 게시판 타입 레이블
 */
export const BOARD_TYPE_LABELS: Record<BoardContentType, string> = {
    [BOARD_CONTENT_TYPES.BASIC]: "일반 게시판",
    [BOARD_CONTENT_TYPES.GALLERY]: "갤러리 게시판",
    [BOARD_CONTENT_TYPES.FAQ]: "FAQ 게시판",
    [BOARD_CONTENT_TYPES.INQUIRY]: "문의 게시판",
    [BOARD_CONTENT_TYPES.HTML]: "HTML 게시판",
};

// ============================================================================
// 배너/팝업 타입
// ============================================================================

/**
 * 디바이스 타입
 */
export const DEVICE_TYPES = {
    PC: "P",
    MOBILE: "M",
} as const;

export type DeviceType = (typeof DEVICE_TYPES)[keyof typeof DEVICE_TYPES];

/**
 * 콘텐츠 타입 (이미지/HTML)
 */
export const CONTENT_TYPES = {
    IMAGE: "I",
    HTML: "H",
} as const;

export type ContentType = (typeof CONTENT_TYPES)[keyof typeof CONTENT_TYPES];

// ============================================================================
// 회원 레벨
// ============================================================================

/**
 * 회원 레벨
 */
export const MEMBER_LEVELS = {
    GUEST: 0,
    BASIC: 1,
    PREMIUM: 2,
    VIP: 3,
    ADMIN: 9,
} as const;

export type MemberLevel = (typeof MEMBER_LEVELS)[keyof typeof MEMBER_LEVELS];

// ============================================================================
// 공통 상태값
// ============================================================================

/**
 * Yes/No 상태
 */
export const YES_NO = {
    YES: "Y",
    NO: "N",
} as const;

export type YesNo = (typeof YES_NO)[keyof typeof YES_NO];

/**
 * 공개/비공개 상태
 */
export const OPEN_STATUS = {
    PUBLIC: "Y",
    PRIVATE: "N",
} as const;

export type OpenStatus = (typeof OPEN_STATUS)[keyof typeof OPEN_STATUS];

// ============================================================================
// 파일 업로드
// ============================================================================

/**
 * 파일 업로드 제한
 */
export const FILE_UPLOAD = {
    /** 최대 파일 크기 (10MB) */
    MAX_SIZE: 10 * 1024 * 1024,
    /** 이미지 허용 확장자 */
    IMAGE_EXTENSIONS: ["jpg", "jpeg", "png", "gif", "webp"],
    /** 문서 허용 확장자 */
    DOCUMENT_EXTENSIONS: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"],
    /** 비디오 허용 확장자 */
    VIDEO_EXTENSIONS: ["mp4", "webm", "mov"],
} as const;

/**
 * 이미지 MIME 타입
 */
export const IMAGE_MIME_TYPES = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/gif": [".gif"],
    "image/webp": [".webp"],
} as const;

// ============================================================================
// 검색 필드
// ============================================================================

/**
 * 게시글 검색 필드
 */
export const POST_SEARCH_FIELDS = {
    TITLE: "title",
    CONTENTS: "contents",
    TITLE_CONTENTS: "titlecontents",
    WRITER: "writer",
} as const;

export type PostSearchField = (typeof POST_SEARCH_FIELDS)[keyof typeof POST_SEARCH_FIELDS];

/**
 * 회원 검색 필드
 */
export const MEMBER_SEARCH_FIELDS = {
    EMAIL: "email",
    NAME: "name",
    MOBILE: "mobile",
} as const;

export type MemberSearchField = (typeof MEMBER_SEARCH_FIELDS)[keyof typeof MEMBER_SEARCH_FIELDS];

// ============================================================================
// 에러 메시지
// ============================================================================

/**
 * 공통 에러 메시지
 */
export const ERROR_MESSAGES = {
    NETWORK_ERROR: "네트워크 연결을 확인해주세요.",
    SERVER_ERROR: "서버 오류가 발생했습니다.",
    UNAUTHORIZED: "인증이 필요합니다.",
    FORBIDDEN: "접근 권한이 없습니다.",
    NOT_FOUND: "요청한 리소스를 찾을 수 없습니다.",
    VALIDATION_ERROR: "입력값을 확인해주세요.",
    UNKNOWN_ERROR: "알 수 없는 에러가 발생했습니다.",
} as const;

// ============================================================================
// 성공 메시지
// ============================================================================

/**
 * 공통 성공 메시지
 */
export const SUCCESS_MESSAGES = {
    CREATED: "등록되었습니다.",
    UPDATED: "수정되었습니다.",
    DELETED: "삭제되었습니다.",
    SAVED: "저장되었습니다.",
} as const;
