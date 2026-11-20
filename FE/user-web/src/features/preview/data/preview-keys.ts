import type { PreviewScope } from "../model/preview-types";

// 기능 : 세션·작업공간·실행 차수를 포함해 서로 다른 목 캐시를 격리한다.
export function previewKeys(scope: PreviewScope) {
  const root = ["preview", "memory", scope.actorId, scope.workspaceId, scope.revision] as const;
  return { root, list: [...root, "list"] as const,
    // 기능 : 동일 범위의 상세 항목 캐시 키를 만든다.
    detail: (id: string) => [...root, "detail", id] as const };
}
