import {
  CalendarDays, ChartNoAxesCombined, Check, ChevronDown, Columns3, GanttChart, Heart,
  Layers, LayoutDashboard, LayoutGrid, List, Map, Search, Table2,
  TableProperties, type LucideIcon,
} from "lucide-react";
import {
  type KeyboardEvent as ReactKeyboardEvent, useCallback, useEffect, useId, useRef, useState,
} from "react";
import { IconValueGlyph } from "@/components/ui/icon-value-glyph";
import { useAppI18n, type AppI18nKey } from "@/features/app-i18n";
import { cn } from "@/utils/cn";
import type { WorkspaceViewHeaderModel } from "../hooks/use-workspace-view-header";
import { useWorkspaceViews } from "../hooks/use-workspace-views";
import type { WorkspaceViewListItem, WorkspaceViewType } from "../types/workspace-view";

const TYPE_ICONS: Record<WorkspaceViewType, LucideIcon> = {
  TABLE: Table2, KANBAN: Columns3, LIST: List, GALLERY: LayoutGrid,
  CALENDAR: CalendarDays, TIMELINE: GanttChart, GANTT: GanttChart,
  CHART: ChartNoAxesCombined, PIVOT: TableProperties, MAP: Map, DASHBOARD: LayoutDashboard,
};
const TYPE_LABELS: Record<WorkspaceViewType, AppI18nKey> = {
  TABLE: "viewHeader.table", KANBAN: "viewHeader.kanban", LIST: "viewHeader.list",
  GALLERY: "viewHeader.gallery", CALENDAR: "viewHeader.calendar", TIMELINE: "viewHeader.timeline",
  GANTT: "viewHeader.gantt", CHART: "viewHeader.chart", PIVOT: "viewHeader.pivot",
  MAP: "viewHeader.map", DASHBOARD: "viewHeader.dashboard",
};

// 기능 : 관리항목과 업무목록의 대상·현재 보기·개인 즐겨찾기 변경을 공통 제공합니다.
export function WorkspaceViewHeader({ model }: { readonly model: WorkspaceViewHeaderModel }) {
  const { t } = useAppI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const panelId = useId();
  const favoriteErrorId = useId();
  const viewsQuery = useWorkspaceViews({
    userId: model.userId, workspaceId: model.workspaceId, targetType: model.targetType,
    targetId: model.target?.id ?? null, viewDefinitionId: model.currentView?.viewDefinitionId ?? null,
    enabled: isOpen && !model.isLoading && !model.isError,
  });
  const visibleItems = (viewsQuery.data?.items ?? []).filter(
    item => item.viewName.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
  );

  // 기능 : 보기 메뉴를 닫고 선택을 시작한 버튼으로 초점을 복원합니다.
  const closeMenu = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    // 1. 메뉴 오픈 시 검색 입력에 초점을 두고 바깥 클릭·Escape를 구독한다.
    searchRef.current?.focus();
    const breakpoint = window.matchMedia("(min-width: 1024px)");

    // 기능 : 헤더 밖에서 다른 조작을 시작하면 보기 메뉴를 닫습니다.
    function handleOutsidePointer(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setIsOpen(false);
    }
    // 기능 : Escape로 메뉴를 닫고 버튼에 초점을 돌립니다.
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeMenu();
    }
    // 기능 : 반응형 헤더가 바뀌면 숨겨지는 메뉴를 닫습니다.
    function handleBreakpointChange() {
      setIsOpen(false);
    }
    document.addEventListener("pointerdown", handleOutsidePointer);
    document.addEventListener("keydown", handleEscape);
    breakpoint.addEventListener("change", handleBreakpointChange);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointer);
      document.removeEventListener("keydown", handleEscape);
      breakpoint.removeEventListener("change", handleBreakpointChange);
    };
  }, [isOpen, closeMenu]);

  // 기능 : 목록 요청은 열림 상태에 맡기고 메뉴 검색어를 초기화합니다.
  function handleToggle() {
    // 1. 이전 검색을 비우고 열림 상태로 목록 요청 여부를 결정한다.
    setSearch("");
    setIsOpen(current => !current);
  }

  // 기능 : 서버 목록의 선택을 화면 상태에 반영하고 메뉴를 닫습니다.
  function handleSelect(view: WorkspaceViewListItem) {
    // 1. 선택한 보기의 표시 정보를 공유 모델에 반영하고 메뉴를 닫는다.
    model.onSelect(view);
    closeMenu();
  }

  // 기능 : 검색 입력과 보기 항목 사이에서 방향키로 초점을 이동합니다.
  function handleMenuKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    // 1. 입력의 Home/End 동작은 보존하고 목록 탐색 키만 처리한다.
    const fromInput = event.target instanceof HTMLInputElement;
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    if (fromInput && (event.key === "Home" || event.key === "End")) return;
    const options = Array.from(rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []);
    if (!options.length) return;
    event.preventDefault();
    const index = options.findIndex(option => option === document.activeElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1
      : event.key === "ArrowDown" ? (index + 1) % options.length
      : index <= 0 ? options.length - 1 : index - 1;
    options[next]?.focus();
  }

  // 기능 : 보기 목록의 조회 실패를 같은 대상에서 다시 요청합니다.
  function handleRetryViews() {
    void viewsQuery.refetch();
  }

  // 기능 : 실패 안내를 닫고 보기 선택 버튼으로 초점을 돌려 다음 조작을 이어갑니다.
  function handleDismissFavoriteError() {
    model.onDismissFavoriteError();
    triggerRef.current?.focus();
  }

  if (model.isLoading) {
    return <div aria-label={t("viewHeader.loadingHeader")} className="flex min-w-0 items-center gap-2" role="status">
      <span className="h-4 w-20 animate-pulse rounded bg-[#EEEDE9]" />
      <span className="h-6 w-28 animate-pulse rounded bg-[#EEEDE9]" />
    </div>;
  }
  if (model.isError || !model.target) {
    return <div className="flex min-w-0 items-center gap-2 text-[12px]" role="alert">
      <span className="truncate text-[#787774]">{t(model.isUnavailable ? "viewHeader.unavailable" : "viewHeader.headerError")}</span>
      <button className="shrink-0 rounded px-2 py-1 text-[#326ACD] hover:bg-[#F0EFEC]" onClick={model.onRetry} type="button">{t("viewHeader.retry")}</button>
    </div>;
  }

  const favoriteLabel = !model.currentView ? "viewHeader.noCurrentView"
    : model.isFavorite === null ? "viewHeader.favoriteUnknown"
    : model.isFavorite ? "viewHeader.removeFavorite" : "viewHeader.addFavorite";
  const favoriteErrorLabel = model.favoriteError === "UNAVAILABLE" ? "viewHeader.favoriteUnavailable"
    : model.favoriteError === "UNAUTHORIZED" ? "viewHeader.favoriteUnauthorized" : "viewHeader.favoriteSaveError";

  return <div className="relative flex min-w-0 shrink items-center gap-1.5" data-testid="workspace-view-header" ref={rootRef}>
    <IconValueGlyph className="h-4 w-4 shrink-0 text-[#6B7280]" name={model.target.icon} />
    <h1 className="max-w-[80px] shrink truncate text-[13px] font-semibold text-[#37352F] xl:max-w-[140px]" title={model.target.name}>{model.target.name}</h1>
    <span aria-hidden="true" className="mx-0.5 h-3.5 w-px shrink-0 bg-[#E7E6E2]" />
    <button
      aria-controls={isOpen ? panelId : undefined}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      aria-label={t("viewHeader.selectView")}
      className={cn("inline-flex h-7 min-w-0 max-w-[130px] shrink items-center gap-1.5 rounded px-1.5 text-[12px] font-medium text-[#65645F] hover:bg-[#F0EFEC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4880EE]/50 xl:max-w-[180px]", isOpen && "bg-[#F0EFEC]")}
      onClick={handleToggle}
      ref={triggerRef}
      title={model.currentView?.viewName ?? t("viewHeader.noCurrentView")}
      type="button"
    >
      <ViewGlyph icon={model.currentView?.viewIcon ?? null} type={model.currentView?.viewType ?? null} />
      <span className="truncate">{model.currentView?.viewName ?? t("viewHeader.noCurrentView")}</span>
      <ChevronDown aria-hidden="true" className="h-3 w-3 shrink-0 text-[#A4A39E]" />
    </button>
    <button
      aria-busy={model.isFavoritePending}
      aria-describedby={model.favoriteError && !isOpen ? favoriteErrorId : undefined}
      aria-label={t(favoriteLabel)}
      aria-pressed={model.isFavorite ?? undefined}
      className={cn("inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-[#9B9A97] hover:bg-[#F0EFEC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4880EE]/50 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent", model.isFavorite === true && "text-[#EF4444]")}
      disabled={!model.canToggleFavorite}
      onClick={model.onToggleFavorite}
      title={t(model.isFavoritePending ? "viewHeader.changingFavorite" : favoriteLabel)}
      type="button"
    ><Heart aria-hidden="true" className={cn("h-4 w-4 shrink-0", model.isFavorite === true && "fill-current")} /></button>
    {model.isFavoritePending && <span className="sr-only" role="status">{t("viewHeader.changingFavorite")}</span>}
    {model.favoriteError && !isOpen && <div
      className="absolute left-0 top-[calc(100%+6px)] z-50 flex w-[280px] max-w-[calc(100vw-32px)] items-start gap-2 rounded-lg border border-[#E7E6E2] bg-white p-3 text-[12px] leading-relaxed text-[#65645F] shadow-lg"
      id={favoriteErrorId}
      role="alert"
    >
      <span className="flex-1">{t(favoriteErrorLabel)}</span>
      <button className="shrink-0 rounded px-1 text-[#787774] hover:bg-[#F0EFEC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4880EE]/50" onClick={handleDismissFavoriteError} type="button">{t("common.close")}</button>
    </div>}
    {isOpen && <div
      aria-label={t("viewHeader.selectView")}
      className="absolute left-0 top-[calc(100%+6px)] z-50 w-[300px] max-w-[calc(100vw-24px)] rounded-lg border border-[#E7E6E2] bg-white p-1.5 text-[12px] text-[#37352F] shadow-[0_8px_28px_rgba(15,23,42,0.12)]"
      id={panelId}
      onKeyDown={handleMenuKeyDown}
      role="dialog"
    >
      <label className="m-1 mb-1.5 flex h-8 items-center gap-2 rounded bg-[#F4F3F0] px-2">
        <Search aria-hidden="true" className="h-3.5 w-3.5 text-[#9B9A97]" />
        <input aria-label={t("viewHeader.searchViews")} className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#9B9A97]" onChange={event => setSearch(event.target.value)} placeholder={t("viewHeader.searchViews")} ref={searchRef} value={search} />
      </label>
      {viewsQuery.isPending ? <p className="p-3 text-[#787774]" role="status">{t("viewHeader.loadingViews")}</p>
        : viewsQuery.isError ? <div className="flex items-center justify-between gap-2 p-3" role="alert">
          <span>{t("viewHeader.listError")}</span>
          <button className="shrink-0 rounded px-1 py-1 text-[#326ACD] hover:bg-[#F0EFEC]" onClick={handleRetryViews} type="button">{t("viewHeader.retry")}</button>
        </div>
        : <div aria-busy={viewsQuery.isFetching} aria-label={t("viewHeader.viewList")} className="max-h-60 overflow-y-auto" role="listbox">
          {visibleItems.map(view => <button
            aria-selected={view.isSelected}
            className="flex h-8 w-full items-center gap-2 rounded px-2 text-left hover:bg-[#F3F2EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4880EE]/40"
            data-view-id={view.viewDefinitionId}
            key={view.viewDefinitionId}
            onClick={() => handleSelect(view)}
            role="option"
            type="button"
          >
            <ViewGlyph icon={view.viewIcon} type={view.viewType} />
            <span className="min-w-0 flex-1 truncate">{view.viewName}</span>
            <span className="shrink-0 text-[11px] text-[#A4A39E]">{t(TYPE_LABELS[view.viewType])}</span>
            {view.isSelected && <Check aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />}
          </button>)}
          {!visibleItems.length && <p className="p-3 text-[#9B9A97]">{t(viewsQuery.data?.items.length ? "viewHeader.noViews" : "viewHeader.noSavedViews")}</p>}
        </div>}
    </div>}
  </div>;
}

// 기능 : 저장된 보기 아이콘을 표시하고 아이콘이 없으면 타입에 맞는 기호를 사용합니다.
function ViewGlyph({ icon, type }: { readonly icon: string | null; readonly type: WorkspaceViewType | null }) {
  if (icon) return <IconValueGlyph className="h-3.5 w-3.5 shrink-0 text-[#8E8D87]" name={icon} />;
  const Icon = type ? TYPE_ICONS[type] : Layers;
  return <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[#8E8D87]" />;
}
