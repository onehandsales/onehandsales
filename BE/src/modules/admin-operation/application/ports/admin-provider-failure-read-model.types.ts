// 역할 : AdminProviderFailureType Admin provider 실패 source 유형을 정의합니다.
export enum AdminProviderFailureType {
  AI = "AI",
  OCR = "OCR",
  STT = "STT",
  CALENDAR = "CALENDAR",
  PUSH = "PUSH",
  EMAIL = "EMAIL",
  SMS = "SMS",
}

// 역할 : AdminProviderFailureStatus Admin provider 실패 정규화 상태를 정의합니다.
export type AdminProviderFailureStatus = "FAILED" | "PENDING" | "CANCELED";

// 역할 : AdminProviderFailureStatusFilter Admin provider 실패 상태 filter 값을 정의합니다.
export type AdminProviderFailureStatusFilter = "FAILED" | "RETRYABLE" | "ALL";

// 역할 : AdminProviderFailureFeatureArea Admin provider 실패 기능 영역을 정의합니다.
export enum AdminProviderFailureFeatureArea {
  AI_WEEKLY_REPORT = "AI_WEEKLY_REPORT",
  FOLLOW_UP = "FOLLOW_UP",
  MEETING_NOTE = "MEETING_NOTE",
  BUSINESS_CARD_SCAN = "BUSINESS_CARD_SCAN",
  NOTIFICATION = "NOTIFICATION",
  CALENDAR_SYNC = "CALENDAR_SYNC",
}

// 역할 : AdminProviderFailureSourceModel Admin provider 실패 원천 model 이름을 정의합니다.
export type AdminProviderFailureSourceModel =
  | "AiProviderCallLog"
  | "BusinessCardScanLog"
  | "NotificationDeliveryAttempt"
  | "FollowUpDeliveryAttempt"
  | "ExternalCalendarConnection"
  | "ExternalCalendarSource";

// 역할 : AdminProviderFailureSafeContext Admin provider 실패 상세의 안전 context를 정의합니다.
export type AdminProviderFailureSafeContext = Record<
  string,
  string | number | boolean | null
>;

// 역할 : AdminProviderFailureRecord Admin provider 실패 공통 application read model을 정의합니다.
export interface AdminProviderFailureRecord {
  readonly id: string;
  readonly sourceId: string;
  readonly providerType: AdminProviderFailureType;
  readonly sourceModel: AdminProviderFailureSourceModel;
  readonly userId: string;
  readonly userEmail: string | null;
  readonly featureArea: AdminProviderFailureFeatureArea;
  readonly operation: string;
  readonly targetType: string;
  readonly targetId: string | null;
  readonly status: AdminProviderFailureStatus;
  readonly safeErrorCode: string | null;
  readonly safeErrorMessage: string | null;
  readonly retryable: boolean;
  readonly latencyMs: number | null;
  readonly requestId: string | null;
  readonly occurredAt: Date;
}

// 역할 : AdminProviderFailureDetailRecord Admin provider 실패 상세 application read model을 정의합니다.
export interface AdminProviderFailureDetailRecord
  extends AdminProviderFailureRecord {
  readonly safeContext: AdminProviderFailureSafeContext;
}

// 역할 : AdminProviderFailureListPageRecord Admin provider 실패 cursor 목록 application read model을 정의합니다.
export interface AdminProviderFailureListPageRecord {
  readonly items: AdminProviderFailureRecord[];
  readonly nextCursor: string | null;
}
