/**
 * 토스트 메시지 상수
 */
export const CONSOLE_TOAST_MESSAGES = {
    UPDATED: "수정되었습니다.",
    CREATED: "등록되었습니다.",
    DELETED: "삭제되었습니다.",
    SAVED: "저장되었습니다.",
    ORDER_CHANGED: "순서가 변경되었습니다.",
    EXPOSURE_CHANGED: "노출설정이 변경되었습니다.",
    MOVED: "이동되었습니다.",
    LEVEL_CHANGED: "회원등급이 변경되었습니다.",
    WITHDRAWN: "탈퇴 처리되었습니다.",
    NOTICE_CHANGED: "공지설정이 변경되었습니다.",
    COMMENT_CREATED: "댓글이 등록되었습니다.",
    COMMENT_UPDATED: "댓글이 수정되었습니다.",
    COMMENT_DELETED: "댓글이 삭제되었습니다.",
    IMAGE_UPLOADED: "이미지가 등록되었습니다.",
    LINK_COPIED: "링크가 복사되었습니다.",
    LEVEL_SET: "설정되었습니다.",
    STATUS_EXPOSED: "노출 되었습니다.",
    STATUS_STOPPED: "중단 되었습니다.",
    STATUS_DELETED: "삭제 되었습니다.",
} as const;

/**
 * 확인 팝업 메시지 상수
 */
export const CONSOLE_CONFIRM_MESSAGES = {
    SAVE: "저장하시겠습니까?",
    DELETE: "삭제하시겠습니까?",
    WITHDRAW_MEMBER: "회원을 탈퇴 처리하시겠습니까?",
    WITHDRAW_MEMBER_CONTENT: "탈퇴한 회원은 복구할 수 없으며, <br />탈퇴 회원 목록에 가입 시 등록하신 이메일 정보가 기록됩니다.",
    COMMENT_REQUIRED: "댓글을 입력해주세요.",
    SELECT_ITEM: (itemName: string) => `${itemName} 선택해주세요.`,
    CHANGE_EXPOSURE: (itemName: string, action: string) =>
        `${itemName} ${action} 하시겠습니까?`,
    DELETE_ITEM: (itemName: string) => `${itemName} 삭제하시겠습니까?`,
    MAX_FILES: (maxLength: number) => `최대 ${maxLength}개까지 첨부 가능합니다.`,
} as const;

