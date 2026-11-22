import { useEffect, useRef, useState } from "react";
import { useProjects } from "./use-projects";
import type { ProjectEdit } from "../model/project-edits";
// 기능 : 프로젝트 변경의 마지막 의도만 적용하고 오류 초안·취소·문맥 이탈 수명을 분리한다.
export function useProjectAction() { const { store, scope, state } = useProjects(); const request = useRef<AbortController | null>(null); const [pending, setPending] = useState(false); const [error, setError] = useState("");
  // 기능 : 취소/닫기는 늦은 성공과 오류가 현재 화면을 덮지 않게 한다.
  function cancel() { request.current?.abort(); request.current = null; setPending(false); setError(""); }
  // 기능 : 세션·workspace·시나리오 변경과 이탈 때 이전 작업을 폐기한다.
  useEffect(function bindScope() { setPending(false); setError(""); return function cleanup() { request.current?.abort(); request.current = null; }; }, [scope.actorId, scope.workspaceId, scope.revision, state.scenario]);
  // 기능 : 새 의도는 이전 지연을 취소하고 저장 성공한 현재 요청만 완료로 반환한다.
  async function run(command: ProjectEdit, useCurrentRevision = false) { request.current?.abort(); const controller = new AbortController(); request.current = controller; setPending(true); try { const revision = useCurrentRevision ? store.current(scope, command.projectId)?.revision : command.revision; if (revision === undefined) throw new Error("This project is unavailable."); await store.edit(scope, { ...command, revision }, controller.signal); if (controller.signal.aborted || request.current !== controller) return false; setError(""); return true; } catch (reason) { if (!controller.signal.aborted && !(reason instanceof DOMException && reason.name === "AbortError")) setError(reason instanceof Error ? reason.message : "Unable to update project."); return false; } finally { if (request.current === controller) { request.current = null; setPending(false); } } }
  return { run, cancel, pending, error };
}
