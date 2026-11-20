import { useQuery } from "@tanstack/react-query";
import { usePreviewEnvironment } from "../data/preview-context";
import { previewKeys } from "../data/preview-keys";

// 기능 : 가상 사용자와 작업공간이 확인된 내부 화면에 조회 범위를 제공한다.
export function usePreviewScope() {
  const { state } = usePreviewEnvironment();
  if (!state.session || !state.workspaceId) throw new Error("Preview session required");
  return { actorId: state.session.id, workspaceId: state.workspaceId, revision: state.revision };
}

// 기능 : 목록과 상세가 동일한 주입 공급자와 범위 키를 사용하도록 조회를 조정한다.
export function usePreviewItem(id?: string) {
  const { runtime } = usePreviewEnvironment();
  const scope = usePreviewScope();
  const keys = previewKeys(scope);
  const list = useQuery({
    queryKey: keys.list, queryFn: ({ signal }) => runtime.source.list(scope, signal), enabled: !id,
  });
  const detail = useQuery({
    queryKey: keys.detail(id ?? ""), queryFn: ({ signal }) => runtime.source.detail(scope, id ?? "", signal), enabled: Boolean(id),
  });
  return { list, detail };
}
