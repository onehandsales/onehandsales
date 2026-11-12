import { ArrowUpDown, ChevronDown, Plus, Search, Settings, SlidersHorizontal, X, type LucideIcon } from "lucide-react";
import { type MouseEvent, type ReactNode, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { useAppI18n } from "@/features/app-i18n";
import { getViewTools, ViewFilterMenu, ViewSortMenu, ViewSettingsMenu, ViewPreviewNote,
  type ViewAttributeCandidate, type ViewMenusModel, type WorkspaceViewHeaderModel } from "@/features/crm-view";
import { ApiClientError } from "@/lib/api-client";
import { cn } from "@/utils/cn";

type Panel = "search" | "filters" | "sorts" | "settings";
type ViewHeaderToolbarProps = {
  readonly attributes?: readonly ViewAttributeCandidate[];
  readonly header: WorkspaceViewHeaderModel;
  readonly menus: ViewMenusModel;
  readonly searchLabel: string;
  readonly searchValue: string;
  readonly onSearchChange: (value: string) => void;
  readonly onCreateRecord?: () => void;
  readonly isCreatingRecord?: boolean;
  readonly createUnavailable?: boolean;
  readonly secondaryActions?: ReactNode;
};
const CONTROL_CLASS = "inline-flex h-7 shrink-0 items-center justify-center gap-1.5 rounded px-2 font-sans text-[14px] font-medium text-[#4B5563] transition hover:bg-[#E4E2DC] hover:text-[#111827] enabled:active:bg-[#D3D1CB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4880EE]/50";

// 기능 : 기존 헤더 모양으로 현재 보기의 도구와 설정 미리보기를 제공합니다.
export function ViewHeaderToolbar({ attributes = [], header, menus, searchLabel, searchValue, onSearchChange, onCreateRecord, isCreatingRecord = false, createUnavailable = false, secondaryActions }: ViewHeaderToolbarProps) {
  const { t } = useAppI18n();
  const [panel, setPanel] = useState<Panel | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const openMenuRef = useRef(menus.open);
  openMenuRef.current = menus.open;
  const panelId = useId();
  const searchId = useId();
  const type = header.currentView?.viewType;
  const tools = getViewTools(type);
  const ready = Boolean(header.currentView && header.target) && !header.isLoading && !header.isError;
  const searchOpen = panel === "search";

  // 기능 : 팝오버 조회를 종료하고 원래 버튼으로 초점을 복원합니다.
  function closePanel() {
    // 1. 화면의 메뉴와 진행 중인 조회를 함께 닫는다.
    setPanel(null);
    menus.open(null);
    triggerRef.current?.focus();
  }
  // 기능 : 사용자가 연 메뉴에 대해서만 서버 설정을 요청합니다.
  function togglePanel(next: Panel, event: MouseEvent<HTMLButtonElement>) {
    // 1. 검색은 기존 페이지 입력에 연결하고 설정 메뉴는 공통 조회 모델에 연결한다.
    triggerRef.current = event.currentTarget;
    const opened = panel === next ? null : next;
    setPanel(opened);
    menus.open(opened === "search" ? null : opened);
  }
  useEffect(() => {
    // 2. 다른 보기나 실패한 헤더에는 이전 팝오버를 남기지 않는다.
    setPanel(null);
  }, [menus.scope, ready]);
  useEffect(() => {
    if (!panel) return;
    const root = rootRef.current;
    // 1. 검색은 펼쳐지는 입력창에, 설정 메뉴는 팝오버의 첫 조작 요소에 초점을 둔다.
    if (panel === "search") searchInputRef.current?.focus({ preventScroll: true });
    else root?.querySelector<HTMLElement>("[data-header-popover] input, [data-header-popover] select, [data-header-popover] button")?.focus();
    const initialWidth = window.innerWidth;
    // 기능 : 바깥 클릭 시 검색어는 유지하고 입력창이나 팝오버를 닫습니다.
    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !root?.contains(event.target)) { setPanel(null); openMenuRef.current(null); }
    }
    // 기능 : 문자 조합 중이 아닐 때 Escape로 검색·메뉴를 닫고 버튼 초점을 복원합니다.
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || event.isComposing) return;
      event.preventDefault();
      setPanel(null); openMenuRef.current(null); triggerRef.current?.focus();
    }
    // 기능 : 화면 폭 전환으로 숨겨지는 팝오버를 닫고 모바일 키보드 높이 변경은 허용합니다.
    function handleResize() {
      if (window.innerWidth !== initialWidth) { setPanel(null); openMenuRef.current(null); }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [panel]);
  useLayoutEffect(() => {
    // 3. 좁은 화면에서도 원래 폭의 팝오버가 화면 바깥으로 나가지 않게 보정한다.
    const element = rootRef.current?.querySelector<HTMLElement>("[data-header-popover]");
    if (!element) return;
    element.style.transform = "";
    const box = element.getBoundingClientRect();
    const shift = box.left < 12 ? 12 - box.left : box.right > window.innerWidth - 12 ? window.innerWidth - 12 - box.right : 0;
    element.style.transform = "translateX(" + shift + "px)";
  }, [panel]);

  // 기능 : 접근할 수 없는 보기는 헤더를 복구하고 일시 오류는 메뉴를 다시 읽습니다.
  function retryMenu(name: Exclude<Panel, "search">, unavailable: boolean) {
    // 1. 삭제된 선택을 해제하는 헤더 복구와 동일 메뉴 재시도를 구분한다.
    if (unavailable) { closePanel(); header.onRetry(); }
    else { void menus[name].retry(); }
  }
  // 기능 : 로딩·실패·정상 빈 응답을 기존 팝오버 안에서 구분합니다.
  function renderMenu(name: Exclude<Panel, "search">) {
    const state = menus[name];
    if (state.isError) {
      const unavailable = state.error instanceof ApiClientError && [403, 404].includes(state.error.statusCode);
      return <div className="px-2 py-2" role="alert"><p>{t(unavailable ? "viewMenu.unavailable" : "viewMenu.loadError")}</p>
        <button className="mt-2 rounded px-2 py-1 text-[#326ACD] hover:bg-[#EDF3FE]" type="button" onClick={() => retryMenu(name, unavailable)}>{t("common.retry")}</button></div>;
    }
    if (state.isPending || !state.data) return <div role="status" className="space-y-2 px-2 py-3"><p className="text-[#9B9A97]">{t("common.loading")}</p><div className="h-6 animate-pulse rounded bg-[#F4F3F0]" /><div className="h-6 animate-pulse rounded bg-[#F4F3F0]" /></div>;
    const candidates = menus.supportsSaving ? menus.candidates : attributes;
    if (name === "filters" && menus.filters.data) return <ViewFilterMenu data={menus.filters.data} candidates={candidates} onChange={menus.filters.change} optionsScope={menus.configurationScope} />;
    if (name === "sorts" && menus.sorts.data) return <ViewSortMenu data={menus.sorts.data} candidates={candidates} onChange={menus.sorts.change} />;
    if (name === "settings" && menus.settings.data) return <ViewSettingsMenu data={menus.settings.data} candidates={candidates} onChange={menus.settings.change} />;
    return null;
  }
  // 기능 : 필터·정렬·설정 팝오버의 폭을 260px로 통일합니다.
  function renderPopover(name: Exclude<Panel, "search">, title: string, children: ReactNode) {
    return panel === name ? <div aria-label={title} className="absolute right-0 top-[calc(100%+6px)] z-50 w-[260px] max-h-[calc(100dvh-100px)] max-w-[calc(100vw-24px)] overflow-y-auto rounded-lg border border-[#E7E6E2] bg-white p-1.5 text-[12px] text-[#37352F] shadow-[0_8px_28px_rgba(15,23,42,0.12)]" data-header-popover="" id={panelId} role="dialog">
      <div className="flex items-center justify-between px-2 pb-2 pt-1"><span className="font-semibold">{title}</span><button aria-label={t("common.close")} className="rounded p-1 text-[#9B9A97] hover:bg-[#F0EFEC]" onClick={closePanel} type="button"><X className="h-3.5 w-3.5" /></button></div>
      <fieldset disabled={menus.isSaving}>{children}</fieldset><ViewPreviewNote supportsSaving={menus.supportsSaving} />
    </div> : null;
  }
  // 기능 : 메뉴 버튼과 현재 상태를 기존 헤더 스타일로 연결합니다.
  function menuButton(name: Exclude<Panel, "search">, label: string, icon: LucideIcon, count = 0) {
    return <div className="relative shrink-0"><ToolbarButton active={panel === name || count > 0} disabled={!ready} controls={panel === name ? panelId : undefined} expanded={panel === name} icon={icon} label={label} onClick={event => togglePanel(name, event)} />
      {panel === name && renderPopover(name, label, renderMenu(name))}</div>;
  }
  return <div className="flex min-w-0 flex-1 items-center gap-1" data-testid="view-header-toolbar" ref={rootRef}>
    <div className="min-w-1 flex-1" />
    {tools.search && <div
      aria-label={searchLabel}
      className={cn("flex h-7 min-w-7 shrink items-center rounded transition-[width] duration-200 ease-out motion-reduce:transition-none", searchOpen ? "w-[208px] bg-white ring-1 ring-inset ring-[#dededa] focus-within:ring-[#9CA3AF]" : "w-7")}
      onBlur={event => {
        if (searchOpen && !event.currentTarget.contains(event.relatedTarget)) setPanel(null);
      }}
      role="search"
    >
      <ToolbarButton disabled={!ready} active={Boolean(searchValue) && !searchOpen} controls={searchId} expanded={searchOpen} icon={Search} label={searchLabel} popup={false} onClick={event => togglePanel("search", event)} />
      <div aria-hidden={!searchOpen} className={cn("flex min-w-0 flex-1 items-center overflow-hidden transition-opacity duration-200 motion-reduce:transition-none", searchOpen ? "visible opacity-100" : "invisible opacity-0")} id={searchId} inert={!searchOpen}>
        <input
          aria-label={searchLabel}
          className="h-7 min-w-0 flex-1 bg-transparent pl-1 pr-2 font-sans text-[14px] font-normal text-[#37352F] outline-none placeholder:text-[#9CA3AF] [&::-webkit-search-cancel-button]:appearance-none"
          disabled={!ready || !searchOpen}
          maxLength={200}
          onChange={event => onSearchChange(event.target.value)}
          placeholder={searchLabel}
          ref={searchInputRef}
          tabIndex={searchOpen ? 0 : -1}
          type="search"
          value={searchValue}
        />
        {searchValue && <button aria-label={t("common.clear")} className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[#9CA3AF] transition-colors hover:bg-[#E4E2DC] hover:text-[#6B7280] enabled:active:bg-[#D3D1CB] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#9CA3AF]" tabIndex={searchOpen ? 0 : -1} type="button" onClick={() => { onSearchChange(""); searchInputRef.current?.focus(); }}><X aria-hidden="true" className="h-4 w-4" /></button>}
      </div>
    </div>}
    {tools.filters && menuButton("filters", t("common.filter"), SlidersHorizontal, menus.filters.data?.viewFilterConditionDefinitions.length)}
    {tools.sorts && menuButton("sorts", t(type === "MAP" ? "viewMenu.listSort" : "viewHeader.sort"), ArrowUpDown, menus.sorts.data?.viewSortDefinitions.length)}
    <button className={cn(CONTROL_CLASS, "hidden text-[#4B5563] disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#4B5563] 2xl:inline-flex")} disabled title={t("viewHeader.comingSoon")} type="button">{t("viewHeader.extraTools")}<ChevronDown className="h-[16px] w-[16px] shrink-0" /></button>
    {tools.create && (onCreateRecord || createUnavailable) && <button aria-label={t("viewHeader.addRecord")} aria-busy={isCreatingRecord} disabled={createUnavailable || isCreatingRecord} title={createUnavailable ? t("viewHeader.comingSoon") : undefined} className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#4880EE] p-0 text-[12px] font-medium text-white transition hover:bg-[#3B6FDA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4880EE]/50 focus-visible:ring-offset-1 disabled:cursor-default disabled:opacity-40" onClick={onCreateRecord} type="button"><Plus aria-hidden="true" className="h-[16px] w-[16px] shrink-0" /></button>}
    {secondaryActions && <div onClickCapture={() => { setPanel(null); menus.open(null); }}>{secondaryActions}</div>}
    {menuButton("settings", t("viewHeader.settings"), Settings)}
  </div>;
}

// 기능 : 공통 헤더 버튼의 표시·활성·접근성 상태를 표현합니다.
function ToolbarButton({ active, disabled = false, controls, expanded, icon: Icon, label, popup = true, onClick }: {
  readonly active: boolean; readonly disabled?: boolean; readonly controls?: string;
  readonly expanded: boolean; readonly icon: LucideIcon; readonly label: string;
  readonly popup?: boolean;
  readonly onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return <button aria-controls={controls} aria-expanded={expanded} aria-haspopup={popup ? "dialog" : undefined} aria-label={label} title={label} disabled={disabled} className={cn(CONTROL_CLASS, "group/header-tool w-7 p-0 disabled:cursor-default disabled:opacity-40", active && "bg-[#E4E2DC] text-[#111827]")} onClick={onClick} type="button">
    <Icon aria-hidden="true" className={cn("h-[16px] w-[16px] shrink-0 text-[#9CA3AF] group-hover/header-tool:text-[#6B7280]", active && "text-[#6B7280]")} />
  </button>;
}
