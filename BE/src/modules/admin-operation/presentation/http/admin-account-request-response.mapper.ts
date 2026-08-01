import type {
  AdminAccountDeletionRequestsPageRecord,
  AdminDataExportRequestsPageRecord,
} from "@/modules/admin-operation/application/ports/admin-account-request.repository";

// 역할 : AdminAccountDeletionRequestQueueItemResponse Admin 계정 삭제 요청 queue item 응답을 정의합니다.
export interface AdminAccountDeletionRequestQueueItemResponse {
  readonly id: string;
  readonly userId: string;
  readonly userEmailMasked: string | null;
  readonly status: string;
  readonly requestedAt: string;
  readonly scheduledDeletionAt: string;
  readonly reasonCode: string | null;
}

// 역할 : AdminAccountDeletionRequestsResponse Admin 계정 삭제 요청 queue 응답을 정의합니다.
export interface AdminAccountDeletionRequestsResponse {
  readonly items: AdminAccountDeletionRequestQueueItemResponse[];
  readonly nextCursor: string | null;
}

// 역할 : AdminDataExportRequestQueueItemResponse Admin 데이터 export 요청 queue item 응답을 정의합니다.
export interface AdminDataExportRequestQueueItemResponse {
  readonly id: string;
  readonly userId: string;
  readonly userEmailMasked: string | null;
  readonly status: string;
  readonly includeSensitive: boolean;
  readonly format: string;
  readonly requestedAt: string;
  readonly expiresAt: string | null;
}

// 역할 : AdminDataExportRequestsResponse Admin 데이터 export 요청 queue 응답을 정의합니다.
export interface AdminDataExportRequestsResponse {
  readonly items: AdminDataExportRequestQueueItemResponse[];
  readonly nextCursor: string | null;
}

// 기능 : Admin 계정 삭제 요청 page record를 API 응답으로 변환합니다.
export function toAdminAccountDeletionRequestsResponse(
  page: AdminAccountDeletionRequestsPageRecord
): AdminAccountDeletionRequestsResponse {
  return {
    items: page.items.map((item) => ({
      id: item.id,
      userId: item.userId,
      userEmailMasked: item.userEmailMasked,
      status: item.status,
      requestedAt: item.requestedAt.toISOString(),
      scheduledDeletionAt: item.scheduledDeletionAt.toISOString(),
      reasonCode: item.reasonCode,
    })),
    nextCursor: page.nextCursor,
  };
}

// 기능 : Admin 데이터 export 요청 page record를 API 응답으로 변환합니다.
export function toAdminDataExportRequestsResponse(
  page: AdminDataExportRequestsPageRecord
): AdminDataExportRequestsResponse {
  return {
    items: page.items.map((item) => ({
      id: item.id,
      userId: item.userId,
      userEmailMasked: item.userEmailMasked,
      status: item.status,
      includeSensitive: item.includeSensitive,
      format: item.format,
      requestedAt: item.requestedAt.toISOString(),
      expiresAt: item.expiresAt?.toISOString() ?? null,
    })),
    nextCursor: page.nextCursor,
  };
}
