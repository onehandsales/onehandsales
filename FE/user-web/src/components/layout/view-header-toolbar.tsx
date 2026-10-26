import {
  ArrowUpDown, ChevronDown, Columns3, Filter, Plus, Search,
  Settings2, Table2, X, type LucideIcon,
} from "lucide-react";
import {
  type MouseEvent, type ReactNode, useEffect, useId, useRef, useState,
} from "react";
import { useAppI18n } from "@/features/app-i18n";
import { cn } from "@/utils/cn";

type HeaderAttribute = { readonly id: string; readonly title: string };
type PreviewFilter = { readonly id: string; readonly attributeId: string; readonly value: string };
type PreviewSort = { readonly id: string; readonly attributeId: string; readonly direction: "ASC" | "DESC" };
type PreviewSettings = {
  readonly filters: readonly PreviewFilter[];
  readonly sorts: readonly PreviewSort[];
  readonly hiddenAttributes: readonly string[];
};
type Panel = "search" | "filter" | "sort" | "settings";
type ViewHeaderToolbarProps = {
  readonly attributes?: readonly HeaderAttribute[];
  readonly searchLabel: string;
  readonly searchValue: string;
  readonly onSearchChange: (value: string) => void;
  readonly onCreateRecord: () => void;
  readonly secondaryActions?: ReactNode;
};

const CONTROL_CLASS = "inline-flex h-7 shrink-0 items-center justify-center gap-1.5 rounded px-2 text-[12px] font-medium text-[#65645F] transition hover:bg-[#F0EFEC] hover:text-[#292824] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4880EE]/50";
const INITIAL_SETTINGS: PreviewSettings = {
  filters: [], sorts: [], hiddenAttributes: [],
};

// 기능 : 공통 보기 선택 옆에 기존 검색·기록 추가·설정 미리보기 도구를 제공합니다.
export function ViewHeaderToolbar({
  attributes = [], searchLabel, searchValue, onSearchChange,
  onCreateRecord, secondaryActions,
}: ViewHeaderToolbarProps) {
  const { t } = useAppI18n();
  const [previewSettings, setPreviewSettings] = useState<PreviewSettings>(INITIAL_SETTINGS);
  const [panel, setPanel] = useState<Panel | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelId = useId();

  // 기능 : 오른쪽 도구의 기존 설정 미리보기 상태만 변경합니다.
  function updateSettings(update: Partial<PreviewSettings>) {
    setPreviewSettings(current => ({ ...current, ...update }));
  }

  // 기능 : 팝오버를 닫고 키보드 입력 위치를 복원합니다.
  function closePanel() {
    setPanel(null);
    triggerRef.current?.focus();
  }

  // 기능 : 한 번에 하나의 헤더 팝오버만 엽니다.
  function togglePanel(next: Panel, event: MouseEvent<HTMLButtonElement>) {
    triggerRef.current = event.currentTarget;
    setPanel((current) => current === next ? null : next);
  }

  useEffect(() => {
    if (!panel) return;
    const root = rootRef.current;
    const initialFocus = root?.querySelector<HTMLElement>("[data-header-popover] input, [data-header-popover] select")
      ?? root?.querySelector<HTMLElement>("[data-header-popover] button");
    initialFocus?.focus();

    // 기능 : 바깥 클릭으로 헤더 팝오버를 닫습니다.
    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !root?.contains(event.target)) setPanel(null);
    }
    // 기능 : Escape로 팝오버를 닫고 원래 버튼에 초점을 돌립니다.
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setPanel(null);
      triggerRef.current?.focus();
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [panel]);

  // 기능 : 실제 속성에서 필터·정렬 입력 줄을 추가합니다.
  function addRule(kind: "filter" | "sort") {
    const attribute = attributes[0];
    if (!attribute) return;
    const id = crypto.randomUUID();
    if (kind === "filter") {
      updateSettings({ filters: [...previewSettings.filters, { id, attributeId: attribute.id, value: "" }] });
    } else {
      updateSettings({ sorts: [...previewSettings.sorts, { id, attributeId: attribute.id, direction: "ASC" }] });
    }
  }

  // 기능 : 오른쪽 조회 도구의 팝오버를 기존 위치와 크기로 표시합니다.
  function renderPopover(name: Panel, title: string, children: ReactNode, wide = false) {
    return panel === name ? (
      <div
        aria-label={title}
        className={cn(
          "absolute top-[calc(100%+6px)] z-50 max-w-[calc(100vw-24px)] rounded-lg border border-[#E7E6E2] bg-white p-1.5 text-[12px] text-[#37352F] shadow-[0_8px_28px_rgba(15,23,42,0.12)]",
          "right-0",
          wide ? "w-[340px]" : "w-[264px]",
        )}
        data-header-popover=""
        id={panelId}
        role="dialog"
      >
        <div className="flex items-center justify-between px-2 pb-2 pt-1">
          <span className="font-semibold">{title}</span>
          <button aria-label={t("common.close")} className="rounded p-1 text-[#9B9A97] hover:bg-[#F0EFEC]" onClick={closePanel} type="button"><X className="h-3.5 w-3.5" /></button>
        </div>
        {children}
      </div>
    ) : null;
  }

  // 기능 : 기존 속성으로 필터·정렬 조건의 선택 입력을 표시합니다.
  function renderAttributeSelect(value: string, onChange: (id: string) => void) {
    return (
      <select
        aria-label={t("viewHeader.attribute")}
        className="h-8 min-w-0 flex-1 rounded border border-[#E7E6E2] bg-white px-2 outline-none focus:border-[#A9C5FA]"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {attributes.map((attribute) => <option key={attribute.id} value={attribute.id}>{attribute.title}</option>)}
      </select>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1" data-testid="view-header-toolbar" ref={rootRef}>
      <div className="min-w-1 flex-1" />
      <div className="relative shrink-0">
        <ToolbarButton active={Boolean(searchValue) || panel === "search"} controls={panel === "search" ? panelId : undefined} expanded={panel === "search"} icon={Search} label={searchLabel} onClick={(event) => togglePanel("search", event)} text={t("common.search")} />
        {renderPopover("search", t("common.search"), <>
          <input aria-label={searchLabel} className="mx-1 h-8 w-[calc(100%-8px)] rounded bg-[#F4F3F0] px-2 outline-none focus:ring-1 focus:ring-[#A9C5FA]" onChange={(event) => onSearchChange(event.target.value)} placeholder={searchLabel} type="search" value={searchValue} />
          {searchValue && <button className="mt-1 w-full rounded px-2 py-2 text-left text-[#787774] hover:bg-[#F3F2EF]" onClick={() => onSearchChange("")} type="button">{t("common.clear")}</button>}
        </>)}
      </div>
      <div className="relative shrink-0">
        <ToolbarButton active={previewSettings.filters.length > 0 || panel === "filter"} controls={panel === "filter" ? panelId : undefined} count={previewSettings.filters.length} expanded={panel === "filter"} icon={Filter} label={t("common.filter")} onClick={(event) => togglePanel("filter", event)} text={t("common.filter")} />
        {renderPopover("filter", t("common.filter"), <>
          {previewSettings.filters.map((filter) => <div className="mb-2 space-y-1 rounded bg-[#F8F7F5] p-2" key={filter.id}>
            <div className="flex items-center gap-1">
              {renderAttributeSelect(filter.attributeId, (attributeId) => updateSettings({ filters: previewSettings.filters.map((item) => item.id === filter.id ? { ...item, attributeId } : item) }))}
              <button aria-label={t("viewHeader.removeFilter")} className="rounded p-1 text-[#9B9A97] hover:bg-[#EAE9E5]" onClick={() => updateSettings({ filters: previewSettings.filters.filter((item) => item.id !== filter.id) })} type="button"><X className="h-3.5 w-3.5" /></button>
            </div>
            <input aria-label={t("viewHeader.filterValue")} className="h-8 w-full rounded border border-[#E7E6E2] px-2 outline-none focus:border-[#A9C5FA]" onChange={(event) => updateSettings({ filters: previewSettings.filters.map((item) => item.id === filter.id ? { ...item, value: event.target.value } : item) })} placeholder={t("viewHeader.filterValue")} value={filter.value} />
          </div>)}
          {!previewSettings.filters.length && <p className="px-2 pb-3 text-[#9B9A97]">{t(attributes.length ? "viewHeader.noFilters" : "viewHeader.noAttributes")}</p>}
          <button className="flex h-8 w-full items-center gap-2 rounded px-2 hover:bg-[#F3F2EF] disabled:opacity-40" disabled={!attributes.length} onClick={() => addRule("filter")} type="button"><Plus className="h-3.5 w-3.5" />{t("viewHeader.addFilter")}</button>
          <PreviewNote />
        </>, true)}
      </div>
      <div className="relative shrink-0">
        <ToolbarButton active={previewSettings.sorts.length > 0 || panel === "sort"} controls={panel === "sort" ? panelId : undefined} count={previewSettings.sorts.length} expanded={panel === "sort"} icon={ArrowUpDown} label={t("viewHeader.sort")} onClick={(event) => togglePanel("sort", event)} text={t("viewHeader.sort")} />
        {renderPopover("sort", t("viewHeader.sort"), <>
          {previewSettings.sorts.map((sort) => <div className="mb-2 flex items-center gap-1 px-1" key={sort.id}>
            {renderAttributeSelect(sort.attributeId, (attributeId) => updateSettings({ sorts: previewSettings.sorts.map((item) => item.id === sort.id ? { ...item, attributeId } : item) }))}
            <select aria-label={t("viewHeader.sortDirection")} className="h-8 rounded border border-[#E7E6E2] bg-white px-1" onChange={(event) => updateSettings({ sorts: previewSettings.sorts.map((item) => item.id === sort.id ? { ...item, direction: event.target.value as "ASC" | "DESC" } : item) })} value={sort.direction}>
              <option value="ASC">{t("viewHeader.ascending")}</option><option value="DESC">{t("viewHeader.descending")}</option>
            </select>
            <button aria-label={t("viewHeader.removeSort")} className="rounded p-1 text-[#9B9A97] hover:bg-[#F3F2EF]" onClick={() => updateSettings({ sorts: previewSettings.sorts.filter((item) => item.id !== sort.id) })} type="button"><X className="h-3.5 w-3.5" /></button>
          </div>)}
          {!previewSettings.sorts.length && <p className="px-2 pb-3 text-[#9B9A97]">{t(attributes.length ? "viewHeader.noSorts" : "viewHeader.noAttributes")}</p>}
          <button className="flex h-8 w-full items-center gap-2 rounded px-2 hover:bg-[#F3F2EF] disabled:opacity-40" disabled={!attributes.length} onClick={() => addRule("sort")} type="button"><Plus className="h-3.5 w-3.5" />{t("viewHeader.addSort")}</button>
          <PreviewNote />
        </>, true)}
      </div>
      <button className={cn(CONTROL_CLASS, "hidden text-[#B5B3AE] disabled:cursor-default disabled:hover:bg-transparent 2xl:inline-flex")} disabled title={t("viewHeader.comingSoon")} type="button">{t("viewHeader.extraTools")}<ChevronDown className="h-3 w-3" /></button>
      <span aria-hidden="true" className="mx-1 h-3.5 w-px shrink-0 bg-[#E7E6E2]" />
      <button aria-label={t("viewHeader.addRecord")} className="inline-flex h-7 shrink-0 items-center gap-1 rounded bg-[#4880EE] px-2 text-[12px] font-medium text-white transition hover:bg-[#3B6FDA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4880EE]/50 focus-visible:ring-offset-1" onClick={onCreateRecord} type="button"><Plus aria-hidden="true" className="h-3.5 w-3.5" /><span className="hidden xl:inline">{t("viewHeader.addRecord")}</span></button>
      {secondaryActions ? <div onClickCapture={() => setPanel(null)}>{secondaryActions}</div> : null}
      <div className="relative shrink-0">
        <ToolbarButton active={panel === "settings"} controls={panel === "settings" ? panelId : undefined} expanded={panel === "settings"} icon={Settings2} label={t("viewHeader.settings")} onClick={(event) => togglePanel("settings", event)} text={t("viewHeader.settings")} />
        {renderPopover("settings", t("viewHeader.settings"), <>
          <div className="flex items-center gap-2 rounded px-2 py-2"><Table2 className="h-3.5 w-3.5 text-[#9B9A97]" /><span className="flex-1">{t("viewHeader.layout")}</span><span className="text-[#9B9A97]">{t("viewHeader.table")}</span></div>
          <div className="my-1 border-t border-[#EEEDE9]" />
          <p className="flex items-center gap-2 px-2 py-2 text-[#9B9A97]"><Columns3 className="h-3.5 w-3.5" />{t("viewHeader.visibleAttributes")}</p>
          {attributes.map((attribute) => <label className="flex h-8 cursor-pointer items-center gap-2 rounded px-2 hover:bg-[#F3F2EF]" key={attribute.id}>
            <input checked={!previewSettings.hiddenAttributes.includes(attribute.id)} className="h-3.5 w-3.5 accent-[#4880EE]" onChange={(event) => updateSettings({ hiddenAttributes: event.target.checked ? previewSettings.hiddenAttributes.filter((id) => id !== attribute.id) : [...previewSettings.hiddenAttributes, attribute.id] })} type="checkbox" />
            <span className="truncate">{attribute.title}</span>
          </label>)}
          {!attributes.length && <p className="px-2 py-2 text-[#9B9A97]">{t("viewHeader.noAttributes")}</p>}
          <PreviewNote />
        </>)}
      </div>
    </div>
  );
}

// 기능 : 헤더 조회 도구의 버튼과 활성 상태를 공통 표현합니다.
function ToolbarButton({
  active, controls, count = 0, expanded, icon: Icon, label, onClick, text,
}: {
  readonly active: boolean; readonly controls?: string; readonly count?: number;
  readonly expanded: boolean; readonly icon: LucideIcon; readonly label: string;
  readonly onClick: (event: MouseEvent<HTMLButtonElement>) => void; readonly text: string;
}) {
  return <button aria-controls={controls} aria-expanded={expanded} aria-haspopup="dialog" aria-label={label} className={cn(CONTROL_CLASS, active && "bg-[#EDF3FE] text-[#326ACD] hover:bg-[#E4EDFD] hover:text-[#326ACD]")} onClick={onClick} type="button">
    <Icon aria-hidden="true" className="h-3.5 w-3.5" />
    <span className="hidden xl:inline">{text}</span>
    {count > 0 && <span className="text-[10px]">{count}</span>}
    {Icon === Settings2 && <ChevronDown aria-hidden="true" className="hidden h-3 w-3 xl:block" />}
  </button>;
}

// 기능 : 실제 기록 조회와 구분되는 설정 미리보기 범위를 안내합니다.
function PreviewNote() {
  const { t } = useAppI18n();
  return <p className="mx-1 mt-2 border-t border-[#EEEDE9] px-1 pb-1 pt-2 text-[11px] leading-relaxed text-[#A4A39E]">{t("viewHeader.previewNote")}</p>;
}
