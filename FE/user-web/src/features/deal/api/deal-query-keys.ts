// 기능 : Deal 도메인 TanStack Query key 팩토리
import type { DealListParams } from "@/features/deal/types/deal";

export const dealQueryKeys = {
  all: ["deal"] as const,

  // 단계별 개수
  stageCounts: () => [...dealQueryKeys.all, "stage-counts"] as const,

  // 목록
  lists: () => [...dealQueryKeys.all, "list"] as const,
  list: (params: DealListParams) =>
    [
      ...dealQueryKeys.lists(),
      {
        page: params.page ?? 1,
        search: params.search ?? "",
        dealStatus: params.dealStatus ?? "",
        sort: params.sort ?? "createdAtDesc",
      },
    ] as const,

  // 상세
  details: () => [...dealQueryKeys.all, "detail"] as const,
  detail: (dealId: string) => [...dealQueryKeys.details(), dealId] as const,

  // 옵션
  companyOptions: () => [...dealQueryKeys.all, "company-options"] as const,
  contactOptions: () => [...dealQueryKeys.all, "contact-options"] as const,
  productOptions: () => [...dealQueryKeys.all, "product-options"] as const,

  // 다음 행동 로그
  followingActionLogs: (dealId: string) =>
    [...dealQueryKeys.detail(dealId), "following-action-logs"] as const,

  // 메모 로그
  memoLogs: (dealId: string) =>
    [...dealQueryKeys.detail(dealId), "memo-logs"] as const,
};
