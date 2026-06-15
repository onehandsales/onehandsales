import {
  Building2,
  Download,
  Layers3,
  MapPin,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { Toast } from "@/components/ui/toast";
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
import { formatDate } from "@/utils/format";

type CompanyListScreenProps = {
  readonly initialCreateOpen?: boolean;
  readonly onCreateDialogClose?: () => void;
};

// 기능 : 회사 목록, 검색 필터, 분야/지역 관리, 엑셀 내보내기 화면을 렌더링합니다.
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

  useEffect(() => {
    if (initialCreateOpen) {
      setIsCreateOpen(true);
    }
  }, [initialCreateOpen]);

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
    <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6">
      <PageHeader
        actions={
          <>
            <Button
              disabled={exportCompaniesMutation.isPending}
              isPending={exportCompaniesMutation.isPending}
              onClick={() => void onExport()}
              type="button"
            >
              <Download className="h-4 w-4" />
              목록 내보내기
            </Button>
            <Button
              disabled={fieldsQuery.isLoading || regionsQuery.isLoading}
              onClick={() => void navigate("/companies/new")}
              type="button"
              variant="primary"
            >
              <Plus className="h-4 w-4" />
              회사 추가
            </Button>
          </>
        }
        description="회사 기본 정보, 연결 거래처, 회사 메모를 관리합니다."
        title="회사"
      />

      <form
        className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(160px,220px)_minmax(160px,220px)_auto]"
        onSubmit={onSearchSubmit}
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-10 w-full rounded-md border pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            onChange={(event) => setCompanyNameText(event.target.value)}
            placeholder="회사명 검색"
            value={companyNameText}
          />
        </div>
        <select
          className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
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
          className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
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
        <div className="flex flex-wrap gap-2">
          <Button type="submit">
            <Search className="h-4 w-4" />
            검색
          </Button>
          <Button onClick={onResetFilters} type="button">
            초기화
          </Button>
        </div>
      </form>

      {notice ? (
        <Toast message={notice} onClose={() => setNotice(null)} variant="success" />
      ) : null}

      {exportCompaniesMutation.error ? (
        <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
          {getApiErrorMessage(exportCompaniesMutation.error)}
        </p>
      ) : null}

      {taxonomyError ? (
        <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
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
          <Pagination
            page={companyList.page}
            totalCount={companyList.totalCount}
            totalPages={companyList.totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      <CompanyCreateDialog
        fields={fields}
        onCreated={() => setNotice("회사가 추가되었습니다.")}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            onCreateDialogClose?.();
          }
        }}
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
    <section className="grid gap-4 rounded-lg border bg-white p-4 lg:grid-cols-2">
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
        <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive lg:col-span-2">
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
    <div className="grid content-start gap-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <form className="flex gap-2" onSubmit={onSubmit}>
        <input
          className="h-9 min-w-0 flex-1 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          onChange={(event) => onNameChange(event.target.value)}
          placeholder={inputPlaceholder}
          value={name}
        />
        <Button
          disabled={isMutating || name.trim().length === 0}
          size="sm"
          type="submit"
        >
          추가
        </Button>
      </form>
      <div className="flex min-h-10 flex-wrap gap-2">
        {isLoading ? (
          <span className="text-sm text-muted-foreground">불러오는 중</span>
        ) : items.length === 0 ? (
          <span className="text-sm text-muted-foreground">{emptyText}</span>
        ) : (
          items.map((item) => (
            <span
              className="inline-flex h-8 items-center gap-2 rounded-md border bg-muted px-2 text-sm"
              key={item.id}
            >
              <span className="max-w-52 truncate">{item.label}</span>
              <button
                aria-label={`${item.label} 삭제`}
                className="grid h-5 w-5 place-items-center rounded text-muted-foreground hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
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
      <div className="hidden overflow-hidden rounded-lg border bg-white md:block">
        <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.55fr_0.55fr_0.8fr_0.6fr] border-b bg-muted px-4 py-3 text-xs font-medium text-muted-foreground">
          <span>회사명</span>
          <span>분야</span>
          <span>지역</span>
          <span>거래처</span>
          <span>딜</span>
          <span>등록일</span>
          <span className="text-right">상세</span>
        </div>
        {companies.map((company) => (
          <div
            className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.55fr_0.55fr_0.8fr_0.6fr] items-center border-b px-4 py-4 text-sm last:border-b-0 hover:bg-muted/50"
            key={company.id}
          >
            <Link
              className="min-w-0 font-medium text-slate-950 hover:text-primary"
              to={`/companies/${company.id}`}
            >
              <span className="block truncate">{company.companyName}</span>
            </Link>
            <span className="truncate text-slate-700">
              {company.companyField.field}
            </span>
            <span className="truncate text-slate-700">
              {company.companyRegion.region}
            </span>
            <span className="text-slate-700">{company.contactCount}</span>
            <span className="text-slate-700">{company.dealCount}</span>
            <span className="text-slate-700">
              {formatDate(company.createdAt, { year: "numeric" })}
            </span>
            <Link
              className="justify-self-end rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
              to={`/companies/${company.id}`}
            >
              보기
            </Link>
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:hidden">
        {companies.map((company) => (
          <article className="rounded-lg border bg-white p-4" key={company.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  className="block truncate text-base font-semibold hover:text-primary"
                  to={`/companies/${company.id}`}
                >
                  {company.companyName}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  {[company.companyField.field, company.companyRegion.region].join(
                    " · "
                  )}
                </p>
              </div>
              <Building2 className="h-5 w-5 shrink-0 text-muted-foreground" />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <Field label="거래처" value={String(company.contactCount)} />
              <Field label="딜" value={String(company.dealCount)} />
              <Field
                label="등록일"
                value={formatDate(company.createdAt, { year: "numeric" })}
              />
            </dl>
          </article>
        ))}
      </div>
    </>
  );
}

// 기능 : 회사 목록 로딩 상태를 렌더링합니다.
function CompanyListSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          className="h-16 animate-pulse rounded-lg border bg-muted"
          key={index}
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
    <div className="grid justify-items-start gap-3 rounded-lg border border-destructive/30 bg-red-50 p-5">
      <p className="text-sm font-medium text-destructive">
        {getApiErrorMessage(error)}
      </p>
      <Button onClick={onRetry} size="sm" type="button">
        다시 시도
      </Button>
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
    <div className="grid justify-items-center gap-3 rounded-lg border bg-white px-5 py-12 text-center">
      <Building2 className="h-8 w-8 text-muted-foreground" />
      <div>
        <h2 className="text-base font-semibold">
          {hasSearch ? "조건에 맞는 회사가 없습니다." : "등록된 회사가 없습니다."}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          분야와 지역을 먼저 준비한 뒤 회사를 추가할 수 있습니다.
        </p>
      </div>
      <Button onClick={onCreate} type="button" variant="primary">
        <Plus className="h-4 w-4" />
        회사 추가
      </Button>
    </div>
  );
}

// 기능 : 모바일 카드의 라벨/값 쌍을 렌더링합니다.
function Field({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-md bg-muted px-3 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 truncate font-medium">{value}</dd>
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
