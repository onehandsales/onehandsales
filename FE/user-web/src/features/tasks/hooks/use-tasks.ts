import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usePreviewEnvironment } from "@/features/preview";
import { useTaskStore } from "../data/task-context";
// 기능 : 계정·workspace·revision별 작업 조회를 분리하고 같은 문맥의 재조회만 이전 값을 유지한다.
export function useTasks() { const { state: preview } = usePreviewEnvironment(); const { store, state } = useTaskStore(); if (!preview.session || !preview.workspaceId) throw new Error("Task workspace required"); const scope = { actorId: preview.session.id, workspaceId: preview.workspaceId, revision: preview.revision }; const query = useQuery({ queryKey: ["tasks", scope.actorId, scope.workspaceId, scope.revision, state.version], queryFn: ({ signal }) => store.read(scope, signal), placeholderData: keepPreviousData, gcTime: 0 }); return { ...query, store, state, scope }; }
