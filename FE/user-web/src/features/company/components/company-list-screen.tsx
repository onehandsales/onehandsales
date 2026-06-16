import {
  BriefcaseBusiness,
  Building2,
  IdCard,
  MapPin,
  Download,
  Plus,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Link, useNavigate } from "react-router-dom";
import { Pagination } from "@/components/ui/pagination";
import { Toast } from "@/components/ui/toast";
import { useAuthSession } from "@/features/auth";
import { CompanyCreateDialog } from "@/features/company/components/company-create-dialog";
import { CompanyTaxonomyCreateDialog } from "@/features/company/components/company-taxonomy-create-dialog";
import {
  useCompanyFields,
  useCompanyList,
  useCompanyRegions,
} from "@/features/company/hooks/use-company-list";
import {
  useCompanyContacts,
  useCompanyDeals,
  useCompanyDetail,
} from "@/features/company/hooks/use-company-detail";
import { useExportCompaniesMutation } from "@/features/company/hooks/use-company-mutations";
import type { CompanyListItem, CompanySort } from "@/features/company/types/company";
import { getApiErrorMessage, type ApiBlobResponse } from "@/lib/api-client";
import { cn } from "@/utils/cn";
import { formatDateWithOptions } from "@/utils/format";

type CompanyListScreenProps = {
  readonly initialCreateOpen?: boolean;
  readonly onCreateDialogClose?: () => void;
};

export function CompanyListScreen({
  initialCreateOpen = false,
  onCreateDialogClose,
}: CompanyListScreenProps) {
  const navigate = useNavigate();
  const { user } = useAuthSession();
  const [companyNameText, setCompanyNameText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyFieldId, setCompanyFieldId] = useState("");
  const [companyRegionId, setCompanyRegionId] = useState("");
  const [sort, setSort] = useState<CompanySort>("createdAtDesc");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [taxonomyDialog, setTaxonomyDialog] = useState<
    { readonly kind: "field" | "region" } | null
  >(null);
  const [pendingFieldName, setPendingFieldName] = useState("");
  const [pendingRegionName, setPendingRegionName] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const listParams = useMemo(
    () => ({
      page,
      companyName: companyName || undefined,
      companyFieldId: companyFieldId || undefined,
      companyRegionId: companyRegionId || undefined,
      sort,
    }),
    [companyFieldId, companyName, companyRegionId, page, sort]
  );
  const exportFilters = useMemo(
    () => ({
      companyName: companyName || undefined,
      companyFieldId: companyFieldId || undefined,
      companyRegionId: companyRegionId || undefined,
      sort,
    }),
    [companyFieldId, companyName, companyRegionId, sort]
  );

  const companiesQuery = useCompanyList(listParams);
  const fieldsQuery = useCompanyFields();
  const regionsQuery = useCompanyRegions();
  const exportCompaniesMutation = useExportCompaniesMutation();

  const fields = useMemo(() => fieldsQuery.data?.items ?? [], [fieldsQuery.data]);
  const regions = useMemo(() => regionsQuery.data?.items ?? [], [regionsQuery.data]);
  const companyList = companiesQuery.data;
  const displayTimeZone = user?.timeZone ?? getBrowserTimeZoneFallback();
  const hasSearch =
    companyName.length > 0 ||
    companyFieldId.length > 0 ||
    companyRegionId.length > 0 ||
    sort !== "createdAtDesc";

  useEffect(() => {
    if (initialCreateOpen) setIsCreateOpen(true);
  }, [initialCreateOpen]);

  useEffect(() => {
    const items = companyList?.items ?? [];
    if (selectedCompanyId && !items.some((company) => company.id === selectedCompanyId)) {
      setSelectedCompanyId("");
    }
  }, [companyList?.items, selectedCompanyId]);

  useEffect(() => {
    if (!pendingFieldName) return;
    const matched = fields.find((f) => f.field === pendingFieldName);
    if (matched) { setCompanyFieldId(matched.id); setPage(1); setPendingFieldName(""); }
  }, [fields, pendingFieldName]);

  useEffect(() => {
    if (!pendingRegionName) return;
    const matched = regions.find((r) => r.region === pendingRegionName);
    if (matched) { setCompanyRegionId(matched.id); setPage(1); setPendingRegionName(""); }
  }, [regions, pendingRegionName]);

  useEffect(() => {
    if (companyFieldId && !fields.some((f) => f.id === companyFieldId)) {
      setCompanyFieldId(""); setPage(1);
    }
  }, [companyFieldId, fields]);

  useEffect(() => {
    if (companyRegionId && !regions.some((r) => r.id === companyRegionId)) {
      setCompanyRegionId(""); setPage(1);
    }
  }, [companyRegionId, regions]);

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
    <section className="flex flex-1 flex-col overflow-hidden bg-[#FAFAF8]">
      <PageHeader
        breadcrumbs={[{ label: "회사", icon: Building2 }]}
        actions={[
          {
            icon: Plus,
            tooltip: "회사 추가",
            onClick: () => void navigate("/companies/new"),
            disabled: fieldsQuery.isLoading || regionsQuery.isLoading,
            variant: "primary",
          },
          {
            icon: Download,
            tooltip: "파일로 내보내기",
            onClick: () => void onExport(),
            disabled: exportCompaniesMutation.isPending,
          },
        ]}
      />

      {/* 검색 + 필터 툴바 */}
      <div className="flex h-10 shrink-0 items-center gap-2 px-5">
        <form className="flex h-8 items-center gap-1.5 rounded-md border border-[#E2E5EC] bg-[#FAFAF8] px-3 transition focus-within:border-[#93C5FD] focus-within:bg-white" onSubmit={onSearchSubmit}>
          <Search className="h-3 w-3 shrink-0 text-[#9CA3AF]" />
          <input
            className="w-[220px] bg-transparent text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            onChange={(e) => setCompanyNameText(e.target.value)}
            placeholder="회사명 검색"
            value={companyNameText}
          />
        </form>
        <FilterChip
          active={!hasSearch}
          label="전체"
          onClick={() => {
            setCompanyName(""); setCompanyNameText("");
            setCompanyFieldId(""); setCompanyRegionId(""); setSort("createdAtDesc"); setPage(1);
          }}
        />
        <select
          className={cn(
            "h-8 min-w-[118px] appearance-none rounded-md border px-3 text-[13px] outline-none transition",
            companyFieldId
              ? "border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]"
              : "border-[#E2E5EC] bg-transparent text-[#6B7280] hover:bg-[#FAFAF8]"
          )}
          onChange={(e) => {
            const v = e.target.value;
            if (v === ADD_TAXONOMY_VALUE) { setTaxonomyDialog({ kind: "field" }); return; }
            setCompanyFieldId(v); setPage(1);
          }}
          value={companyFieldId}
        >
          <option value="">분야</option>
          <option value={ADD_TAXONOMY_VALUE}>+ 추가</option>
          {fields.map((f) => <option key={f.id} value={f.id}>{f.field}</option>)}
        </select>
        <select
          className={cn(
            "h-8 min-w-[118px] appearance-none rounded-md border px-3 text-[13px] outline-none transition",
            companyRegionId
              ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]"
              : "border-[#E2E5EC] bg-transparent text-[#6B7280] hover:bg-[#FAFAF8]"
          )}
          onChange={(e) => {
            const v = e.target.value;
            if (v === ADD_TAXONOMY_VALUE) { setTaxonomyDialog({ kind: "region" }); return; }
            setCompanyRegionId(v); setPage(1);
          }}
          value={companyRegionId}
        >
          <option value="">지역</option>
          <option value={ADD_TAXONOMY_VALUE}>+ 추가</option>
          {regions.map((r) => <option key={r.id} value={r.id}>{r.region}</option>)}
        </select>
        <select
          className={cn(
            "h-8 min-w-[132px] appearance-none rounded-md border px-3 text-[13px] outline-none transition",
            sort !== "createdAtDesc"
              ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
              : "border-[#E2E5EC] bg-transparent text-[#6B7280] hover:bg-[#FAFAF8]"
          )}
          onChange={(e) => {
            setSort(e.target.value as CompanySort);
            setPage(1);
          }}
          value={sort}
        >
          <option value="createdAtDesc">최신순</option>
          <option value="contactCountDesc">담당자 높은순</option>
          <option value="contactCountAsc">담당자 낮은순</option>
          <option value="dealCountDesc">딜 높은순</option>
          <option value="dealCountAsc">딜 낮은순</option>
        </select>
        <div className="flex-1" />
        <span className="text-[12px] text-[#9CA3AF]">{companyList?.totalCount ?? 0}개</span>
      </div>

      {/* 알림 */}
      {notice || exportCompaniesMutation.error ? (
        <div className="px-5 pt-2">
          {notice ? <Toast message={notice} onClose={() => setNotice(null)} variant="success" /> : null}
          {exportCompaniesMutation.error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
            {getApiErrorMessage(exportCompaniesMutation.error)}
          </p>
          ) : null}
        </div>
      ) : null}

      {/* 테이블 + 미리보기 */}
      <div className="flex min-h-0 flex-1 gap-5 overflow-hidden px-5 pb-3 pt-1">
        <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-hidden">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[#E2E5EC] bg-white shadow-sm">
            <div className="flex h-11 shrink-0 items-center border-b border-[#E2E5EC] bg-[#F9FAFB] px-6">
              <div className="w-[260px] shrink-0 text-[12px] font-semibold text-[#64748B]">회사명</div>
              <div className="w-[150px] shrink-0 text-[12px] font-semibold text-[#64748B]">분야</div>
              <div className="w-[130px] shrink-0 text-[12px] font-semibold text-[#64748B]">지역</div>
              <div className="w-[80px] shrink-0 text-right text-[12px] font-semibold text-[#64748B]">담당자 수</div>
              <div className="w-[72px] shrink-0 text-right text-[12px] font-semibold text-[#64748B]">딜 수</div>
              <div className="w-[128px] shrink-0 text-right text-[12px] font-semibold text-[#64748B]">등록일</div>
              <div className="min-w-0 flex-1" />
            </div>

            {companiesQuery.isLoading ? (
              <CompanyListSkeleton />
            ) : companiesQuery.isError ? (
              <CompanyListError error={companiesQuery.error} onRetry={() => void companiesQuery.refetch()} />
            ) : !companyList || companyList.items.length === 0 ? (
              <CompanyEmptyState hasSearch={hasSearch} onCreate={() => setIsCreateOpen(true)} />
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto">
                {companyList.items.map((company) => (
                  <CompanyRow
                    company={company}
                    displayTimeZone={displayTimeZone}
                    isActive={company.id === selectedCompanyId}
                    key={company.id}
                    onSelect={setSelectedCompanyId}
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

        {selectedCompanyId ? (
          <div className="flex w-[380px] shrink-0 flex-col overflow-hidden rounded-lg border border-[#E5EAF0] bg-white">
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-[#E6EAF0] px-4">
              <div className="flex items-center gap-2">
                <button
                  aria-label="미리보기 닫기"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#E2E5EC] text-[#64748B] transition hover:bg-[#F8FAFC] hover:text-[#111827]"
                  onClick={() => setSelectedCompanyId("")}
                  title="닫기"
                  type="button"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
                <span className="text-[12px] font-medium text-[#6B7280]">미리보기</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Link
                  className="inline-flex h-7 items-center rounded-md border border-[#E2E5EC] bg-white px-2.5 text-[12px] font-medium text-[#374151] transition hover:bg-[#F5F6F8]"
                  to={`/companies/${selectedCompanyId}`}
                >
                  상세보기
                </Link>
              </div>
            </div>
            <CompanyPreviewPanel companyId={selectedCompanyId} />
          </div>
        ) : null}
      </div>

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
          else if (taxonomyDialog?.kind === "region") setPendingRegionName(name);
        }}
        onOpenChange={(isOpen) => { if (!isOpen) setTaxonomyDialog(null); }}
        open={taxonomyDialog !== null}
      />
    </section>
  );
}

function CompanyRow({
  company,
  displayTimeZone,
  isActive,
  onSelect,
}: {
  readonly company: CompanyListItem;
  readonly displayTimeZone: string;
  readonly isActive: boolean;
  readonly onSelect: (companyId: string) => void;
}) {
  return (
    <button
      className={cn(
        "group flex h-[66px] w-full cursor-pointer items-center border-b border-[#E2E5EC] px-6 text-left transition-colors last:border-b-0 hover:bg-[#FFFBEB]",
        isActive ? "bg-[#FFFBEB]" : "bg-white"
      )}
      onClick={() => onSelect(company.id)}
      type="button"
    >
      <div className="w-[260px] min-w-0 shrink-0">
        <span className="block truncate text-[13px] font-semibold text-[#111827]">
          {company.companyName}
        </span>
      </div>
      <div className="w-[150px] min-w-0 shrink-0">
        <span
          className="inline-flex h-[22px] max-w-full min-w-0 items-center overflow-hidden rounded-full bg-[#FFFBEB] px-2.5 text-[11px] font-semibold text-[#B45309]"
          title={company.companyField.field}
        >
          <span className="min-w-0 truncate whitespace-nowrap">{company.companyField.field}</span>
        </span>
      </div>
      <div className="w-[130px] min-w-0 shrink-0">
        <span
          className="inline-flex h-[22px] max-w-full min-w-0 items-center overflow-hidden rounded-full bg-[#ECFDF5] px-2.5 text-[11px] font-semibold text-[#047857]"
          title={company.companyRegion.region}
        >
          <span className="min-w-0 truncate whitespace-nowrap">{company.companyRegion.region}</span>
        </span>
      </div>
      <div className="w-[80px] shrink-0 text-right text-[12px] font-medium text-[#475569]">
        {company.contactCount.toLocaleString("ko-KR")}명
      </div>
      <div className="w-[72px] shrink-0 text-right text-[12px] font-medium text-[#475569]">
        {company.dealCount.toLocaleString("ko-KR")}건
      </div>
      <div
        className="w-[128px] shrink-0 text-right text-[12px] font-medium text-[#64748B]"
        title={formatCompanyCreatedAt(company.createdAt, displayTimeZone)}
      >
        {formatCompanyCreatedAt(company.createdAt, displayTimeZone)}
      </div>
      <div className="min-w-0 flex-1" />
    </button>
  );
}

function CompanyPreviewPanel({ companyId }: { readonly companyId: string }) {
  const companyQuery = useCompanyDetail(companyId);
  const contactsQuery = useCompanyContacts(companyId);
  const dealsQuery = useCompanyDeals(companyId);
  const company = companyQuery.data;
  const contacts = contactsQuery.data?.items ?? [];
  const deals = dealsQuery.data?.items ?? [];

  if (companyQuery.isLoading) {
    return <CompanyPreviewSkeleton />;
  }

  if (companyQuery.isError || !company) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-center text-[13px] text-red-500">
        회사 정보를 불러오지 못했습니다.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F8FAFC] text-[#475569]">
          <Building2 className="h-5 w-5" strokeWidth={1.7} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[16px] font-semibold text-[#111827]">
            {company.companyName}
          </h2>
          <div className="mt-2 flex min-w-0 flex-wrap gap-1.5">
            <InfoPill icon={BriefcaseBusiness} tone="amber">
              {company.companyField.field}
            </InfoPill>
            <InfoPill icon={MapPin} tone="green">
              {company.companyRegion.region}
            </InfoPill>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <PreviewMetric label="담당자" value={`${contacts.length.toLocaleString("ko-KR")}명`} />
        <PreviewMetric label="딜" value={`${deals.length.toLocaleString("ko-KR")}건`} />
      </div>

      <PreviewSection icon={IdCard} title="담당자">
        {contactsQuery.isLoading ? (
          <PreviewMutedText>불러오는 중</PreviewMutedText>
        ) : contacts.length === 0 ? (
          <PreviewMutedText>연결된 담당자가 없습니다.</PreviewMutedText>
        ) : (
          contacts.slice(0, 4).map((contact) => (
            <Link
              className="flex min-w-0 items-center justify-between gap-3 rounded-md px-2 py-2 transition hover:bg-[#F9FAFB]"
              key={contact.id}
              to={`/contacts/${contact.id}`}
            >
              <span className="min-w-0 truncate text-[13px] font-medium text-[#111827]">
                {contact.username}
              </span>
              <span className="shrink-0 text-[12px] text-[#64748B]">
                {contact.contactDepartment.departmentName}
              </span>
            </Link>
          ))
        )}
      </PreviewSection>

      <PreviewSection icon={BriefcaseBusiness} title="딜">
        {dealsQuery.isLoading ? (
          <PreviewMutedText>불러오는 중</PreviewMutedText>
        ) : deals.length === 0 ? (
          <PreviewMutedText>연결된 딜이 없습니다.</PreviewMutedText>
        ) : (
          deals.slice(0, 4).map((deal) => (
            <Link
              className="flex min-w-0 items-center justify-between gap-3 rounded-md px-2 py-2 transition hover:bg-[#F9FAFB]"
              key={deal.id}
              to={`/deals/${deal.id}`}
            >
              <span className="min-w-0 truncate text-[13px] font-medium text-[#111827]">
                {deal.dealName}
              </span>
              <span className="shrink-0 text-[12px] font-semibold text-[#B45309]">
                {deal.dealCost.toLocaleString("ko-KR")}원
              </span>
            </Link>
          ))
        )}
      </PreviewSection>
    </div>
  );
}

function FilterChip({ active, label, onClick }: {
  readonly active: boolean;
  readonly label: string;
  readonly onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "inline-flex h-8 items-center rounded-[6px] border px-3 text-[13px] transition",
        active
          ? "border-[#C7D7FE] bg-[#EAF2FF] font-bold text-[#1D4ED8]"
          : "border-[#E6EAF0] bg-white font-medium text-[#475569] hover:bg-[#F9FAFB]"
      )}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function CompanyEmptyState({ hasSearch, onCreate }: {
  readonly hasSearch: boolean;
  readonly onCreate: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#E2E5EC] bg-[#FAFAF8]">
        <Building2 className="h-5 w-5 text-[#9CA3AF]" strokeWidth={1.5} />
      </div>
      <p className="mt-4 text-[14px] font-semibold text-[#111827]">
        {hasSearch ? "조건에 맞는 회사가 없습니다" : "등록된 회사가 없습니다"}
      </p>
      <p className="mt-1 text-[13px] text-[#9CA3AF]">고객사를 추가하고 딜과 연결해보세요</p>
      <button
        className="mt-5 inline-flex h-8 items-center gap-1.5 rounded-md bg-[#047857] px-3.5 text-[13px] font-medium text-white transition hover:bg-[#065F46]"
        onClick={onCreate}
        type="button"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
        회사 추가
      </button>
    </div>
  );
}

function CompanyListError({ error, onRetry }: {
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
        <div key={i} className="h-[66px] animate-pulse border-b border-[#E2E5EC] bg-[#F9FAFB] last:border-b-0" />
      ))}
    </div>
  );
}

function InfoPill({
  children,
  icon: Icon,
  tone,
}: {
  readonly children: string;
  readonly icon: LucideIcon;
  readonly tone: "amber" | "green";
}) {
  const toneClass = tone === "amber"
    ? "bg-[#FFFBEB] text-[#B45309]"
    : "bg-[#ECFDF5] text-[#047857]";

  return (
    <span
      className={cn(
        "inline-flex h-6 max-w-full min-w-0 items-center gap-1 overflow-hidden rounded-full px-2.5 text-[11px] font-semibold",
        toneClass
      )}
      title={children}
    >
      <Icon className="h-3 w-3 shrink-0" strokeWidth={1.8} />
      <span className="min-w-0 truncate whitespace-nowrap">{children}</span>
    </span>
  );
}

function PreviewMetric({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="rounded-md border border-[#E6EAF0] bg-[#FAFBFC] px-3 py-2.5">
      <p className="text-[11px] font-medium text-[#94A3B8]">{label}</p>
      <p className="mt-0.5 truncate text-[15px] font-semibold text-[#111827]">{value}</p>
    </div>
  );
}

function PreviewSection({
  children,
  icon: Icon,
  title,
}: {
  readonly children: ReactNode;
  readonly icon: LucideIcon;
  readonly title: string;
}) {
  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-[#475569]">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
        {title}
      </div>
      <div className="divide-y divide-[#EEF2F7] rounded-md border border-[#E6EAF0] bg-white">
        {children}
      </div>
    </div>
  );
}

function PreviewMutedText({ children }: { readonly children: string }) {
  return <p className="px-3 py-3 text-[12px] text-[#94A3B8]">{children}</p>;
}

function CompanyPreviewSkeleton() {
  return (
    <div className="flex-1 space-y-4 overflow-hidden px-4 py-4">
      <div className="flex gap-3">
        <div className="h-10 w-10 animate-pulse rounded-lg bg-[#EEF2F7]" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-36 animate-pulse rounded bg-[#EEF2F7]" />
          <div className="h-5 w-44 animate-pulse rounded-full bg-[#EEF2F7]" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="h-16 animate-pulse rounded-md bg-[#EEF2F7]" />
        <div className="h-16 animate-pulse rounded-md bg-[#EEF2F7]" />
      </div>
      <div className="h-36 animate-pulse rounded-md bg-[#EEF2F7]" />
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

const ADD_TAXONOMY_VALUE = "__add_taxonomy__";
