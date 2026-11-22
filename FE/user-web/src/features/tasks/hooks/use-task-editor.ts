import { useEffect, useRef, useState } from "react";
import { useTasks } from "./use-tasks";
import type { Task, TaskDraft } from "../model/task-types";
// 기능 : 패널의 필드 확정·초안·저장 원본을 구분하고 중복/취소/실패/충돌을 관리한다.
export function useTaskEditor(initial: TaskDraft, existing: Task | null, onCreated: (task: Task) => void) {
  const query = useTasks(); const [draft, setDraft] = useState<TaskDraft>(initial); const draftRef = useRef(initial); const saved = useRef(existing); const [pending, setPending] = useState(false); const [error, setError] = useState(""); const request = useRef<AbortController | null>(null); const submissionId = useRef(crypto.randomUUID()); const composing = useRef(false);
  // 기능 : 입력 의도를 동기 참조와 화면에 함께 반영한다.
  function change<K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) { const next = { ...draftRef.current, [key]: value }; if (key === "projectId") next.assigneeId = null; draftRef.current = next; setDraft(next); return next; }
  // 기능 : 이미 진행 중인 제출은 합치고 현재 필드 snapshot만 저장한다.
  async function commit(input = draftRef.current, force = false) { if (request.current || composing.current) return; if (saved.current && (["title", "projectId", "status", "assigneeId", "dueDate", "description"] as const).every(key => input[key] === saved.current![key])) return; if (!force && !saved.current && (!input.title.trim() || !input.projectId)) return; const controller = new AbortController(); request.current = controller; setPending(true); setError(""); try { const result = saved.current ? await query.store.edit(query.scope, saved.current.id, saved.current.revision, input, controller.signal) : await query.store.create(query.scope, input, submissionId.current, controller.signal); if (controller.signal.aborted || request.current !== controller) return; const created = !saved.current; saved.current = result; draftRef.current = result; setDraft(result); if (created) onCreated(result); } catch (reason) { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Unable to save task."); } finally { if (request.current === controller) { request.current = null; setPending(false); } } }
  // 기능 : 닫기·문맥 변경은 미완료 저장을 취소하며 이미 성공한 필드는 유지한다.
  function cancel() { request.current?.abort(); request.current = null; setPending(false); setError(""); }
  // 기능 : 사용자가 선택한 경우에만 최신 저장값으로 충돌 초안을 교체한다.
  function reload() { if (!saved.current) return; const latest = query.store.current(query.scope, saved.current.id); if (!latest) { setError("This task is no longer available."); return; } cancel(); saved.current = latest; draftRef.current = latest; setDraft(latest); }
  // 기능 : 계정·workspace·시나리오·패널 수명 뒤 늦은 결과를 폐기한다.
  useEffect(function bindLifetime() { setPending(false); return function cleanup() { request.current?.abort(); request.current = null; }; }, [query.scope.actorId, query.scope.workspaceId, query.scope.revision, query.state.scenario]);
  return { draft, change, commit, cancel, reload, pending, error, composing };
}
