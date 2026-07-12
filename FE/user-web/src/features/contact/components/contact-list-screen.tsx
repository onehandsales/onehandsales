import {
  ArrowUpDown,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  Download,
  IdCard,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PageHeader } from "@/components/layout/page-header";
import { CollapsibleDesktopSearch } from "@/components/ui/collapsible-desktop-search";
import {
  Link,
  useLocation,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import { ListFilterSelect } from "@/components/ui/list-filter-select";
import { Pagination } from "@/components/ui/pagination";
import { ListEmptyState } from "@/components/ui/state";
import { Toast } from "@/components/ui/toast";
import type { AppShellOutletContext } from "@/components/layout/app-shell";
import { useAuthSession } from "@/features/auth";
import { ContactCreateDialog } from "@/features/contact/components/contact-create-dialog";
import { ContactTaxonomyManageDialog } from "@/features/contact/components/contact-taxonomy-manage-dialog";
import {
  useContactDepartments,
  useContactList,
} from "@/features/contact/hooks/use-contact-list";
import { useCompanyOptions } from "@/features/contact/hooks/use-company-options";
import { useExportContactsMutation } from "@/features/contact/hooks/use-contact-mutations";
import type {
  ContactCreateFormValues,
} from "@/features/contact/schemas/contact-schema";
import type {
  ContactListItem,
  ContactSort,
} from "@/features/contact/types/contact";
import { getApiErrorMessage, type ApiBlobResponse } from "@/lib/api-client";
import { cn } from "@/utils/cn";
import { formatDateWithOptions } from "@/utils/format";
import {
  readLocationNotice,
  readLocationNoticeDescription,
} from "@/utils/location-state";

const CONTACT_SORT_OPTIONS: Array<{
  readonly value: ContactSort;
  readonly label: string;
}> = [
  { value: "createdAtDesc", label: "최신순" },
  { value: "usernameAsc", label: "이름순" },
];

const CONTACT_TABLE_GRID_STYLE = {
  gridTemplateColumns:
    "minmax(0,0.8fr) minmax(0,0.9fr) minmax(0,0.6fr) minmax(0,0.5fr) minmax(0,0.7fr) minmax(0,1fr) minmax(0,0.65fr)",
};

type ContactListScreenProps = {
  readonly initialCreateOpen?: boolean;
  readonly onCreateDialogClose?: () => void;
};

const CONTACT_CREATE_PANEL_STORAGE_KEY = "onehand.contact.createPanelWidth";
const CONTACT_CREATE_PANEL_DEFAULT_WIDTH = 520;
const CONTACT_CREATE_PANEL_MIN_WIDTH = 420;
const CONTACT_CREATE_PANEL_MAX_RATIO = 0.55;
const CONTACT_CREATE_PANEL_AUTO_SIDEBAR_RATIO = 0.45;
const CONTACT_CREATE_PANEL_TRANSITION_MS = 500;
const DESKTOP_SEARCH_COMPACT_MAX_WIDTH = 170;
const DESKTOP_FILTER_COLLAPSED_WIDTH = 72;
const DESKTOP_FILTER_EXPANDED_WIDTH =
  "calc(clamp(136px,14vw,178px) + clamp(136px,14vw,178px) + 0.5rem)";

export function ContactListScreen({
  initialCreateOpen = false,
  onCreateDialogClose,
}: ContactListScreenProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const outletContext =
    useOutletContext<AppShellOutletContext | undefined>();
  const { user } = useAuthSession();
  const isDockedViewport = useMediaQuery("(min-width: 1024px)");
  const [usernameText, setUsernameText] = useState("");
  const [username, setUsername] = useState("");
  const [searchResetSignal, setSearchResetSignal] = useState(0);
  const [companyIds, setCompanyIds] = useState<string[]>([]);
  const [contactDepartmentIds, setContactDepartmentIds] = useState<string[]>([]);
  const [sort, setSort] = useState<ContactSort>("createdAtDesc");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDockedCreateRendered, setIsDockedCreateRendered] = useState(false);
  const [createPanelWidth, setCreatePanelWidth] = useState(
    getStoredContactCreatePanelWidth,
  );
  const [isCreatePanelResizing, setIsCreatePanelResizing] = useState(false);
  const [isCompactFilterOpen, setIsCompactFilterOpen] = useState(false);
  const [compactFilterPosition, setCompactFilterPosition] =
    useState<FieldFilterPopoverPosition | null>(null);
  const [taxonomyOpen, setTaxonomyOpen] = useState(false);
  const [pendingDepartmentName, setPendingDepartmentName] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeDescription, setNoticeDescription] = useState<string | null>(null);
  const [actionError] = useState<string | null>(null);
  const compactFilterButtonRef = useRef<HTMLButtonElement>(null);
  const compactFilterPopoverRef = useRef<HTMLDivElement>(null);
  const setAutoSidebarCollapsed = outletContext?.setAutoSidebarCollapsed;

  const listParams = useMemo(
    () => ({
      page,
      username: username || undefined,
      companyIds: companyIds.length > 0 ? companyIds : undefined,
      contactDepartmentId: contactDepartmentIds[0] ?? undefined,
      sort,
    }),
    [companyIds, contactDepartmentIds, page, sort, username],
  );
  const exportFilters = useMemo(
    () => ({
      username: username || undefined,
      companyIds: companyIds.length > 0 ? companyIds : undefined,
      contactDepartmentId: contactDepartmentIds[0] ?? undefined,
      sort,
    }),
    [companyIds, contactDepartmentIds, sort, username],
  );

  const contactsQuery = useContactList(listParams);
  const departmentsQuery = useContactDepartments();
  const companyOptionsQuery = useCompanyOptions();
  const exportContactsMutation = useExportContactsMutation();

  useEffect(() => {
    const message = readLocationNotice(location.state);
    if (!message) {
      return;
    }

    setNotice(message);
    setNoticeDescription(readLocationNoticeDescription(location.state));
    void navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const contactList = contactsQuery.data;
  const departments = useMemo(
    () => departmentsQuery.data?.items ?? [],
    [departmentsQuery.data],
  );
  const companyOptions = useMemo(
    () => companyOptionsQuery.data?.items ?? [],
    [companyOptionsQuery.data],
  );

  const displayTimeZone = user?.timeZone ?? getBrowserTimeZoneFallback();
  const isDockedCreateOpen = isCreateOpen && isDockedViewport;
  const isDockedCreateMounted = isDockedCreateOpen || isDockedCreateRendered;
  const isCompactFilterMode = isDockedCreateOpen;
  const hasTaxonomyFilters =
    companyIds.length > 0 || contactDepartmentIds.length > 0;
  const taxonomyFilterCount = companyIds.length + contactDepartmentIds.length;
  const hasSearch =
    username.length > 0 ||
    companyIds.length > 0 ||
    contactDepartmentIds.length > 0 ||
    sort !== "createdAtDesc";

  useEffect(() => {
    if (!initialCreateOpen) {
      return;
    }

    setCreatePanelWidth(CONTACT_CREATE_PANEL_MIN_WIDTH);
    setIsCreateOpen(true);
  }, [initialCreateOpen]);

  useEffect(() => {
    if (isDockedCreateOpen) {
      setIsDockedCreateRendered(true);
      return;
    }

    const timerId = window.setTimeout(() => {
      setIsDockedCreateRendered(false);
    }, CONTACT_CREATE_PANEL_TRANSITION_MS);

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
        getCompactFilterPopoverPosition(compactFilterButtonRef.current),
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
      CONTACT_CREATE_PANEL_STORAGE_KEY,
      String(createPanelWidth),
    );
  }, [createPanelWidth]);

  useEffect(() => {
    const clampToViewport = () => {
      setCreatePanelWidth((currentWidth) =>
        clampContactCreatePanelWidth(
          currentWidth,
          window.innerWidth,
        ),
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
          CONTACT_CREATE_PANEL_AUTO_SIDEBAR_RATIO;

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
        clampContactCreatePanelWidth(
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

  useEffect(() => {
    if (!pendingDepartmentName) return;
    const matched = departments.find(
      (d) => d.departmentName === pendingDepartmentName,
    );
    if (matched) {
      setContactDepartmentIds((prev) => addUniqueId(prev, matched.id));
      setPage(1);
      setPendingDepartmentName("");
    }
  }, [departments, pendingDepartmentName]);

  useEffect(() => {
    const validIds = new Set(departments.map((d) => d.id));
    const nextIds = contactDepartmentIds.filter((id) => validIds.has(id));
    if (nextIds.length !== contactDepartmentIds.length) {
      setContactDepartmentIds(nextIds);
      setPage(1);
    }
  }, [contactDepartmentIds, departments]);

  const onSearchSubmit = (nextUsername: string) => {
    setUsername(nextUsername);
    setPage(1);
  };

  const onExport = async () => {
    const file = await exportContactsMutation.mutateAsync(exportFilters);
    downloadBlobFile(file, "contacts.xlsx");
  };
  const onCreateOpenChange = (open: boolean) => {
    setIsCreateOpen(open);

    if (!open) {
      onCreateDialogClose?.();
    }
  };
  const openCreatePanel = () => {
    setCreatePanelWidth(CONTACT_CREATE_PANEL_MIN_WIDTH);
    setIsCreateOpen(true);
  };
  const onCreateExpand = (values: ContactCreateFormValues) => {
    void navigate("/app/contacts/new/full", {
      state: { contactCreateDraft: values },
    });
  };
  const onContactCreated = () => setNotice("담당자를 추가했어요.");

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
        breadcrumbs={[{ label: "담당자", icon: IdCard }]}
        actions={[
          {
            icon: Download,
            tooltip: "엑셀 다운로드",
            onClick: () => void onExport(),
            disabled: exportContactsMutation.isPending,
          },
          {
            icon: Plus,
            tooltip: "담당자 생성",
            onClick: openCreatePanel,
            hidden: isDockedCreateMounted,
            variant: "primary",
          },
        ]}
      />

      {/* 검색 + 필터 툴바 (데스크톱) */}
      <div className="hidden min-h-10 shrink-0 items-center px-5 py-1 md:flex">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto [scrollbar-width:none] lg:gap-2 [&::-webkit-scrollbar]:hidden">
          <CollapsibleDesktopSearch
            appliedValue={username}
            maxExpandedWidth={
              isCompactFilterMode ? DESKTOP_SEARCH_COMPACT_MAX_WIDTH : undefined
            }
            placeholder="담당자를 검색하세요!"
            resetSignal={searchResetSignal}
            submitLabel="담당자 검색 실행"
            value={usernameText}
            onSubmit={onSearchSubmit}
            onValueChange={setUsernameText}
          />
          <FilterChip
            active={hasSearch}
            icon={RotateCcw}
            label="초기화"
            onClick={() => {
              setUsername("");
              setUsernameText("");
              setSearchResetSignal((signal) => signal + 1);
              setCompanyIds([]);
              setContactDepartmentIds([]);
              setSort("createdAtDesc");
              setPage(1);
            }}
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
                hasTaxonomyFilters
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
              {hasTaxonomyFilters ? (
                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#4880EE] px-1 text-[10px] font-bold leading-none text-white">
                  {taxonomyFilterCount}
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
              <ContactTaxonomyFilterCombobox
                emptyText="조건을 바꾸면 회사를 찾을 수 있어요."
                getLabel={(c) => c.companyName}
                icon={Building2}
                itemKindLabel="회사"
                items={companyOptions}
                selectedIds={companyIds}
                size="desktop"
                tone="blue"
                onSelectedIdsChange={(ids) => {
                  setCompanyIds(ids);
                  setPage(1);
                }}
              />
              <ContactTaxonomyFilterCombobox
                emptyText="조건을 바꾸면 부서를 찾을 수 있어요."
                getLabel={(d) => d.departmentName}
                icon={BriefcaseBusiness}
                itemKindLabel="부서"
                items={departments}
                selectedIds={contactDepartmentIds}
                size="desktop"
                tone="blue"
                onCreateClick={() => setTaxonomyOpen(true)}
                onSelectedIdsChange={(ids) => {
                  setContactDepartmentIds(ids);
                  setPage(1);
                }}
              />
            </div>
          </div>
          <ListFilterSelect
            active={sort !== "createdAtDesc"}
            ariaLabel="정렬 조건"
            icon={ArrowUpDown}
            className={
              isCompactFilterMode
                ? "w-[104px]"
                : "w-[clamp(136px,14vw,178px)]"
            }
            onChange={(nextSort) => {
              setSort(nextSort);
              setPage(1);
            }}
            options={CONTACT_SORT_OPTIONS}
            value={sort}
          />
        </div>
        <span className="ml-2 shrink-0 text-[12px] text-[#9CA3AF]">
          {contactList?.totalCount ?? 0}명
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
              <ContactTaxonomyFilterCombobox
                emptyText="조건을 바꾸면 회사를 찾을 수 있어요."
                getLabel={(c) => c.companyName}
                icon={Building2}
                itemKindLabel="회사"
                items={companyOptions}
                layout="full"
                selectedIds={companyIds}
                size="desktop"
                tone="blue"
                onSelectedIdsChange={(ids) => {
                  setCompanyIds(ids);
                  setPage(1);
                }}
              />
            </div>
            <div className="grid gap-1.5">
              <p className="text-[12px] font-semibold text-[#64748B]">부서</p>
              <ContactTaxonomyFilterCombobox
                emptyText="조건을 바꾸면 부서를 찾을 수 있어요."
                getLabel={(d) => d.departmentName}
                icon={BriefcaseBusiness}
                itemKindLabel="부서"
                items={departments}
                layout="full"
                selectedIds={contactDepartmentIds}
                size="desktop"
                tone="blue"
                onCreateClick={() => setTaxonomyOpen(true)}
                onSelectedIdsChange={(ids) => {
                  setContactDepartmentIds(ids);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* 알림 */}
      {notice || exportContactsMutation.error || actionError ? (
        <div className="hidden px-5 pt-2 md:block">
          {notice ? (
            <Toast
              description={noticeDescription ?? undefined}
              message={notice}
              onClose={() => {
                setNotice(null);
                setNoticeDescription(null);
              }}
              variant="success"
            />
          ) : null}
          {exportContactsMutation.error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
              {getApiErrorMessage(exportContactsMutation.error)}
            </p>
          ) : null}
          {actionError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
              {actionError}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* 테이블 (데스크톱) */}
      <div
        className={cn(
          "hidden min-h-0 flex-1 gap-3 overflow-hidden px-5 pb-3 pt-1 md:flex xl:gap-5",
          isCreatePanelResizing && "cursor-col-resize select-none",
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex w-full min-w-0 flex-col overflow-hidden rounded-lg border border-[#E2E5EC] bg-white shadow-sm">
            {/* 테이블 헤더 (데스크톱) */}
            <div
              className="hidden h-11 shrink-0 items-center border-b border-[#E2E5EC] bg-[#F9FAFB] px-3 md:grid md:px-4 xl:px-6"
              style={CONTACT_TABLE_GRID_STYLE}
            >
              <div className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                담당자명
              </div>
              <div className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                회사
              </div>
              <div className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                부서
              </div>
              <div className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                직급
              </div>
              <div className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                핸드폰
              </div>
              <div className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                이메일
              </div>
              <div className="min-w-0 truncate whitespace-nowrap text-[12px] font-semibold text-[#64748B]">
                등록일
              </div>
            </div>

            {contactsQuery.isLoading ? (
              <ContactListSkeleton />
            ) : contactsQuery.isError ? (
              <ContactListError
                error={contactsQuery.error}
                onRetry={() => void contactsQuery.refetch()}
              />
            ) : !contactList || contactList.items.length === 0 ? (
              <ListEmptyState
                actionIcon={Plus}
                actionLabel="담당자 생성"
                icon={IdCard}
                onAction={openCreatePanel}
                title={
                  hasSearch
                    ? "조건을 바꾸면 담당자를 찾을 수 있어요"
                    : "데이터가 존재하지 않아요"
                }
              />
            ) : (
              <div className="min-w-0">
                {contactList.items.map((c) => (
                  <ContactRow
                    contact={c}
                    displayTimeZone={displayTimeZone}
                    key={c.id}
                  />
                ))}
              </div>
            )}
          </div>

          {contactList ? (
            <Pagination
              page={contactList.page}
              totalPages={contactList.totalPages}
              onPageChange={setPage}
            />
          ) : null}
        </div>

        {isDockedCreateMounted ? (
          <ContactCreateDialog
            mode="docked"
            onExpand={onCreateExpand}
            onCreated={onContactCreated}
            onOpenChange={onCreateOpenChange}
            onResizeStart={() => setIsCreatePanelResizing(true)}
            open={isDockedCreateOpen}
            width={createPanelWidth}
          />
        ) : null}
      </div>

      {/* 모바일 뷰 */}
      <section className="flex min-h-0 flex-1 flex-col md:hidden">
        {/* 모바일 알림 */}
        {notice ? (
          <div className="px-4 pt-2">
            <Toast
              description={noticeDescription ?? undefined}
              message={notice}
              onClose={() => {
                setNotice(null);
                setNoticeDescription(null);
              }}
              variant="success"
            />
          </div>
        ) : null}

        {/* 모바일 필터 칩 행 */}
        <div className="flex h-10 shrink-0 items-center gap-2 overflow-x-auto border-b border-[#E5E7EB] px-4">
          <button
            aria-label="초기화"
            className={cn(
              "inline-flex h-7 shrink-0 items-center justify-center gap-1 rounded-md border-0 bg-transparent px-2 text-[12px] font-semibold transition-[background-color,color,transform] duration-150 focus:outline-none active:scale-[0.97]",
              hasSearch
                ? "text-[#1D4ED8] hover:bg-[#EFF6FF]"
                : "text-[#5F6368] hover:bg-[#F3F4F6]",
            )}
            onClick={() => {
              setUsername("");
              setUsernameText("");
              setCompanyIds([]);
              setContactDepartmentIds([]);
              setSort("createdAtDesc");
              setPage(1);
            }}
            type="button"
          >
            <RotateCcw className="h-3 w-3" />
            <span>초기화</span>
          </button>
          <ContactTaxonomyFilterCombobox
            emptyText="조건을 바꾸면 회사를 찾을 수 있어요."
            getLabel={(c) => c.companyName}
            icon={Building2}
            itemKindLabel="회사"
            items={companyOptions}
            selectedIds={companyIds}
            size="mobile"
            tone="blue"
            onSelectedIdsChange={(ids) => {
              setCompanyIds(ids);
              setPage(1);
            }}
          />
          <ContactTaxonomyFilterCombobox
            emptyText="조건을 바꾸면 부서를 찾을 수 있어요."
            getLabel={(d) => d.departmentName}
            icon={BriefcaseBusiness}
            itemKindLabel="부서"
            items={departments}
            selectedIds={contactDepartmentIds}
            size="mobile"
            tone="blue"
            onCreateClick={() => setTaxonomyOpen(true)}
            onSelectedIdsChange={(ids) => {
              setContactDepartmentIds(ids);
              setPage(1);
            }}
          />
          <div className="flex-1" />
          <span className="shrink-0 text-[11px] text-[#9CA3AF]">
            {contactList?.totalCount ?? 0}명
          </span>
        </div>

        {/* 모바일 카드 목록 */}
        <div className="bg-white">
          {contactsQuery.isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className="h-[80px] animate-pulse border-b border-[#E5E7EB] bg-[#F9FAFB]"
                />
              ))}
            </div>
          ) : contactsQuery.isError ? (
            <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
              <p className="text-[13px] text-red-500">
                {getApiErrorMessage(contactsQuery.error)}
              </p>
              <button
                className="mt-3 inline-flex h-8 items-center rounded-md border border-[#E2E5EC] bg-white px-3 text-[12px] text-[#6B7280]"
                onClick={() => void contactsQuery.refetch()}
                type="button"
              >
                다시 시도
              </button>
            </div>
          ) : !contactList || contactList.items.length === 0 ? (
            <ListEmptyState
              actionIcon={Plus}
              actionLabel="담당자 생성"
              icon={IdCard}
              onAction={openCreatePanel}
              title={
                hasSearch
                  ? "조건을 바꾸면 담당자를 찾을 수 있어요"
                  : "데이터가 존재하지 않아요"
              }
            />
          ) : (
            contactList.items.map((contact) => (
              <ContactMobileCard
                key={contact.id}
                contact={contact}
                displayTimeZone={displayTimeZone}
              />
            ))
          )}
        </div>

        {/* 모바일 페이지네이션 */}
        {contactList ? (
          <div className="shrink-0 border-t border-[#E5E7EB] bg-white px-4 py-2">
            <Pagination
              page={contactList.page}
              totalPages={contactList.totalPages}
              onPageChange={setPage}
            />
          </div>
        ) : null}

        {/* FAB */}
        <button
          aria-label="담당자 생성"
          className="fixed bottom-24 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-[#4880EE] shadow-[0_4px_16px_rgba(59,130,246,0.27)] transition active:opacity-80"
          onClick={openCreatePanel}
          type="button"
        >
          <Plus className="h-4 w-4 text-white" strokeWidth={2.5} />
        </button>
      </section>

      <div className="lg:hidden">
        <ContactCreateDialog
          mode="overlay"
          onExpand={onCreateExpand}
          onCreated={onContactCreated}
          onOpenChange={onCreateOpenChange}
          open={isCreateOpen && !isDockedViewport}
        />
      </div>
      <ContactTaxonomyManageDialog
        onCreated={(kind, name) => {
          if (kind === "department") setPendingDepartmentName(name);
        }}
        onOpenChange={setTaxonomyOpen}
        open={taxonomyOpen}
      />
    </section>
  );
}

function ContactMobileCard({
  contact,
  displayTimeZone,
}: {
  readonly contact: ContactListItem;
  readonly displayTimeZone: string;
}) {
  const initial = contact.username.charAt(0).toUpperCase();

  return (
    <Link
      className="flex w-full items-start gap-3 border-b border-[#E5E7EB] bg-white px-4 py-[14px] transition active:bg-[#F9FAFB]"
      to={`/app/contacts/${contact.id}`}
    >
      {/* 이니셜 아바타 */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF4FF]">
        <span className="text-[13px] font-bold text-[#4880EE]">{initial}</span>
      </div>
      {/* 내용 */}
      <div className="min-w-0 flex-1">
        {/* Row1: 이름 + 직급 배지 */}
        <div className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 truncate text-[14px] font-semibold text-[#111827]">
            {contact.username}
          </span>
          <span className="inline-flex h-5 shrink-0 items-center rounded-full bg-[#FEF3C7] px-2 text-[11px] font-semibold text-[#B45309]">
            {contact.contactJobGrade.jobGradeName}
          </span>
        </div>
        {/* Row2: 회사 · 부서 */}
        <p className="mt-0.5 text-[12px] text-[#6B7280]">
          {contact.company.companyName} ·{" "}
          {contact.contactDepartment.departmentName}
        </p>
        {/* Row3: 연락처 + 등록일 */}
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[12px] text-[#6B7280]">
            {contact.mobile || contact.email || "-"}
          </span>
          <span className="shrink-0 text-[11px] text-[#9CA3AF]">
            {formatContactCreatedAt(contact.createdAt, displayTimeZone)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function ContactRow({
  contact,
  displayTimeZone,
}: {
  readonly contact: ContactListItem;
  readonly displayTimeZone: string;
}) {
  const navigate = useNavigate();

  return (
    <div
      className="grid h-[66px] w-full cursor-pointer items-center border-b border-[#E2E5EC] bg-white px-3 text-left transition-colors last:border-b-0 hover:bg-[#EFF6FF] md:px-4 xl:px-6"
      onClick={() => void navigate(`/app/contacts/${contact.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          void navigate(`/app/contacts/${contact.id}`);
        }
      }}
      role="button"
      style={CONTACT_TABLE_GRID_STYLE}
      tabIndex={0}
    >
      <div className="min-w-0">
        <span className="block truncate text-[13px] font-semibold text-[#111827]">
          {contact.username}
        </span>
      </div>
      <div className="min-w-0">
        <span
          className="inline-flex h-[22px] max-w-full min-w-0 items-center overflow-hidden rounded-full bg-[#F1F5F9] px-2.5 text-[11px] font-semibold text-[#475569]"
          title={contact.company.companyName}
        >
          <span className="min-w-0 truncate whitespace-nowrap">
            {contact.company.companyName}
          </span>
        </span>
      </div>
      <div className="min-w-0">
        <span
          className="block truncate text-[12px] font-medium text-[#4880EE]"
          title={contact.contactDepartment.departmentName}
        >
          {contact.contactDepartment.departmentName}
        </span>
      </div>
      <div className="min-w-0">
        <span
          className="inline-flex h-[22px] max-w-full min-w-0 items-center overflow-hidden rounded-full bg-[#FEF3C7] px-2.5 text-[11px] font-semibold text-[#B45309]"
          title={contact.contactJobGrade.jobGradeName}
        >
          <span className="min-w-0 truncate whitespace-nowrap">
            {contact.contactJobGrade.jobGradeName}
          </span>
        </span>
      </div>
      <div
        className="min-w-0 truncate text-[12px] font-medium text-[#475569]"
        title={contact.mobile || "-"}
      >
        {contact.mobile || "-"}
      </div>
      <div
        className="min-w-0 truncate text-[12px] font-medium text-[#475569]"
        title={contact.email || "-"}
      >
        {contact.email || "-"}
      </div>
      <div
        className="min-w-0 truncate text-[12px] font-medium text-[#64748B]"
        title={formatContactCreatedAt(contact.createdAt, displayTimeZone)}
      >
        {formatContactCreatedAt(contact.createdAt, displayTimeZone)}
      </div>
    </div>
  );
}

export function ContactCard({
  contact,
  displayTimeZone,
}: {
  readonly contact: ContactListItem;
  readonly displayTimeZone: string;
}) {
  return (
    <Link
      className="flex items-start justify-between gap-4 bg-white px-6 py-3 hover:bg-white"
      to={`/app/contacts/${contact.id}`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-[#111827]">
          {contact.username}
        </p>
        <p className="mt-0.5 text-[12px] text-[#9CA3AF]">
          {contact.company.companyName} ·{" "}
          {contact.contactDepartment.departmentName}
        </p>
        <div className="mt-2 space-y-1 text-[12px] text-[#64748B]">
          <p className="truncate">핸드폰 {contact.mobile || "-"}</p>
          <p className="truncate">이메일 {contact.email || "-"}</p>
          <p>
            등록일 {formatContactCreatedAt(contact.createdAt, displayTimeZone)}
          </p>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-[12px] font-medium text-[#1D4ED8]">
          {contact.contactJobGrade.jobGradeName}
        </p>
      </div>
    </Link>
  );
}

function ContactListSkeleton() {
  return (
    <div className="overflow-hidden">
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className="h-[66px] animate-pulse border-b border-[#E2E5EC] bg-[#F9FAFB] last:border-b-0"
        />
      ))}
    </div>
  );
}

function ContactListError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 py-14 text-center">
      <p className="text-[13px] text-red-500">{getApiErrorMessage(error)}</p>
      <button
        className="mt-3 inline-flex h-8 items-center rounded-md border border-[#E2E5EC] bg-white px-3 text-[12px] text-[#6B7280] hover:bg-white"
        onClick={onRetry}
        type="button"
      >
        다시 시도
      </button>
    </div>
  );
}

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

// ── ContactTaxonomyFilterCombobox ────────────────────────────────────────────

type FieldFilterPopoverPosition = {
  readonly left: number;
  readonly top: number;
  readonly width: number;
};

type ContactTaxonomyFilterItem = {
  readonly id: string;
};

type ContactTaxonomyFilterTone = "blue" | "amber" | "green";

function ContactTaxonomyFilterCombobox<
  TItem extends ContactTaxonomyFilterItem,
>({
  emptyText,
  getLabel,
  icon: Icon,
  itemKindLabel,
  items,
  layout = "compact",
  selectedIds,
  size,
  tone,
  onCreateClick,
  onSelectedIdsChange,
}: {
  readonly emptyText: string;
  readonly getLabel: (item: TItem) => string;
  readonly icon: LucideIcon;
  readonly itemKindLabel: string;
  readonly items: readonly TItem[];
  readonly layout?: "compact" | "full";
  readonly selectedIds: readonly string[];
  readonly size: "desktop" | "mobile";
  readonly tone: ContactTaxonomyFilterTone;
  readonly onCreateClick?: () => void;
  readonly onSelectedIdsChange: (ids: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [popoverPosition, setPopoverPosition] =
    useState<FieldFilterPopoverPosition | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const query = search.trim();
  const normalizedQuery = normalizeFilterText(query);
  const filteredItems =
    normalizedQuery.length > 0
      ? items.filter((item) =>
          normalizeFilterText(getLabel(item)).includes(normalizedQuery),
        )
      : items;
  const isMobile = size === "mobile";

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
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
        getFieldFilterPopoverPosition(inputRef.current, isMobile),
      );
    };
    const onMouseDown = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };

    updatePopoverPosition();
    const focusFrame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("resize", updatePopoverPosition);
    window.addEventListener("scroll", updatePopoverPosition, true);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("resize", updatePopoverPosition);
      window.removeEventListener("scroll", updatePopoverPosition, true);
    };
  }, [isMobile, isOpen]);

  const toggleItem = (item: TItem) => {
    const nextIds = selectedIdSet.has(item.id)
      ? selectedIds.filter((id) => id !== item.id)
      : [...selectedIds, item.id];

    setSearch("");
    onSelectedIdsChange(nextIds);
  };

  const openOptions = (nextSearch: string) => {
    setSearch(nextSearch);

    if (inputRef.current) {
      setPopoverPosition(
        getFieldFilterPopoverPosition(inputRef.current, isMobile),
      );
    }

    setIsOpen(true);
  };

  const clearSelection = () => {
    setSearch("");
    onSelectedIdsChange([]);
    inputRef.current?.focus();
    openOptions("");
  };

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "relative shrink-0",
        layout === "full"
          ? "w-full"
          : isMobile
            ? "w-[120px]"
            : "w-[clamp(136px,14vw,178px)]",
      )}
    >
      <div className="relative">
        {!isOpen ? (
          <button
            aria-expanded={false}
            aria-label={`${itemKindLabel} 필터`}
            className={cn(
              "inline-flex w-full min-w-0 items-center gap-1.5 rounded-md border-0 bg-transparent px-2 font-semibold outline-none transition-[background-color,color,transform,opacity] duration-150 active:scale-[0.97]",
              isMobile ? "h-7 text-[12px]" : "h-8 text-[13px]",
              selectedIds.length > 0
                ? "text-[#1D4ED8] hover:bg-[#EFF6FF]"
                : "text-[#5F6368] hover:bg-[#F3F4F6]",
            )}
            onClick={() => openOptions("")}
            type="button"
          >
            <Icon className={isMobile ? "h-3 w-3 shrink-0" : "h-3.5 w-3.5 shrink-0"} />
            <span className="min-w-0 flex-1 truncate text-left">
              {itemKindLabel}
            </span>
            <ChevronDown className={isMobile ? "h-3 w-3 shrink-0 text-[#9CA3AF]" : "h-3.5 w-3.5 shrink-0 text-[#9CA3AF]"} />
          </button>
        ) : (
          <>
            <Search
              className={cn(
                "pointer-events-none absolute top-1/2 shrink-0 -translate-y-1/2 text-[#6B7280]",
                isMobile ? "left-2.5 h-3 w-3" : "left-3 h-3 w-3",
              )}
            />
            <input
              ref={inputRef}
              aria-autocomplete="list"
              aria-expanded={isOpen}
              aria-label={`${itemKindLabel} 필터`}
              autoComplete="off"
              className={cn(
                "w-full min-w-0 border-0 bg-[#F3F4F6] text-[#111827] outline-none transition-[background-color,color,transform,opacity] duration-150",
                isMobile
                  ? "h-7 rounded-md pl-7 pr-7 text-[12px]"
                  : "h-8 rounded-md pl-8 pr-7 text-[13px]",
              )}
              onChange={(event) => {
                openOptions(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setIsOpen(false);
                  setSearch("");
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
              value={search}
            />
            {selectedIds.length > 0 || search ? (
              <button
                aria-label={`${itemKindLabel} 필터 지우기`}
                className={cn(
                  "absolute right-1 top-1/2 grid -translate-y-1/2 place-items-center rounded-full text-[#9CA3AF] transition hover:bg-[#E5E7EB] hover:text-[#374151] active:scale-[0.97]",
                  isMobile ? "h-6 w-6" : "h-7 w-7",
                )}
                onClick={clearSelection}
                type="button"
              >
                <X className={isMobile ? "h-3 w-3" : "h-3.5 w-3.5"} />
              </button>
            ) : (
              <ChevronDown
                className={cn(
                  "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rotate-180 text-[#9CA3AF]",
                  isMobile ? "h-3 w-3" : "h-3.5 w-3.5",
                )}
              />
            )}
          </>
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
              setSearch("");
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
                      isSelected && getTaxonomyFilterItemSelectedClass(tone),
                    )}
                    key={item.id}
                    onClick={() => toggleItem(item)}
                    type="button"
                  >
                    <span
                      className={cn(
                        "grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border",
                        isSelected
                          ? getTaxonomyFilterCheckBorderClass(tone)
                          : "border-[#CBD5E1]",
                      )}
                    >
                      {isSelected ? (
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            getTaxonomyFilterCheckDotClass(tone),
                          )}
                        />
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

          {onCreateClick ? (
            <button
              className="flex h-9 w-full items-center gap-1.5 px-3 text-left text-[12px] font-semibold text-[#4880EE] transition hover:bg-[#EFF6FF]"
              onClick={() => {
                setIsOpen(false);
                setSearch("");
                onCreateClick();
              }}
              type="button"
            >
              <Plus className="h-3.5 w-3.5" />
              새 {itemKindLabel} 추가
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function getCompactFilterPopoverPosition(
  trigger: HTMLButtonElement,
): FieldFilterPopoverPosition {
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

function getFieldFilterPopoverPosition(
  input: HTMLInputElement,
  isMobile: boolean,
): FieldFilterPopoverPosition {
  const rect = input.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const margin = 16;
  const width = isMobile
    ? Math.min(256, Math.max(160, viewportWidth - margin * 2))
    : 256;
  const maxLeft = Math.max(margin, viewportWidth - width - margin);
  const left = Math.min(Math.max(rect.left, margin), maxLeft);

  return {
    left,
    top: rect.bottom + 4,
    width,
  };
}

function getTaxonomyFilterItemSelectedClass(tone: ContactTaxonomyFilterTone) {
  if (tone === "blue") return "bg-[#EFF6FF] font-semibold text-[#1D4ED8]";
  if (tone === "green") return "bg-[#F0FDF4] font-semibold text-[#15803D]";
  return "bg-[#FFFBEB] font-semibold text-[#B45309]";
}

function getTaxonomyFilterCheckBorderClass(tone: ContactTaxonomyFilterTone) {
  if (tone === "blue") return "border-[#E2E5EC]";
  if (tone === "green") return "border-[#E2E5EC]";
  return "border-[#E2E5EC]";
}

function getTaxonomyFilterCheckDotClass(tone: ContactTaxonomyFilterTone) {
  if (tone === "blue") return "bg-[#4880EE]";
  if (tone === "green") return "bg-[#15803D]";
  return "bg-[#B45309]";
}

// ── Utilities ────────────────────────────────────────────────────────────────

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

function getStoredContactCreatePanelWidth() {
  if (typeof window === "undefined") {
    return CONTACT_CREATE_PANEL_DEFAULT_WIDTH;
  }

  const storedWidth = Number(
    window.localStorage.getItem(CONTACT_CREATE_PANEL_STORAGE_KEY),
  );

  return clampContactCreatePanelWidth(storedWidth, window.innerWidth);
}

function clampContactCreatePanelWidth(width: number, viewportWidth?: number) {
  const fallbackWidth = Number.isFinite(width)
    ? width
    : CONTACT_CREATE_PANEL_DEFAULT_WIDTH;
  const maxWidth = getContactCreatePanelMaxWidth(viewportWidth);

  return Math.min(
    Math.max(fallbackWidth, CONTACT_CREATE_PANEL_MIN_WIDTH),
    maxWidth,
  );
}

function getContactCreatePanelMaxWidth(viewportWidth?: number) {
  if (!viewportWidth || viewportWidth <= 0) {
    return CONTACT_CREATE_PANEL_DEFAULT_WIDTH;
  }

  return Math.max(
    CONTACT_CREATE_PANEL_MIN_WIDTH,
    Math.floor(viewportWidth * CONTACT_CREATE_PANEL_MAX_RATIO),
  );
}

function downloadBlobFile(file: ApiBlobResponse, fallbackFileName: string) {
  const url = window.URL.createObjectURL(file.blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.fileName ?? fallbackFileName;
  document.body.append(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function formatContactCreatedAt(value: string, timeZone: string) {
  return formatDateWithOptions(value, {
    day: "2-digit",
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

function normalizeFilterText(value: string) {
  return value.trim().toLowerCase();
}

function addUniqueId(ids: readonly string[], id: string) {
  return ids.includes(id) ? [...ids] : [...ids, id];
}
