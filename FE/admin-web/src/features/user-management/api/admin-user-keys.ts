import type {
  AdminUserActivityTimelineParams,
  AdminUserListParams,
} from "../types/admin-user";

// 기능 : Admin 사용자 React Query key를 생성합니다.
export const adminUserKeys = {
  all: ["admin", "users"] as const,
  lists: () => [...adminUserKeys.all, "list"] as const,
  list: (params: AdminUserListParams) =>
    [...adminUserKeys.lists(), params] as const,
  detail: (userId: string) => [...adminUserKeys.all, "detail", userId] as const,
  timeline: (userId: string, params: AdminUserActivityTimelineParams) =>
    [...adminUserKeys.detail(userId), "activity-timeline", params] as const,
};
