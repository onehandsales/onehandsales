import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { usePreviewEnvironment } from "@/features/preview";
import { useCompanySetup } from "@/features/company-setup/data/company-context";
import { CompanyReadError } from "@/features/company-settings/model/settings-types";
import type { Company } from "@/features/company-setup/model/company-types";
import type { BrandDraft, HeaderPreset } from "../model/branding-types";

// 기능 : 브랜드 초안·즉시 미리보기·저장값을 나누고 회사와 동일한 실행 문맥에서 취소·경합을 처리한다.
export function useBrandingEditor() {
  const location = useLocation();
  const { state: preview } = usePreviewEnvironment(); const { store, state } = useCompanySetup();
  const [draft, setDraft] = useState<BrandDraft | null>(null); const draftRef = useRef<BrandDraft | null>(null); const baseline = useRef<Company | null>(null);
  const request = useRef<AbortController | null>(null); const composing = useRef(false);
  const [pending, setPending] = useState(false); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [readKind, setReadKind] = useState(""); const [saved, setSaved] = useState(false); const [retry, setRetry] = useState(0);
  const canEdit = preview.session?.role === "owner";
  // 기능 : 성공한 조회·저장 결과로만 저장 기준과 현재 초안을 함께 갱신한다.
  function accept(value: Company) { baseline.current = value; const next = { defaults: value.branding, logo: value.logo }; draftRef.current = next; setDraft(next); }
  // 기능 : 초안은 남기면서 진행 중인 목 저장을 취소한다.
  function cancel() { request.current?.abort(); request.current = null; setPending(false); }
  // 기능 : 새 선택이 이전 저장보다 우선하게 하고 성공 안내는 실제 재저장 전까지 제거한다.
  function edit(patch: Partial<BrandDraft>) { cancel(); setSaved(false); setError(""); if (draftRef.current) { draftRef.current = { ...draftRef.current, ...patch }; setDraft(draftRef.current); } }
  // 기능 : 헤더 선택은 저장하지 않고 현재 미리보기 초안에만 반영한다.
  function selectHeader(header: HeaderPreset) { if (draftRef.current) edit({ defaults: { ...draftRef.current.defaults, header } }); }
  // 기능 : 전체 취소는 파일 편집기를 포함해 초안을 폐기하고 저장된 같은 회사를 다시 읽는다.
  function reload() { cancel(); draftRef.current = null; setDraft(null); setSaved(false); setRetry(value => value + 1); }
  // 기능 : 진입·이력·조회 시나리오·인증 수명에 따라 조회하고 이전 요청은 폐기한다.
  useEffect(function loadBranding() {
    request.current?.abort(); request.current = null; setPending(false); setError(""); setReadKind(""); setSaved(false);
    if (!preview.session || !preview.workspaceId) return;
    if (draftRef.current && !["read-error", "empty", "denied"].includes(state.settingsScenario)) return function abortSave() { request.current?.abort(); };
    const controller = new AbortController(); request.current = controller; draftRef.current = null; setDraft(null); setLoading(true);
    // 기능 : 살아 있는 조회만 현재 저장 기준으로 채택한다.
    function onRead(value: Company) { if (!controller.signal.aborted) accept(value); }
    // 기능 : 취소와 조회 실패·권한·빈 상태를 구분한다.
    function onError(failure: unknown) { if (!controller.signal.aborted && !(failure instanceof DOMException && failure.name === "AbortError")) { setError(failure instanceof Error ? failure.message : "Unable to load branding."); setReadKind(failure instanceof CompanyReadError ? failure.kind : "read"); } }
    // 기능 : 이전 조회가 새 조회의 로딩 상태를 종료하지 못하게 한다.
    function onFinish() { if (request.current === controller) { request.current = null; setLoading(false); } }
    void store.readSettings({ actorId: preview.session.id, workspaceId: preview.workspaceId, revision: preview.revision }, controller.signal).then(onRead).catch(onError).finally(onFinish);
    return function cancelOnLeave() { controller.abort(); request.current?.abort(); };
  }, [location.key, preview.revision, preview.session, preview.workspaceId, retry, state.settingsScenario, store]);
  // 기능 : 중복 제출을 막고 성공 시에만 브랜드 기본값과 명시적 로고 변경을 확정한다.
  async function save() {
    if (!preview.session || !preview.workspaceId || !draftRef.current || !baseline.current || !canEdit || request.current || composing.current) return;
    const controller = new AbortController(); request.current = controller; setPending(true); setSaved(false);
    const value = draftRef.current; const base = baseline.current;
    try {
      const result = await store.saveBranding({ actorId: preview.session.id, workspaceId: preview.workspaceId, revision: preview.revision }, { ...value, brandRevision: base.brandingRevision, companyRevision: base.settingsRevision, logoChanged: value.logo !== base.logo }, controller.signal);
      if (!controller.signal.aborted) { accept(result); setError(""); setSaved(true); }
    } catch (failure) { if (!controller.signal.aborted && !(failure instanceof DOMException && failure.name === "AbortError")) setError(failure instanceof Error ? failure.message : "Unable to save branding."); }
    finally { if (request.current === controller) { request.current = null; setPending(false); } }
  }
  return { draft, loading, pending, error, readKind, saved, setSaved, canEdit, composing, selectHeader, edit, save, cancel, reload };
}
