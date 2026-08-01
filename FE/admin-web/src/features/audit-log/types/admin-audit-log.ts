// 역할 : AdminAuditAction Admin 감사 로그 action 값을 정의합니다.
export type AdminAuditAction =
  | "ADMIN_LOGIN"
  | "ADMIN_USER_LIST_VIEW"
  | "ADMIN_USER_DETAIL_VIEW"
  | "ADMIN_DOMAIN_RECORDS_VIEW"
  | "ADMIN_TRASH_VIEW"
  | "ADMIN_PROVIDER_FAILURE_VIEW"
  | "ADMIN_ANALYTICS_VIEW"
  | "ADMIN_ACCOUNT_DELETION_VIEW"
  | "ADMIN_DATA_EXPORT_VIEW"
  | "ADMIN_SYSTEM_CHECK_VIEW"
  | "ADMIN_SYSTEM_CHECK_RECORDED"
  | "ADMIN_SENSITIVE_RAW_ACCESS";

// 역할 : AdminAuditResult Admin 감사 로그 처리 결과 값을 정의합니다.
export type AdminAuditResult = "SUCCESS" | "DENIED" | "FAILED";

// 역할 : AdminTargetType Admin 감사 또는 민감 원문 조회 대상 값을 정의합니다.
export type AdminTargetType =
  | "USER"
  | "COMPANY"
  | "CONTACT"
  | "PRODUCT"
  | "DEAL"
  | "SCHEDULE"
  | "MEETING_NOTE"
  | "BUSINESS_CARD_SCAN"
  | "IMPORT_JOB"
  | "NOTIFICATION"
  | "PROVIDER_FAILURE"
  | "TRASH_RECORD"
  | "ACCOUNT_DELETION_REQUEST"
  | "DATA_EXPORT_REQUEST"
  | "SYSTEM_OPERATION_CHECK";

// 역할 : AdminSensitiveFieldSet Admin 민감 원문 조회 필드 묶음을 정의합니다.
export type AdminSensitiveFieldSet =
  | "USER_CONTACT"
  | "DOMAIN_MEMO"
  | "MEETING_NOTE_BODY"
  | "TRASH_RECORD_DETAIL";

// 역할 : AdminAuditLogListParams Admin 감사 로그 목록 조회 params를 정의합니다.
export type AdminAuditLogListParams = {
  readonly cursor?: string;
  readonly limit?: number;
  readonly adminUserId?: string;
  readonly targetUserId?: string;
  readonly action?: AdminAuditAction;
  readonly result?: AdminAuditResult;
  readonly from?: string;
  readonly to?: string;
};

// 역할 : AdminAuditLogListItem Admin 감사 로그 목록 item 응답을 정의합니다.
export type AdminAuditLogListItem = {
  readonly id: string;
  readonly adminUserId: string;
  readonly adminEmailMasked: string | null;
  readonly targetUserId: string | null;
  readonly targetType: AdminTargetType;
  readonly targetId: string | null;
  readonly action: AdminAuditAction;
  readonly result: AdminAuditResult;
  readonly reasonPreview: string | null;
  readonly requestId: string | null;
  readonly createdAt: string;
};

// 역할 : AdminAuditLogListResponse Admin 감사 로그 목록 응답을 정의합니다.
export type AdminAuditLogListResponse = {
  readonly items: AdminAuditLogListItem[];
  readonly nextCursor: string | null;
};

// 역할 : AdminSensitiveRawAccessRequest Admin 민감 원문 조회 요청을 정의합니다.
export type AdminSensitiveRawAccessRequest = {
  readonly targetUserId: string;
  readonly targetType: AdminTargetType;
  readonly targetId: string;
  readonly fieldSet: AdminSensitiveFieldSet;
  readonly reason: string;
};

// 역할 : AdminSensitiveRawAccessResponse Admin 민감 원문 조회 응답을 정의합니다.
export type AdminSensitiveRawAccessResponse = {
  readonly accessId: string;
  readonly targetUserId: string;
  readonly targetType: AdminTargetType;
  readonly targetId: string;
  readonly fieldSet: AdminSensitiveFieldSet;
  readonly data: Record<string, string | null>;
  readonly createdAt: string;
};
