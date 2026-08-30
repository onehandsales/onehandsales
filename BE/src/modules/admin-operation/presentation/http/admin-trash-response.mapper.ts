import type {
  AdminTrashDomain,
  AdminTrashRecoveryRequestsPageRecord,
  AdminTrashRecordsPageRecord,
  AdminTrashSummaryRecord,
} from "@/modules/admin-operation/application/ports/admin-trash-read-model.types";

// 역할 : AdminTrashDomainSummaryResponse Admin Trash 도메인별 count API 응답을 정의합니다.
export interface AdminTrashDomainSummaryResponse {
  readonly total: number;
  readonly active: number;
  readonly expired: number;
}

// 역할 : AdminTrashRecoveryRequestSummaryResponse Admin Trash 복구 요청 count API 응답을 정의합니다.
export interface AdminTrashRecoveryRequestSummaryResponse {
  readonly requested: number;
  readonly reviewing: number;
  readonly closed: number;
}

// 역할 : AdminTrashSummaryResponse Admin 사용자 Trash summary API 응답을 정의합니다.
export interface AdminTrashSummaryResponse {
  readonly userId: string;
  readonly total: number;
  readonly activeRestoreWindow: number;
  readonly expiredRestoreWindow: number;
  readonly byDomain: Record<AdminTrashDomain, AdminTrashDomainSummaryResponse>;
  readonly recoveryRequests: AdminTrashRecoveryRequestSummaryResponse;
}

// 역할 : AdminTrashRecordsResponse Admin 사용자 Trash row 목록 API 응답을 정의합니다.
export interface AdminTrashRecordsResponse {
  readonly items: AdminTrashRecordItemResponse[];
  readonly nextCursor: string | null;
}

// 역할 : AdminTrashRecordItemResponse Admin 사용자 Trash row item API 응답을 정의합니다.
export interface AdminTrashRecordItemResponse {
  readonly targetType: string;
  readonly targetId: string;
  readonly titleSnapshot: string;
  readonly deletedAt: string;
  readonly trashExpiresAt: string;
  readonly restoreWindow: string;
  readonly userCanSelfRestore: boolean;
  readonly sensitiveFlags: {
    readonly hasMemo: boolean;
    readonly hasPrivateMemo: boolean;
    readonly privateMemoIncluded: false;
  };
  readonly recoveryRequest: {
    readonly id: string;
    readonly status: string;
    readonly createdAt: string;
  } | null;
}

// 역할 : AdminTrashRecoveryRequestsResponse Admin 복구 요청 queue API 응답을 정의합니다.
export interface AdminTrashRecoveryRequestsResponse {
  readonly items: AdminTrashRecoveryRequestQueueItemResponse[];
  readonly nextCursor: string | null;
}

// 역할 : AdminTrashRecoveryRequestQueueItemResponse Admin 복구 요청 queue item API 응답을 정의합니다.
export interface AdminTrashRecoveryRequestQueueItemResponse {
  readonly id: string;
  readonly userId: string;
  readonly userEmailMasked: string | null;
  readonly targetType: string;
  readonly targetId: string;
  readonly titleSnapshot: string;
  readonly status: string;
  readonly deletedAt: string;
  readonly trashExpiresAt: string;
  readonly createdAt: string;
}

// 기능 : Admin 사용자 Trash summary record를 API 응답으로 변환합니다.
export function toAdminTrashSummaryResponse(
  summary: AdminTrashSummaryRecord
): AdminTrashSummaryResponse {
  return summary;
}

// 기능 : Admin 사용자 Trash row page record를 API 응답으로 변환합니다.
export function toAdminTrashRecordsResponse(
  page: AdminTrashRecordsPageRecord
): AdminTrashRecordsResponse {
  return {
    items: page.items.map((item) => ({
      targetType: item.targetType,
      targetId: item.targetId,
      titleSnapshot: item.titleSnapshot,
      deletedAt: item.deletedAt.toISOString(),
      trashExpiresAt: item.trashExpiresAt.toISOString(),
      restoreWindow: item.restoreWindow,
      userCanSelfRestore: item.userCanSelfRestore,
      sensitiveFlags: item.sensitiveFlags,
      recoveryRequest: item.recoveryRequest
        ? {
            id: item.recoveryRequest.id,
            status: item.recoveryRequest.status,
            createdAt: item.recoveryRequest.createdAt.toISOString(),
          }
        : null,
    })),
    nextCursor: page.nextCursor,
  };
}

// 기능 : Admin 복구 요청 queue page record를 API 응답으로 변환합니다.
export function toAdminTrashRecoveryRequestsResponse(
  page: AdminTrashRecoveryRequestsPageRecord
): AdminTrashRecoveryRequestsResponse {
  return {
    items: page.items.map((item) => ({
      id: item.id,
      userId: item.userId,
      userEmailMasked: item.userEmailMasked,
      targetType: item.targetType,
      targetId: item.targetId,
      titleSnapshot: item.titleSnapshot,
      status: item.status,
      deletedAt: item.deletedAt.toISOString(),
      trashExpiresAt: item.trashExpiresAt.toISOString(),
      createdAt: item.createdAt.toISOString(),
    })),
    nextCursor: page.nextCursor,
  };
}
