import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useNavigationType, useSearchParams } from "react-router-dom";
import { previewReturnPath, usePreviewEnvironment } from "@/features/preview";
import { useCompanySetup } from "../data/company-context";
import { setupError } from "../model/company-types";
import type { SetupDraft, SetupStep } from "../model/company-types";

// 기능 : 단계별 초안·브라우저 이력·검증·취소 가능한 최종 저장을 현재 인증 범위에 묶는다.
export function useOnboarding() {
  const { state: preview } = usePreviewEnvironment(); const { store, state } = useCompanySetup(); const navigate = useNavigate(); const location = useLocation(); const [params] = useSearchParams();
  const navigationType = useNavigationType();
  const actorId = preview.session?.id; const workspaceId = preview.workspaceId; const revision = preview.revision;
  const scope = useMemo(() => actorId && workspaceId ? { actorId, workspaceId, revision } : null, [actorId, workspaceId, revision]);
  const returnTo = previewReturnPath(params.get("returnTo"));
  const draft = scope ? store.draft(scope) : null;
  const firstInvalid = draft ? ([0, 1, 3, 4] as SetupStep[]).find(value => !!setupError(draft, value)) ?? 4 : 0;
  const allowed = Math.min(draft?.furthest ?? 0, firstInvalid);
  const rawStep = params.get("step"); const requested = rawStep !== null && /^[0-4]$/.test(rawStep) ? Number(rawStep) : rawStep === null && navigationType === "POP" ? 0 : draft?.step ?? 0;
  const step = Math.min(requested, allowed) as SetupStep; const storedStep = draft?.step;
  const [error, setError] = useState(""); const [pending, setPending] = useState(false); const request = useRef<AbortController | null>(null); const composing = useRef(false);
  const restoreSubmitFocus = useRef(false);
  // 기능 : 입력을 남긴 채 현재 저장만 취소한다.
  function cancel(restoreFocus = false) { restoreSubmitFocus.current = restoreFocus; request.current?.abort(); request.current = null; setPending(false); }
  // 기능 : 단계 이동·실행 문맥·시나리오 변경 또는 이탈에서 늦은 완료를 무효화한다.
  useEffect(function cancelPrevious() { request.current?.abort(); request.current = null; setPending(false); setError(""); return function abortOnLeave() { request.current?.abort(); }; }, [preview.revision, state.scenario, step, location.key]);
  // 기능 : 방문 가능한 단계와 URL을 일치시키고 이력 복귀의 현재 단계를 같은 초안에 기록한다.
  useEffect(function synchronizeStep() {
    if (!scope) return;
    if (storedStep !== step) store.edit(scope, { step });
    const query = new URLSearchParams(params); if (step) query.set("step", String(step)); else query.delete("step");
    if (query.toString() !== params.toString()) void navigate({ pathname: location.pathname, search: query.size ? "?" + query : "", hash: location.hash }, { replace: true, state: location.state });
  }, [scope, storedStep, step, store, params, location.pathname, location.hash, location.state, navigate]);
  // 기능 : 단계 전환 뒤 새 질문 제목을 키보드와 읽기 도구에 알린다.
  useEffect(function focusStep() { document.querySelector<HTMLElement>(".setup-form h1")?.focus(); }, [step]);
  // 기능 : 비활성 폼 대신 취소 버튼에 초점을 주고 취소 후 제출 위치로 복원한다.
  useEffect(function focusPendingControl() {
    if (pending) document.querySelector<HTMLButtonElement>(".setup-cancel")?.focus();
    else if (restoreSubmitFocus.current) { restoreSubmitFocus.current = false; document.querySelector<HTMLButtonElement>(".setup-next")?.focus(); }
  }, [pending]);
  // 기능 : 제출 오류 안내를 읽을 수 있도록 초점을 이동한다.
  useEffect(function focusFailure() { if (error && !pending) (document.querySelector<HTMLElement>(".setup-form [aria-invalid=true]") ?? document.getElementById("setup-error"))?.focus(); }, [error, pending]);
  // 기능 : 필드 수정은 이전 요청을 취소하고 같은 단계의 다른 답변을 보존한다.
  function edit(patch: Partial<SetupDraft>) { cancel(); setError(""); if (scope) store.edit(scope, patch); }
  // 기능 : 완료한 단계까지만 실제 URL 이력으로 왕복하며 초안의 나머지 값을 유지한다.
  function go(next: SetupStep) {
    if (!scope || !draft) return;
    cancel(); store.edit(scope, { step: next, furthest: Math.max(draft.furthest, next) as SetupStep });
    const query = new URLSearchParams(params); if (next) query.set("step", String(next)); else query.delete("step");
    if (returnTo !== "/app") query.set("returnTo", returnTo); else query.delete("returnTo");
    void navigate({ pathname: "/onboarding", search: query.size ? "?" + query : "", hash: location.hash }, { state: location.state });
  }
  // 기능 : 마지막 관찰 단계에서만 회사 저장을 확정하고 초기 대시보드로 이동한다.
  async function next() {
    if (!scope || !draft || request.current || composing.current) return;
    const message = setupError(draft, step); if (message) { setError(message); return; }
    if (step < 4) { go((step + 1) as SetupStep); return; }
    const controller = new AbortController(); request.current = controller; let completed = false; setPending(true); setError("");
    try { await store.finish(scope, controller.signal); if (!controller.signal.aborted) { completed = true; void navigate(returnTo, { replace: true, state: { setupJustCompleted: true } }); } }
    catch (failure) { if (!controller.signal.aborted && !(failure instanceof DOMException && failure.name === "AbortError")) setError(failure instanceof Error ? failure.message : "Unable to save setup."); }
    finally { if (request.current === controller) { request.current = null; if (!completed) setPending(false); } }
  }
  return { draft, step, scope, returnTo, error, pending, composing, edit, go, next, cancel };
}
