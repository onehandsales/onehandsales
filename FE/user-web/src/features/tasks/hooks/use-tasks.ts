import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { PreviewError, usePreviewEnvironment } from "@/features/preview";
import { useTaskStore } from "../data/task-context";
// 기능 : 계정·workspace·revision별 작업 조회를 분리하고 같은 문맥의 재조회만 이전 값을 유지한다.
export function useTasks() { const { state: preview } = usePreviewEnvironment(); const { store, state } = useTaskStore(); if (!preview.session || !preview.workspaceId) throw new Error("Task workspace required"); const scope = { actorId: preview.session.id, workspaceId: preview.workspaceId, revision: preview.revision }; const query = useQuery({ queryKey: ["tasks", scope.actorId, scope.workspaceId, scope.revision, state.version], queryFn: ({ signal }) => store.read(scope, signal), placeholderData: keepPreviousData, gcTime: 0 });
  // 기능 : 삭제된 이전 조회 행을 즉시 숨기며 접근 오류는 비동기 query의 안내로 처리한다.
  function visible(task: { id: string }) { try { return !!store.current(scope, task.id); } catch (error) { if (error instanceof PreviewError || error instanceof DOMException && error.name === "AbortError") return false; throw error; } }
  const data = query.data?.filter(visible); return { ...query, data, store, state, scope }; }
