import type {
  AdminAccountDeletionRequestsParams,
  AdminDataExportRequestsParams,
} from "../types/admin-account-request";

// 기능 : Admin 계정 데이터 요청 React Query key를 생성합니다.
export const adminAccountRequestKeys = {
  all: ["admin", "account-requests"] as const,
  deletion: (params: AdminAccountDeletionRequestsParams) =>
    [...adminAccountRequestKeys.all, "deletion", params] as const,
  dataExport: (params: AdminDataExportRequestsParams) =>
    [...adminAccountRequestKeys.all, "data-export", params] as const,
};
