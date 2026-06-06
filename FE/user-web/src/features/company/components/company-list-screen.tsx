import { ArchiveRestore, Building2, Plus, Search, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { CompanyCreateDialog } from "@/features/company/components/company-create-dialog";
import { useCompanyList } from "@/features/company/hooks/use-company-list";
import {
  useDeleteCompanyMutation,
  useRestoreCompanyMutation,
} from "@/features/company/hooks/use-company-mutations";
import type { Company } from "@/features/company/types/company";
import { getApiErrorMessage } from "@/lib/api-client";

export function CompanyListScreen() {
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const companiesQuery = useCompanyList({
    page: 1,
    pageSize: 20,
    search: search || undefined,
    includeDeleted,
  });
  const deleteCompanyMutation = useDeleteCompanyMutation();
  const restoreCompanyMutation = useRestoreCompanyMutation();
  const actionError =
    deleteCompanyMutation.error ?? restoreCompanyMutation.error ?? null;
  const companyList = companiesQuery.data;

  const onSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearch(searchText.trim());
  };

  const onDelete = async (company: Company) => {
    if (!window.confirm(`${company.name} 회사를 휴지통으로 이동할까요?`)) {
      return;
    }

    await deleteCompanyMutation.mutateAsync(company.id);
    setNotice("회사가 휴지통으로 이동되었습니다.");
  };

  const onRestore = async (company: Company) => {
    await restoreCompanyMutation.mutateAsync(company.id);
    setNotice("회사가 복구되었습니다.");
  };

  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6">
      <header className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">회사</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            회사 기본 정보와 연결 현황을 관리합니다.
          </p>
        </div>
        <button
          className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          onClick={() => setIsCreateOpen(true)}
          type="button"
        >
          <Plus className="h-4 w-4" />
          회사 추가
        </button>
      </header>

      <form
        className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        onSubmit={onSearchSubmit}
      >
        <div className="relative w-full md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-10 w-full rounded-md border pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="회사명, 분야, 지역 검색"
            value={searchText}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium">
            <input
              checked={includeDeleted}
              className="h-4 w-4 rounded border"
              onChange={(event) => setIncludeDeleted(event.target.checked)}
              type="checkbox"
            />
            삭제 포함
          </label>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-medium hover:bg-muted"
            type="submit"
          >
            <Search className="h-4 w-4" />
            검색
          </button>
        </div>
      </form>

      {notice ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {notice}
        </p>
      ) : null}

      {actionError ? (
        <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
          {getApiErrorMessage(actionError)}
        </p>
      ) : null}

      {companiesQuery.isLoading ? (
        <CompanyListSkeleton />
      ) : companiesQuery.isError ? (
        <CompanyListError
          error={companiesQuery.error}
          onRetry={() => void companiesQuery.refetch()}
        />
      ) : !companyList || companyList.items.length === 0 ? (
        <CompanyEmptyState
          hasSearch={search.length > 0}
          onCreate={() => setIsCreateOpen(true)}
        />
      ) : (
        <CompanyListContent
          companies={companyList.items}
          isMutating={
            deleteCompanyMutation.isPending || restoreCompanyMutation.isPending
          }
          onDelete={onDelete}
          onRestore={onRestore}
        />
      )}

      <CompanyCreateDialog
        onCreated={(company) => setNotice(`${company.name} 회사가 추가되었습니다.`)}
        onOpenChange={setIsCreateOpen}
        open={isCreateOpen}
      />
    </section>
  );
}

type CompanyListContentProps = {
  readonly companies: Company[];
  readonly isMutating: boolean;
  readonly onDelete: (company: Company) => Promise<void>;
  readonly onRestore: (company: Company) => Promise<void>;
};

function CompanyListContent({
  companies,
  isMutating,
  onDelete,
  onRestore,
}: CompanyListContentProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border bg-white md:block">
        <div className="grid grid-cols-[1.4fr_0.9fr_0.9fr_0.6fr_0.6fr_0.8fr_0.9fr_1fr] border-b bg-muted px-4 py-3 text-xs font-medium text-muted-foreground">
          <span>회사명</span>
          <span>분야</span>
          <span>지역</span>
          <span>거래처</span>
          <span>딜</span>
          <span>상태</span>
          <span>최근 수정일</span>
          <span className="text-right">작업</span>
        </div>
        {companies.map((company) => (
          <div
            className="grid grid-cols-[1.4fr_0.9fr_0.9fr_0.6fr_0.6fr_0.8fr_0.9fr_1fr] items-center border-b px-4 py-4 text-sm last:border-b-0 hover:bg-muted/50"
            key={company.id}
          >
            <Link
              className="min-w-0 font-medium text-slate-950 hover:text-primary"
              to={`/companies/${company.id}`}
            >
              <span className="block truncate">{company.name}</span>
            </Link>
            <span className="truncate text-slate-700">
              {company.industry ?? "-"}
            </span>
            <span className="truncate text-slate-700">{company.region ?? "-"}</span>
            <span className="text-slate-700">
              {formatOptionalCount(company.contactCount)}
            </span>
            <span className="text-slate-700">
              {formatOptionalCount(company.dealCount)}
            </span>
            <CompanyStatusBadge company={company} />
            <span className="text-slate-700">{formatDate(company.updatedAt)}</span>
            <CompanyRowActions
              company={company}
              isMutating={isMutating}
              onDelete={onDelete}
              onRestore={onRestore}
            />
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
                  {company.name}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  {[company.industry, company.region].filter(Boolean).join(" · ") ||
                    "-"}
                </p>
              </div>
              <CompanyStatusBadge company={company} />
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">거래처</dt>
                <dd className="mt-1 font-medium">
                  {formatOptionalCount(company.contactCount)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">딜</dt>
                <dd className="mt-1 font-medium">
                  {formatOptionalCount(company.dealCount)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">수정일</dt>
                <dd className="mt-1 font-medium">{formatDate(company.updatedAt)}</dd>
              </div>
            </dl>
            <div className="mt-4 flex justify-end">
              <CompanyRowActions
                company={company}
                isMutating={isMutating}
                onDelete={onDelete}
                onRestore={onRestore}
              />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

type CompanyRowActionsProps = {
  readonly company: Company;
  readonly isMutating: boolean;
  readonly onDelete: (company: Company) => Promise<void>;
  readonly onRestore: (company: Company) => Promise<void>;
};

function CompanyRowActions({
  company,
  isMutating,
  onDelete,
  onRestore,
}: CompanyRowActionsProps) {
  const isDeleted = company.deletedAt !== null;

  return (
    <div className="flex justify-end gap-2">
      {isDeleted ? (
        <button
          className="inline-flex h-9 items-center gap-2 rounded-md border border-emerald-200 px-3 text-sm font-medium text-emerald-800 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isMutating}
          onClick={() => void onRestore(company)}
          type="button"
        >
          <ArchiveRestore className="h-4 w-4" />
          복구
        </button>
      ) : (
        <button
          className="inline-flex h-9 items-center gap-2 rounded-md border border-destructive/30 px-3 text-sm font-medium text-destructive hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isMutating}
          onClick={() => void onDelete(company)}
          type="button"
        >
          <Trash2 className="h-4 w-4" />
          삭제
        </button>
      )}
    </div>
  );
}

function CompanyStatusBadge({ company }: { readonly company: Company }) {
  if (company.deletedAt) {
    return (
      <span className="inline-flex h-7 w-fit items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 text-xs font-medium text-amber-800">
        삭제됨
      </span>
    );
  }

  return (
    <span className="inline-flex h-7 w-fit items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-medium text-emerald-800">
      활성
    </span>
  );
}

function CompanyListSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          className="grid grid-cols-[1.4fr_0.9fr_0.9fr_0.6fr_0.6fr_0.8fr_0.9fr_1fr] gap-4 border-b px-4 py-4 last:border-b-0"
          key={index}
        >
          {Array.from({ length: 8 }, (__, cellIndex) => (
            <div
              className="h-5 animate-pulse rounded bg-muted"
              key={cellIndex}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function CompanyListError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="grid gap-3 rounded-lg border bg-white px-5 py-8 text-center">
      <Building2 className="mx-auto h-8 w-8 text-muted-foreground" />
      <div>
        <h2 className="text-base font-semibold">회사를 불러오지 못했습니다.</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {getApiErrorMessage(error)}
        </p>
      </div>
      <button
        className="mx-auto inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
        onClick={onRetry}
        type="button"
      >
        재시도
      </button>
    </div>
  );
}

function CompanyEmptyState({
  hasSearch,
  onCreate,
}: {
  readonly hasSearch: boolean;
  readonly onCreate: () => void;
}) {
  return (
    <div className="grid gap-3 rounded-lg border bg-white px-5 py-10 text-center">
      <Building2 className="mx-auto h-9 w-9 text-muted-foreground" />
      <div>
        <h2 className="text-base font-semibold">
          {hasSearch ? "검색 결과가 없습니다" : "등록된 회사가 없습니다"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          회사 정보를 추가하면 거래처, 제품, 딜 연결이 쉬워집니다.
        </p>
      </div>
      <button
        className="mx-auto inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        onClick={onCreate}
        type="button"
      >
        <Plus className="h-4 w-4" />
        회사 추가
      </button>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function formatOptionalCount(value: number | undefined) {
  return value === undefined ? "-" : value;
}
