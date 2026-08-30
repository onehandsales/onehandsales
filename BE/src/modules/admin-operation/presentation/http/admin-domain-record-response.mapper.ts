import type {
  AdminDomainRecordDomain,
  AdminDomainRecordItemRecord,
  AdminDomainRecordSensitiveFlags,
  AdminDomainRecordStatus,
  AdminDomainRecordSummary,
  AdminDomainRecordsPageRecord,
} from "@/modules/admin-operation/application/ports/admin-domain-record-read-model.types";

// 역할 : AdminDomainRecordItemResponse Admin 도메인 read-only row 응답을 정의합니다.
export interface AdminDomainRecordItemResponse {
  readonly id: string;
  readonly displayTitle: string;
  readonly status: AdminDomainRecordStatus;
  readonly summary: AdminDomainRecordSummary;
  readonly sensitiveFlags: AdminDomainRecordSensitiveFlags;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
  readonly trashExpiresAt: string | null;
}

// 역할 : AdminDomainRecordsResponse Admin 도메인 read-only 목록 API 응답을 정의합니다.
export interface AdminDomainRecordsResponse {
  readonly domain: AdminDomainRecordDomain;
  readonly items: AdminDomainRecordItemResponse[];
  readonly nextCursor: string | null;
}

// 기능 : Admin 도메인 read-only page record를 API 응답으로 변환합니다.
export function toAdminDomainRecordsResponse(
  page: AdminDomainRecordsPageRecord
): AdminDomainRecordsResponse {
  return {
    domain: page.domain,
    items: page.items.map((item) => toDomainRecordItemResponse(item)),
    nextCursor: page.nextCursor,
  };
}

// 기능 : Admin 도메인 row record를 ISO string 기반 응답으로 변환합니다.
function toDomainRecordItemResponse(
  item: AdminDomainRecordItemRecord
): AdminDomainRecordItemResponse {
  return {
    id: item.id,
    displayTitle: item.displayTitle,
    status: item.status,
    summary: item.summary,
    sensitiveFlags: item.sensitiveFlags,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    deletedAt: item.deletedAt?.toISOString() ?? null,
    trashExpiresAt: item.trashExpiresAt?.toISOString() ?? null,
  };
}
