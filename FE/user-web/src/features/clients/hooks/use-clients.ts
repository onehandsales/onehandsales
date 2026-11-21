import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { usePreviewEnvironment } from "@/features/preview";
import { useClientStore } from "../data/client-context";
import { clientKey } from "../data/client-keys";
// 기능 : 고객 목록·상세·향후 프로젝트 선택지가 같은 조회와 문맥을 소비하게 한다.
export function useClients() {
  const { state: preview } = usePreviewEnvironment(); const { store, state } = useClientStore();
  if (!preview.session || !preview.workspaceId) throw new Error("Client workspace required");
  const scope = { actorId: preview.session.id, workspaceId: preview.workspaceId, revision: preview.revision };
  const query = useQuery({ queryKey: clientKey(scope, state.version), queryFn: ({ signal }) => store.read(scope, signal), gcTime: 0, placeholderData: keepPreviousData });
  return { ...query, store, state, scope };
}
