import type {
  AdminAuditAction,
  AdminAuditResult,
  AdminTargetType,
} from "./admin-operation.types";
import type {
  AdminDomainRecordDomain,
  AdminDomainRecordSort,
  AdminDomainRecordsPageRecord,
} from "./admin-domain-record-read-model.types";

export const ADMIN_DOMAIN_RECORD_REPOSITORY = Symbol(
  "ADMIN_DOMAIN_RECORD_REPOSITORY"
);

// 역할 : ListAdminDomainRecordsInput Admin 도메인 read-only 목록 조회 조건을 정의합니다.
export interface ListAdminDomainRecordsInput {
  readonly userId: string;
  readonly domain: AdminDomainRecordDomain;
  readonly q?: string;
  readonly includeDeleted: boolean;
  readonly cursor?: string;
  readonly limit: number;
  readonly sort: AdminDomainRecordSort;
}

// 역할 : CreateAdminDomainAuditLogInput Admin 도메인 조회 감사 로그 생성 값을 정의합니다.
export interface CreateAdminDomainAuditLogInput {
  readonly adminUserId: string;
  readonly targetUserId: string;
  readonly targetType: AdminTargetType;
  readonly targetId: string;
  readonly action: AdminAuditAction;
  readonly result: AdminAuditResult;
  readonly requestId: string;
  readonly metadataJson: Record<string, unknown>;
}

// 역할 : AdminDomainRecordRepository Admin 사용자 도메인 탭 read model 영속성 계약을 정의합니다.
export interface AdminDomainRecordRepository {
  // 기능 : Admin 도메인 탭 대상 사용자가 존재하는지 확인합니다.
  targetUserExists(userId: string): Promise<boolean>;

  // 기능 : Admin 사용자 소유 도메인 row를 cursor 기반으로 조회합니다.
  listDomainRecords(
    input: ListAdminDomainRecordsInput
  ): Promise<AdminDomainRecordsPageRecord>;

  // 기능 : Admin 도메인 조회 감사 로그를 append-only로 생성합니다.
  createAuditLog(input: CreateAdminDomainAuditLogInput): Promise<void>;

  // 기능 : Admin 도메인 저장소 작업을 하나의 Prisma transaction에서 실행합니다.
  runInTransaction<T>(
    work: (repository: AdminDomainRecordRepository) => Promise<T>
  ): Promise<T>;
}
