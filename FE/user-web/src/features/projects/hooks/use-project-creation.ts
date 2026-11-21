import { useEffect, useRef, useState } from "react";
import { useProjects } from "./use-projects";
import type { Project, ProjectDraft } from "../model/project-types";
// 기능 : 생성 폼의 실패 초안을 보존하며 취소/이탈과 빠른 중복 저장을 막는다.
export function useProjectCreation(initial: ProjectDraft, onCreated: (project: Project) => void) {
  const { store, scope, state } = useProjects(); const [draft, setDraft] = useState(initial); const [pending, setPending] = useState(false); const [error, setError] = useState(""); const request = useRef<AbortController | null>(null); const [submissionId] = useState(() => crypto.randomUUID());
  // 기능 : 생성 문맥이나 장애 시나리오 변경·화면 이탈 시 이전 제출을 취소한다.
  useEffect(function bindRequest() { setPending(false); setError(""); return function cancel() { request.current?.abort(); request.current = null; }; }, [scope.actorId, scope.workspaceId, scope.revision, state.scenario]);
  // 기능 : 성공한 현재 제출만 실제 목적지로 넘기고 재시도 동안 오류 영역의 위치를 유지한다.
  async function submit() { if (request.current) return; const controller = new AbortController(); request.current = controller; setPending(true); try { const project = await store.create(scope, draft, submissionId, controller.signal); if (!controller.signal.aborted && request.current === controller) onCreated(project); } catch (reason) { if (!controller.signal.aborted && !(reason instanceof DOMException && reason.name === "AbortError")) setError(reason instanceof Error ? reason.message : "Unable to create project."); } finally { if (request.current === controller) { request.current = null; setPending(false); } } }
  return { draft, setDraft, pending, error, submit };
}
