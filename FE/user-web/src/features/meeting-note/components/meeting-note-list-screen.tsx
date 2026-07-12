import {
  AlertCircle,
  ArrowUpDown,
  Building2,
  CalendarClock,
  ChevronDown,
  NotebookPen,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useOutletContext,
  useSearchParams,
} from "react-router-dom";
import type { AppShellOutletContext } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { CollapsibleDesktopSearch } from "@/components/ui/collapsible-desktop-search";
import { ListFilterSelect } from "@/components/ui/list-filter-select";
import { Pagination } from "@/components/ui/pagination";
import { ListEmptyState } from "@/components/ui/state";
import { Toast } from "@/components/ui/toast";
import { useAuthSession } from "@/features/auth";
import { MeetingNoteCreateDialog } from "@/features/meeting-note/components/meeting-note-create-dialog";
import {
  useMeetingNoteFilterCompanies,
  useMeetingNoteFilterContacts,
  useMeetingNoteList,
} from "@/features/meeting-note/hooks/use-meeting-note-queries";
import type { MeetingNoteCreateFormValues } from "@/features/meeting-note/schemas/meeting-note-schema";
import type {
  MeetingNoteListItem,
  MeetingNoteListParams,
  MeetingNoteSort,
} from "@/features/meeting-note/types/meeting-note";
import { getApiErrorMessage } from "@/lib/api-client";
import { cn } from "@/utils/cn";
import { formatDateWithOptions } from "@/utils/format";
import { readLocationNotice } from "@/utils/location-state";

const MEETING_NOTE_TABLE_GRID_STYLE = {
  gridTemplateColumns:
    "minmax(0,0.82fr) minmax(0,1.45fr) minmax(0,0.88fr) minmax(0,0.88fr) minmax(0,0.82fr)",
};
const MEETING_NOTE_CREATE_PANEL_STORAGE_KEY =
  "onehand.meetingNote.createPanelWidth";
const MEETING_NOTE_CREATE_PANEL_DEFAULT_WIDTH = 520;
const MEETING_NOTE_CREATE_PANEL_MIN_WIDTH = 420;
const MEETING_NOTE_CREATE_PANEL_MAX_RATIO = 0.55;
const MEETING_NOTE_CREATE_PANEL_AUTO_SIDEBAR_RATIO = 0.45;
const MEETING_NOTE_CREATE_PANEL_TRANSITION_MS = 500;
const DESKTOP_SEARCH_COMPACT_MAX_WIDTH = 170;
const DESKTOP_FILTER_COLLAPSED_WIDTH = 72;
const DESKTOP_FILTER_EXPANDED_WIDTH =
  "calc(clamp(136px,14vw,178px) + clamp(136px,14vw,178px) + 0.5rem)";

const MEETING_NOTE_SORT_OPTIONS = [
  { value: "createdAtDesc", label: "최신순" },
  { value: "meetingAtDesc", label: "미팅일순" },
] satisfies readonly { readonly value: MeetingNoteSort; readonly label: string }[];

// 기능 : 회의록 목록과 필터 화면을 렌더링합니다.
export function MeetingNoteListScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const outletContext =
    useOutletContext<AppShellOutletContext | undefined>();
  const { user } = useAuthSession();
  const isDockedViewport = useMediaQuery("(min-width: 1024px)");
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [searchResetSignal, setSearchResetSignal] = useState(0);
  const [companyIds, setCompanyIds] = useState<string[]>([]);
  const [contactIds, setContactIds] = useState<string[]>([]);
  const [sort, setSort] = useState<MeetingNoteSort>("createdAtDesc");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDockedCreateRendered, setIsDockedCreateRendered] = useState(false);
  const [createPanelWidth, setCreatePanelWidth] = useState(
    getStoredMeetingNoteCreatePanelWidth,
  );
  const [isCreatePanelResizing, setIsCreatePanelResizing] = useState(false);
  const [isCompactFilterOpen, setIsCompactFilterOpen] = useState(false);
  const [compactFilterPosition, setCompactFilterPosition] =
    useState<MeetingNoteFilterPopoverPosition | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const compactFilterButtonRef = useRef<HTMLButtonElement>(null);
  const compactFilterPopoverRef = useRef<HTMLDivElement>(null);
  const setAutoSidebarCollapsed = outletContext?.setAutoSidebarCollapsed;

  const params = useMemo<MeetingNoteListParams>(
    () => ({
      companyIds,
      contactIds,
      page,
      ...(search ? { search } : {}),
      sort,
    }),
    [companyIds, contactIds, page, search, sort],
  );

  const meetingNotesQuery = useMeetingNoteList(params);
  const companiesQuery = useMeetingNoteFilterCompanies();
  const contactsQuery = useMeetingNoteFilterContacts();
  const meetingNotes = useMemo(
    () => meetingNotesQuery.data?.items ?? [],
    [meetingNotesQuery.data?.items],
  );
  const companyOptions = useMemo(
    () => companiesQuery.data?.items ?? [],
    [companiesQuery.data?.items],
  );
  const filteredContactOptions = useMemo(() => {
    const contactOptions = contactsQuery.data?.items ?? [];

    return companyIds.length > 0
      ? contactOptions.filter((contact) =>
          contact.companyId ? companyIds.includes(contact.companyId) : false,
        )
      : contactOptions;
  }, [companyIds, contactsQuery.data?.items]);
  const validContactIdSet = useMemo(
    () => new Set(filteredContactOptions.map((contact) => contact.id)),
    [filteredContactOptions],
  );
  const hasFilter = Boolean(
    search ||
      companyIds.length > 0 ||
      contactIds.length > 0 ||
      sort !== "createdAtDesc",
  );
  const displayTimeZone = user?.timeZone ?? getBrowserTimeZoneFallback();
  const isDockedCreateOpen = isCreateOpen && isDockedViewport;
  const isDockedCreateMounted = isDockedCreateOpen || isDockedCreateRendered;
  const isCompactFilterMode = isDockedCreateOpen;
  const hasEntityFilters = companyIds.length > 0 || contactIds.length > 0;
  const entityFilterCount = companyIds.length + contactIds.length;

  useEffect(() => {
    if (contactIds.length === 0) {
      return;
    }

    const nextContactIds = contactIds.filter((contactId) =>
      validContactIdSet.has(contactId),
    );

    if (nextContactIds.length !== contactIds.length) {
      setContactIds(nextContactIds);
      setPage(1);
    }
  }, [contactIds, validContactIdSet]);

  useEffect(() => {
    const message = readLocationNotice(location.state);
    if (!message) {
      return;
    }

    setNotice(message);
    void navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (searchParams.get("create") !== "1") {
      return;
    }

    setCreatePanelWidth(MEETING_NOTE_CREATE_PANEL_MIN_WIDTH);
    setIsCreateOpen(true);

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete("create");
    setSearchParams(nextSearchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (isDockedCreateOpen) {
      setIsDockedCreateRendered(true);
      return;
    }

    const timerId = window.setTimeout(() => {
      setIsDockedCreateRendered(false);
    }, MEETING_NOTE_CREATE_PANEL_TRANSITION_MS);

    return () => window.clearTimeout(timerId);
  }, [isDockedCreateOpen]);

  useEffect(() => {
    if (!isCompactFilterMode) {
      setIsCompactFilterOpen(false);
    }
  }, [isCompactFilterMode]);

  useEffect(() => {
    if (!isCompactFilterOpen) {
      return;
    }

    const updateCompactFilterPosition = () => {
      if (!compactFilterButtonRef.current) {
        return;
      }

      setCompactFilterPosition(
        getCompactMeetingNoteFilterPopoverPosition(
          compactFilterButtonRef.current,
        ),
      );
    };
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        compactFilterButtonRef.current?.contains(target) ||
        compactFilterPopoverRef.current?.contains(target)
      ) {
        return;
      }

      setIsCompactFilterOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCompactFilterOpen(false);
        compactFilterButtonRef.current?.focus();
      }
    };

    updateCompactFilterPosition();
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", updateCompactFilterPosition);
    window.addEventListener("scroll", updateCompactFilterPosition, true);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", updateCompactFilterPosition);
      window.removeEventListener("scroll", updateCompactFilterPosition, true);
    };
  }, [isCompactFilterOpen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      MEETING_NOTE_CREATE_PANEL_STORAGE_KEY,
      String(createPanelWidth),
    );
  }, [createPanelWidth]);

  useEffect(() => {
    const clampToViewport = () => {
      setCreatePanelWidth((currentWidth) =>
        clampMeetingNoteCreatePanelWidth(currentWidth, window.innerWidth),
      );
    };

    clampToViewport();
    window.addEventListener("resize", clampToViewport);

    return () => {
      window.removeEventListener("resize", clampToViewport);
    };
  }, []);

  useEffect(() => {
    if (!setAutoSidebarCollapsed) {
      return;
    }

    return () => {
      setAutoSidebarCollapsed(false);
    };
  }, [setAutoSidebarCollapsed]);

  useEffect(() => {
    if (!setAutoSidebarCollapsed) {
      return;
    }

    const syncAutoSidebar = () => {
      const viewportWidth =
        typeof window === "undefined" ? 0 : window.innerWidth;
      const shouldCollapse =
        isDockedCreateMounted &&
        viewportWidth > 0 &&
        createPanelWidth / viewportWidth >
          MEETING_NOTE_CREATE_PANEL_AUTO_SIDEBAR_RATIO;

      setAutoSidebarCollapsed(shouldCollapse);
    };

    syncAutoSidebar();
    window.addEventListener("resize", syncAutoSidebar);

    return () => {
      window.removeEventListener("resize", syncAutoSidebar);
    };
  }, [createPanelWidth, isDockedCreateMounted, setAutoSidebarCollapsed]);

  useEffect(() => {
    if (!isCreatePanelResizing) {
      return;
    }

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    const onMouseMove = (event: MouseEvent) => {
      setCreatePanelWidth(
        clampMeetingNoteCreatePanelWidth(
          window.innerWidth - event.clientX,
          window.innerWidth,
        ),
      );
    };
    const onMouseUp = () => setIsCreatePanelResizing(false);

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isCreatePanelResizing]);

  const applySearch = (nextSearch: string) => {
    setSearch(nextSearch);
    setPage(1);
  };

  const onSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applySearch(searchText.trim());
  };

  const updateCompanyIds = (ids: string[]) => {
    setCompanyIds(ids);
    setPage(1);
  };

  const updateContactIds = (ids: string[]) => {
    setContactIds(ids);
    setPage(1);
  };

  const updateSort = (value: MeetingNoteSort) => {
    setSort(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchText("");
    setSearch("");
    setSearchResetSignal((signal) => signal + 1);
    setCompanyIds([]);
    setContactIds([]);
    setSort("createdAtDesc");
    setPage(1);
  };

  const onCreateOpenChange = (open: boolean) => {
    setIsCreateOpen(open);
  };

  const openCreatePanel = () => {
    setCreatePanelWidth(MEETING_NOTE_CREATE_PANEL_MIN_WIDTH);
    setIsCreateOpen(true);
  };

  const onCreateExpand = (values: MeetingNoteCreateFormValues) => {
    void navigate("/app/meeting-notes/new/full", {
      state: { meetingNoteCreateDraft: values },
    });
  };

  const onMeetingNoteCreated = () => {
    setNotice("회의록을 추가했어요.");
    setPage(1);
    void meetingNotesQuery.refetch();
  };

  return (
    <section
      className="flex min-h-full flex-col bg-white transition-[padding-right] duration-[500ms] ease-out"
      style={
        isDockedCreateMounted
          ? { paddingRight: isDockedCreateOpen ? createPanelWidth : 0 }
          : undefined
      }
    >
      <PageHeader
        breadcrumbs={[{ label: "회의록", icon: NotebookPen }]}
        actions={[
          {
            icon: Plus,
            tooltip: "회의록 생성",
            onClick: openCreatePanel,
            hidden: isDockedCreateMounted,
            variant: "primary",
          },
        ]}
      />

      <div className="hidden min-h-10 shrink-0 items-center px-5 py-1 md:flex">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto [scrollbar-width:none] lg:gap-2 [&::-webkit-scrollbar]:hidden">
          <CollapsibleDesktopSearch
            appliedValue={search}
            maxExpandedWidth={
              isCompactFilterMode ? DESKTOP_SEARCH_COMPACT_MAX_WIDTH : undefined
            }
            placeholder="회의록명을 검색하세요!"
            resetSignal={searchResetSignal}
            submitLabel="회의록 검색 실행"
            value={searchText}
            onSubmit={applySearch}
            onValueChange={setSearchText}
          />
          <FilterChip
            active={hasFilter}
            icon={RotateCcw}
            label="초기화"
            onClick={clearFilters}
          />
          <div
            className="relative flex h-8 shrink-0 items-center overflow-hidden transition-[width] duration-500 ease-out"
            style={{
              width: isCompactFilterMode
                ? DESKTOP_FILTER_COLLAPSED_WIDTH
                : DESKTOP_FILTER_EXPANDED_WIDTH,
            }}
          >
            <button
              ref={compactFilterButtonRef}
              aria-expanded={isCompactFilterOpen}
              aria-label="필터"
              aria-hidden={!isCompactFilterMode}
              className={cn(
                "absolute left-0 top-0 inline-flex h-8 w-[72px] shrink-0 items-center justify-center gap-1.5 rounded-md border-0 bg-transparent px-2 text-[13px] font-semibold transition-[opacity,transform,background-color,color] duration-150 focus:outline-none active:scale-[0.97]",
                hasEntityFilters
                  ? "text-[#1D4ED8] hover:bg-[#EFF6FF]"
                  : "text-[#5F6368] hover:bg-[#F3F4F6]",
                isCompactFilterMode
                  ? "scale-100 opacity-100"
                  : "!hidden pointer-events-none scale-95 opacity-0",
              )}
              onClick={() => setIsCompactFilterOpen((open) => !open)}
              tabIndex={isCompactFilterMode ? 0 : -1}
              type="button"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>필터</span>
              {hasEntityFilters ? (
                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#4880EE] px-1 text-[10px] font-bold leading-none text-white">
                  {entityFilterCount}
                </span>
              ) : null}
            </button>
            <div
              aria-hidden={isCompactFilterMode}
              inert={isCompactFilterMode ? true : undefined}
              className={cn(
                "flex shrink-0 items-center gap-1.5 transition-opacity duration-300 ease-out lg:gap-2",
                isCompactFilterMode
                  ? "!hidden pointer-events-none opacity-0"
                  : "opacity-100",
              )}
            >
              <MeetingNoteFilterMultiSelect
                emptyText="조건을 바꾸면 회사를 찾을 수 있어요."
                getLabel={(company) => company.companyName}
                icon={Building2}
                itemKindLabel="회사"
                items={companyOptions}
                selectedIds={companyIds}
                onSelectedIdsChange={updateCompanyIds}
              />
              <MeetingNoteFilterMultiSelect
                emptyText="조건을 바꾸면 담당자를 찾을 수 있어요."
                getLabel={(contact) => contact.contactUsername}
                icon={UserRound}
                itemKindLabel="담당자"
                items={filteredContactOptions}
                selectedIds={contactIds}
                onSelectedIdsChange={updateContactIds}
              />
            </div>
          </div>
          <ListFilterSelect<MeetingNoteSort>
            active={sort !== "createdAtDesc"}
            ariaLabel="정렬 조건"
            icon={ArrowUpDown}
            className={
              isCompactFilterMode
                ? "w-[104px]"
                : "w-[clamp(136px,14vw,178px)]"
            }
            onChange={updateSort}
            options={MEETING_NOTE_SORT_OPTIONS}
            value={sort}
          />
        </div>
        <span className="ml-2 shrink-0 text-[12px] text-[#9CA3AF]">
          {meetingNotesQuery.data?.totalCount ?? 0}개
        </span>
      </div>

      {isCompactFilterMode && isCompactFilterOpen ? (
        <div
          ref={compactFilterPopoverRef}
          className={cn(
            "fixed z-50 rounded-lg border border-[#E6EAF0] bg-white p-3 shadow-lg",
            !compactFilterPosition && "invisible",
          )}
          style={{
            left: compactFilterPosition?.left ?? 0,
            top: compactFilterPosition?.top ?? 0,
            width: compactFilterPosition?.width ?? 320,
          }}
        >
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <p className="text-[12px] font-semibold text-[#64748B]">회사</p>
              <MeetingNoteFilterMultiSelect
                emptyText="조건을 바꾸면 회사를 찾을 수 있어요."
                getLabel={(company) => company.companyName}
                icon={Building2}
                itemKindLabel="회사"
                items={companyOptions}
                layout="full"
                selectedIds={companyIds}
                onSelectedIdsChange={updateCompanyIds}
              />
            </div>
            <div className="grid gap-1.5">
              <p className="text-[12px] font-semibold text-[#64748B]">
                담당자
              </p>
              <MeetingNoteFilterMultiSelect
                emptyText="조건을 바꾸면 담당자를 찾을 수 있어요."
                getLabel={(contact) => contact.contactUsername}
                icon={UserRound}
                itemKindLabel="담당자"
                items={filteredContactOptions}
                layout="full"
                selectedIds={contactIds}
                onSelectedIdsChange={updateContactIds}
              />
            </div>
          </div>
        </div>
      ) : null}

      {notice ? (
        <div className="hidden px-5 pt-2 md:block">
          <Toast
            message={notice}
            onClose={() => setNotice(null)}
            variant="success"
          />
        </div>
      ) : null}

      <div
        className={cn(
          "hidden min-w-0 overflow-hidden px-5 pb-3 pt-1 md:flex",
          isCreatePanelResizing && "cursor-col-resize select-none",
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex w-full min-w-0 flex-col overflow-hidden rounded-lg border border-[#E2E5EC] bg-white shadow-sm">
            <div
              className="grid h-11 shrink-0 items-center border-b border-[#E2E5EC] bg-[#F9FAFB] px-3 md:px-4 xl:px-6"
              style={MEETING_NOTE_TABLE_GRID_STYLE}
            >
              <span className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                미팅날짜
              </span>
              <span className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                제목
              </span>
              <span className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                회사
              </span>
              <span className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                담당자
              </span>
              <span className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                등록일
              </span>
            </div>

            {meetingNotesQuery.isLoading ? (
              <MeetingNoteListSkeleton />
            ) : meetingNotesQuery.isError ? (
              <MeetingNoteListError
                error={meetingNotesQuery.error}
                onRetry={() => void meetingNotesQuery.refetch()}
              />
            ) : meetingNotes.length === 0 ? (
              <ListEmptyState
                actionIcon={Plus}
                actionLabel="회의록 생성"
                icon={NotebookPen}
                onAction={openCreatePanel}
                title={
                  hasFilter
                    ? "조건을 바꾸면 회의록을 찾을 수 있어요"
                    : "데이터가 존재하지 않아요"
                }
              />
            ) : (
              <div className="min-w-0">
                {meetingNotes.map((meetingNote) => (
                  <MeetingNoteListRow
                    displayTimeZone={displayTimeZone}
                    key={meetingNote.id}
                    meetingNote={meetingNote}
                  />
                ))}
              </div>
            )}
          </div>

          {meetingNotesQuery.data ? (
            <Pagination
              page={page}
              totalPages={meetingNotesQuery.data.totalPages}
              onPageChange={setPage}
            />
          ) : null}
        </div>

        {isDockedCreateMounted ? (
          <MeetingNoteCreateDialog
            mode="docked"
            onCreated={onMeetingNoteCreated}
            onExpand={onCreateExpand}
            onOpenChange={onCreateOpenChange}
            onResizeStart={() => setIsCreatePanelResizing(true)}
            open={isDockedCreateOpen}
            width={createPanelWidth}
          />
        ) : null}
      </div>

      <section className="flex min-h-0 flex-1 flex-col md:hidden">
        {notice ? (
          <div className="px-4 pt-2">
            <Toast
              message={notice}
              onClose={() => setNotice(null)}
              variant="success"
            />
          </div>
        ) : null}

        <form
          className="flex h-11 shrink-0 items-center gap-2 border-b border-[#E5E7EB] bg-white px-4"
          onSubmit={onSearchSubmit}
        >
          <Search className="h-4 w-4 shrink-0 text-[#9CA3AF]" />
          <input
            className="min-w-0 flex-1 bg-transparent text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="회의 관련 검색"
            value={searchText}
          />
        </form>

        <div className="flex h-10 shrink-0 items-center gap-2 overflow-x-auto border-b border-[#E5E7EB] px-4">
          <button
            aria-label="초기화"
            aria-pressed={hasFilter}
            className={cn(
              "inline-flex h-7 shrink-0 items-center justify-center gap-1 rounded-md border-0 bg-transparent px-2 text-[12px] font-semibold transition-[background-color,color,transform] duration-150 focus:outline-none active:scale-[0.97]",
              hasFilter
                ? "text-[#1D4ED8] hover:bg-[#EFF6FF]"
                : "text-[#5F6368] hover:bg-[#F3F4F6]",
            )}
            onClick={clearFilters}
            type="button"
          >
            <RotateCcw className="h-3 w-3" />
            <span>초기화</span>
          </button>
          <MeetingNoteFilterMultiSelect
            className="w-[112px]"
            emptyText="조건을 바꾸면 회사를 찾을 수 있어요."
            getLabel={(company) => company.companyName}
            icon={Building2}
            itemKindLabel="회사"
            items={companyOptions}
            selectedIds={companyIds}
            onSelectedIdsChange={updateCompanyIds}
          />
          <MeetingNoteFilterMultiSelect
            className="w-[112px]"
            emptyText="조건을 바꾸면 담당자를 찾을 수 있어요."
            getLabel={(contact) => contact.contactUsername}
            icon={UserRound}
            itemKindLabel="담당자"
            items={filteredContactOptions}
            selectedIds={contactIds}
            onSelectedIdsChange={updateContactIds}
          />
          <ListFilterSelect<MeetingNoteSort>
            active={sort !== "createdAtDesc"}
            ariaLabel="정렬 조건"
            icon={ArrowUpDown}
            className="w-[112px]"
            onChange={updateSort}
            options={MEETING_NOTE_SORT_OPTIONS}
            value={sort}
          />
          <div className="flex-1" />
          <span className="shrink-0 text-[11px] text-[#9CA3AF]">
            {meetingNotesQuery.data?.totalCount ?? 0}개
          </span>
        </div>

        <div className="bg-white">
          {meetingNotesQuery.isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 8 }, (_, index) => (
                <div
                  className="h-[80px] animate-pulse border-b border-[#E5E7EB] bg-[#F9FAFB]"
                  key={index}
                />
              ))}
            </div>
          ) : meetingNotesQuery.isError ? (
            <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
              <p className="text-[13px] text-red-500">
                {getApiErrorMessage(meetingNotesQuery.error)}
              </p>
              <button
                className="mt-3 inline-flex h-8 items-center rounded-md border border-[#E2E5EC] bg-white px-3 text-[12px] text-[#6B7280]"
                onClick={() => void meetingNotesQuery.refetch()}
                type="button"
              >
                다시 시도
              </button>
            </div>
          ) : meetingNotes.length === 0 ? (
            <ListEmptyState
              actionIcon={Plus}
              actionLabel="회의록 생성"
              icon={NotebookPen}
              onAction={openCreatePanel}
              title={
                hasFilter
                  ? "조건을 바꾸면 회의록을 찾을 수 있어요"
                  : "데이터가 존재하지 않아요"
              }
            />
          ) : (
            meetingNotes.map((meetingNote) => (
              <MeetingNoteMobileCard
                displayTimeZone={displayTimeZone}
                key={meetingNote.id}
                meetingNote={meetingNote}
              />
            ))
          )}
        </div>

        {meetingNotesQuery.data ? (
          <div className="shrink-0 border-t border-[#E5E7EB] bg-white px-4 py-2">
            <Pagination
              page={page}
              totalPages={meetingNotesQuery.data.totalPages}
              onPageChange={setPage}
            />
          </div>
        ) : null}

        <button
          aria-label="회의록 생성"
          className="fixed bottom-24 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-[#4880EE] shadow-[0_4px_16px_rgba(59,130,246,0.27)] transition active:opacity-80"
          onClick={openCreatePanel}
          type="button"
        >
          <Plus className="h-4 w-4 text-white" strokeWidth={2.5} />
        </button>
      </section>

      <div className="lg:hidden">
        <MeetingNoteCreateDialog
          mode="overlay"
          onCreated={onMeetingNoteCreated}
          onExpand={onCreateExpand}
          onOpenChange={onCreateOpenChange}
          open={isCreateOpen && !isDockedViewport}
        />
      </div>
    </section>
  );
}

// 기능 : 목록 필터 초기화 버튼을 렌더링합니다.
function FilterChip({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  readonly active: boolean;
  readonly icon?: LucideIcon;
  readonly label: string;
  readonly onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md border-0 bg-transparent px-2 text-[13px] font-semibold transition-[background-color,color,transform] duration-150 focus:outline-none active:scale-[0.97]",
        active
          ? "text-[#1D4ED8] hover:bg-[#EFF6FF]"
          : "text-[#5F6368] hover:bg-[#F3F4F6]",
      )}
      onClick={onClick}
      type="button"
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      <span>{label}</span>
    </button>
  );
}

type MeetingNoteFilterPopoverPosition = {
  readonly left: number;
  readonly top: number;
  readonly width: number;
};

type MeetingNoteFilterItem = {
  readonly id: string;
};

// 기능 : 회의록 목록에서 회사/담당자를 여러 개 선택할 수 있는 검색형 필터입니다.
function MeetingNoteFilterMultiSelect<TItem extends MeetingNoteFilterItem>({
  className,
  emptyText,
  getLabel,
  icon: Icon,
  itemKindLabel,
  items,
  layout = "compact",
  selectedIds,
  onSelectedIdsChange,
}: {
  readonly className?: string;
  readonly emptyText: string;
  readonly getLabel: (item: TItem) => string;
  readonly icon: LucideIcon;
  readonly itemKindLabel: string;
  readonly items: readonly TItem[];
  readonly layout?: "compact" | "full";
  readonly selectedIds: readonly string[];
  readonly onSelectedIdsChange: (ids: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [popoverPosition, setPopoverPosition] =
    useState<MeetingNoteFilterPopoverPosition | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedItems = useMemo(
    () => items.filter((item) => selectedIdSet.has(item.id)),
    [items, selectedIdSet],
  );
  const selectedSummary = getSelectedMeetingNoteFilterSummary(
    selectedItems,
    getLabel,
    itemKindLabel,
  );
  const normalizedFilterText = normalizeMeetingNoteFilterText(filterText.trim());
  const filteredItems =
    normalizedFilterText.length > 0
      ? items.filter((item) =>
          normalizeMeetingNoteFilterText(getLabel(item)).includes(
            normalizedFilterText,
          ),
        )
      : items;
  const inputValue = isOpen ? filterText : selectedSummary;

  useEffect(() => {
    if (!isOpen) {
      setFilterText("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const updatePopoverPosition = () => {
      if (!inputRef.current) {
        return;
      }

      setPopoverPosition(
        getMeetingNoteFilterPopoverPosition(inputRef.current),
      );
    };
    const onMouseDown = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setFilterText("");
      }
    };

    updatePopoverPosition();
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("resize", updatePopoverPosition);
    window.addEventListener("scroll", updatePopoverPosition, true);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("resize", updatePopoverPosition);
      window.removeEventListener("scroll", updatePopoverPosition, true);
    };
  }, [isOpen]);

  const openOptions = (nextFilterText: string) => {
    setFilterText(nextFilterText);

    if (inputRef.current) {
      setPopoverPosition(
        getMeetingNoteFilterPopoverPosition(inputRef.current),
      );
    }

    setIsOpen(true);
  };

  const toggleItem = (item: TItem) => {
    const nextIds = selectedIdSet.has(item.id)
      ? selectedIds.filter((id) => id !== item.id)
      : [...selectedIds, item.id];

    setFilterText("");
    onSelectedIdsChange(nextIds);
  };

  const clearSelection = () => {
    setFilterText("");
    onSelectedIdsChange([]);
    inputRef.current?.focus();
    openOptions("");
  };

  return (
    <div
      className={cn(
        "relative shrink-0",
        layout === "full" ? "w-full" : "w-[clamp(136px,14vw,178px)]",
        className,
      )}
      ref={wrapperRef}
    >
      <div className="relative">
        {isOpen ? (
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3 w-3 shrink-0 -translate-y-1/2 text-[#6B7280]" />
        ) : (
          <Icon
            className={cn(
              "pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 shrink-0 -translate-y-1/2",
              selectedIds.length > 0 ? "text-[#1D4ED8]" : "text-[#5F6368]",
            )}
          />
        )}
        <input
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-label={`${itemKindLabel} 필터`}
          autoComplete="off"
          className={cn(
            "h-8 w-full min-w-0 rounded-md border-0 bg-transparent text-[13px] outline-none transition-[background-color,color,transform,opacity] duration-150",
            isOpen
              ? "bg-[#F3F4F6] pl-8 pr-7 text-[#111827]"
              : selectedIds.length > 0
                ? "bg-transparent pl-8 pr-7 font-semibold text-[#1D4ED8] hover:bg-[#EFF6FF]"
                : "cursor-pointer pl-8 pr-7 text-[#5F6368] hover:bg-[#F3F4F6]",
          )}
          onChange={(event) => openOptions(event.target.value)}
          onFocus={() => openOptions("")}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsOpen(false);
              setFilterText("");
              inputRef.current?.blur();
              return;
            }

            if (event.key === "Enter") {
              const firstItem = filteredItems[0];
              if (!firstItem) {
                return;
              }

              event.preventDefault();
              toggleItem(firstItem);
            }
          }}
          placeholder={`${itemKindLabel} 선택`}
          ref={inputRef}
          value={inputValue}
        />
        {selectedIds.length > 0 || filterText ? (
          <button
            aria-label={`${itemKindLabel} 필터 지우기`}
            className="absolute right-1 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-[#9CA3AF] transition hover:bg-[#E5E7EB] hover:text-[#374151]"
            onClick={clearSelection}
            type="button"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <ChevronDown
            className={cn(
              "pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF] transition-transform",
              isOpen && "rotate-180",
            )}
          />
        )}
      </div>

      {isOpen ? (
        <div
          className={cn(
            "fixed z-50 overflow-hidden rounded-md border border-[#E6EAF0] bg-white shadow-lg",
            !popoverPosition && "invisible",
          )}
          style={{
            left: popoverPosition?.left ?? 0,
            top: popoverPosition?.top ?? 0,
            width: popoverPosition?.width ?? 256,
          }}
        >
          <button
            className={cn(
              "flex h-9 w-full items-center gap-1.5 px-3 text-left text-[13px] transition hover:bg-[#F9FAFB]",
              selectedIds.length === 0
                ? "font-semibold text-[#1D4ED8]"
                : "font-medium text-[#475569]",
            )}
            onClick={() => {
              setFilterText("");
              setIsOpen(false);
              onSelectedIdsChange([]);
            }}
            type="button"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {itemKindLabel} 초기화
          </button>

          <div className="max-h-[184px] overflow-y-auto border-y border-[#E6EAF0] py-1">
            {filteredItems.length === 0 ? (
              <p className="px-3 py-3 text-[12px] text-[#9CA3AF]">
                {emptyText}
              </p>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedIdSet.has(item.id);

                return (
                  <button
                    className={cn(
                      "flex h-8 w-full min-w-0 items-center gap-2 px-3 text-left text-[13px] transition hover:bg-[#F9FAFB]",
                      isSelected && "bg-[#EFF6FF] font-semibold text-[#1D4ED8]",
                    )}
                    key={item.id}
                    onClick={() => toggleItem(item)}
                    type="button"
                  >
                    <span
                      className={cn(
                        "grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border",
                        isSelected ? "border-[#E2E5EC]" : "border-[#CBD5E1]",
                      )}
                    >
                      {isSelected ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#4880EE]" />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {getLabel(item)}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getMeetingNoteFilterPopoverPosition(
  input: HTMLInputElement,
): MeetingNoteFilterPopoverPosition {
  const rect = input.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const margin = 16;
  const width = 256;
  const maxLeft = Math.max(margin, viewportWidth - width - margin);
  const left = Math.min(Math.max(rect.left, margin), maxLeft);

  return {
    left,
    top: rect.bottom + 4,
    width,
  };
}

function getCompactMeetingNoteFilterPopoverPosition(
  trigger: HTMLButtonElement,
): MeetingNoteFilterPopoverPosition {
  const rect = trigger.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const margin = 16;
  const width = Math.min(320, Math.max(280, viewportWidth - margin * 2));
  const maxLeft = Math.max(margin, viewportWidth - width - margin);
  const left = Math.min(Math.max(rect.left, margin), maxLeft);

  return {
    left,
    top: rect.bottom + 6,
    width,
  };
}

function getSelectedMeetingNoteFilterSummary<TItem extends MeetingNoteFilterItem>(
  selectedItems: readonly TItem[],
  getLabel: (item: TItem) => string,
  itemKindLabel: string,
) {
  if (selectedItems.length === 0) {
    return "";
  }

  if (selectedItems.length === 1) {
    const selectedItem = selectedItems[0];
    return selectedItem ? getLabel(selectedItem) : "";
  }

  return `${itemKindLabel} ${selectedItems.length}개`;
}

function normalizeMeetingNoteFilterText(value: string) {
  return value.trim().toLocaleLowerCase("ko-KR");
}

// 기능 : 모바일 회의록 목록 카드를 렌더링합니다.
function MeetingNoteMobileCard({
  displayTimeZone,
  meetingNote,
}: {
  readonly displayTimeZone: string;
  readonly meetingNote: MeetingNoteListItem;
}) {
  const meetingDateLabel = formatMeetingNoteListDate(
    meetingNote.meetingAt,
    displayTimeZone,
    true,
  );
  const createdAtLabel = formatMeetingNoteListDate(
    meetingNote.createdAt,
    displayTimeZone,
  );
  const relationLabel =
    [meetingNote.companies.label, meetingNote.contacts.label]
      .filter(Boolean)
      .join(" · ") || "-";
  const relationCount = Math.max(
    meetingNote.companies.count,
    meetingNote.contacts.count,
  );

  return (
    <Link
      className="flex w-full items-start gap-3 border-b border-[#E5E7EB] bg-white px-4 py-[14px] transition active:bg-[#F9FAFB]"
      to={`/app/meeting-notes/${meetingNote.id}`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF7ED]">
        <CalendarClock className="h-4 w-4 text-[#EA580C]" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-0.5 truncate text-[12px] font-medium text-[#6B7280]">
          {meetingDateLabel}
        </p>
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="min-w-0 truncate text-[14px] font-semibold text-[#111827]">
            {meetingNote.title}
          </span>
          {relationCount > 1 ? (
            <span className="inline-flex h-5 shrink-0 items-center rounded-full bg-[#F1F5F9] px-2 text-[11px] font-medium text-[#475569]">
              외 {relationCount - 1}
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 truncate text-[11px] text-[#9CA3AF]">
          {relationLabel}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-[#9CA3AF]">
          등록일 {createdAtLabel}
        </p>
      </div>
    </Link>
  );
}

// 기능 : 회의록 목록 row를 클릭 가능한 상세 이동 항목으로 렌더링합니다.
function MeetingNoteListRow({
  displayTimeZone,
  meetingNote,
}: {
  readonly displayTimeZone: string;
  readonly meetingNote: MeetingNoteListItem;
}) {
  const navigate = useNavigate();
  const detailPath = `/app/meeting-notes/${meetingNote.id}`;

  return (
    <div
      className={cn(
        "grid h-[66px] w-full cursor-pointer items-center border-b border-[#E2E5EC] bg-white px-3 text-left transition-colors last:border-b-0 hover:bg-blue-50/60 md:px-4 xl:px-6",
      )}
      onClick={() => void navigate(detailPath)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          void navigate(detailPath);
        }
      }}
      role="button"
      style={MEETING_NOTE_TABLE_GRID_STYLE}
      tabIndex={0}
    >
      <DateCell
        includeTime
        value={meetingNote.meetingAt}
        timeZone={displayTimeZone}
      />
      <TitleCell title={meetingNote.title} />
      <SummaryCell summary={meetingNote.companies} />
      <SummaryCell summary={meetingNote.contacts} />
      <DateCell value={meetingNote.createdAt} timeZone={displayTimeZone} />
    </div>
  );
}

function TitleCell({ title }: { readonly title: string }) {
  return (
    <span className="min-w-0 pr-3">
      <span className="block truncate text-[13px] font-semibold text-[#111827]">
        {title}
      </span>
    </span>
  );
}

function DateCell({
  includeTime = false,
  timeZone,
  value,
}: {
  readonly includeTime?: boolean;
  readonly timeZone: string;
  readonly value: string | null;
}) {
  const dateLabel = formatMeetingNoteListDate(value, timeZone, includeTime);

  return (
    <span
      className="min-w-0 truncate pr-3 text-[12px] font-medium text-[#64748B]"
      title={dateLabel}
    >
      {dateLabel}
    </span>
  );
}

// 기능 : 목록 summary label을 표시합니다.
function SummaryCell({
  summary,
}: {
  readonly summary: { readonly label: string };
}) {
  return (
    <span className="min-w-0 pr-3">
      <span className="block truncate text-[13px] font-medium text-[#111827]">
        {summary.label || "-"}
      </span>
    </span>
  );
}

// 기능 : 회의록 목록 error 상태를 렌더링합니다.
function MeetingNoteListError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="flex items-center gap-2 text-[13px] text-red-600">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>{getApiErrorMessage(error)}</span>
      </div>
      <button
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E5EC] bg-white px-3 text-[12px] font-medium text-[#374151] hover:bg-[#F5F6F8]"
        onClick={onRetry}
        type="button"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        다시 시도
      </button>
    </div>
  );
}

// 기능 : 회의록 목록 loading skeleton을 렌더링합니다.
function MeetingNoteListSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }, (_, rowIndex) => (
        <div
          className="grid h-[66px] items-center border-b border-[#E2E5EC] px-3 last:border-b-0 md:px-4 xl:px-6"
          key={rowIndex}
          style={MEETING_NOTE_TABLE_GRID_STYLE}
        >
          {Array.from({ length: 5 }, (_, cellIndex) => (
            <div className="min-w-0 pr-3" key={cellIndex}>
              <div className="h-4 w-20 animate-pulse rounded bg-[#F3F4F6]" />
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

function formatMeetingNoteListDate(
  value: string | null,
  timeZone: string,
  includeTime = false,
) {
  return formatDateWithOptions(value, {
    day: "2-digit",
    ...(includeTime ? { hour: "numeric", hour12: true, minute: "2-digit" } : {}),
    month: "2-digit",
    timeZone,
    year: "numeric",
  });
}

function getBrowserTimeZoneFallback() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul";
  } catch {
    return "Asia/Seoul";
  }
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQueryList = window.matchMedia(query);
    const onChange = () => setMatches(mediaQueryList.matches);

    onChange();
    mediaQueryList.addEventListener("change", onChange);

    return () => {
      mediaQueryList.removeEventListener("change", onChange);
    };
  }, [query]);

  return matches;
}

function getStoredMeetingNoteCreatePanelWidth() {
  if (typeof window === "undefined") {
    return MEETING_NOTE_CREATE_PANEL_DEFAULT_WIDTH;
  }

  const storedWidth = Number(
    window.localStorage.getItem(MEETING_NOTE_CREATE_PANEL_STORAGE_KEY),
  );

  return clampMeetingNoteCreatePanelWidth(storedWidth, window.innerWidth);
}

function clampMeetingNoteCreatePanelWidth(
  width: number,
  viewportWidth?: number,
) {
  const fallbackWidth = Number.isFinite(width)
    ? width
    : MEETING_NOTE_CREATE_PANEL_DEFAULT_WIDTH;
  const maxWidth = getMeetingNoteCreatePanelMaxWidth(viewportWidth);

  return Math.min(
    Math.max(fallbackWidth, MEETING_NOTE_CREATE_PANEL_MIN_WIDTH),
    maxWidth,
  );
}

function getMeetingNoteCreatePanelMaxWidth(viewportWidth?: number) {
  if (!viewportWidth || viewportWidth <= 0) {
    return MEETING_NOTE_CREATE_PANEL_DEFAULT_WIDTH;
  }

  return Math.max(
    MEETING_NOTE_CREATE_PANEL_MIN_WIDTH,
    Math.floor(viewportWidth * MEETING_NOTE_CREATE_PANEL_MAX_RATIO),
  );
}
