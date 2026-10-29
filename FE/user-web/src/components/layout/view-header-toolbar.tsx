import { ArrowUpDown, ChevronDown, Filter, Plus, Search, Settings2, X, type LucideIcon } from "lucide-react";
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
  readonly secondaryActions?: ReactNode;
};
const CONTROL_CLASS = "inline-flex h-7 shrink-0 items-center justify-center gap-1.5 rounded px-2 text-[12px] font-medium text-[#65645F] transition hover:bg-[#F0EFEC] hover:text-[#292824] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4880EE]/50";

// 기능 : 기존 헤더 모양으로 현재 보기의 도구와 설정 미리보기를 제공합니다.
export function ViewHeaderToolbar({ attributes = [], header, menus, searchLabel, searchValue, onSearchChange, onCreateRecord, secondaryActions }: ViewHeaderToolbarProps) {
  const { t } = useAppI18n();
  const [panel, setPanel] = useState<Panel | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const openMenuRef = useRef(menus.open);
  openMenuRef.current = menus.open;
  const panelId = useId();
  const type = header.currentView?.viewType;
  const tools = getViewTools(type);
  const ready = Boolean(header.currentView) && !header.isLoading && !header.isError;

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
    root?.querySelector<HTMLElement>("[data-header-popover] input, [data-header-popover] select, [data-header-popover] button")?.focus();
    const initialWidth = window.innerWidth;
    // 기능 : 바깥 클릭 시 입력은 유지하고 팝오버만 닫습니다.
    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !root?.contains(event.target)) { setPanel(null); openMenuRef.current(null); }
    }
    // 기능 : Escape로 팝오버를 닫고 버튼 초점을 복원합니다.
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
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
    if (name === "filters" && menus.filters.data) return <ViewFilterMenu data={menus.filters.data} candidates={attributes} onChange={menus.filters.change} />;
    if (name === "sorts" && menus.sorts.data) return <ViewSortMenu data={menus.sorts.data} candidates={attributes} onChange={menus.sorts.change} />;
    if (name === "settings" && menus.settings.data) return <ViewSettingsMenu data={menus.settings.data} candidates={attributes} onChange={menus.settings.change} />;
    return null;
  }
  // 기능 : 설정 264px와 필터·정렬 340px의 기존 팝오버 형태를 유지합니다.
  function renderPopover(name: Panel, title: string, children: ReactNode) {
    return panel === name ? <div aria-label={title} className={cn(
      "absolute right-0 top-[calc(100%+6px)] z-50 max-h-[calc(100dvh-100px)] max-w-[calc(100vw-24px)] overflow-y-auto rounded-lg border border-[#E7E6E2] bg-white p-1.5 text-[12px] text-[#37352F] shadow-[0_8px_28px_rgba(15,23,42,0.12)]",
      name === "filters" || name === "sorts" ? "w-[340px]" : "w-[264px]",
    )} data-header-popover="" id={panelId} role="dialog">
      <div className="flex items-center justify-between px-2 pb-2 pt-1"><span className="font-semibold">{title}</span><button aria-label={t("common.close")} className="rounded p-1 text-[#9B9A97] hover:bg-[#F0EFEC]" onClick={closePanel} type="button"><X className="h-3.5 w-3.5" /></button></div>
      {children}{name !== "search" && <ViewPreviewNote />}
    </div> : null;
  }
  // 기능 : 메뉴 버튼과 현재 상태를 기존 헤더 스타일로 연결합니다.
  function menuButton(name: Exclude<Panel, "search">, label: string, icon: LucideIcon, count = 0) {
    return <div className="relative shrink-0"><ToolbarButton active={panel === name || count > 0} disabled={!ready} controls={panel === name ? panelId : undefined} expanded={panel === name} icon={icon} label={label} text={label} count={count} onClick={event => togglePanel(name, event)} />
      {panel === name && renderPopover(name, label, renderMenu(name))}</div>;
  }
  return <div className="flex min-w-0 flex-1 items-center gap-1" data-testid="view-header-toolbar" ref={rootRef}>
    <div className="min-w-1 flex-1" />
    {tools.search && <div className="relative shrink-0"><ToolbarButton active={Boolean(searchValue) || panel === "search"} controls={panel === "search" ? panelId : undefined} expanded={panel === "search"} icon={Search} label={searchLabel} text={t("common.search")} onClick={event => togglePanel("search", event)} />
      {renderPopover("search", t("common.search"), <><input aria-label={searchLabel} className="mx-1 h-8 w-[calc(100%-8px)] rounded bg-[#F4F3F0] px-2 outline-none focus:ring-1 focus:ring-[#A9C5FA]" type="search" placeholder={searchLabel} value={searchValue} onChange={event => onSearchChange(event.target.value)} />{searchValue && <button className="mt-1 w-full rounded px-2 py-2 text-left text-[#787774] hover:bg-[#F3F2EF]" type="button" onClick={() => onSearchChange("")}>{t("common.clear")}</button>}</>)}
    </div>}
    {tools.filters && menuButton("filters", t("common.filter"), Filter, menus.filters.data?.viewFilterConditionDefinitions.length)}
    {tools.sorts && menuButton("sorts", t(type === "MAP" ? "viewMenu.listSort" : "viewHeader.sort"), ArrowUpDown, menus.sorts.data?.viewSortDefinitions.length)}
    <button className={cn(CONTROL_CLASS, "hidden text-[#B5B3AE] disabled:cursor-default disabled:hover:bg-transparent 2xl:inline-flex")} disabled title={t("viewHeader.comingSoon")} type="button">{t("viewHeader.extraTools")}<ChevronDown className="h-3 w-3" /></button>
    {tools.create && onCreateRecord && <><span aria-hidden="true" className="mx-1 h-3.5 w-px shrink-0 bg-[#E7E6E2]" /><button aria-label={t("viewHeader.addRecord")} className="inline-flex h-7 shrink-0 items-center gap-1 rounded bg-[#4880EE] px-2 text-[12px] font-medium text-white transition hover:bg-[#3B6FDA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4880EE]/50 focus-visible:ring-offset-1" onClick={onCreateRecord} type="button"><Plus aria-hidden="true" className="h-3.5 w-3.5" /><span className="hidden xl:inline">{t("viewHeader.addRecord")}</span></button></>}
    {secondaryActions && <div onClickCapture={() => { setPanel(null); menus.open(null); }}>{secondaryActions}</div>}
    {menuButton("settings", t("viewHeader.settings"), Settings2)}
  </div>;
}

// 기능 : 공통 헤더 버튼의 표시·활성·접근성 상태를 표현합니다.
function ToolbarButton({ active, disabled = false, controls, count = 0, expanded, icon: Icon, label, onClick, text }: {
  readonly active: boolean; readonly disabled?: boolean; readonly controls?: string; readonly count?: number;
  readonly expanded: boolean; readonly icon: LucideIcon; readonly label: string;
  readonly onClick: (event: MouseEvent<HTMLButtonElement>) => void; readonly text: string;
}) {
  return <button aria-controls={controls} aria-expanded={expanded} aria-haspopup="dialog" aria-label={label} disabled={disabled} className={cn(CONTROL_CLASS, "disabled:cursor-default disabled:opacity-40", active && "bg-[#EDF3FE] text-[#326ACD] hover:bg-[#E4EDFD] hover:text-[#326ACD]")} onClick={onClick} type="button">
    <Icon aria-hidden="true" className="h-3.5 w-3.5" /><span className="hidden xl:inline">{text}</span>{count > 0 && <span className="text-[10px]">{count}</span>}{Icon === Settings2 && <ChevronDown aria-hidden="true" className="hidden h-3 w-3 xl:block" />}
  </button>;
}
