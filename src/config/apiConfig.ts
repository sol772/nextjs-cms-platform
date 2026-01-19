export const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 공통
export const COMMON_API_ROUTES = {
    GET_SITE_INFO: "/v1/admin/config/site/:site_id/:c_lang",
    POST: {
        GET_LIST: "/v1/board/:category/:limit",
        GET_DETAIL: "/v1/board/view/:category/:idx",
        CRUD: "/v1/board", // POST, PUT, DELETE 모두 동일한 URL 사용
        POST_PASSWORD: "/v1/board/password",
    },
    POST_FILE: {
        DELETE: "/v1/board/file",
        DOWNLOAD: "/v1/board/download/:category/:parent_idx/:idx",
    },
    POST_GROUP: {
        GET: "/v1/admin/menu/boardGroup/:parent_id",
    },
    POST_COMMENT: {
        GET: "/v1/comment/user/:category/:board_idx",
        CRUD: "/v1/comment/user",
    },
    REFRESH_TOKEN: "/v1/auth/refresh",
};

// 사용자
export const USER_API_ROUTES = {
    GET_SITE_INFO: "/v1/main/config/site/:site_id/:c_lang",

    POLICY: {
        GET_LIST: "/v1/main/config/policy",
        GET_DETAIL: "/v1/main/config/policy/:idx",
    },

    CATEGORY: {
        GET_LIST: "/v1/main/menu",
        GET_SUB: "/v1/main/menu/sub/:id",
    },

    POPUP: {
        GET_LIST: "/v1/auth/popup/",
        GET_DETAIL: "/v1/auth/popupDetail/:idx",
    },

    GET_MAIN_BANNER: "/v1/main/banner",

    AUTH: {
        LOGIN: "/v1/auth/login",
        SIGNUP: "/v1/auth/signup",
        PASSWORD: "/v1/auth/email-password",
    },

    POST: {
        GET_GROUP: "/v1/main/menu/boardGroup/:parent_id",
    },
};

// 관리자
export const CONSOLE_API_ROUTES = {
    // 공통 --------------------
    BOARD_MENU: "/v1/admin/first/board-name",

    // 로그인 --------------------
    LOGIN: "/v1/auth/admin/login",

    // 메인 ----------------------
    MAIN_BOARD_COUNT: "/v1/admin/first/board-cnt",
    MAIN_CONNECTOR_COUNT: "/v1/admin/first/connector-cnt",
    MAIN_BOARD_LIST: "/v1/admin/first/board-list/:limit",
    MAIN_CONNECTOR_LIST: "/v1/admin/first/connector-list/:limit",
    GET_ALARM: "/v1/admin/first/alarm-cnt/:follow",
    PUT_ALARM: "/v1/admin/first/alarm-read-delete",

    // 게시판 관리 ----------------------
    POST: {
        PUT_ORDER: "/v1/board/moveOrder",
        PUT_NOTICE: "/v1/board/notice",
        PUT_MOVE: "/v1/board/move",
    },
    COMMENT: {
        GET: "/v1/comment/admin/:getLimit",
        DELETE: "/v1/comment/adminDelete",
    },

    // 메뉴 관리 ----------------------
    CATEGORY: {
        CRUD: "/v1/admin/menu",
        GET_DETAIL: "/v1/admin/menu/:id",
        PUT_ORDER: "/v1/admin/menu/move",
        CRUD_SUB: "/v1/admin/menu/sub",
        GET_SUB: "/v1/admin/menu/sub/:id",
        GET_BOARD_GROUP: "/v1/admin/menu/boardGroup/:parent_id",
        CRUD_BOARD_GROUP: "/v1/admin/menu/boardGroup",
        PUT_BOARD_GROUP_ORDER: "/v1/admin/menu/boardGroupMove",
        PUT_BOARD_GROUP_GRADE: "/v1/admin/menu/boardGroupGrade",
        GET_CDN_FILE_LIST: "/v1/admin/menu/cdn/imageList",
        POST_CDN_FILE: "/v1/admin/menu/cdn/image",
        DELETE_CDN_FILE: "/v1/admin/menu/cdn/imageDelete",
    },

    // 회원 관리 ----------------------
    MEMBER: {
        GET_LIST: "/v1/admin/member/list",
        GET_DETAIL: "/v1/admin/member/view/:idx",
        BASE: "/v1/admin/member",
        BASE_WITHDRAWN: "/v1/admin/member/sec",
        PUT_LEVEL: "/v1/admin/member/lvUpdate",
    },

    // 디자인 관리 ----------------------
    BANNER: {
        CRUD: "/v1/admin/banner",
        GET_DETAIL: "/v1/admin/banner/:idx",
        POST_OPEN: "/v1/admin/banner/open",
        PUT_ORDER: "/v1/admin/banner/move",
    },
    POPUP: {
        CRUD: "/v1/admin/popup",
        GET_DETAIL: "/v1/admin/popup/:idx",
        POST_OPEN: "/v1/admin/popup/open",
    },

    // 환경설정 ----------------------
    SITE: {
        GET: "/v1/admin/config/site/:site_id/:c_lang",
        PUT: "/v1/admin/config/site",
    },
    POLICY: {
        CRUD: "/v1/admin/config/policy",
        GET_DETAIL: "/v1/admin/config/policy/:idx",
        POST_USE: "/v1/admin/config/policy/use",
    },
    LEVEL: {
        BASE: "/v1/admin/config/level",
    },

    // 통계 관리 ----------------------
    STATISTICS: {
        GET_ALL: "/v1/admin/stat",
        GET_CHART: "/v1/admin/stat/chart",
        GET_DATA: "/v1/admin/stat/pre",
        GET_URL: "/v1/admin/stat/url",
        GET_AGENT: "/v1/admin/stat/agent",
        GET_VISITOR: "/v1/admin/stat/history",
    },

    // 유지보수 관리 ----------------------
    MAINTENANCE: {
        GET_LIST: "/v1/admin/maintenance/list/:category",
        GET_DETAIL: "/v1/admin/maintenance/view/:category/:list_no",
        GET_COMMENT: "/v1/admin/maintenance/comment/:list_no",
        GET_FILE: "/v1/admin/maintenance/download/:list_no",
        POST_CREATE: "/v1/admin/maintenance/create",
        POST_COMMENT: "/v1/admin/maintenance/comment",
    },
};
