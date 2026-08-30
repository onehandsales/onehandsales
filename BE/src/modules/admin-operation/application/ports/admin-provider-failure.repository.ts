import type {
  AdminAuditAction,
  AdminAuditResult,
  AdminTargetType,
} from "./admin-operation.types";
import type {
  AdminProviderFailureDetailRecord,
  AdminProviderFailureFeatureArea,
  AdminProviderFailureListPageRecord,
  AdminProviderFailureStatusFilter,
  AdminProviderFailureType,
} from "./admin-provider-failure-read-model.types";

export const ADMIN_PROVIDER_FAILURE_REPOSITORY = Symbol(
  "ADMIN_PROVIDER_FAILURE_REPOSITORY"
);

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
