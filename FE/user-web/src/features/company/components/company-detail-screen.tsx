import {
  ArchiveRestore,
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  Package,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { CompanyEditForm } from "@/features/company/components/company-edit-form";
import { CompanyLogSection } from "@/features/company/components/company-log-section";
import { useCompanyDetail } from "@/features/company/hooks/use-company-detail";
import {
  useDeleteCompanyMutation,
  useRestoreCompanyMutation,
} from "@/features/company/hooks/use-company-mutations";
import type { Company, CompanyMemo } from "@/features/company/types/company";
import { ApiClientError, getApiErrorMessage } from "@/lib/api-client";

type CompanyDetailScreenProps = {
  readonly companyId: string;
};

export function CompanyDetailScreen({ companyId }: CompanyDetailScreenProps) {
  const [notice, setNotice] = useState<string | null>(null);
  const companyQuery = useCompanyDetail(companyId);
  const deleteCompanyMutation = useDeleteCompanyMutation();
  const restoreCompanyMutation = useRestoreCompanyMutation();
  const actionError =
    deleteCompanyMutation.error ?? restoreCompanyMutation.error ?? null;

  const onDelete = async (company: Company) => {
    if (!window.confirm(`${company.name} 회사를 휴지통으로 이동할까요?`)) {
      return;
    }

    await deleteCompanyMutation.mutateAsync(company.id);
    setNotice("회사가 휴지통으로 이동되었습니다.");
  };

  const onRestore = async () => {
    const company = await restoreCompanyMutation.mutateAsync(companyId);
    setNotice(`${company.name} 회사가 복구되었습니다.`);
  };

  if (companyQuery.isLoading) {
    return <CompanyDetailSkeleton />;
  }

  if (companyQuery.isError) {
    if (isDeletedResourceReadError(companyQuery.error)) {
      return (
        <DeletedCompanyState
          error={companyQuery.error}
          isRestoring={restoreCompanyMutation.isPending}
          onRestore={onRestore}
        />
      );
    }

    return (
      <CompanyDetailError
        error={companyQuery.error}
        onRetry={() => void companyQuery.refetch()}
      />
    );
  }

  const companyDetail = companyQuery.data;

  if (!companyDetail) {
    return <CompanyDetailSkeleton />;
  }

  const { company, logs, memos, contactCount, dealCount, productCount } =
    companyDetail;

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-5 py-6">
      <header className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
            to="/companies"
          >
            <ArrowLeft className="h-4 w-4" />
            회사 목록
          </Link>
          <h1 className="mt-3 text-2xl font-semibold">{company.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatCompanySubtitle(company)}
          </p>
        </div>
        <button
          className="inline-flex h-10 w-fit items-center gap-2 rounded-md border border-destructive/30 px-4 text-sm font-medium text-destructive hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={deleteCompanyMutation.isPending}
          onClick={() => void onDelete(company)}
          type="button"
        >
          <Trash2 className="h-4 w-4" />
          휴지통 이동
        </button>
      </header>

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

      <ConnectionSummary
        contactCount={contactCount}
        dealCount={dealCount}
        productCount={productCount}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-6">
          <section className="grid gap-4">
            <div>
              <h2 className="text-lg font-semibold">기본 정보</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                회사명, 분야, 지역, 태그를 정리합니다.
              </p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <CompanyEditForm
                company={company}
                onSaved={(updatedCompany) =>
                  setNotice(`${updatedCompany.name} 회사가 저장되었습니다.`)
                }
              />
            </div>
          </section>

          <CompanyLogSection
            companyId={company.id}
            logs={logs}
            onChanged={setNotice}
          />
        </div>

        <aside className="grid content-start gap-6">
          <CompanyTagPanel company={company} />
          <CompanyMemoPanel memos={memos} />
        </aside>
      </div>
    </section>
  );
}

function ConnectionSummary({
  contactCount,
  dealCount,
  productCount,
}: {
  readonly contactCount: number;
  readonly dealCount: number;
  readonly productCount: number;
}) {
  const items = [
    {
      label: "거래처",
      value: contactCount,
      icon: Users,
      className: "border-sky-200 bg-sky-50 text-sky-900",
    },
    {
      label: "딜",
      value: dealCount,
      icon: BriefcaseBusiness,
      className: "border-emerald-200 bg-emerald-50 text-emerald-900",
    },
    {
      label: "제품",
      value: productCount,
      icon: Package,
      className: "border-amber-200 bg-amber-50 text-amber-900",
    },
  ];

  return (
    <section className="grid gap-3 md:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            className={`flex items-center justify-between rounded-lg border px-4 py-3 ${item.className}`}
            key={item.label}
          >
            <div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="mt-1 text-2xl font-semibold">{item.value}</p>
            </div>
            <Icon className="h-5 w-5" />
          </div>
        );
      })}
    </section>
  );
}

function CompanyTagPanel({ company }: { readonly company: Company }) {
  return (
    <section className="grid gap-3">
      <h2 className="text-lg font-semibold">태그</h2>
      <div className="rounded-lg border bg-white p-4">
        {company.tags.length === 0 ? (
          <p className="text-sm text-muted-foreground">등록된 태그가 없습니다.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {company.tags.map((tag) => (
              <span
                className="inline-flex h-8 items-center rounded-full border bg-muted px-3 text-sm font-medium"
                key={tag.id}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CompanyMemoPanel({ memos }: { readonly memos: CompanyMemo[] }) {
  return (
    <section className="grid gap-3">
      <h2 className="text-lg font-semibold">메모 기록</h2>
      <div className="overflow-hidden rounded-lg border bg-white">
        {memos.length === 0 ? (
          <p className="px-4 py-5 text-sm text-muted-foreground">
            등록된 메모가 없습니다.
          </p>
        ) : (
          <div className="divide-y">
            {memos.map((memo) => (
              <article className="grid gap-2 px-4 py-4" key={memo.id}>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(memo.memoDate)}
                </p>
                {memo.title ? (
                  <h3 className="text-sm font-semibold">{memo.title}</h3>
                ) : null}
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {memo.content}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function DeletedCompanyState({
  error,
  isRestoring,
  onRestore,
}: {
  readonly error: unknown;
  readonly isRestoring: boolean;
  readonly onRestore: () => Promise<void>;
}) {
  return (
    <section className="mx-auto grid max-w-3xl gap-4 px-5 py-10 text-center">
      <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />
      <div>
        <h1 className="text-xl font-semibold">삭제된 회사입니다.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {getApiErrorMessage(error)}
        </p>
      </div>
      <div className="flex justify-center gap-2">
        <Link
          className="inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
          to="/companies"
        >
          회사 목록
        </Link>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isRestoring}
          onClick={() => void onRestore()}
          type="button"
        >
          <ArchiveRestore className="h-4 w-4" />
          복구
        </button>
      </div>
    </section>
  );
}

function CompanyDetailError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <section className="mx-auto grid max-w-3xl gap-4 px-5 py-10 text-center">
      <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />
      <div>
        <h1 className="text-xl font-semibold">회사 상세를 불러오지 못했습니다.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
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
    </section>
  );
}

function CompanyDetailSkeleton() {
  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6">
      <div className="grid gap-2 border-b pb-5">
        <div className="h-5 w-28 animate-pulse rounded bg-muted" />
        <div className="h-8 w-56 animate-pulse rounded bg-muted" />
        <div className="h-4 w-80 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div className="h-24 animate-pulse rounded-lg bg-muted" key={index} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
        <div className="h-72 animate-pulse rounded-lg bg-muted" />
      </div>
    </section>
  );
}

function isDeletedResourceReadError(error: unknown) {
  return (
    error instanceof ApiClientError &&
    error.statusCode === 410 &&
    error.isDeletedResource
  );
}

function formatCompanySubtitle(company: Company) {
  return [company.industry, company.region].filter(Boolean).join(" · ") || "-";
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
