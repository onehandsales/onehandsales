import { Check, HelpCircle, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAppI18n, type AppI18nKey } from "@/features/app-i18n";
import { workspaceObjectAttributeDefinitionQueryKeys, type AttributeDefinitionValueType } from "@/features/crm-object";
import { ApiClientError } from "@/lib/api-client";
import { createViewColumn } from "../api/view-column-api";
import { workspaceViewQueryKeys } from "../api/workspace-view-query-keys";
import { viewDataQueryKeys } from "../api/view-data-query-keys";
import type { ViewDataScope } from "../types/view-data";
import { AttributeTypeIcon } from "./attribute-type-icon";
import { ATTRIBUTE_TYPE_ICONS } from "./attribute-type-icons";

// 기능 : 모달 없이 테이블 헤더 안에서 새 속성의 이름과 유형을 입력하고 저장합니다.
export function InlineAttributeColumn({ scope, onCancel, onCreated }: {
  readonly scope: ViewDataScope; readonly onCancel: () => void; readonly onCreated: () => void;
}) {
  const { t } = useAppI18n();
  const client = useQueryClient();
  const root = useRef<HTMLDivElement>(null), input = useRef<HTMLInputElement>(null);
  const mounted = useRef(true), busy = useRef(false), attempt = useRef<{ key: string; id: string } | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<AttributeDefinitionValueType | "">("");
  const [saving, setSaving] = useState(false), [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    mounted.current = true;
    input.current?.focus();
    root.current?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    return () => { mounted.current = false; };
  }, []);

  // 기능 : 저장 당시 사용자·Workspace의 속성·메뉴·본문 캐시를 갱신합니다.
  async function refresh() {
    // 1. cursor가 이전 설정을 가리키지 않도록 해당 View의 본문 페이지를 처음부터 읽는다.
    await Promise.all([
      client.invalidateQueries({ queryKey: workspaceObjectAttributeDefinitionQueryKeys.list(scope.userId, scope.workspaceId, scope.targetId) }),
      client.invalidateQueries({ queryKey: workspaceViewQueryKeys.menu(scope.userId, scope.workspaceId, scope.viewDefinitionId, "settings") }),
      client.invalidateQueries({ queryKey: workspaceViewQueryKeys.menu(scope.userId, scope.workspaceId, scope.viewDefinitionId, "filters") }),
      client.invalidateQueries({ queryKey: workspaceViewQueryKeys.menu(scope.userId, scope.workspaceId, scope.viewDefinitionId, "sorts") }),
      client.resetQueries({ queryKey: viewDataQueryKeys.view(scope) }, { throwOnError: true }),
    ]);
  }

  // 기능 : 완성된 입력만 한 번 저장하고 응답 유실 재시도에는 동일한 생성 ID를 사용합니다.
  async function submit(explicit = false) {
    if (busy.current || !name.trim() || !type || (!explicit && error)) return;
    // 1. 다른 입력은 새 의도로 구분하고 동일 입력의 재시도는 같은 ID를 유지한다.
    const key = JSON.stringify([name.trim(), type]);
    if (!attempt.current || attempt.current.key !== key) attempt.current = { key, id: crypto.randomUUID() };
    busy.current = true; setSaving(true); setError(null);
    let committed = saved;
    try {
      if (!committed) {
        await createViewColumn(scope, { creationId: attempt.current.id, attributeDefinitionName: name.trim(), attributeType: type });
        committed = true;
        if (mounted.current) setSaved(true);
      }
      // 2. API 성공 뒤 조회 실패는 생성 재요청 없이 조회만 재시도한다.
      await refresh();
      if (mounted.current) onCreated();
    } catch (failure) {
      if (!mounted.current) return;
      const code = failure instanceof ApiClientError ? failure.code : null;
      let message: AppI18nKey = "attributeColumn.failed";
      if (committed) message = "attributeColumn.refreshFailed";
      else if (code === "AttributeDefinitionApiSlugAlreadyExists") message = "attributeColumn.duplicate";
      else if (code === "ViewColumnCreationConflict") message = "attributeColumn.conflict";
      else if (code === "ViewColumnLimitExceeded") message = "attributeColumn.limit";
      else if (code === "ViewColumnTargetUnsupported" || failure instanceof ApiClientError && failure.statusCode === 404) message = "attributeColumn.unavailable";
      setError(t(message));
    } finally {
      busy.current = false;
      if (mounted.current) setSaving(false);
    }
  }

  useEffect(() => {
    // 기능 : 입력 영역 밖 클릭은 완성된 초안만 확정하고 실패 뒤에는 자동 재시도하지 않습니다.
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !root.current?.contains(event.target)) void submit();
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  });

  return <div ref={root} role="columnheader" data-testid="inline-attribute-column" aria-busy={saving}
    className="relative flex h-full min-w-0 items-center gap-1 border-r border-[#EEEDEA] bg-[#FAFAF8] px-2"
    onBlur={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) void submit(); }}
    onKeyDown={event => {
      if (event.nativeEvent.isComposing || event.keyCode === 229) return;
      if (event.key === "Escape" && !saving && !saved) { event.preventDefault(); event.stopPropagation(); onCancel(); }
      if (event.key === "Enter" && event.target instanceof HTMLInputElement) { event.preventDefault(); void submit(true); }
    }}>
    <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded hover:bg-[#E4E2DC] focus-within:ring-2 focus-within:ring-[#4880EE]/45" title={t(type ? `attributeTypes.${type}` : "attributeColumn.type")}>
      {type ? <AttributeTypeIcon type={type} /> : <HelpCircle aria-hidden="true" className="h-4 w-4 text-[#9CA3AF]" />}
      <select aria-label={t("attributeColumn.type")} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" value={type} disabled={saving || saved}
        onChange={event => { setType(event.target.value as AttributeDefinitionValueType); setError(null); }}>
        <option value="" disabled>{t("attributeColumn.type")}</option>
        {(Object.keys(ATTRIBUTE_TYPE_ICONS) as AttributeDefinitionValueType[]).map(value => <option key={value} value={value}>{t(`attributeTypes.${value}`)}</option>)}
      </select>
    </span>
    <input ref={input} aria-label={t("attributeColumn.name")} aria-invalid={Boolean(error)} maxLength={80} disabled={saving || saved}
      className="h-7 min-w-0 flex-1 rounded border border-[#E4E2DC] bg-white px-2 text-[12px] text-[#374151] outline-none focus:border-[#4880EE]"
      placeholder={t("attributeColumn.name")} value={name} onChange={event => { setName(event.target.value); setError(null); }} />
    <button type="button" aria-label={t(saved ? "common.retry" : "common.save")} disabled={saving || !name.trim() || !type}
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[#4880EE] hover:bg-[#E4E2DC] disabled:opacity-40" onClick={() => { void submit(true); }}>
      {saving ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Check aria-hidden="true" className="h-4 w-4" />}
    </button>
    {!saved && <button type="button" aria-label={t("common.cancel")} disabled={saving} className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[#9CA3AF] hover:bg-[#E4E2DC] disabled:opacity-40" onClick={onCancel}><X aria-hidden="true" className="h-4 w-4" /></button>}
    {error && <p role="alert" className="absolute left-0 top-full z-30 w-full rounded-b border border-[#E4E2DC] bg-white px-2 py-2 text-[12px] font-normal text-[#B91C1C] shadow">{error}</p>}
  </div>;
}
