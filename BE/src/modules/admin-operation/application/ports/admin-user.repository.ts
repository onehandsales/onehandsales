import type {
  AdminAuditAction,
  AdminAuditResult,
  AdminTargetType,
  UserStatus,
} from "./admin-operation.types";
import type { AdminUserListSort } from "./admin-user-query.types";
import type {
  AdminUserActivityTimelinePageRecord,
  AdminUserListPageRecord,
  AdminUserOverviewRecord,
} from "./admin-user-read-model.types";

export const ADMIN_USER_REPOSITORY = Symbol("ADMIN_USER_REPOSITORY");

// 역할 : ListAdminUsersInput Admin 사용자 목록 조회 조건을 정의합니다.
export interface ListAdminUsersInput {
  readonly q?: string;
  readonly status?: UserStatus;
  readonly countryCode?: string;
  readonly preferredLocale?: string;
  readonly cursor?: string;
  readonly limit: number;
  readonly sort: AdminUserListSort;
}

// 역할 : ListAdminUserActivityTimelineInput Admin 사용자 활동 timeline 조회 조건을 정의합니다.
export interface ListAdminUserActivityTimelineInput {
  readonly userId: string;
  readonly cursor?: string;
  readonly limit: number;
  readonly from?: Date;
  readonly to?: Date;
  readonly eventType?: string;
}

// 역할 : CreateAdminAuditLogInput Admin 운영 조회 감사 로그 생성 값을 정의합니다.
export interface CreateAdminAuditLogInput {
  readonly adminUserId: string;
  readonly targetUserId: string | null;
  readonly targetType: AdminTargetType;
  readonly targetId: string | null;
  readonly action: AdminAuditAction;
  readonly result: AdminAuditResult;
  readonly requestId: string;
  readonly metadataJson: Record<string, unknown>;
}

// 역할 : AdminUserRepository Admin 사용자 overview read model 영속성 계약을 정의합니다.
export interface AdminUserRepository {
  // 기능 : Admin 사용자 목록을 cursor 기반으로 조회합니다.
  listUsers(input: ListAdminUsersInput, now: Date): Promise<AdminUserListPageRecord>;

  // 기능 : Admin 사용자 상세 overview를 조회합니다.
  getUserOverview(
    userId: string,
    now: Date
  ): Promise<AdminUserOverviewRecord | null>;

  // 기능 : Admin 사용자 활동 timeline을 cursor 기반으로 조회합니다.
  listActivityTimeline(
    input: ListAdminUserActivityTimelineInput
  ): Promise<AdminUserActivityTimelinePageRecord>;

  // 기능 : Admin 운영 조회 감사 로그를 append-only로 생성합니다.
  createAuditLog(input: CreateAdminAuditLogInput): Promise<void>;

  // 기능 : Admin 사용자 저장소 작업을 하나의 Prisma transaction에서 실행합니다.
  runInTransaction<T>(
    work: (repository: AdminUserRepository) => Promise<T>
  ): Promise<T>;
}
