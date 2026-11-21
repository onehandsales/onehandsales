import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { usePreviewEnvironment } from "@/features/preview";
import { useProjectStore } from "../data/project-context";
// 기능 : 실제 프로젝트 원본을 같은 scope의 보드/고객/상세에 공유한다.
export function useProjects() { const { state: preview } = usePreviewEnvironment(); const { store, state } = useProjectStore(); if (!preview.session || !preview.workspaceId) throw new Error("Project workspace required"); const scope = { actorId: preview.session.id, workspaceId: preview.workspaceId, revision: preview.revision }; const query = useQuery({ queryKey: ["projects", scope.actorId, scope.workspaceId, scope.revision, state.version], queryFn: ({ signal }) => store.read(scope, signal), placeholderData: keepPreviousData, gcTime: 0 }); return { ...query, store, state, scope }; }
