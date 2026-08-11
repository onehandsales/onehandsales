import type {
  AdminAuditAction,
  AdminAuditResult,
  AdminTargetType,
} from "./admin-operation.types";

export const ADMIN_DOMAIN_RECORD_REPOSITORY = Symbol(
  "ADMIN_DOMAIN_RECORD_REPOSITORY"
);

// 역할 : AdminDomainRecordDomain Admin 도메인 탭 조회 대상 값을 정의합니다.
export enum AdminDomainRecordDomain {
  COMPANY = "COMPANY",
  CONTACT = "CONTACT",
  PRODUCT = "PRODUCT",
  DEAL = "DEAL",
  SCHEDULE = "SCHEDULE",
  MEETING_NOTE = "MEETING_NOTE",
  BUSINESS_CARD_SCAN = "BUSINESS_CARD_SCAN",
  IMPORT_JOB = "IMPORT_JOB",
}

// 역할 : AdminDomainRecordSort Admin 도메인 탭 정렬 값을 정의합니다.
export enum AdminDomainRecordSort {
  CREATED_AT_DESC = "createdAt.desc",
  UPDATED_AT_DESC = "updatedAt.desc",
  DELETED_AT_DESC = "deletedAt.desc",
}

// 역할 : AdminDomainRecordStatus Admin 도메인 row 삭제 상태를 정의합니다.
export type AdminDomainRecordStatus = "ACTIVE" | "DELETED";

// 역할 : AdminDomainRecordSummary Admin 도메인 row 안전 summary 값을 정의합니다.
export type AdminDomainRecordSummary = Record<
  string,
  string | number | boolean | null
>;

// 역할 : AdminDomainRecordSensitiveFlags Admin 도메인 row 민감 필드 포함 여부를 정의합니다.
export type AdminDomainRecordSensitiveFlags = Record<string, boolean>;

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

// 역할 : AdminDomainRecordItemRecord Admin 도메인 read-only row record를 정의합니다.
export interface AdminDomainRecordItemRecord {
  readonly id: string;
  readonly displayTitle: string;
  readonly status: AdminDomainRecordStatus;
  readonly summary: AdminDomainRecordSummary;
  readonly sensitiveFlags: AdminDomainRecordSensitiveFlags;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly trashExpiresAt: Date | null;
}

// 역할 : AdminDomainRecordsPageRecord Admin 도메인 read-only cursor 목록 결과를 정의합니다.
export interface AdminDomainRecordsPageRecord {
  readonly domain: AdminDomainRecordDomain;
  readonly items: AdminDomainRecordItemRecord[];
  readonly nextCursor: string | null;
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
