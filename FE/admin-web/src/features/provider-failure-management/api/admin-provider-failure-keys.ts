import type { AdminProviderFailureListParams } from "../types/admin-provider-failure";

// 기능 : Admin provider 실패 React Query key를 생성합니다.
export const adminProviderFailureKeys = {
  all: ["admin", "provider-failures"] as const,
  list: (params: AdminProviderFailureListParams) =>
    [...adminProviderFailureKeys.all, "list", params] as const,
  detail: (failureId: string) =>
    [...adminProviderFailureKeys.all, "detail", failureId] as const,
};
