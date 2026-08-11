// 역할 : UserRole Admin 운영 read model에서 사용하는 사용자 권한 값을 정의합니다.
export const UserRole = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// 역할 : UserStatus Admin 운영 read model에서 사용하는 사용자 상태 값을 정의합니다.
export const UserStatus = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  DELETED: "DELETED",
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

// 역할 : NotificationDeliveryStatus Admin 사용자 알림 요약의 최근 발송 상태 값을 정의합니다.
export const NotificationDeliveryStatus = {
  PENDING: "PENDING",
  SENT: "SENT",
  FAILED: "FAILED",
  CANCELED: "CANCELED",
} as const;

export type NotificationDeliveryStatus =
  (typeof NotificationDeliveryStatus)[keyof typeof NotificationDeliveryStatus];

// 역할 : UserActivationStatus Admin 사용자 activation 요약 상태 값을 정의합니다.
export const UserActivationStatus = {
  NOT_ACTIVATED: "NOT_ACTIVATED",
  ACTIVATED: "ACTIVATED",
} as const;

export type UserActivationStatus =
  (typeof UserActivationStatus)[keyof typeof UserActivationStatus];

// 역할 : AdminAuditAction Admin 운영 감사 로그 action 값을 정의합니다.
export const AdminAuditAction = {
  ADMIN_LOGIN: "ADMIN_LOGIN",
  ADMIN_USER_LIST_VIEW: "ADMIN_USER_LIST_VIEW",
  ADMIN_USER_DETAIL_VIEW: "ADMIN_USER_DETAIL_VIEW",
  ADMIN_DOMAIN_RECORDS_VIEW: "ADMIN_DOMAIN_RECORDS_VIEW",
  ADMIN_TRASH_VIEW: "ADMIN_TRASH_VIEW",
  ADMIN_PROVIDER_FAILURE_VIEW: "ADMIN_PROVIDER_FAILURE_VIEW",
  ADMIN_ANALYTICS_VIEW: "ADMIN_ANALYTICS_VIEW",
  ADMIN_ACCOUNT_DELETION_VIEW: "ADMIN_ACCOUNT_DELETION_VIEW",
  ADMIN_DATA_EXPORT_VIEW: "ADMIN_DATA_EXPORT_VIEW",
  ADMIN_SYSTEM_CHECK_VIEW: "ADMIN_SYSTEM_CHECK_VIEW",
  ADMIN_SYSTEM_CHECK_RECORDED: "ADMIN_SYSTEM_CHECK_RECORDED",
  ADMIN_SENSITIVE_RAW_ACCESS: "ADMIN_SENSITIVE_RAW_ACCESS",
} as const;

export type AdminAuditAction =
  (typeof AdminAuditAction)[keyof typeof AdminAuditAction];

// 역할 : AdminAuditResult Admin 운영 감사 로그 처리 결과 값을 정의합니다.
export const AdminAuditResult = {
  SUCCESS: "SUCCESS",
  DENIED: "DENIED",
  FAILED: "FAILED",
} as const;

export type AdminAuditResult =
  (typeof AdminAuditResult)[keyof typeof AdminAuditResult];

// 역할 : AdminTargetType Admin 감사와 민감 원문 조회 대상 값을 정의합니다.
export const AdminTargetType = {
  USER: "USER",
  COMPANY: "COMPANY",
  CONTACT: "CONTACT",
  PRODUCT: "PRODUCT",
  DEAL: "DEAL",
  SCHEDULE: "SCHEDULE",
  MEETING_NOTE: "MEETING_NOTE",
  BUSINESS_CARD_SCAN: "BUSINESS_CARD_SCAN",
  IMPORT_JOB: "IMPORT_JOB",
  NOTIFICATION: "NOTIFICATION",
  PROVIDER_FAILURE: "PROVIDER_FAILURE",
  TRASH_RECORD: "TRASH_RECORD",
  ACCOUNT_DELETION_REQUEST: "ACCOUNT_DELETION_REQUEST",
  DATA_EXPORT_REQUEST: "DATA_EXPORT_REQUEST",
  SYSTEM_OPERATION_CHECK: "SYSTEM_OPERATION_CHECK",
} as const;

export type AdminTargetType =
  (typeof AdminTargetType)[keyof typeof AdminTargetType];

// 역할 : AdminSensitiveFieldSet Admin 민감 원문 조회에서 허용하는 필드 묶음 값을 정의합니다.
export const AdminSensitiveFieldSet = {
  USER_CONTACT: "USER_CONTACT",
  DOMAIN_MEMO: "DOMAIN_MEMO",
  MEETING_NOTE_BODY: "MEETING_NOTE_BODY",
  TRASH_RECORD_DETAIL: "TRASH_RECORD_DETAIL",
} as const;

export type AdminSensitiveFieldSet =
  (typeof AdminSensitiveFieldSet)[keyof typeof AdminSensitiveFieldSet];

// 역할 : TrashRecoveryRequestStatus Admin Trash 복구 요청 처리 상태 값을 정의합니다.
export const TrashRecoveryRequestStatus = {
  REQUESTED: "REQUESTED",
  REVIEWING: "REVIEWING",
  WAITING_RECOVERY_POLICY: "WAITING_RECOVERY_POLICY",
  RECOVERY_AVAILABLE: "RECOVERY_AVAILABLE",
  REJECTED: "REJECTED",
  CLOSED: "CLOSED",
} as const;

export type TrashRecoveryRequestStatus =
  (typeof TrashRecoveryRequestStatus)[keyof typeof TrashRecoveryRequestStatus];

// 역할 : AccountDeletionRequestStatus Admin 계정 삭제 요청 처리 상태 값을 정의합니다.
export const AccountDeletionRequestStatus = {
  REQUESTED: "REQUESTED",
  CANCELLED: "CANCELLED",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
} as const;

export type AccountDeletionRequestStatus =
  (typeof AccountDeletionRequestStatus)[keyof typeof AccountDeletionRequestStatus];

// 역할 : UserDataExportRequestStatus Admin 데이터 export 요청 처리 상태 값을 정의합니다.
export const UserDataExportRequestStatus = {
  REQUESTED: "REQUESTED",
  PROCESSING: "PROCESSING",
  READY: "READY",
  EXPIRED: "EXPIRED",
  FAILED: "FAILED",
} as const;

export type UserDataExportRequestStatus =
  (typeof UserDataExportRequestStatus)[keyof typeof UserDataExportRequestStatus];

// 역할 : AdminOperationCheckRunStatus Admin 운영 gate 점검 결과 상태 값을 정의합니다.
export const AdminOperationCheckRunStatus = {
  PASS: "PASS",
  WARN: "WARN",
  FAIL: "FAIL",
} as const;

export type AdminOperationCheckRunStatus =
  (typeof AdminOperationCheckRunStatus)[keyof typeof AdminOperationCheckRunStatus];
