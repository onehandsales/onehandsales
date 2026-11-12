import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { ViewDataScope, ViewMainResponse } from "../types/view-data";
import { workspaceViewQueryKeys } from "./workspace-view-query-keys";
import { viewConfigurationQueryKeys } from "./view-configuration-query-keys";
import { viewDataQueryKeys } from "./view-data-query-keys";

// 기능 : 같은 View의 오래된 cursor를 비우고 첫 페이지와 표시 설정을 다시 읽습니다.
export async function refreshViewColumnLabel(client: QueryClient, scope: ViewDataScope) {
  const { queryKey, predicate } = viewDataQueryKeys.forView(scope);
  const settings = workspaceViewQueryKeys.menu(scope.userId, scope.workspaceId, scope.viewDefinitionId, "settings");
  const configuration = viewConfigurationQueryKeys.view(scope.userId, scope.workspaceId, scope.viewDefinitionId);
  // 1. 기존 요청을 취소하고 다음 페이지의 만료된 cursor를 제거한다.
  await client.cancelQueries({ queryKey, predicate });
  // 그룹 token도 이전 설정에 묶이므로 새 본문 응답이 다시 만들도록 제거한다.
  client.removeQueries({ queryKey, predicate: query => predicate(query) && query.queryKey[9] === "GROUP_ITEMS" });
  client.setQueriesData<InfiniteData<ViewMainResponse>>({ queryKey, predicate }, previous => previous && ({
    ...previous, pages: previous.pages.slice(0, 1), pageParams: previous.pageParams.slice(0, 1),
  }));
  // 2. 기존 첫 화면을 유지하므로 조회 실패 시 편집창에서 조회만 재시도할 수 있다.
  await Promise.all([
    client.invalidateQueries({ queryKey, predicate, refetchType: "none" }),
    client.invalidateQueries({ queryKey: settings, refetchType: "none" }),
    client.invalidateQueries({ queryKey: configuration, refetchType: "none" }),
  ]);
  await Promise.all([
    client.refetchQueries({ queryKey, predicate, type: "active" }, { throwOnError: true }),
    client.refetchQueries({ queryKey: settings, type: "active" }, { throwOnError: true }),
    client.refetchQueries({ queryKey: configuration, type: "active" }, { throwOnError: true }),
  ]);
}
