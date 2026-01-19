/**
 * API 응답 타입 정의
 * 모든 API 응답의 공통 구조와 각 엔티티별 타입을 정의합니다.
 */

// ============================================================================
// 공통 응답 타입
// ============================================================================

/**
 * 기본 API 응답 구조
 * 모든 API 응답은 이 형태를 따릅니다.
 */
export interface ApiResponse<T = unknown> {
    code: number;
    message: string;
    data: T;
}

/**
 * 페이지네이션이 포함된 목록 응답
 */
export interface PaginatedData<T> {
    data_list: T[];
    total_count: number;
    last_page: number;
    current_page?: number;
}

/**
 * API 에러 응답 구조
 */
export interface ApiErrorResponse {
    code: number;
    message: string;
    details?: Record<string, string[]>;
}

// ============================================================================
// 게시판 관련 타입
// ============================================================================

/**
 * 게시글 아이템
 */
export interface PostItem {
    idx: number;
    category: number;
    b_title: string;
    b_notice: string;
    b_num: number;
    b_img: string | null;
    g_name: string | null;
    g_status: string;
    comment_count: number;
    b_view: number;
    b_reg_date: string;
    m_name: string;
}

/**
 * 게시글 상세 정보
 */
export interface PostDetail extends PostItem {
    b_contents: string;
    b_file: PostFile[];
    b_secret: string;
    b_password?: string;
    m_email: string;
    b_reply_depth?: number;
    b_reply_order?: number;
    b_parent_idx?: number;
}

/**
 * 게시글 첨부파일
 */
export interface PostFile {
    idx: number;
    bf_file: string;
    bf_original_name: string;
    bf_size: number;
}

/**
 * 게시판 분류(그룹) 아이템
 */
export interface BoardGroupItem {
    id: number;
    g_num: number;
    g_name: string;
    use_yn: string[];
}

/**
 * 게시판 설정 정보
 */
export interface BoardSettingData {
    c_content_type: number;
    b_column_title: string;
    b_column_date: string;
    b_column_view: string;
    b_column_file: string;
    limit: number;
    b_read_lv: number;
    b_write_lv: number;
    b_secret: string;
    b_reply: string;
    b_reply_lv: number;
    b_comment: string;
    b_comment_lv: number;
    b_top_html: string;
    b_template: string;
    b_template_text: string;
    b_thumbnail_with: number;
    b_thumbnail_height: number;
    b_group: string;
}

/**
 * 게시판 이름 정보
 */
export interface BoardNameItem {
    category: number;
    c_name: string;
}

/**
 * 게시글 목록 응답 데이터
 */
export interface PostListData extends PaginatedData<PostItem>, BoardSettingData {
    board_Name: BoardNameItem[];
}

/**
 * 댓글 아이템
 */
export interface CommentItem {
    idx: number;
    c_contents: string;
    c_reg_date: string;
    m_name: string;
    m_email: string;
    c_depth: number;
    c_order: number;
    c_parent_idx: number | null;
}

// ============================================================================
// 회원 관련 타입
// ============================================================================

/**
 * 회원 아이템 (목록용)
 */
export interface MemberItem {
    idx: number;
    m_name: string;
    m_level: number;
    m_mobile: string;
    m_email: string;
    reg_date: string;
}

/**
 * 회원 상세 정보
 */
export interface MemberDetail extends MemberItem {
    m_status: string;
    m_memo?: string;
    m_login_date?: string;
    m_update_date?: string;
}

/**
 * 회원 목록 응답 데이터
 */
export interface MemberListData extends PaginatedData<MemberItem> {}

/**
 * 탈퇴 회원 아이템
 */
export interface WithdrawnMemberItem {
    idx: number;
    m_name: string;
    m_email: string;
    m_withdrawn_date: string;
    m_withdrawn_reason?: string;
}

// ============================================================================
// 배너 관련 타입
// ============================================================================

/**
 * 배너 아이템 (목록용)
 */
export interface BannerItem {
    idx: number;
    b_file: string | null;
    b_title: string;
    b_s_date: string;
    b_e_date: string;
    b_size: string[];
    b_open: string[];
    b_moveNum: number;
    b_c_type: string;
}

/**
 * 배너 상세 정보
 */
export interface BannerDetail extends BannerItem {
    b_type: string;
    b_lang: string;
    b_link: string;
    b_link_target: string;
    b_width_size: string;
    b_height_size: string;
    b_html?: string;
    b_mobile_file?: string | null;
}

/**
 * 배너 목록 응답 데이터
 */
export interface BannerListData extends PaginatedData<BannerItem> {}

// ============================================================================
// 팝업 관련 타입
// ============================================================================

/**
 * 팝업 아이템 (목록용)
 */
export interface PopupItem {
    idx: number;
    p_title: string;
    p_s_date: string;
    p_e_date: string;
    p_open: string[];
    p_moveNum: number;
}

/**
 * 팝업 상세 정보
 */
export interface PopupDetail extends PopupItem {
    p_type: string;
    p_lang: string;
    p_contents: string;
    p_width: number;
    p_height: number;
    p_top: number;
    p_left: number;
}

/**
 * 팝업 목록 응답 데이터
 */
export interface PopupListData extends PaginatedData<PopupItem> {}

// ============================================================================
// 메뉴/카테고리 관련 타입
// ============================================================================

/**
 * 카테고리 아이템
 */
export interface CategoryItem {
    idx: number;
    c_name: string;
    c_type: string;
    c_depth: number;
    c_order: number;
    c_parent_idx: number | null;
    c_use_yn: string;
    c_url?: string;
    c_target?: string;
}

/**
 * 메뉴 트리 노드
 */
export interface MenuTreeNode extends CategoryItem {
    children?: MenuTreeNode[];
}

// ============================================================================
// 통계 관련 타입
// ============================================================================

/**
 * 방문자 통계 아이템
 */
export interface VisitorStatItem {
    date: string;
    visit_count: number;
    page_view: number;
    unique_visitor: number;
}

/**
 * 차트 데이터 포인트
 */
export interface ChartDataPoint {
    name: string;
    value: number;
    [key: string]: string | number;
}

// ============================================================================
// 사이트 설정 관련 타입
// ============================================================================

/**
 * 사이트 정보
 */
export interface SiteInfo {
    site_id: string;
    site_name: string;
    site_url: string;
    site_logo?: string;
    site_favicon?: string;
    site_description?: string;
    site_keywords?: string;
}

/**
 * 사이트 설정
 */
export interface SiteConfig {
    c_lang: string[];
    c_default_lang: string;
    c_timezone: string;
    c_date_format: string;
}

/**
 * 레벨 설정 아이템
 */
export interface LevelItem {
    idx: number;
    l_level: number;
    l_name: string;
    l_icon?: string;
}

/**
 * 정책 아이템
 */
export interface PolicyItem {
    idx: number;
    p_type: string;
    p_lang: string;
    p_title: string;
    p_contents: string;
    p_update_date: string;
}

// ============================================================================
// 인증 관련 타입
// ============================================================================

/**
 * 로그인 요청
 */
export interface LoginRequest {
    m_email: string;
    m_password: string;
}

/**
 * 로그인 응답 데이터
 */
export interface LoginResponseData {
    accessToken: string;
    refreshToken: string;
    m_email: string;
    m_name: string;
    m_level: number;
    m_menu_auth?: string;
}

/**
 * 토큰 갱신 응답 데이터
 */
export interface RefreshTokenResponseData {
    accessToken: string;
    refreshToken: string;
}

// ============================================================================
// 공통 파라미터 타입
// ============================================================================

/**
 * 목록 조회 공통 파라미터
 */
export interface ListParams {
    page: number;
    limit: number;
    search?: string;
    searchtxt?: string;
}

/**
 * 날짜 범위 파라미터
 */
export interface DateRangeParams {
    sdate?: string;
    edate?: string;
}

/**
 * 정렬 파라미터
 */
export interface SortParams {
    sort_field?: string;
    sort_order?: "asc" | "desc";
}

// ============================================================================
// 파일 업로드 관련 타입
// ============================================================================

/**
 * 업로드된 파일 정보
 */
export interface UploadedFile {
    idx: number;
    file_name: string;
    file_path: string;
    file_size: number;
    file_type: string;
}

/**
 * 파일 업로드 응답
 */
export interface FileUploadResponse {
    file_url: string;
    file_name: string;
}

// ============================================================================
// 유틸리티 타입
// ============================================================================

/**
 * 선택 옵션 아이템
 */
export interface SelectOption<T = string> {
    value: T;
    label: string;
}

/**
 * 키-값 쌍
 */
export interface KeyValue<K = string, V = string> {
    key: K;
    value: V;
}
