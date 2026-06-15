import { Building2, Download, Plus, Search } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Link, useNavigate } from "react-router-dom";
import { Pagination } from "@/components/ui/pagination";
import { Toast } from "@/components/ui/toast";
import { CompanyCreateDialog } from "@/features/company/components/company-create-dialog";
import { CompanyTaxonomyCreateDialog } from "@/features/company/components/company-taxonomy-create-dialog";
import {
  useCompanyFields,
  useCompanyList,
  useCompanyRegions,
} from "@/features/company/hooks/use-company-list";
import { useExportCompaniesMutation } from "@/features/company/hooks/use-company-mutations";
import type { CompanyListItem } from "@/features/company/types/company";
import { getApiErrorMessage, type ApiBlobResponse } from "@/lib/api-client";
import { cn } from "@/utils/cn";

type CompanyListScreenProps = {
  readonly initialCreateOpen?: boolean;
  readonly onCreateDialogClose?: () => void;
};

export function CompanyListScreen({
  initialCreateOpen = false,
  onCreateDialogClose,
}: CompanyListScreenProps) {
  const navigate = useNavigate();
  const [companyNameText, setCompanyNameText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyFieldId, setCompanyFieldId] = useState("");
  const [companyRegionId, setCompanyRegionId] = useState("");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
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
    }),
    [companyFieldId, companyName, companyRegionId, page]
  );
  const exportFilters = useMemo(
    () => ({
      companyName: companyName || undefined,
      companyFieldId: companyFieldId || undefined,
      companyRegionId: companyRegionId || undefined,
    }),
    [companyFieldId, companyName, companyRegionId]
  );

  const companiesQuery = useCompanyList(listParams);
  const fieldsQuery = useCompanyFields();
  const regionsQuery = useCompanyRegions();
  const exportCompaniesMutation = useExportCompaniesMutation();

  const fields = useMemo(() => fieldsQuery.data?.items ?? [], [fieldsQuery.data]);
  const regions = useMemo(() => regionsQuery.data?.items ?? [], [regionsQuery.data]);
  const companyList = companiesQuery.data;
  const hasSearch =
    companyName.length > 0 ||
    companyFieldId.length > 0 ||
    companyRegionId.length > 0;

  useEffect(() => {
    if (initialCreateOpen) setIsCreateOpen(true);
  }, [initialCreateOpen]);

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
    <section className="flex min-h-full flex-col bg-[#FAFAF8]">
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
        <form className="flex h-7 items-center gap-1.5 rounded-md border border-[#E2E5EC] bg-[#FAFAF8] px-2.5 transition focus-within:border-[#93C5FD] focus-within:bg-white" onSubmit={onSearchSubmit}>
          <Search className="h-3 w-3 shrink-0 text-[#9CA3AF]" />
          <input
            className="w-[140px] bg-transparent text-[12px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            onChange={(e) => setCompanyNameText(e.target.value)}
            placeholder="회사 검색"
            value={companyNameText}
          />
        </form>
        <FilterChip
          active={!hasSearch}
          label="전체"
          onClick={() => {
            setCompanyName(""); setCompanyNameText("");
            setCompanyFieldId(""); setCompanyRegionId(""); setPage(1);
          }}
        />
        <select
          className={cn(
            "h-7 appearance-none rounded-md border px-2.5 text-[12px] outline-none transition",
            companyFieldId
              ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
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
          {fields.map((f) => <option key={f.id} value={f.id}>{f.field}</option>)}
          <option value={ADD_TAXONOMY_VALUE}>+ 추가</option>
        </select>
        <select
          className={cn(
            "h-7 appearance-none rounded-md border px-2.5 text-[12px] outline-none transition",
            companyRegionId
              ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
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
          {regions.map((r) => <option key={r.id} value={r.id}>{r.region}</option>)}
          <option value={ADD_TAXONOMY_VALUE}>+ 추가</option>
        </select>
        <div className="flex-1" />
        <span className="text-[12px] text-[#9CA3AF]">{companyList?.totalCount ?? 0}개</span>
      </div>

      {/* 알림 */}
      <div className="px-5 pt-3">
        {notice ? <Toast message={notice} onClose={() => setNotice(null)} variant="success" /> : null}
        {exportCompaniesMutation.error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
            {getApiErrorMessage(exportCompaniesMutation.error)}
          </p>
        ) : null}
      </div>

      {/* 테이블 */}
      <div className="px-5 py-3">
        <div className="overflow-hidden rounded-lg border border-[#E2E5EC] bg-white shadow-sm">
          <div className="flex h-9 shrink-0 items-center border-b border-[#E2E5EC] bg-[#F9FAFB] px-4">
            <div className="w-[220px] shrink-0 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">회사명</div>
            <div className="w-[110px] shrink-0 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">분야</div>
            <div className="w-[90px] shrink-0 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">지역</div>
            <div className="w-[80px] shrink-0 text-center text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">담당자</div>
            <div className="w-[60px] shrink-0 text-center text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">딜</div>
            <div className="min-w-0 flex-1 text-right text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">등록일</div>
          </div>

          {companiesQuery.isLoading ? (
            <CompanyListSkeleton />
          ) : companiesQuery.isError ? (
            <CompanyListError error={companiesQuery.error} onRetry={() => void companiesQuery.refetch()} />
          ) : !companyList || companyList.items.length === 0 ? (
            <CompanyEmptyState hasSearch={hasSearch} onCreate={() => setIsCreateOpen(true)} />
          ) : (
            <div>
              {companyList.items.map((company) => (
                <CompanyRow key={company.id} company={company} />
              ))}
            </div>
          )}
        </div>
      </div>

      {companyList ? (
        <Pagination
          page={companyList.page}
          totalPages={companyList.totalPages}
          onPageChange={setPage}
          className="py-3"
        />
      ) : null}

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

function CompanyRow({ company }: { readonly company: CompanyListItem }) {
  return (
    <div className="group flex h-[52px] items-center border-b border-[#E2E5EC] px-4 last:border-b-0 hover:bg-[#FAFAF8]">
      <div className="w-[220px] shrink-0 min-w-0">
        <Link
          className="block truncate text-[13px] font-medium text-[#111827] hover:text-[#1D4ED8]"
          to={`/companies/${company.id}`}
        >
          {company.companyName}
        </Link>
      </div>
      <div className="w-[110px] shrink-0">
        <span className="text-[12px] text-[#6B7280]">{company.companyField.field}</span>
      </div>
      <div className="w-[90px] shrink-0">
        <span className="text-[12px] text-[#6B7280]">{company.companyRegion.region}</span>
      </div>
      <div className="w-[80px] shrink-0 text-center">
        <span className="text-[12px] text-[#374151]">{company.contactCount}</span>
      </div>
      <div className="w-[60px] shrink-0 text-center">
        <span className="text-[12px] font-semibold text-[#1D4ED8]">{company.dealCount}</span>
      </div>
      <div className="min-w-0 flex-1 text-right">
        <span className="text-[12px] text-[#9CA3AF]">{formatCompactDate(company.createdAt)}</span>
      </div>
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
        "inline-flex h-7 items-center rounded-md px-2.5 text-[12px] font-medium transition",
        active
          ? "bg-[#1D4ED8] text-white"
          : "text-[#6B7280] hover:bg-[#FAFAF8]"
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
        className="mt-5 inline-flex h-8 items-center gap-1.5 rounded-md bg-[#1D4ED8] px-3.5 text-[13px] font-medium text-white transition hover:bg-[#1E40AF]"
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
        <div key={i} className="h-[52px] animate-pulse border-b border-[#E2E5EC] bg-[#F9FAFB] last:border-b-0" />
      ))}
    </div>
  );
}

function formatCompactDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { year: "2-digit", month: "2-digit", day: "2-digit" })
    .format(new Date(value))
    .replace(/\s+/g, "")
    .replace(/\.$/, "");
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

const ADD_TAXONOMY_VALUE = "__add_taxonomy__";
