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

// 역할 : AdminDomainRecordItemRecord Admin 도메인 read-only row application read model을 정의합니다.
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

// 역할 : AdminDomainRecordsPageRecord Admin 도메인 read-only cursor application page를 정의합니다.
export interface AdminDomainRecordsPageRecord {
  readonly domain: AdminDomainRecordDomain;
  readonly items: AdminDomainRecordItemRecord[];
  readonly nextCursor: string | null;
}
