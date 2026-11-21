import { useEffect, useRef, useState } from "react";
import { usePreviewEnvironment } from "@/features/preview";
import { useCompanySetup } from "@/features/company-setup/data/company-context";
import { CompanyReadError, settingsError } from "../model/settings-types";
import type { CompanySettings } from "../model/settings-types";
// 기능 : 회사 전체 초안을 페이지·모달 수명에 묶고 취소·실패·중복 저장을 처리한다.
export function useCompanyEditor(onSaved?: () => void) {
  const { state: preview } = usePreviewEnvironment(); const { store, state } = useCompanySetup();
  const [draft, setDraft] = useState<CompanySettings | null>(null); const draftRef = useRef<CompanySettings | null>(null); const savedRevision = useRef(0);
  const [loading, setLoading] = useState(true); const [pending, setPending] = useState(false); const [error, setError] = useState(""); const [readKind, setReadKind] = useState(""); const [saved, setSaved] = useState(false); const [retry, setRetry] = useState(0);
  const request = useRef<AbortController | null>(null); const composing = useRef(false); const canEdit = preview.session?.role === "owner";
  const scope = preview.session && preview.workspaceId ? { actorId: preview.session.id, workspaceId: preview.workspaceId, revision: preview.revision } : null;
  // 기능 : 입력은 보존하면서 진행 중인 조회·저장만 취소한다.
  function cancel() { request.current?.abort(); request.current = null; setPending(false); }
  // 기능 : 편집값 수정은 이전 저장을 취소하고 다음 저장의 초안으로만 남긴다.
  function edit(patch: Partial<CompanySettings>) { cancel(); setError(""); setSaved(false); if (draftRef.current) { draftRef.current = { ...draftRef.current, ...patch }; setDraft(draftRef.current); } }
  // 기능 : 명시적 재조회는 초안을 버리고 저장된 회사부터 다시 읽는다.
  function reload() { cancel(); draftRef.current = null; setDraft(null); setRetry(value => value + 1); }
  // 기능 : 실행 범위·시나리오·이탈에서 늦은 결과를 취소하고 필요한 조회만 시작한다.
  useEffect(function loadCompany() {
    request.current?.abort(); request.current = null; setPending(false); setError(""); setReadKind("");
    if (!preview.session || !preview.workspaceId) return;
    if (draftRef.current && !["read-error", "empty", "denied"].includes(state.settingsScenario)) return function cancelSave() { request.current?.abort(); };
    const controller = new AbortController(); request.current = controller; draftRef.current = null; setDraft(null); setLoading(true);
    void store.readSettings({ actorId: preview.session.id, workspaceId: preview.workspaceId, revision: preview.revision }, controller.signal).then(value => {
      if (controller.signal.aborted) return; savedRevision.current = value.settingsRevision; draftRef.current = value; setDraft(value);
    }).catch((failure: unknown) => { if (!controller.signal.aborted && !(failure instanceof DOMException && failure.name === "AbortError")) { setError(failure instanceof Error ? failure.message : "Unable to read company."); setReadKind(failure instanceof CompanyReadError ? failure.kind : "read"); } }).finally(() => { if (request.current === controller) { request.current = null; setLoading(false); } });
    return function cancelOnLeave() { controller.abort(); request.current?.abort(); };
  }, [preview.revision, preview.session, preview.workspaceId, retry, state.settingsScenario, store]);
  // 기능 : 사용 가능한 전체 초안만 저장하며 성공 전 회사 소비 화면을 바꾸지 않는다.
  async function save() {
    if (!scope || !draftRef.current || !canEdit || request.current || composing.current) return;
    const message = settingsError(draftRef.current); if (message) { setError(message); return; }
    const controller = new AbortController(); request.current = controller; setPending(true); setSaved(false);
    try { const value = await store.saveSettings(scope, draftRef.current, savedRevision.current, controller.signal); if (!controller.signal.aborted) { savedRevision.current = value.settingsRevision; draftRef.current = value; setDraft(value); setError(""); setSaved(true); onSaved?.(); } }
    catch (failure) { if (!controller.signal.aborted && !(failure instanceof DOMException && failure.name === "AbortError")) setError(failure instanceof Error ? failure.message : "Unable to save company."); }
    finally { if (request.current === controller) { request.current = null; setPending(false); } }
  }
  return { draft, loading, pending, error, readKind, saved, setSaved, composing, canEdit, edit, save, cancel, reload, companyId: scope ? "company-" + scope.workspaceId : "" };
}
