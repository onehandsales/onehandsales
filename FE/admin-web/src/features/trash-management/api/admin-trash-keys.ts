import type {
  AdminTrashRecordsParams,
  AdminTrashRecoveryRequestsParams,
} from "../types/admin-trash";

// 기능 : Admin Trash React Query key를 생성합니다.
export const adminTrashKeys = {
  all: ["admin", "trash"] as const,
  user: (userId: string) => [...adminTrashKeys.all, "user", userId] as const,
  summary: (userId: string) =>
    [...adminTrashKeys.user(userId), "summary"] as const,
  records: (userId: string, params: AdminTrashRecordsParams) =>
    [...adminTrashKeys.user(userId), "records", params] as const,
  recoveryRequests: (params: AdminTrashRecoveryRequestsParams) =>
    [...adminTrashKeys.all, "recovery-requests", params] as const,
};
