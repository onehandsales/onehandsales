import { useQuery } from "@tanstack/react-query";
import {
  getAdminUserOverview,
  listAdminUserActivityTimeline,
  listAdminUsers,
} from "../api/admin-user-api";
import { adminUserKeys } from "../api/admin-user-keys";
import type {
  AdminUserActivityTimelineParams,
  AdminUserListParams,
} from "../types/admin-user";

// 기능 : Admin 사용자 목록 query를 실행합니다.
export function useAdminUsers(params: AdminUserListParams) {
  return useQuery({
    queryKey: adminUserKeys.list(params),
    queryFn: () => listAdminUsers(params),
  });
}

// 기능 : Admin 사용자 상세 overview query를 실행합니다.
export function useAdminUserOverview(userId: string) {
  return useQuery({
    enabled: userId.length > 0,
    queryKey: adminUserKeys.detail(userId),
    queryFn: () => getAdminUserOverview(userId),
  });
}

// 기능 : Admin 사용자 활동 timeline query를 실행합니다.
export function useAdminUserActivityTimeline(
  userId: string,
  params: AdminUserActivityTimelineParams
) {
  return useQuery({
    enabled: userId.length > 0,
    queryKey: adminUserKeys.timeline(userId, params),
    queryFn: () => listAdminUserActivityTimeline(userId, params),
  });
}
