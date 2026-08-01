import { useQuery } from "@tanstack/react-query";
import {
  getAdminUserTrashSummary,
  listAdminTrashRecoveryRequests,
  listAdminUserTrashRecords,
} from "../api/admin-trash-api";
import { adminTrashKeys } from "../api/admin-trash-keys";
import type {
  AdminTrashRecordsParams,
  AdminTrashRecoveryRequestsParams,
} from "../types/admin-trash";

// 기능 : Admin 사용자 Trash summary query를 실행합니다.
export function useAdminUserTrashSummary(userId: string) {
  return useQuery({
    enabled: userId.length > 0,
    queryKey: adminTrashKeys.summary(userId),
    queryFn: () => getAdminUserTrashSummary(userId),
  });
}

// 기능 : Admin 사용자 Trash row 목록 query를 실행합니다.
export function useAdminUserTrashRecords(
  userId: string,
  params: AdminTrashRecordsParams
) {
  return useQuery({
    enabled: userId.length > 0,
    queryKey: adminTrashKeys.records(userId, params),
    queryFn: () => listAdminUserTrashRecords(userId, params),
  });
}

// 기능 : Admin Trash 복구 요청 queue query를 실행합니다.
export function useAdminTrashRecoveryRequests(
  params: AdminTrashRecoveryRequestsParams
) {
  return useQuery({
    queryKey: adminTrashKeys.recoveryRequests(params),
    queryFn: () => listAdminTrashRecoveryRequests(params),
  });
}
