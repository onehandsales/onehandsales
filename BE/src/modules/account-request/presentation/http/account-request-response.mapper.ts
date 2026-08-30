import type {
  AccountDeletionRequestRecord,
  UserDataExportRequestRecord,
  UserDataExportRequestStatusValue,
} from "@/modules/account-request/application/ports/account-request-read-model.types";

// 역할 : UserDataExportRequestResponse 내 데이터 export 요청 응답을 정의합니다.
export interface UserDataExportRequestResponse {
  readonly id: string;
  readonly status: UserDataExportRequestStatusValue;
  readonly includeSensitive: boolean;
  readonly format: string;
  readonly requestedAt: string;
  readonly expiresAt: string | null;
  readonly downloadUrl: string | null;
}

// 역할 : AccountDeletionRequestResponse 계정 삭제 요청 응답을 정의합니다.
export interface AccountDeletionRequestResponse {
  readonly id: string;
  readonly status: string;
  readonly requestedAt: string;
  readonly scheduledDeletionAt: string;
  readonly canCancelUntil: string;
}

// 역할 : CancelAccountDeletionRequestResponse 계정 삭제 요청 취소 응답을 정의합니다.
export interface CancelAccountDeletionRequestResponse {
  readonly id: string;
  readonly status: string;
  readonly cancelledAt: string | null;
}

// 기능 : 데이터 export request record를 만료 반영 응답으로 변환합니다.
export function toUserDataExportRequestResponse(
  request: UserDataExportRequestRecord,
  now: Date
): UserDataExportRequestResponse {
  const effectiveStatus = resolveDataExportStatus(request, now);

  return {
    id: request.id,
    status: effectiveStatus,
    includeSensitive: request.includeSensitive,
    format: request.format,
    requestedAt: request.requestedAt.toISOString(),
    expiresAt: request.expiresAt?.toISOString() ?? null,
    downloadUrl: createDataExportDownloadUrl(request, effectiveStatus, now),
  };
}

// 기능 : 계정 삭제 요청 record를 생성/조회 응답으로 변환합니다.
export function toAccountDeletionRequestResponse(
  request: AccountDeletionRequestRecord
): AccountDeletionRequestResponse {
  return {
    id: request.id,
    status: request.status,
    requestedAt: request.requestedAt.toISOString(),
    scheduledDeletionAt: request.scheduledDeletionAt.toISOString(),
    canCancelUntil: request.canCancelUntil.toISOString(),
  };
}

// 기능 : 계정 삭제 취소 record를 취소 API 응답으로 변환합니다.
export function toCancelAccountDeletionRequestResponse(
  request: AccountDeletionRequestRecord
): CancelAccountDeletionRequestResponse {
  return {
    id: request.id,
    status: request.status,
    cancelledAt: request.cancelledAt?.toISOString() ?? null,
  };
}

// 기능 : READY export가 만료된 경우 응답 상태만 EXPIRED로 표시합니다.
function resolveDataExportStatus(
  request: UserDataExportRequestRecord,
  now: Date
): UserDataExportRequestStatusValue {
  if (
    request.status === "READY" &&
    request.expiresAt &&
    request.expiresAt.getTime() <= now.getTime()
  ) {
    return "EXPIRED";
  }

  return request.status;
}

// 기능 : 다운로드 가능한 READY 요청에만 User API download path를 노출합니다.
function createDataExportDownloadUrl(
  request: UserDataExportRequestRecord,
  status: UserDataExportRequestStatusValue,
  now: Date
): string | null {
  if (
    status !== "READY" ||
    !request.artifactPath ||
    !request.expiresAt ||
    request.expiresAt.getTime() <= now.getTime()
  ) {
    return null;
  }

  return `/api/users/me/data-export-requests/${request.id}/download`;
}
