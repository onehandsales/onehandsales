import type { ViewDataRequest, ViewDataScope } from "../types/view-data";

// 기능 : 사용자·Workspace·원본·보기·시간대가 다른 본문 캐시를 격리합니다.
function dataScope(scope: ViewDataScope | null) {
  return ["crm-view", scope?.userId.toLowerCase() ?? null, scope?.workspaceId.toLowerCase() ?? null, "data",
    scope?.sourceType ?? null, scope?.targetId.toLowerCase() ?? null, scope?.viewDefinitionId.toLowerCase() ?? null,
    scope?.viewType ?? null, scope?.timeZone ?? null] as const;
}
export const viewDataQueryKeys = {
  // 기능 : 검색·페이지 크기별 본문 조회를 구분합니다.
  main(scope: ViewDataScope | null, q: string, limit: number) {
    return [...dataScope(scope), "MAIN", q, limit] as const;
  },
  // 기능 : 각 칸반 열의 독립 페이지와 설정 token을 구분합니다.
  group(input: ViewDataRequest, groupToken: string) {
    return [...dataScope(input), "GROUP_ITEMS", input.q, input.limit, groupToken] as const;
  },
};
