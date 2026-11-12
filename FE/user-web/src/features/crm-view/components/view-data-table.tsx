import { ChevronDown, EyeOff, Plus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useAppI18n } from "@/features/app-i18n";
import { cn } from "@/utils/cn";
import type { ViewDataBinding, ViewDataItem, ViewDataScope, ViewTableResponse } from "../types/view-data";
import { AttributeTypeIcon } from "./attribute-type-icon";
import { InlineAttributeColumn } from "./inline-attribute-column";
import { ViewColumnLabelEditor } from "./view-column-label-editor";
import { ViewDataCell, type ViewCellEditing } from "./view-data-cell";
import { ViewDataGroups } from "./view-data-groups";

// 저장된 컬럼의 기본 폭과 이름 작성 영역의 폭은 별도로 관리한다.
const DEFAULT_COLUMN_WIDTH = 150;
const ATTRIBUTE_EDITOR_WIDTH = 220;

// 기능 : 기존 표의 속성 아이콘을 표시 타입에 맞게 제공합니다.
function BindingIcon({ type }: { readonly type: string }) { return <AttributeTypeIcon type={type} />; }

// 기능 : 기존 관리항목 표의 배치·셀 편집·열 조작 UX로 View 본문을 표시합니다.
export function ViewDataTable({ response, items, editing, onCreate, creating, scope }: {
  readonly response: ViewTableResponse; readonly items: readonly ViewDataItem[];
  readonly editing: ViewCellEditing; readonly onCreate?: (() => void) | undefined; readonly creating: boolean;
  readonly scope?: ViewDataScope;
}) {
  const { t } = useAppI18n();
  const original = response.data.columnBindingIds.flatMap(id => response.bindings.find(binding => binding.id === id) ?? []);
  const [order, setOrder] = useState<readonly string[] | null>(null);
  const [widths, setWidths] = useState<Record<string, number>>({});
  const labelBusy = useRef(false);
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [menu, setMenu] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const addButton = useRef<HTMLButtonElement>(null);
  const restoreAddFocus = useRef(false);
  const canAdd = scope?.sourceType === "OBJECT" && response.source.kind === "OBJECT" && !response.source.listDefinitionId;
  const [drag, setDrag] = useState<{ source: string; target: string } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const selectAll = useRef<HTMLInputElement>(null);
  const cleanup = useRef<(() => void) | null>(null);
  const suppressClick = useRef(false);
  const sorted = order ? [...original].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id)) : original;
  const columns = sorted.filter(binding => !hidden.has(binding.id));
  // 기능 : 저장 너비를 초기값으로 사용하고 현재 화면의 드래그 너비를 우선합니다.
  function width(binding: ViewDataBinding) { return widths[binding.id] ?? binding.width ?? DEFAULT_COLUMN_WIDTH; }
  // 추가 영역에서 버튼과 입력만 교체하며 초안 때문에 grid 열을 늘리지 않는다.
  const actionWidth = canAdd ? ATTRIBUTE_EDITOR_WIDTH : 44;
  const template = `44px ${columns.map(binding => `${width(binding)}px`).join(" ")} minmax(${actionWidth}px,1fr)`;
  const minimum = 44 + columns.reduce((total, binding) => total + width(binding), 0) + actionWidth;
  const preview = order !== null || Object.keys(widths).length > 0 || hidden.size > 0;
  const itemKeys = useMemo(() => [...new Set(items.map(item => item.itemKey))], [items]);
  const allSelected = itemKeys.length > 0 && itemKeys.every(key => selected.has(key));

  useEffect(() => {
    if (!adding && restoreAddFocus.current) { restoreAddFocus.current = false; addButton.current?.focus(); }
  }, [adding]);
  // 기능 : Esc 취소는 +로 복귀하고 바깥 클릭 취소는 클릭 대상의 포커스를 유지합니다.
  function cancelAttribute(restoreFocus = true) { restoreAddFocus.current = restoreFocus; setAdding(false); }

  useEffect(() => {
    if (selectAll.current) selectAll.current.indeterminate = !allSelected && itemKeys.some(key => selected.has(key));
  }, [allSelected, itemKeys, selected]);
  useEffect(() => () => cleanup.current?.(), []);
  useEffect(() => {
    if (!menu) return;
    // 기능 : 속성 메뉴 밖 클릭과 Escape에서 기존 표처럼 메뉴를 닫습니다.
    function close(event: PointerEvent | KeyboardEvent) {
      if (labelBusy.current) return;
      if (event instanceof KeyboardEvent ? event.key === "Escape" : event.target instanceof Node && !root.current?.contains(event.target)) setMenu(null);
    }
    document.addEventListener("pointerdown", close); document.addEventListener("keydown", close);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", close); };
  }, [menu]);

  // 기능 : 원본 속성 순서를 변경하지 않고 현재 보기의 열 드래그를 미리 표시합니다.
  function moveColumn(source: string, target: string) {
    if (source === target) return;
    const ids = sorted.map(binding => binding.id);
    const from = ids.indexOf(source), to = ids.indexOf(target);
    if (from < 0 || to < 0) return;
    ids.splice(from, 1); ids.splice(to, 0, source); setOrder(ids);
  }
  // 기능 : 경계 드래그와 헤더 드래그에 기존 pointer 조작감을 적용합니다.
  function startPointer(binding: ViewDataBinding, event: ReactPointerEvent<HTMLButtonElement>, resize: boolean) {
    if (event.button !== 0 || labelBusy.current) return;
    if (resize) { event.preventDefault(); event.stopPropagation(); }
    cleanup.current?.();
    const startX = event.clientX, startWidth = width(binding), pointerId = event.pointerId;
    let moved = false, target = binding.id;
    const previousCursor = document.body.style.cursor, previousSelect = document.body.style.userSelect;
    // 기능 : 작은 움직임은 클릭으로 유지하고 너비 또는 삽입 위치를 갱신합니다.
    function move(pointer: PointerEvent) {
      if (pointer.pointerId !== pointerId || (!resize && Math.abs(pointer.clientX - startX) < 6 && !moved)) return;
      pointer.preventDefault(); moved = true; setMenu(null);
      document.body.style.cursor = resize ? "col-resize" : "grabbing"; document.body.style.userSelect = "none";
      if (resize) setWidths(current => ({ ...current, [binding.id]: Math.max(100, Math.round(startWidth + pointer.clientX - startX)) }));
      else {
        const elements = root.current?.querySelectorAll<HTMLElement>("[data-column-id]") ?? [];
        let nearest = Infinity;
        elements.forEach(element => {
          const bounds = element.getBoundingClientRect();
          const distance = Math.abs(pointer.clientX - (bounds.left + bounds.width / 2));
          if (distance < nearest) { nearest = distance; target = element.dataset.columnId ?? binding.id; }
        });
        setDrag({ source: binding.id, target });
      }
    }
    // 기능 : 전역 pointer listener와 임시 커서를 제거합니다.
    function stop() {
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", finish); window.removeEventListener("pointercancel", stop);
      document.body.style.cursor = previousCursor; document.body.style.userSelect = previousSelect;
      setDrag(null); cleanup.current = null;
    }
    // 기능 : 실제 드래그 이후 메뉴 클릭을 억제하고 화면 열 순서를 확정합니다.
    function finish(pointer: PointerEvent) {
      if (pointer.pointerId !== pointerId) return;
      if (moved) { suppressClick.current = true; window.setTimeout(() => { suppressClick.current = false; }, 0); if (!resize) moveColumn(binding.id, target); }
      stop();
    }
    cleanup.current = stop;
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", finish); window.addEventListener("pointercancel", stop);
  }
  // 기능 : 같은 원본의 여러 그룹 occurrence를 함께 선택합니다.
  function toggleItem(key: string) {
    setSelected(current => { const next = new Set(current); if (next.has(key)) next.delete(key); else next.add(key); return next; });
  }
  // 기능 : 받은 원본 항목만 선택하고 아직 읽지 않은 페이지를 선택했다고 표시하지 않습니다.
  function toggleAll() { setSelected(allSelected ? new Set() : new Set(itemKeys)); }
  // 기능 : 숨긴 열의 현재 화면 표시를 복원하거나 미리 숨깁니다.
  function toggleColumn(id: string) {
    setHidden(current => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }
  // 기능 : 저장된 보기의 표시 상태로 열 조작 미리보기를 되돌립니다.
  function resetColumns() { if (labelBusy.current) return; setOrder(null); setWidths({}); setHidden(new Set()); setMenu(null); }
  // 기능 : 편집 종료 후 원래 컬럼 헤더로 키보드 포커스를 돌려줍니다.
  function closeLabelEditor(id: string) {
    setMenu(null);
    root.current?.querySelector<HTMLElement>(`[data-column-id="${id}"] > button`)?.focus();
  }
  // 기능 : 기존 40px 행과 동일 셀 편집 컴포넌트로 각 occurrence를 표시합니다.
  function renderRow(item: ViewDataItem) {
    return <div className="grid h-[40px] items-stretch bg-white text-[14px] text-[#374151] shadow-[inset_0_-1px_0_#F1F0EC] transition hover:bg-[#FAFAF8]" role="row" key={item.occurrenceKey} style={{ gridTemplateColumns: template }}>
      <div className="flex h-full items-center justify-center border-r border-[#F1F0EC]" role="cell">
        <input aria-label={t("objectList.selectRowLabel", { values: { name: item.title } })} className="h-4 w-4 rounded border-[#D6D3CD] accent-[#4880EE]" type="checkbox" checked={selected.has(item.itemKey)} onChange={() => toggleItem(item.itemKey)} />
      </div>
      {columns.map((binding, index) => <div className="flex h-full min-w-0 items-center border-r border-[#F1F0EC]" role="cell" key={binding.id}>
        <ViewDataCell binding={binding} item={item} editing={editing} primary={index === 0} />
      </div>)}
      <div aria-hidden="true" role="cell" />
    </div>;
  }
  // 기능 : 기존 속성 헤더 모양으로 보기의 열 이동·너비·표시 미리보기를 제공합니다.
  function renderColumn(binding: ViewDataBinding) {
    return <div key={binding.id} data-column-id={binding.id} role="columnheader"
          className={cn("relative flex h-full min-w-0 border-r border-[#EEEDEA]", drag?.target === binding.id && "shadow-[inset_2px_0_0_#4880EE]", drag?.source === binding.id && "opacity-50")}>
          <button className="flex h-full min-w-0 flex-1 touch-none items-center gap-2 px-3 text-left text-[#9CA3AF] outline-none hover:bg-[#E4E2DC] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4880EE]/45 cursor-grab" type="button"
            aria-label={t("objectList.openAttributeDefinitionMenuLabel", { values: { name: binding.label } })} aria-expanded={menu === binding.id}
            onPointerDown={event => startPointer(binding, event, false)} onClick={() => { if (!suppressClick.current && !labelBusy.current) setMenu(menu === binding.id ? null : binding.id); }}>
            <BindingIcon type={binding.attributeType} /><span className="truncate">{binding.label}</span>
          </button>
          <button className="absolute right-[-4px] top-0 z-20 h-full w-2 cursor-col-resize touch-none hover:bg-[#4880EE]/35 focus-visible:bg-[#4880EE]/50" type="button"
            aria-label={t("objectList.resizeAttributeDefinitionColumnLabel", { values: { name: binding.label } })} onPointerDown={event => startPointer(binding, event, true)} />
          {menu === binding.id && <div className="absolute left-1 top-[calc(100%+6px)] z-50 w-[220px] rounded-[14px] border border-[#E5E1D8] bg-white p-2 shadow-[0_18px_42px_rgba(15,23,42,0.18)]" role="dialog" aria-label={binding.label}>
            {scope && <ViewColumnLabelEditor scope={scope} binding={binding} onClose={() => closeLabelEditor(binding.id)} onBusyChange={busy => { labelBusy.current = busy; }} />}
            <p className="px-2 py-2 text-[12px] text-[#9B9A97]">{t("viewData.attributeType")} · {binding.attributeType}</p>
            <button className="flex h-7 w-full items-center gap-2 rounded px-2 text-[14px] text-[#2F2F2F] hover:bg-[#E4E2DC]" type="button" onClick={() => { if (!labelBusy.current) { toggleColumn(binding.id); setMenu(null); } }}><EyeOff className="h-4 w-4" />{t("objectList.attributeDefinitionHideAction")}</button>
            <p className="mt-2 border-t border-[#EEEDEA] px-2 pt-2 text-[11px] font-normal text-[#9B9A97]">{t("viewData.layoutPreview")}</p>
          </div>}
        </div>;
  }
  return <div ref={root} data-testid="view-table">
    <div role="table" aria-label={response.viewName} className="min-w-full" style={{ minWidth: minimum }}>
      <div role="row" className="sticky top-0 z-10 grid h-[36px] items-stretch bg-white text-[14px] font-medium text-[#111827] shadow-[inset_0_-1px_0_#EEEDEA]" style={{ gridTemplateColumns: template }}>
        <div className="flex h-full items-center justify-center" role="columnheader"><input ref={selectAll} type="checkbox" aria-label={t("objectList.selectAllRowsLabel")} checked={allSelected} onChange={toggleAll} className="h-4 w-4 rounded accent-[#4880EE]" /></div>
        {columns.map(renderColumn)}
        {adding && scope ? <div className="h-full min-w-0" style={{ width: ATTRIBUTE_EDITOR_WIDTH }}>
          <InlineAttributeColumn scope={scope} onCancel={cancelAttribute} onCreated={() => { setAdding(false); }} />
        </div> : <div className="relative flex h-full items-center px-2" role="columnheader">
          <button ref={addButton} aria-label={t(canAdd ? "attributeColumn.add" : "objectList.addAttributeDefinitionTooltip")} aria-expanded={menu === "+"} className="flex h-7 items-center gap-2 whitespace-nowrap rounded px-1 text-[#9CA3AF] hover:bg-[#E4E2DC]" type="button" onClick={() => { if (labelBusy.current) return; if (canAdd) { setMenu(null); setAdding(true); } else setMenu(menu === "+" ? null : "+"); }}><Plus aria-hidden="true" className="h-4 w-4 shrink-0" />{canAdd && <span>{t("attributeColumn.add")}</span>}</button>
          {menu === "+" && <div role="dialog" aria-label={t("viewData.visibleColumns")} className="absolute right-1 top-[calc(100%+6px)] z-50 w-[264px] rounded-lg border border-[#E7E6E2] bg-white p-2 text-[12px] text-[#37352F] shadow-lg">
            <div className="flex items-center justify-between px-1 pb-2 font-semibold">{t("viewData.visibleColumns")}<button aria-label={t("common.close")} type="button" onClick={() => setMenu(null)}><X className="h-4 w-4" /></button></div>
            {response.bindings.map(binding => <label key={binding.id} className="flex min-h-7 items-center gap-2 rounded px-1 hover:bg-[#F3F2EF]"><input className="accent-[#4880EE]" type="checkbox" disabled={!original.some(value => value.id === binding.id)} checked={!binding.isHidden && !hidden.has(binding.id)} onChange={() => toggleColumn(binding.id)} /><span className="truncate">{binding.label}</span></label>)}
            <p className="mt-2 border-t border-[#EEEDEA] pt-2 text-[11px] text-[#9B9A97]">{t("viewData.layoutPreview")}</p>
          </div>}
        </div>}
      </div>
      <div role="rowgroup"><ViewDataGroups items={items} groups={response.data.groups} renderItem={renderRow} table />
        {!items.length && [0, 1, 2].map(index => <div key={index} role="row" className="grid h-[40px] shadow-[inset_0_-1px_0_#F1F0EC]" style={{ gridTemplateColumns: template }}>
          <div role="cell" />{columns.map(binding => <div key={binding.id} role="cell" className="border-r border-[#F1F0EC]" />)}<div role="cell" />
        </div>)}
      </div>
    </div>
    {onCreate && <button aria-label={t(creating ? "common.saving" : "viewHeader.addRecord")} aria-busy={creating} className="flex h-[40px] w-full items-center justify-center gap-1.5 border-b border-[#F1F0EC] text-[14px] text-[#65645F] hover:bg-[#E4E2DC] disabled:opacity-50" type="button" disabled={creating} onClick={onCreate}><Plus aria-hidden="true" className="h-5 w-5 shrink-0 text-[#4880EE]" strokeWidth={2} /></button>}
    {preview && <div className="flex items-center gap-2 border-b border-[#EEEDEA] px-3 py-2 text-[11px] text-[#9B9A97]"><span>{t("viewData.layoutPreview")}</span><button className="shrink-0 text-[#326ACD]" type="button" onClick={resetColumns}>{t("common.reset")}</button></div>}
    {selected.size > 0 && <p className="px-3 pt-2 text-[11px] text-[#9B9A97]">{t("viewData.selected", { values: { count: selected.size } })}</p>}
    {hidden.size > 0 && columns.length === 0 && <button className="m-3 text-[12px] text-[#326ACD]" type="button" onClick={() => setMenu("+")}>{t("viewData.visibleColumns")}<ChevronDown className="inline h-3 w-3" /></button>}
  </div>;
}
