import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usePreviewEnvironment } from "@/features/preview";
import { useTemplateStore } from "../data/template-context";
// 기능 : 계정·workspace·revision별 템플릿을 조회하고 저장 변경을 같은 원본에서 갱신한다.
export function useTemplates() {
  const { state: preview } = usePreviewEnvironment(); const { store, state } = useTemplateStore();
  if (!preview.session || !preview.workspaceId) throw new Error("Template workspace required");
  const scope = { actorId: preview.session.id, workspaceId: preview.workspaceId, revision: preview.revision };
  const query = useQuery({ queryKey: ["task-templates", scope.actorId, scope.workspaceId, scope.revision, state.version], queryFn: ({ signal }) => store.read(scope, signal), placeholderData: keepPreviousData, gcTime: 0 });
  return { ...query, store, state, scope, editable: preview.session.role === "owner" };
}
