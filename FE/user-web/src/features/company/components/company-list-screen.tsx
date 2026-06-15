import {
  Building2,
  Download,
  Layers3,
  MapPin,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pagination } from "@/components/ui/pagination";
import { CompanyCreateDialog } from "@/features/company/components/company-create-dialog";
import {
  useCompanyFields,
  useCompanyList,
  useCompanyRegions,
} from "@/features/company/hooks/use-company-list";
import {
  useCreateCompanyFieldMutation,
  useCreateCompanyRegionMutation,
  useDeleteCompanyFieldMutation,
  useDeleteCompanyRegionMutation,
  useExportCompaniesMutation,
} from "@/features/company/hooks/use-company-mutations";
import type {
  CompanyField,
  CompanyListItem,
  CompanyRegion,
} from "@/features/company/types/company";
import {
  ApiClientError,
  getApiErrorMessage,
  type ApiBlobResponse,
} from "@/lib/api-client";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format";

// 기능 : 회사 목록, 검색 필터, 분야/지역 관리, 엑셀 내보내기 화면을 렌더링합니다.
export function CompanyListScreen() {
  const [companyNameText, setCompanyNameText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyFieldId, setCompanyFieldId] = useState("");
  const [companyRegionId, setCompanyRegionId] = useState("");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
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
  const companyList = companiesQuery.data;
  const fields = fieldsQuery.data?.items ?? [];
  const regions = regionsQuery.data?.items ?? [];
  const taxonomyError = fieldsQuery.error ?? regionsQuery.error ?? null;
  const hasSearch =
    companyName.length > 0 ||
    companyFieldId.length > 0 ||
    companyRegionId.length > 0;

  // 기능 : 회사명 검색어를 확정하고 첫 페이지로 이동합니다.
  const onSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCompanyName(companyNameText.trim());
    setPage(1);
  };

  // 기능 : 모든 회사 목록 필터를 초기화합니다.
  const onResetFilters = () => {
    setCompanyName("");
    setCompanyNameText("");
    setCompanyFieldId("");
    setCompanyRegionId("");
    setPage(1);
  };

  // 기능 : 현재 필터 기준으로 회사 목록 엑셀 파일을 내려받습니다.
  const onExport = async () => {
    const file = await exportCompaniesMutation.mutateAsync(exportFilters);

    downloadBlobFile(file, "companies.xlsx");
  };

  return (
    <section className="flex flex-col gap-0 px-6 py-5">
      <form
        className="mb-3 flex min-h-10 shrink-0 flex-wrap items-center gap-2"
        onSubmit={onSearchSubmit}
      >
        <button
          className={cn(
            "inline-flex h-[30px] items-center rounded-[7px] px-3 text-[12px] font-bold transition-colors",
            !hasSearch
              ? "border border-[#C7D7FE] bg-[#EAF2FF] text-[#1D4ED8]"
              : "border border-[#E6EAF0] bg-white text-[#475569] hover:bg-gray-50"
          )}
          onClick={onResetFilters}
          type="button"
        >
          전체
        </button>
        <div className="relative w-full sm:w-[220px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />
          <input
            className="h-[30px] w-full rounded-[7px] border border-[#E6EAF0] bg-white pl-8 pr-3 text-[12px] font-medium text-[#334155] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#C7D7FE]"
            onChange={(event) => setCompanyNameText(event.target.value)}
            placeholder="회사명 검색"
            value={companyNameText}
          />
        </div>
        <select
          className={cn(
            "inline-flex h-[30px] cursor-pointer appearance-none items-center rounded-[7px] border border-[#E6EAF0] bg-white pl-3 pr-7 text-[12px] font-medium text-[#475569] outline-none transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60",
            companyFieldId && "border-[#C7D7FE] bg-[#EAF2FF] text-[#1D4ED8]"
          )}
          disabled={fieldsQuery.isLoading}
          onChange={(event) => {
            setCompanyFieldId(event.target.value);
            setPage(1);
          }}
          value={companyFieldId}
        >
          <option value="">전체 분야</option>
          {fields.map((field) => (
            <option key={field.id} value={field.id}>
              {field.field}
            </option>
          ))}
        </select>
        <select
          className={cn(
            "inline-flex h-[30px] cursor-pointer appearance-none items-center rounded-[7px] border border-[#E6EAF0] bg-white pl-3 pr-7 text-[12px] font-medium text-[#475569] outline-none transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60",
            companyRegionId && "border-[#C7D7FE] bg-[#EAF2FF] text-[#1D4ED8]"
          )}
          disabled={regionsQuery.isLoading}
          onChange={(event) => {
            setCompanyRegionId(event.target.value);
            setPage(1);
          }}
          value={companyRegionId}
        >
          <option value="">전체 지역</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.region}
            </option>
          ))}
        </select>
        <button
          className="inline-flex h-[30px] items-center gap-1.5 rounded-[7px] border border-[#E6EAF0] bg-white px-3 text-[12px] font-bold text-[#475569] transition-colors hover:bg-gray-50"
          type="submit"
        >
          <Search className="h-3.5 w-3.5" />
          검색
        </button>
        <div className="hidden flex-1 md:block" />
        <span className="text-[12px] font-semibold text-[#64748B]">
          {exportCompaniesMutation.isPending
            ? "내보내는 중..."
            : `${companyList?.totalCount ?? 0}개`}
        </span>
        <button
          className="inline-flex h-[30px] items-center gap-1.5 rounded-[7px] border border-[#E6EAF0] bg-white px-3 text-[12px] font-bold text-[#475569] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={exportCompaniesMutation.isPending}
          onClick={() => void onExport()}
          type="button"
        >
          <Download className="h-3.5 w-3.5" />
          내보내기
        </button>
        <button
          className="inline-flex h-[30px] items-center gap-1.5 rounded-[7px] bg-[#1D4ED8] px-3 text-[12px] font-bold text-white transition-colors hover:bg-[#1E40AF] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={fieldsQuery.isLoading || regionsQuery.isLoading}
          onClick={() => setIsCreateOpen(true)}
          type="button"
        >
          <Plus className="h-3.5 w-3.5" />
          회사 추가
        </button>
      </form>

      {notice ? (
        <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
          {notice}
        </div>
      ) : null}

      {exportCompaniesMutation.error ? (
        <p className="mb-3 rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-[#EF4444]">
          {getApiErrorMessage(exportCompaniesMutation.error)}
        </p>
      ) : null}

      {taxonomyError ? (
        <p className="mb-3 rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-[#EF4444]">
          {getApiErrorMessage(taxonomyError)}
        </p>
      ) : null}

      <CompanyTaxonomyManager
        fields={fields}
        isLoading={fieldsQuery.isLoading || regionsQuery.isLoading}
        onNotice={setNotice}
        regions={regions}
      />

      {companiesQuery.isLoading ? (
        <CompanyListSkeleton />
      ) : companiesQuery.isError ? (
        <CompanyListError
          error={companiesQuery.error}
          onRetry={() => void companiesQuery.refetch()}
        />
      ) : !companyList || companyList.items.length === 0 ? (
        <CompanyEmptyState
          hasSearch={hasSearch}
          onCreate={() => setIsCreateOpen(true)}
        />
      ) : (
        <>
          <CompanyListContent companies={companyList.items} />
          {companyList.totalPages > 1 || page > 1 ? (
            <Pagination
              page={companyList.page}
              totalCount={companyList.totalCount}
              totalPages={companyList.totalPages}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}

      <CompanyCreateDialog
        fields={fields}
        onCreated={() => setNotice("회사가 추가되었습니다.")}
        onOpenChange={setIsCreateOpen}
        open={isCreateOpen}
        regions={regions}
      />
    </section>
  );
}

type CompanyTaxonomyManagerProps = {
  readonly fields: CompanyField[];
  readonly regions: CompanyRegion[];
  readonly isLoading: boolean;
  readonly onNotice: (notice: string) => void;
};

// 기능 : 회사 분야와 지역의 생성/삭제 관리를 렌더링합니다.
function CompanyTaxonomyManager({
  fields,
  regions,
  isLoading,
  onNotice,
}: CompanyTaxonomyManagerProps) {
  const [fieldName, setFieldName] = useState("");
  const [regionName, setRegionName] = useState("");
  const createFieldMutation = useCreateCompanyFieldMutation();
  const deleteFieldMutation = useDeleteCompanyFieldMutation();
  const createRegionMutation = useCreateCompanyRegionMutation();
  const deleteRegionMutation = useDeleteCompanyRegionMutation();
  const actionError =
    createFieldMutation.error ??
    deleteFieldMutation.error ??
    createRegionMutation.error ??
    deleteRegionMutation.error ??
    null;
  const isMutating =
    createFieldMutation.isPending ||
    deleteFieldMutation.isPending ||
    createRegionMutation.isPending ||
    deleteRegionMutation.isPending;

  // 기능 : 회사 분야를 생성합니다.
  const onFieldSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = fieldName.trim();

    if (!name) {
      return;
    }

    await createFieldMutation.mutateAsync({ field: name });
    setFieldName("");
    onNotice("회사 분야가 추가되었습니다.");
  };

  // 기능 : 회사 지역을 생성합니다.
  const onRegionSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = regionName.trim();

    if (!name) {
      return;
    }

    await createRegionMutation.mutateAsync({ region: name });
    setRegionName("");
    onNotice("회사 지역이 추가되었습니다.");
  };

  // 기능 : 사용 중이지 않은 회사 분야를 삭제합니다.
  const onFieldDelete = async (field: CompanyField) => {
    if (!window.confirm(`${field.field} 분야를 삭제할까요?`)) {
      return;
    }

    await deleteFieldMutation.mutateAsync(field.id);
    onNotice("회사 분야가 삭제되었습니다.");
  };

  // 기능 : 사용 중이지 않은 회사 지역을 삭제합니다.
  const onRegionDelete = async (region: CompanyRegion) => {
    if (!window.confirm(`${region.region} 지역을 삭제할까요?`)) {
      return;
    }

    await deleteRegionMutation.mutateAsync(region.id);
    onNotice("회사 지역이 삭제되었습니다.");
  };

  return (
    <section className="mb-3 grid gap-0 overflow-hidden rounded-lg border border-[#E5EAF0] bg-white lg:grid-cols-2">
      <CompanyTaxonomyColumn
        emptyText="등록된 분야가 없습니다."
        icon={Layers3}
        inputPlaceholder="새 분야"
        isLoading={isLoading}
        isMutating={isMutating}
        items={fields.map((field) => ({
          id: field.id,
          label: field.field,
          onDelete: () => void onFieldDelete(field),
        }))}
        name={fieldName}
        onNameChange={setFieldName}
        onSubmit={onFieldSubmit}
        title="회사 분야"
      />
      <CompanyTaxonomyColumn
        emptyText="등록된 지역이 없습니다."
        icon={MapPin}
        inputPlaceholder="새 지역"
        isLoading={isLoading}
        isMutating={isMutating}
        items={regions.map((region) => ({
          id: region.id,
          label: region.region,
          onDelete: () => void onRegionDelete(region),
        }))}
        name={regionName}
        onNameChange={setRegionName}
        onSubmit={onRegionSubmit}
        title="회사 지역"
      />
      {actionError ? (
        <p className="border-t border-red-100 bg-red-50 px-4 py-2.5 text-sm text-[#EF4444] lg:col-span-2">
          {getCompanyTaxonomyErrorMessage(actionError)}
        </p>
      ) : null}
    </section>
  );
}

type CompanyTaxonomyColumnProps = {
  readonly title: string;
  readonly inputPlaceholder: string;
  readonly emptyText: string;
  readonly icon: typeof Layers3;
  readonly name: string;
  readonly items: Array<{
    readonly id: string;
    readonly label: string;
    readonly onDelete: () => void;
  }>;
  readonly isLoading: boolean;
  readonly isMutating: boolean;
  readonly onNameChange: (value: string) => void;
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

// 기능 : 분야/지역 관리 컬럼을 렌더링합니다.
function CompanyTaxonomyColumn({
  title,
  inputPlaceholder,
  emptyText,
  icon: Icon,
  name,
  items,
  isLoading,
  isMutating,
  onNameChange,
  onSubmit,
}: CompanyTaxonomyColumnProps) {
  return (
    <div className="grid content-start gap-3 border-b border-[#E6EAF0] px-4 py-3 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-[#64748B]" />
        <h2 className="text-[12px] font-bold text-[#334155]">{title}</h2>
      </div>
      <form className="flex gap-2" onSubmit={onSubmit}>
        <input
          className="h-[30px] min-w-0 flex-1 rounded-[7px] border border-[#E6EAF0] px-3 text-[12px] outline-none focus:border-[#C7D7FE]"
          onChange={(event) => onNameChange(event.target.value)}
          placeholder={inputPlaceholder}
          value={name}
        />
        <button
          className="inline-flex h-[30px] items-center rounded-[7px] border border-[#E6EAF0] bg-white px-3 text-[12px] font-bold text-[#475569] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isMutating || name.trim().length === 0}
          type="submit"
        >
          추가
        </button>
      </form>
      <div className="flex min-h-10 flex-wrap gap-2">
        {isLoading ? (
          <span className="text-[12px] text-[#94A3B8]">불러오는 중</span>
        ) : items.length === 0 ? (
          <span className="text-[12px] text-[#94A3B8]">{emptyText}</span>
        ) : (
          items.map((item) => (
            <span
              className="inline-flex h-7 items-center gap-2 rounded-md border border-[#E6EAF0] bg-[#FAFBFC] px-2 text-[12px] text-[#475569]"
              key={item.id}
            >
              <span className="max-w-52 truncate">{item.label}</span>
              <button
                aria-label={`${item.label} 삭제`}
                className="grid h-5 w-5 place-items-center rounded text-[#94A3B8] hover:bg-white hover:text-[#EF4444] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isMutating}
                onClick={item.onDelete}
                type="button"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}

type CompanyListContentProps = {
  readonly companies: CompanyListItem[];
};

// 기능 : 회사 목록 테이블과 모바일 카드를 렌더링합니다.
function CompanyListContent({ companies }: CompanyListContentProps) {
  return (
    <>
      <div className="hidden flex-col overflow-hidden rounded-lg border border-[#E5EAF0] bg-white md:flex">
        <div
          className="flex shrink-0 items-center border-b border-[#E6EAF0] bg-[#FAFBFC] px-6"
          style={{ height: 44 }}
        >
          <CompanyHeaderCell width={260}>회사명</CompanyHeaderCell>
          <CompanyHeaderCell width={140}>분야</CompanyHeaderCell>
          <CompanyHeaderCell width={130}>지역</CompanyHeaderCell>
          <CompanyHeaderCell width={90}>거래처</CompanyHeaderCell>
          <CompanyHeaderCell width={90}>딜 수</CompanyHeaderCell>
          <CompanyHeaderCell flex>등록일</CompanyHeaderCell>
        </div>
        {companies.map((company) => (
          <Link
            className="flex items-center border-b border-[#E8EDF3] px-6 transition-colors hover:bg-[#F9FAFB] last:border-b-0"
            key={company.id}
            style={{ height: 62 }}
            to={`/companies/${company.id}`}
          >
            <div className="min-w-0 shrink-0" style={{ width: 260 }}>
              <span className="block truncate text-[13px] font-semibold text-[#111827]">
                {company.companyName}
              </span>
            </div>
            <div className="shrink-0" style={{ width: 140 }}>
              <span className="inline-flex h-6 max-w-[120px] items-center rounded-full bg-[#DBEAFE] px-2.5 text-[11px] font-medium text-[#2568D8]">
                <span className="truncate">{company.companyField.field}</span>
              </span>
            </div>
            <div className="shrink-0" style={{ width: 130 }}>
              <span className="inline-flex h-6 max-w-[110px] items-center rounded-md bg-[#D1FAE5] px-2.5 text-[11px] font-medium text-[#065F46]">
                <span className="truncate">{company.companyRegion.region}</span>
              </span>
            </div>
            <div className="shrink-0" style={{ width: 90 }}>
              <span className="text-[12px] font-semibold text-[#374151]">
                {company.contactCount.toLocaleString("ko-KR")}
              </span>
            </div>
            <div className="shrink-0" style={{ width: 90 }}>
              <span className="text-[12px] font-semibold text-[#374151]">
                {company.dealCount.toLocaleString("ko-KR")}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[12px] text-[#374151]">
                {formatDate(company.createdAt, { year: "numeric" })}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-3 md:hidden">
        {companies.map((company) => (
          <Link
            className="block rounded-lg border border-[#E5EAF0] bg-white p-4 transition-colors hover:bg-[#F9FAFB]"
            key={company.id}
            to={`/companies/${company.id}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="block truncate text-[15px] font-semibold text-[#111827]">
                  {company.companyName}
                </p>
                <p className="mt-1 text-[12px] text-[#64748B]">
                  {[company.companyField.field, company.companyRegion.region].join(
                    " · "
                  )}
                </p>
              </div>
              <Building2 className="h-5 w-5 shrink-0 text-[#94A3B8]" />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <Field label="거래처" value={String(company.contactCount)} />
              <Field label="딜" value={String(company.dealCount)} />
              <Field
                label="등록일"
                value={formatDate(company.createdAt, { year: "numeric" })}
              />
            </dl>
          </Link>
        ))}
      </div>
    </>
  );
}

function CompanyHeaderCell({
  children,
  width,
  flex = false,
}: {
  readonly children: string;
  readonly width?: number;
  readonly flex?: boolean;
}) {
  return (
    <div
      className={cn("shrink-0 text-[12px] font-bold text-[#334155]", flex && "min-w-0 flex-1")}
      style={width ? { width } : undefined}
    >
      {children}
    </div>
  );
}

// 기능 : 회사 목록 로딩 상태를 렌더링합니다.
function CompanyListSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-[#E5EAF0] bg-white">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          className="animate-pulse border-b border-[#E8EDF3] bg-[#FAFBFC] last:border-b-0"
          key={index}
          style={{ height: 62 }}
        />
      ))}
    </div>
  );
}

// 기능 : 회사 목록 조회 실패 상태를 렌더링합니다.
function CompanyListError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="rounded-lg border border-[#E5EAF0] bg-white px-6 py-10 text-center">
      <p className="text-[13px] font-medium text-[#EF4444]">
        {getApiErrorMessage(error)}
      </p>
      <button
        className="mt-3 inline-flex h-8 items-center rounded-lg border border-[#E5E7EB] px-3 text-[13px] text-[#374151] hover:bg-[#F9FAFB]"
        onClick={onRetry}
        type="button"
      >
        다시 시도
      </button>
    </div>
  );
}

// 기능 : 회사 목록 빈 상태를 렌더링합니다.
function CompanyEmptyState({
  hasSearch,
  onCreate,
}: {
  readonly hasSearch: boolean;
  readonly onCreate: () => void;
}) {
  return (
    <div className="grid place-items-center rounded-lg border border-[#E5EAF0] bg-white px-5 py-16 text-center">
      <Building2 className="h-10 w-10 text-[#D1D5DB]" />
      <p className="mt-4 text-[14px] font-semibold text-[#374151]">
        {hasSearch ? "조건에 맞는 회사가 없습니다." : "등록된 회사가 없습니다."}
      </p>
      <p className="mt-1 text-[13px] text-[#9CA3AF]">
        분야와 지역을 먼저 준비한 뒤 회사를 추가할 수 있습니다.
      </p>
      <button
        className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1D4ED8] px-4 text-[13px] font-semibold text-white hover:bg-[#1E40AF]"
        onClick={onCreate}
        type="button"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
        회사 추가
      </button>
    </div>
  );
}

// 기능 : 모바일 카드의 라벨/값 쌍을 렌더링합니다.
function Field({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-md bg-[#F9FAFB] px-3 py-2">
      <dt className="text-[11px] text-[#94A3B8]">{label}</dt>
      <dd className="mt-1 truncate text-[13px] font-semibold text-[#374151]">{value}</dd>
    </div>
  );
}

// 기능 : Blob 응답을 브라우저 다운로드로 연결합니다.
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

// 기능 : 분야/지역 삭제 불가 오류를 사용자 메시지로 변환합니다.
function getCompanyTaxonomyErrorMessage(error: unknown) {
  if (
    error instanceof ApiClientError &&
    error.statusCode === 409 &&
    error.code === "CompanyFieldInUse"
  ) {
    return "사용 중인 분야는 삭제할 수 없음";
  }

  if (
    error instanceof ApiClientError &&
    error.statusCode === 409 &&
    error.code === "CompanyRegionInUse"
  ) {
    return "사용 중인 지역은 삭제할 수 없음";
  }

  return getApiErrorMessage(error);
}
