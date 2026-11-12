import { useEffect, useId, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAppI18n } from "@/features/app-i18n";
import { ApiClientError } from "@/lib/api-client";
import { updateViewColumnLabel } from "../api/view-column-api";
import { refreshViewColumnLabel } from "../api/refresh-view-column-label";
import type { ViewDataBinding, ViewDataScope } from "../types/view-data";

// 기능 : 현재 보기의 컬럼 표시명을 명시적으로 저장하고 원본 이름 복원을 제공합니다.
export function ViewColumnLabelEditor({ scope, binding, onClose, onBusyChange }: {
  readonly scope: ViewDataScope; readonly binding: ViewDataBinding;
  readonly onClose: () => void; readonly onBusyChange: (busy: boolean) => void;
}) {
  const { t } = useAppI18n();
  const client = useQueryClient();
  const inputId = useId(), errorId = useId();
  const input = useRef<HTMLInputElement>(null);
  const mounted = useRef(true), busy = useRef(false), composing = useRef(false), committed = useRef(false);
  const [name, setName] = useState(binding.label);
  const [saving, setSaving] = useState(false), [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    mounted.current = true;
    input.current?.focus({ preventScroll: true }); input.current?.select();
    return () => { mounted.current = false; };
  }, []);

  // 기능 : 저장 성공 후 조회가 실패해도 PATCH를 반복하지 않고 조회만 복구합니다.
  async function submit(labelOverride: string | null) {
    if (busy.current || composing.current || !committed.current && labelOverride !== null && !labelOverride.trim()) return;
    busy.current = true; onBusyChange(true); setSaving(true); setError(null);
    try {
      // 1. 더블 클릭을 막고 서버가 저장한 뒤에만 새 이름을 화면에 반영한다.
      if (!committed.current) {
        await updateViewColumnLabel(scope, binding.id, labelOverride);
        committed.current = true;
        if (mounted.current) setSaved(true);
      }
      // 2. 요청 당시 View의 캐시만 갱신하고 화면을 떠난 뒤에는 새 편집창을 닫지 않는다.
      await refreshViewColumnLabel(client, scope);
      if (mounted.current) onClose();
    } catch (failure) {
      if (mounted.current) setError(t(committed.current ? "columnLabel.refreshFailed" :
        failure instanceof ApiClientError && [403, 404, 409].includes(failure.statusCode) ? "columnLabel.unavailable" : "columnLabel.failed"));
    } finally {
      busy.current = false; onBusyChange(false);
      if (mounted.current) setSaving(false);
    }
  }

  return <form aria-busy={saving} className="space-y-2" onSubmit={event => { event.preventDefault(); void submit(name.trim()); }}
    onKeyDown={event => {
      if (composing.current || event.nativeEvent.isComposing || event.keyCode === 229) {
        event.stopPropagation(); if (event.key === "Enter") event.preventDefault(); return;
      }
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); if (!busy.current) onClose(); }
    }}>
    <label htmlFor={inputId} className="block px-1 text-[12px] font-normal text-[#65645F]">{t("columnLabel.name")}</label>
    <input ref={input} id={inputId} className="h-8 w-full rounded border border-[#E5E1D8] px-2 text-[14px] font-normal text-[#111827] outline-none focus:border-[#4880EE] disabled:opacity-50"
      value={name} disabled={saving || saved} aria-describedby={error ? errorId : undefined}
      onChange={event => { setName(event.target.value); setError(null); }}
      onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }} />
    <p className="px-1 text-[11px] font-normal text-[#9B9A97]">{t("columnLabel.scope")}</p>
    {error && <p id={errorId} role="alert" className="px-1 text-[12px] font-normal text-[#B42318]">{error}</p>}
    <div className="flex gap-2">
      <button type="submit" disabled={saving || !saved && !name.trim()} className="h-7 flex-1 rounded bg-[#4880EE] px-2 text-[12px] text-white disabled:opacity-50">{t(saving ? "common.saving" : saved ? "common.retry" : "common.save")}</button>
      <button type="button" disabled={saving} onClick={onClose} className="h-7 rounded px-2 text-[12px] text-[#65645F] hover:bg-[#E4E2DC] disabled:opacity-50">{t(saved ? "common.close" : "common.cancel")}</button>
    </div>
    <button type="button" disabled={saving || saved} onClick={() => { void submit(null); }} className="w-full rounded px-1 py-1 text-left text-[12px] font-normal text-[#326ACD] hover:bg-[#E4E2DC] disabled:opacity-50">{t("columnLabel.clear")}</button>
  </form>;
}
