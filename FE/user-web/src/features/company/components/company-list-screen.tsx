import {
  Building2,
  ChevronDown,
  Download,
  Plus,
  RotateCcw,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useLocation, useNavigate } from "react-router-dom";
import { ListFilterSelect } from "@/components/ui/list-filter-select";
import { Pagination } from "@/components/ui/pagination";
import { ListEmptyState } from "@/components/ui/state";
import { Toast } from "@/components/ui/toast";
import { useAuthSession } from "@/features/auth";
import { CompanyCreateDialog } from "@/features/company/components/company-create-dialog";
import { CompanyTaxonomyCreateDialog } from "@/features/company/components/company-taxonomy-create-dialog";
import {
  useCompanyFields,
  useCompanyList,
  useCompanyRegions,
} from "@/features/company/hooks/use-company-list";
import { useExportCompaniesMutation } from "@/features/company/hooks/use-company-mutations";
import type {
  CompanyListItem,
  CompanySort,
} from "@/features/company/types/company";
import { getApiErrorMessage, type ApiBlobResponse } from "@/lib/api-client";
import { cn } from "@/utils/cn";
import { formatDateWithOptions } from "@/utils/format";
import { readLocationNotice } from "@/utils/location-state";

type CompanyListScreenProps = {
  readonly initialCreateOpen?: boolean;
  readonly onCreateDialogClose?: () => void;
};

const COMPANY_SORT_OPTIONS: Array<{
  readonly value: CompanySort;
  readonly label: string;
}> = [
  { value: "createdAtDesc", label: "최신순" },
  { value: "contactCountDesc", label: "담당자 높은순" },
  { value: "contactCountAsc", label: "담당자 낮은순" },
  { value: "dealCountDesc", label: "딜 높은순" },
  { value: "dealCountAsc", label: "딜 낮은순" },
];

const COMPANY_TABLE_GRID_STYLE = {
  gridTemplateColumns: "repeat(6, minmax(90px, 1fr))",
};

export function CompanyListScreen({
  initialCreateOpen = false,
  onCreateDialogClose,
}: CompanyListScreenProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthSession();
  const [companyNameText, setCompanyNameText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyFieldIds, setCompanyFieldIds] = useState<string[]>([]);
  const [companyRegionIds, setCompanyRegionIds] = useState<string[]>([]);
  const [sort, setSort] = useState<CompanySort>("createdAtDesc");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [taxonomyDialog, setTaxonomyDialog] = useState<{
    readonly kind: "field" | "region";
  } | null>(null);
  const [pendingFieldName, setPendingFieldName] = useState("");
  const [pendingRegionName, setPendingRegionName] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const listParams = useMemo(
    () => ({
      page,
      companyName: companyName || undefined,
      companyFieldIds:
        companyFieldIds.length > 0 ? companyFieldIds : undefined,
      companyRegionIds:
        companyRegionIds.length > 0 ? companyRegionIds : undefined,
      sort,
    }),
    [companyFieldIds, companyName, companyRegionIds, page, sort],
  );
  const exportFilters = useMemo(
    () => ({
      companyName: companyName || undefined,
      companyFieldIds:
        companyFieldIds.length > 0 ? companyFieldIds : undefined,
      companyRegionIds:
        companyRegionIds.length > 0 ? companyRegionIds : undefined,
      sort,
    }),
    [companyFieldIds, companyName, companyRegionIds, sort],
  );

  const companiesQuery = useCompanyList(listParams);
  const fieldsQuery = useCompanyFields();
  const regionsQuery = useCompanyRegions();
  const exportCompaniesMutation = useExportCompaniesMutation();

  useEffect(() => {
    const message = readLocationNotice(location.state);
    if (!message) {
      return;
    }

    setNotice(message);
    void navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const fields = useMemo(
    () => fieldsQuery.data?.items ?? [],
    [fieldsQuery.data],
  );
  const regions = useMemo(
    () => regionsQuery.data?.items ?? [],
    [regionsQuery.data],
  );
  const companyList = companiesQuery.data;
  const displayTimeZone = user?.timeZone ?? getBrowserTimeZoneFallback();
  const hasSearch =
    companyName.length > 0 ||
    companyFieldIds.length > 0 ||
    companyRegionIds.length > 0 ||
    sort !== "createdAtDesc";

  useEffect(() => {
    if (initialCreateOpen) setIsCreateOpen(true);
  }, [initialCreateOpen]);

  useEffect(() => {
    if (!pendingFieldName) return;
    const matched = fields.find((f) => f.field === pendingFieldName);
    if (matched) {
      setCompanyFieldIds((prev) => addUniqueId(prev, matched.id));
      setPage(1);
      setPendingFieldName("");
    }
  }, [fields, pendingFieldName]);

  useEffect(() => {
    if (!pendingRegionName) return;
    const matched = regions.find((r) => r.region === pendingRegionName);
    if (matched) {
      setCompanyRegionIds((prev) => addUniqueId(prev, matched.id));
      setPage(1);
      setPendingRegionName("");
    }
  }, [regions, pendingRegionName]);

  useEffect(() => {
    const validFieldIds = new Set(fields.map((field) => field.id));
    const nextIds = companyFieldIds.filter((id) => validFieldIds.has(id));

    if (nextIds.length !== companyFieldIds.length) {
      setCompanyFieldIds(nextIds);
      setPage(1);
    }
  }, [companyFieldIds, fields]);

  useEffect(() => {
    const validRegionIds = new Set(regions.map((region) => region.id));
    const nextIds = companyRegionIds.filter((id) => validRegionIds.has(id));

    if (nextIds.length !== companyRegionIds.length) {
      setCompanyRegionIds(nextIds);
      setPage(1);
    }
  }, [companyRegionIds, regions]);

  const onSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCompanyName(companyNameText.trim());
    setPage(1);
  };

  const onExport = async () => {
    const file = await exportCompaniesMutation.mutateAsync(exportFilters);
    downloadBlobFile(file, "companies.xlsx");
  };

  return (
    <section className="flex min-h-full flex-col bg-[#FAFAF8]">
      <PageHeader
        breadcrumbs={[{ label: "회사", icon: Building2 }]}
        actions={[
          {
            icon: Download,
            tooltip: "파일로 내보내기",
            onClick: () => void onExport(),
            disabled: exportCompaniesMutation.isPending,
          },
          {
            icon: Plus,
            tooltip: "회사 추가",
            onClick: () => void navigate("/companies/new"),
            disabled: fieldsQuery.isLoading || regionsQuery.isLoading,
            variant: "primary",
          },
        ]}
      />

      {/* 검색 + 필터 툴바 (데스크톱) */}
      <div className="hidden min-h-10 shrink-0 items-center gap-1.5 overflow-x-auto px-5 py-1 md:flex lg:gap-2">
        <form
          className="flex h-8 w-[clamp(150px,20vw,220px)] shrink-0 items-center gap-1.5 rounded-md border border-[#E2E5EC] bg-[#FAFAF8] px-3 transition hover:border-[#93C5FD] hover:bg-white focus-within:border-[#2563EB] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#2563EB]"
          onSubmit={onSearchSubmit}
        >
          <Search className="h-3 w-3 shrink-0 text-[#9CA3AF]" />
          <input
            className="min-w-0 flex-1 bg-transparent text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            onChange={(e) => setCompanyNameText(e.target.value)}
            placeholder="회사명 검색"
            value={companyNameText}
          />
        </form>
        <FilterChip
          active={!hasSearch}
          icon={RotateCcw}
          label="초기화"
          onClick={() => {
            setCompanyName("");
            setCompanyNameText("");
            setCompanyFieldIds([]);
            setCompanyRegionIds([]);
            setSort("createdAtDesc");
            setPage(1);
          }}
        />
        <CompanyTaxonomyFilterCombobox
          emptyText="조건에 맞는 분야가 없습니다."
          getLabel={(field) => field.field}
          itemKindLabel="분야"
          items={fields}
          selectedIds={companyFieldIds}
          size="desktop"
          tone="amber"
          onCreateClick={() => setTaxonomyDialog({ kind: "field" })}
          onSelectedIdsChange={(ids) => {
            setCompanyFieldIds(ids);
            setPage(1);
          }}
        />
        <CompanyTaxonomyFilterCombobox
          emptyText="조건에 맞는 지역이 없습니다."
          getLabel={(region) => region.region}
          itemKindLabel="지역"
          items={regions}
          selectedIds={companyRegionIds}
          size="desktop"
          tone="green"
          onCreateClick={() => setTaxonomyDialog({ kind: "region" })}
          onSelectedIdsChange={(ids) => {
            setCompanyRegionIds(ids);
            setPage(1);
          }}
        />
        <ListFilterSelect
          active={sort !== "createdAtDesc"}
          ariaLabel="정렬 조건"
          className="w-[clamp(124px,13vw,148px)]"
          onChange={(nextSort) => {
            setSort(nextSort);
            setPage(1);
          }}
          options={COMPANY_SORT_OPTIONS}
          value={sort}
        />
        <div className="flex-1" />
        <span className="shrink-0 text-[12px] text-[#9CA3AF]">
          {companyList?.totalCount ?? 0}개
        </span>
      </div>

      {/* 알림 */}
      {notice || exportCompaniesMutation.error ? (
        <div className="hidden px-5 pt-2 md:block">
          {notice ? (
            <Toast
              message={notice}
              onClose={() => setNotice(null)}
              variant="success"
            />
          ) : null}
          {exportCompaniesMutation.error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
              {getApiErrorMessage(exportCompaniesMutation.error)}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* 테이블 (데스크톱) */}
      <div className="hidden gap-3 overflow-x-auto px-5 pb-3 pt-1 md:flex xl:gap-5">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex w-full min-w-[520px] flex-col overflow-hidden rounded-lg border border-[#E2E5EC] bg-white shadow-sm">
            <div
              className="grid h-11 shrink-0 items-center border-b border-[#E2E5EC] bg-[#F9FAFB] px-3 md:px-4 xl:px-6"
              style={COMPANY_TABLE_GRID_STYLE}
            >
              <div className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                회사명
              </div>
              <div className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                분야
              </div>
              <div className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                지역
              </div>
              <div className="min-w-0 truncate whitespace-nowrap text-[12px] font-semibold text-[#64748B]">
                담당자 수
              </div>
              <div className="min-w-0 truncate whitespace-nowrap text-[12px] font-semibold text-[#64748B]">
                딜 수
              </div>
              <div className="min-w-0 truncate whitespace-nowrap text-[12px] font-semibold text-[#64748B]">
                등록일
              </div>
            </div>

            {companiesQuery.isLoading ? (
              <CompanyListSkeleton />
            ) : companiesQuery.isError ? (
              <CompanyListError
                error={companiesQuery.error}
                onRetry={() => void companiesQuery.refetch()}
              />
            ) : !companyList || companyList.items.length === 0 ? (
              <ListEmptyState
                actionIcon={Plus}
                actionLabel="회사 추가"
                icon={Building2}
                onAction={() => setIsCreateOpen(true)}
                title={
                  hasSearch
                    ? "조건에 맞는 회사가 없습니다"
                    : "등록된 회사가 없습니다"
                }
              />
            ) : (
              <div className="min-w-0">
                {companyList.items.map((company) => (
                  <CompanyRow
                    company={company}
                    displayTimeZone={displayTimeZone}
                    key={company.id}
                  />
                ))}
              </div>
            )}
          </div>

          {companyList ? (
            <Pagination
              page={companyList.page}
              totalPages={companyList.totalPages}
              onPageChange={setPage}
            />
          ) : null}
        </div>
      </div>

      {/* 모바일 뷰 */}
      <section className="flex min-h-0 flex-1 flex-col md:hidden">
        {/* 모바일 알림 */}
        {notice ? (
          <div className="px-4 pt-2">
            <Toast
              message={notice}
              onClose={() => setNotice(null)}
              variant="success"
            />
          </div>
        ) : null}

        {/* 모바일 필터 칩 행 */}
        <div className="flex h-10 shrink-0 items-center gap-2 overflow-x-auto border-b border-[#E5E7EB] px-4">
          <button
            className={cn(
              "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium transition hover:border-[#93C5FD] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]",
              !hasSearch
                ? "border-[#C7D7FE] bg-[#EAF2FF] font-bold text-[#1D4ED8]"
                : "border-[#E5E7EB] bg-[#F3F4F6] text-[#4B5563]",
            )}
            onClick={() => {
              setCompanyName("");
              setCompanyNameText("");
              setCompanyFieldIds([]);
              setCompanyRegionIds([]);
              setSort("createdAtDesc");
              setPage(1);
            }}
            type="button"
          >
            <RotateCcw className="h-3 w-3" />
            초기화
          </button>
          <CompanyTaxonomyFilterCombobox
            emptyText="조건에 맞는 분야가 없습니다."
            getLabel={(field) => field.field}
            itemKindLabel="분야"
            items={fields}
            selectedIds={companyFieldIds}
            size="mobile"
            tone="amber"
            onCreateClick={() => setTaxonomyDialog({ kind: "field" })}
            onSelectedIdsChange={(ids) => {
              setCompanyFieldIds(ids);
              setPage(1);
            }}
          />
          <CompanyTaxonomyFilterCombobox
            emptyText="조건에 맞는 지역이 없습니다."
            getLabel={(region) => region.region}
            itemKindLabel="지역"
            items={regions}
            selectedIds={companyRegionIds}
            size="mobile"
            tone="green"
            onCreateClick={() => setTaxonomyDialog({ kind: "region" })}
            onSelectedIdsChange={(ids) => {
              setCompanyRegionIds(ids);
              setPage(1);
            }}
          />
          <div className="flex-1" />
          <span className="shrink-0 text-[11px] text-[#9CA3AF]">
            {companyList?.totalCount ?? 0}개
          </span>
        </div>

        {/* 모바일 카드 목록 */}
        <div className="bg-white">
          {companiesQuery.isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className="h-[80px] animate-pulse border-b border-[#E5E7EB] bg-[#F9FAFB]"
                />
              ))}
            </div>
          ) : companiesQuery.isError ? (
            <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
              <p className="text-[13px] text-red-500">
                {getApiErrorMessage(companiesQuery.error)}
              </p>
              <button
                className="mt-3 inline-flex h-8 items-center rounded-md border border-[#E2E5EC] bg-white px-3 text-[12px] text-[#6B7280]"
                onClick={() => void companiesQuery.refetch()}
                type="button"
              >
                다시 시도
              </button>
            </div>
          ) : !companyList || companyList.items.length === 0 ? (
            <ListEmptyState
              actionIcon={Plus}
              actionLabel="회사 추가"
              icon={Building2}
              onAction={() => setIsCreateOpen(true)}
              title={
                hasSearch
                  ? "조건에 맞는 회사가 없습니다"
                  : "등록된 회사가 없습니다"
              }
            />
          ) : (
            companyList.items.map((company) => (
              <CompanyMobileCard
                key={company.id}
                company={company}
                displayTimeZone={displayTimeZone}
              />
            ))
          )}
        </div>

        {/* 모바일 페이지네이션 */}
        {companyList ? (
          <div className="shrink-0 border-t border-[#E5E7EB] bg-white px-4 py-2">
            <Pagination
              page={companyList.page}
              totalPages={companyList.totalPages}
              onPageChange={setPage}
            />
          </div>
        ) : null}

        {/* FAB */}
        <button
          aria-label="회사 추가"
          className="fixed bottom-24 right-5 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#2563EB] shadow-[0_4px_16px_rgba(59,130,246,0.27)] transition active:opacity-80"
          onClick={() => void navigate("/companies/new")}
          type="button"
        >
          <Plus className="h-6 w-6 text-white" strokeWidth={2.5} />
        </button>
      </section>

      <CompanyCreateDialog
        fields={fields}
        onCreated={() => setNotice("회사가 추가되었습니다.")}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) onCreateDialogClose?.();
        }}
        open={isCreateOpen}
        regions={regions}
      />
      <CompanyTaxonomyCreateDialog
        kind={taxonomyDialog?.kind ?? "field"}
        fields={fields}
        regions={regions}
        onCreated={(name) => {
          if (taxonomyDialog?.kind === "field") setPendingFieldName(name);
          else if (taxonomyDialog?.kind === "region")
            setPendingRegionName(name);
        }}
        onOpenChange={(isOpen) => {
          if (!isOpen) setTaxonomyDialog(null);
        }}
        open={taxonomyDialog !== null}
      />
    </section>
  );
}

function CompanyRow({
  company,
  displayTimeZone,
}: {
  readonly company: CompanyListItem;
  readonly displayTimeZone: string;
}) {
  const navigate = useNavigate();

  return (
    <div
      className="group grid h-[66px] w-full cursor-pointer items-center border-b border-[#E2E5EC] bg-white px-3 text-left transition-colors last:border-b-0 hover:bg-[#EAF2FF] md:px-4 xl:px-6"
      onClick={() => void navigate(`/companies/${company.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          void navigate(`/companies/${company.id}`);
        }
      }}
      role="button"
      tabIndex={0}
      style={COMPANY_TABLE_GRID_STYLE}
    >
      <div className="min-w-0">
        <span className="block truncate text-[13px] font-semibold text-[#111827]">
          {company.companyName}
        </span>
      </div>
      <div className="min-w-0">
        <span
          className="inline-flex h-[22px] max-w-full min-w-0 items-center overflow-hidden rounded-full bg-[#FFFBEB] px-2.5 text-[11px] font-semibold text-[#B45309]"
          title={company.companyField.field}
        >
          <span className="min-w-0 truncate whitespace-nowrap">
            {company.companyField.field}
          </span>
        </span>
      </div>
      <div className="min-w-0">
        <span
          className="inline-flex h-[22px] max-w-full min-w-0 items-center overflow-hidden rounded-full bg-[#ECFDF5] px-2.5 text-[11px] font-semibold text-[#047857]"
          title={company.companyRegion.region}
        >
          <span className="min-w-0 truncate whitespace-nowrap">
            {company.companyRegion.region}
          </span>
        </span>
      </div>
      <div className="min-w-0 truncate whitespace-nowrap text-[12px] font-medium text-[#475569]">
        {company.contactCount.toLocaleString("ko-KR")}명
      </div>
      <div className="min-w-0 truncate whitespace-nowrap text-[12px] font-medium text-[#475569]">
        {company.dealCount.toLocaleString("ko-KR")}건
      </div>
      <div
        className="min-w-0 truncate text-[12px] font-medium text-[#64748B]"
        title={formatCompanyCreatedAt(company.createdAt, displayTimeZone)}
      >
        {formatCompanyCreatedAt(company.createdAt, displayTimeZone)}
      </div>
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
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[6px] border px-3 text-[13px] transition hover:border-[#93C5FD] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]",
        active
          ? "border-[#C7D7FE] bg-[#EAF2FF] font-bold text-[#1D4ED8]"
          : "border-[#E6EAF0] bg-white font-medium text-[#475569] hover:bg-[#F9FAFB]",
      )}
      onClick={onClick}
      type="button"
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {label}
    </button>
  );
}

type FieldFilterPopoverPosition = {
  readonly left: number;
  readonly top: number;
  readonly width: number;
};

type CompanyTaxonomyFilterItem = {
  readonly id: string;
};

type CompanyTaxonomyFilterTone = "amber" | "green";

function CompanyTaxonomyFilterCombobox<
  TItem extends CompanyTaxonomyFilterItem,
>({
  emptyText,
  getLabel,
  itemKindLabel,
  items,
  selectedIds,
  size,
  tone,
  onCreateClick,
  onSelectedIdsChange,
}: {
  readonly emptyText: string;
  readonly getLabel: (item: TItem) => string;
  readonly itemKindLabel: string;
  readonly items: readonly TItem[];
  readonly selectedIds: readonly string[];
  readonly size: "desktop" | "mobile";
  readonly tone: CompanyTaxonomyFilterTone;
  readonly onCreateClick: () => void;
  readonly onSelectedIdsChange: (ids: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [popoverPosition, setPopoverPosition] =
    useState<FieldFilterPopoverPosition | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedItems = useMemo(
    () => items.filter((item) => selectedIdSet.has(item.id)),
    [items, selectedIdSet],
  );
  const selectedSummary = getSelectedTaxonomyFilterSummary(
    selectedItems,
    getLabel,
    itemKindLabel,
  );
  const query = search.trim();
  const normalizedQuery = normalizeFilterText(query);
  const filteredItems =
    normalizedQuery.length > 0
      ? items.filter((item) =>
          normalizeFilterText(getLabel(item)).includes(normalizedQuery),
        )
      : items;
  const isMobile = size === "mobile";
  const inputValue = isOpen ? search : selectedSummary;

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

      setPopoverPosition(getFieldFilterPopoverPosition(inputRef.current, isMobile));
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
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("resize", updatePopoverPosition);
    window.addEventListener("scroll", updatePopoverPosition, true);

    return () => {
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
      setPopoverPosition(getFieldFilterPopoverPosition(inputRef.current, isMobile));
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
        isMobile ? "w-[120px]" : "w-[clamp(136px,14vw,178px)]",
      )}
    >
      <div className="relative">
        {/* Search icon — only visible when open */}
        {isOpen ? (
          <Search
            className={cn(
              "pointer-events-none absolute top-1/2 shrink-0 -translate-y-1/2 text-[#9CA3AF]",
              isMobile ? "left-2.5 h-3 w-3" : "left-3 h-3 w-3",
            )}
          />
        ) : null}
        <input
          ref={inputRef}
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-label={`${itemKindLabel} 필터`}
          autoComplete="off"
          className={cn(
            "w-full min-w-0 border outline-none transition",
            isMobile
              ? "h-7 rounded-full text-[12px]"
              : "h-8 rounded-full text-[13px]",
            isOpen
              ? cn(
                  "border-[#2563EB] bg-white text-[#111827] ring-1 ring-[#2563EB]",
                  isMobile ? "pl-7 pr-7" : "pl-8 pr-7",
                )
              : selectedIds.length > 0
                ? cn(
                    getTaxonomyFilterInputSelectedClass(tone),
                    isMobile ? "pl-3 pr-7" : "pl-3.5 pr-7",
                  )
                : isMobile
                  ? "border-[#E5E7EB] bg-[#F3F4F6] pl-3 pr-7 text-[#4B5563] hover:border-[#D1D5DB]"
                  : "cursor-pointer border-[#E2E5EC] bg-transparent pl-3.5 pr-7 text-[#6B7280] hover:border-[#D1D5DB] hover:bg-[#F5F6F8]",
          )}
          onChange={(event) => {
            openOptions(event.target.value);
          }}
          onFocus={() => openOptions("")}
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
          value={inputValue}
        />
        {/* Right icon: × when selected/searching, ▾ when idle */}
        {selectedIds.length > 0 || search ? (
          <button
            aria-label={`${itemKindLabel} 필터 지우기`}
            className={cn(
              "absolute right-1 top-1/2 grid -translate-y-1/2 place-items-center rounded-full text-[#9CA3AF] transition hover:bg-white hover:text-[#374151]",
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
              "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF] transition-transform",
              isMobile ? "h-3 w-3" : "h-3.5 w-3.5",
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

          <button
            className="flex h-9 w-full items-center gap-1.5 px-3 text-left text-[12px] font-semibold text-[#2563EB] transition hover:bg-[#EFF6FF]"
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
        </div>
      ) : null}
    </div>
  );
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

function getSelectedTaxonomyFilterSummary<TItem extends CompanyTaxonomyFilterItem>(
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

function getTaxonomyFilterInputSelectedClass(
  tone: CompanyTaxonomyFilterTone,
) {
  return tone === "amber"
    ? "border-[#FDE68A] bg-[#FFFBEB] font-semibold text-[#B45309]"
    : "border-[#BBF7D0] bg-[#F0FDF4] font-semibold text-[#15803D]";
}

function getTaxonomyFilterItemSelectedClass(
  tone: CompanyTaxonomyFilterTone,
) {
  return tone === "amber"
    ? "bg-[#FFFBEB] font-semibold text-[#B45309]"
    : "bg-[#F0FDF4] font-semibold text-[#15803D]";
}

function getTaxonomyFilterCheckBorderClass(
  tone: CompanyTaxonomyFilterTone,
) {
  return tone === "amber" ? "border-[#B45309]" : "border-[#15803D]";
}

function getTaxonomyFilterCheckDotClass(tone: CompanyTaxonomyFilterTone) {
  return tone === "amber" ? "bg-[#B45309]" : "bg-[#15803D]";
}

function CompanyListError({
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
        className="mt-3 inline-flex h-8 items-center rounded-md border border-[#E2E5EC] bg-white px-3 text-[12px] text-[#6B7280] hover:bg-[#FAFAF8]"
        onClick={onRetry}
        type="button"
      >
        다시 시도
      </button>
    </div>
  );
}

function CompanyListSkeleton() {
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

function formatCompanyCreatedAt(value: string, timeZone: string) {
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

function CompanyMobileCard({
  company,
  displayTimeZone,
}: {
  readonly company: CompanyListItem;
  readonly displayTimeZone: string;
}) {
  const navigate = useNavigate();
  const initial = company.companyName.charAt(0).toUpperCase();

  return (
    <button
      className="flex w-full items-start gap-3 border-b border-[#E5E7EB] bg-white px-4 py-[14px] text-left transition active:bg-[#F9FAFB]"
      onClick={() => void navigate(`/companies/${company.id}`)}
      type="button"
    >
      {/* 이니셜 아바타 */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEEEFF]">
        <span className="text-[13px] font-bold text-[#5E5CE6]">{initial}</span>
      </div>
      {/* 내용 */}
      <div className="min-w-0 flex-1">
        {/* Row1: 회사명 + 분야 배지 */}
        <div className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 truncate text-[14px] font-semibold text-[#111827]">
            {company.companyName}
          </span>
          <span className="inline-flex h-5 shrink-0 items-center rounded-full bg-[#FFFBEB] px-2 text-[11px] font-semibold text-[#B45309]">
            {company.companyField.field}
          </span>
        </div>
        {/* Row2: 지역 */}
        <p className="mt-0.5 text-[12px] text-[#6B7280]">
          {company.companyRegion.region}
        </p>
        {/* Row3: 담당자·딜 + 등록일 */}
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[12px] text-[#6B7280]">
            담당자 {company.contactCount.toLocaleString("ko-KR")}명 · 딜{" "}
            {company.dealCount.toLocaleString("ko-KR")}건
          </span>
          <span className="shrink-0 text-[11px] text-[#9CA3AF]">
            {formatCompanyCreatedAt(company.createdAt, displayTimeZone)}
          </span>
        </div>
      </div>
    </button>
  );
}
