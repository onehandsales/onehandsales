import { HelpCircle, Loader2 } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAppI18n, type AppI18nKey } from "@/features/app-i18n";
import { workspaceObjectAttributeDefinitionQueryKeys, type AttributeDefinitionValueType } from "@/features/crm-object";
import { ApiClientError } from "@/lib/api-client";
import { createViewColumn } from "../api/view-column-api";
import { workspaceViewQueryKeys } from "../api/workspace-view-query-keys";
import { viewDataQueryKeys } from "../api/view-data-query-keys";
import type { ViewDataScope } from "../types/view-data";
import { AttributeTypeIcon } from "./attribute-type-icon";
import { AttributeTypePopover } from "./attribute-type-popover";

// 기능 : 열 헤더에서 이름을 작성하고 연결된 유형 팝오버로 새 컬럼을 생성합니다.
export function InlineAttributeColumn({ scope, onCancel, onCreated }: {
  readonly scope: ViewDataScope; readonly onCancel: (restoreFocus?: boolean) => void; readonly onCreated: () => void;
}) {
  const { t } = useAppI18n();
  const client = useQueryClient();
  const root = useRef<HTMLDivElement>(null), input = useRef<HTMLInputElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const focusTypesOnOpen = useRef(false);
  const mounted = useRef(true), busy = useRef(false), composing = useRef(false);
  const attempt = useRef<{ key: string; id: string } | null>(null);
  const panelId = useId();
  const [name, setName] = useState("");
  const [type, setType] = useState<AttributeDefinitionValueType | "">("");
  const [open, setOpen] = useState(true);
  const [saving, setSaving] = useState(false), [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mounted.current = true;
    root.current?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    input.current?.focus({ preventScroll: true });
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (open && focusTypesOnOpen.current) {
      panel.current?.querySelector<HTMLElement>('input, [role="option"]')?.focus({ preventScroll: true });
      focusTypesOnOpen.current = false;
    }
  }, [open]);

  // 기능 : 키보드로 유형 목록을 열고 검색창 또는 첫 유형으로 이동합니다.
  function focusTypes() {
    if (open) panel.current?.querySelector<HTMLElement>('input, [role="option"]')?.focus({ preventScroll: true });
    else { focusTypesOnOpen.current = true; setOpen(true); }
  }

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

  // 기능 : 확정된 이름·유형을 저장하고 동일 입력 재시도는 같은 생성 ID를 사용합니다.
  async function submit(explicit = false, selectedType = type) {
    if (busy.current || composing.current || !name.trim() || !selectedType || (!explicit && error)) return;
    // 1. 유형 클릭 직후에는 React 상태 반영을 기다리지 않고 선택값을 사용한다.
    const key = JSON.stringify([name.trim(), selectedType]);
    if (!attempt.current || attempt.current.key !== key) attempt.current = { key, id: crypto.randomUUID() };
    busy.current = true; setSaving(true); setError(null); setOpen(false);
    let committed = saved;
    try {
      if (!committed) {
        await createViewColumn(scope, { creationId: attempt.current.id, attributeDefinitionName: name.trim(), attributeType: selectedType });
        committed = true;
        if (mounted.current) setSaved(true);
      }
      // 2. 저장 후 조회 실패는 POST를 반복하지 않고 조회만 복구한다.
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
      setError(t(message)); setOpen(true);
    } finally {
      busy.current = false;
      if (mounted.current) setSaving(false);
    }
  }

  // 기능 : Portal의 유형 목록도 이름 입력과 같은 작성 영역으로 판별합니다.
  function contains(target: EventTarget | null) {
    return target instanceof Node && Boolean(root.current?.contains(target) || panel.current?.contains(target));
  }

  // 기능 : 이름 없는 초안은 취소하고 이름이 있는 입력은 기존 저장 흐름을 따릅니다.
  function leaveEditor() {
    if (busy.current || composing.current) return;
    if (!name.trim() && !saved) { onCancel(false); return; }
    setOpen(false);
    void submit();
  }

  useEffect(() => {
    // 기능 : 팝오버 내부 선택은 바깥 클릭으로 처리하지 않습니다.
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !contains(event.target)) leaveEditor();
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  });

  // 기능 : 이름이 있으면 유형 선택으로 생성하고 없으면 이름 입력을 이어갑니다.
  function selectType(value: AttributeDefinitionValueType) {
    if (busy.current || saved) return;
    setType(value); setError(null);
    if (name.trim()) void submit(true, value);
    else {
      input.current?.focus({ preventScroll: true });
      setOpen(false);
    }
  }

  return <div ref={root} role="columnheader" data-testid="inline-attribute-column" aria-busy={saving}
    className="relative flex h-full min-w-0 items-center gap-0.5 bg-transparent pl-1.5 pr-3 font-sans font-normal"
    onBlur={event => {
      if (event.relatedTarget && !contains(event.relatedTarget)) leaveEditor();
    }}
    onKeyDown={event => {
      if (composing.current || event.nativeEvent.isComposing || event.keyCode === 229) return;
      if (event.key === "Escape" && !saving) {
        event.preventDefault(); event.stopPropagation();
        if (!saved) onCancel();
        else setOpen(false);
      }
      if (event.key === "Enter" && event.target === input.current) {
        event.preventDefault();
        if (type) void submit(true);
        else focusTypes();
      }
      if (event.key === "ArrowDown" && event.target === input.current) {
        event.preventDefault();
        focusTypes();
      }
    }}>
    <button type="button" aria-label={t("attributeColumn.type")} aria-haspopup="dialog"
      aria-controls={open ? panelId : undefined} aria-expanded={open} disabled={saving}
      title={t(type ? "attributeTypes." + type as AppI18nKey : "attributeColumn.type")}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-[#9CA3AF] outline-none hover:bg-[#F3F3F2] focus-visible:ring-2 focus-visible:ring-[#4880EE]/45 disabled:cursor-wait"
      onClick={() => setOpen(current => !current)}>
      {saving ? <Loader2 aria-label={t("common.saving")} className="h-4 w-4 animate-spin" />
        : type ? <AttributeTypeIcon type={type} /> : <HelpCircle aria-hidden="true" className="h-4 w-4" />}
    </button>
    <input ref={input} aria-label={t("attributeColumn.name")} aria-invalid={Boolean(error)}
      aria-describedby={open && error ? panelId + "-error" : undefined}
      autoComplete="off" maxLength={80} disabled={saving || saved}
      className="h-8 min-w-0 flex-1 border-0 bg-transparent px-0 text-[14px] font-medium text-[#9CA3AF] outline-none placeholder:text-[#A3A3A0]"
      title={name || t("attributeColumn.namePlaceholder")}
      placeholder={t("attributeColumn.namePlaceholder")} value={name}
      onFocus={() => setOpen(true)} onClick={() => setOpen(true)}
      onCompositionStart={() => { composing.current = true; }}
      onCompositionEnd={() => { composing.current = false; }}
      onChange={event => { setName(event.target.value); setError(null); }} />
    {open && <AttributeTypePopover id={panelId} anchorRef={root} panelRef={panel} value={type}
      disabled={saving || saved} error={error} onSelect={selectType} onRetry={() => { void submit(true); }} />}
  </div>;
}
