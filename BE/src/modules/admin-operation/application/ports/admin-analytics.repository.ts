import type {
  AdminAuditAction,
  AdminAuditResult,
  AdminTargetType,
} from "./admin-operation.types";
import type { AdminAnalyticsOverviewRecord } from "./admin-analytics-read-model.types";

export const ADMIN_ANALYTICS_REPOSITORY = Symbol("ADMIN_ANALYTICS_REPOSITORY");

// 역할 : GetAdminAnalyticsOverviewInput Admin analytics overview 조회 조건을 정의합니다.
export interface GetAdminAnalyticsOverviewInput {
  readonly from: Date;
  readonly to: Date;
  readonly timeZone: string;
  readonly countryCode?: string;
  readonly preferredLocale?: string;
}

// 역할 : CreateAdminAnalyticsAuditLogInput Admin analytics 조회 감사 로그 입력을 정의합니다.
export interface CreateAdminAnalyticsAuditLogInput {
  readonly adminUserId: string;
  readonly targetUserId: string | null;
  readonly targetType: AdminTargetType;
  readonly targetId: string | null;
  readonly action: AdminAuditAction;
  readonly result: AdminAuditResult;
  readonly requestId: string;
  readonly metadataJson: Record<string, unknown>;
}

// 역할 : AdminAnalyticsRepository Admin analytics read model 영속성 계약을 정의합니다.
export interface AdminAnalyticsRepository {
  // 기능 : 09 ProductAnalyticsEvent를 Admin 운영 요약으로 집계합니다.
  getAnalyticsOverview(
    input: GetAdminAnalyticsOverviewInput
  ): Promise<AdminAnalyticsOverviewRecord>;

  // 기능 : Admin analytics 조회 감사 로그를 append-only로 생성합니다.
  createAuditLog(input: CreateAdminAnalyticsAuditLogInput): Promise<void>;
}
