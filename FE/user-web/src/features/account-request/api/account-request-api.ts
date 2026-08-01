import type {
  AccountDeletionRequestResponse,
  CancelAccountDeletionRequestResponse,
  CreateAccountDeletionRequestInput,
  CreateDataExportRequestInput,
  UserDataExportRequestResponse,
} from "@/features/account-request/types/account-request";
import { apiClient } from "@/lib/api-client";

// 기능 : 현재 사용자 데이터 export 요청 생성 API를 호출합니다.
export function createMyDataExportRequest(
  input: CreateDataExportRequestInput
) {
  return apiClient<UserDataExportRequestResponse>(
    "/api/users/me/data-export-requests",
    {
      method: "POST",
      body: {
        includeSensitive: input.includeSensitive,
        format: input.format,
      },
    }
  );
}

// 기능 : 현재 사용자 데이터 export 요청 상태 조회 API를 호출합니다.
export function getMyDataExportRequest(requestId: string) {
  return apiClient<UserDataExportRequestResponse>(
    `/api/users/me/data-export-requests/${requestId}`
  );
}

// 기능 : 현재 사용자 계정 삭제 요청 생성 API를 호출합니다.
export function createMyAccountDeletionRequest(
  input: CreateAccountDeletionRequestInput
) {
  return apiClient<AccountDeletionRequestResponse>(
    "/api/users/me/account-deletion-requests",
    {
      method: "POST",
      body: {
        confirmText: input.confirmText,
        ...(input.reasonCode ? { reasonCode: input.reasonCode } : {}),
        ...(input.reasonMessage ? { reasonMessage: input.reasonMessage } : {}),
      },
    }
  );
}

// 기능 : 현재 사용자 계정 삭제 요청 취소 API를 호출합니다.
export function cancelMyAccountDeletionRequest(requestId: string) {
  return apiClient<CancelAccountDeletionRequestResponse>(
    `/api/users/me/account-deletion-requests/${requestId}/cancel`,
    {
      method: "POST",
      body: {},
    }
  );
}
