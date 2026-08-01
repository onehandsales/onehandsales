import type {
  AdminAuditAction,
  AdminAuditResult,
  AdminTargetType,
} from "@prisma/client";

export const ADMIN_PROVIDER_FAILURE_REPOSITORY = Symbol(
  "ADMIN_PROVIDER_FAILURE_REPOSITORY"
);

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

// 역할 : ListAdminProviderFailuresInput Admin provider 실패 목록 조회 조건을 정의합니다.
export interface ListAdminProviderFailuresInput {
  readonly providerType?: AdminProviderFailureType;
  readonly featureArea?: AdminProviderFailureFeatureArea;
  readonly status: AdminProviderFailureStatusFilter;
  readonly retryable?: boolean;
  readonly userId?: string;
  readonly from?: Date;
  readonly to?: Date;
  readonly cursor?: string;
  readonly limit: number;
}

// 역할 : AdminProviderFailureRecord Admin provider 실패 공통 row record를 정의합니다.
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

// 역할 : AdminProviderFailureDetailRecord Admin provider 실패 상세 record를 정의합니다.
export interface AdminProviderFailureDetailRecord
  extends AdminProviderFailureRecord {
  readonly safeContext: AdminProviderFailureSafeContext;
}

// 역할 : AdminProviderFailureListPageRecord Admin provider 실패 cursor 목록 결과를 정의합니다.
export interface AdminProviderFailureListPageRecord {
  readonly items: AdminProviderFailureRecord[];
  readonly nextCursor: string | null;
}

// 역할 : CreateAdminProviderFailureAuditLogInput Admin provider 실패 조회 감사 로그 생성 값을 정의합니다.
export interface CreateAdminProviderFailureAuditLogInput {
  readonly adminUserId: string;
  readonly targetUserId: string | null;
  readonly targetType: AdminTargetType;
  readonly targetId: string | null;
  readonly action: AdminAuditAction;
  readonly result: AdminAuditResult;
  readonly requestId: string;
  readonly metadataJson: Record<string, unknown>;
}

// 역할 : AdminProviderFailureRepository Admin provider 실패 safe read model 영속성 계약을 정의합니다.
export interface AdminProviderFailureRepository {
  // 기능 : 여러 provider 실패 source를 공통 cursor 목록으로 조회합니다.
  listProviderFailures(
    input: ListAdminProviderFailuresInput
  ): Promise<AdminProviderFailureListPageRecord>;

  // 기능 : opaque failure ID에 해당하는 provider 실패 상세를 안전 context로 조회합니다.
  getProviderFailureDetail(
    failureId: string
  ): Promise<AdminProviderFailureDetailRecord | null>;

  // 기능 : Admin provider 실패 조회 감사 로그를 append-only로 생성합니다.
  createAuditLog(input: CreateAdminProviderFailureAuditLogInput): Promise<void>;

  // 기능 : Admin provider 실패 저장소 작업을 하나의 Prisma transaction에서 실행합니다.
  runInTransaction<T>(
    work: (repository: AdminProviderFailureRepository) => Promise<T>
  ): Promise<T>;
}
