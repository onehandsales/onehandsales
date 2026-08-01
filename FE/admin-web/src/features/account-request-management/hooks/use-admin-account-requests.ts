import { useQuery } from "@tanstack/react-query";
import {
  listAdminAccountDeletionRequests,
  listAdminDataExportRequests,
} from "../api/admin-account-request-api";
import { adminAccountRequestKeys } from "../api/admin-account-request-keys";
import type {
  AdminAccountDeletionRequestsParams,
  AdminDataExportRequestsParams,
} from "../types/admin-account-request";

// 기능 : Admin 계정 삭제 요청 queue query를 실행합니다.
export function useAdminAccountDeletionRequests(
  params: AdminAccountDeletionRequestsParams,
  enabled = true
) {
  return useQuery({
    enabled,
    queryKey: adminAccountRequestKeys.deletion(params),
    queryFn: () => listAdminAccountDeletionRequests(params),
  });
}

// 기능 : Admin 데이터 export 요청 queue query를 실행합니다.
export function useAdminDataExportRequests(
  params: AdminDataExportRequestsParams,
  enabled = true
) {
  return useQuery({
    enabled,
    queryKey: adminAccountRequestKeys.dataExport(params),
    queryFn: () => listAdminDataExportRequests(params),
  });
}
