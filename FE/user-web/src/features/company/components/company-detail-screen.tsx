import {
  ArrowLeft,
  CalendarDays,
  IdCard,
  Layers3,
  MapPin,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Toast } from "@/components/ui/toast";
import { CompanyEditForm } from "@/features/company/components/company-edit-form";
import {
  CompanyMemoLogSection,
  CompanyPrivateMemoLogSection,
} from "@/features/company/components/company-log-section";
import {
  useCompanyContacts,
  useCompanyDetail,
  useCompanyMemoLogs,
  useCompanyPrivateMemoLogs,
} from "@/features/company/hooks/use-company-detail";
import {
  useCompanyFields,
  useCompanyRegions,
} from "@/features/company/hooks/use-company-list";
import type {
  CompanyContact,
  CompanyField,
  CompanyRegion,
} from "@/features/company/types/company";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDateTime } from "@/utils/format";

type CompanyDetailScreenProps = {
  readonly companyId: string;
};

// 기능 : 회사 상세, 연결 거래처, 일반/개인 메모 화면을 렌더링합니다.
export function CompanyDetailScreen({ companyId }: CompanyDetailScreenProps) {
  const [notice, setNotice] = useState<string | null>(null);
  const companyQuery = useCompanyDetail(companyId);
  const contactsQuery = useCompanyContacts(companyId);
  const fieldsQuery = useCompanyFields();
  const regionsQuery = useCompanyRegions();
  const memoLogsQuery = useCompanyMemoLogs(companyId);
  const privateMemoLogsQuery = useCompanyPrivateMemoLogs(companyId);
  const company = companyQuery.data;
  const fields = useMemo(
    () =>
      company
        ? mergeCompanyField(fieldsQuery.data?.items ?? [], company.companyField)
        : (fieldsQuery.data?.items ?? []),
    [company, fieldsQuery.data?.items]
  );
  const regions = useMemo(
    () =>
      company
        ? mergeCompanyRegion(
            regionsQuery.data?.items ?? [],
            company.companyRegion
          )
        : (regionsQuery.data?.items ?? []),
    [company, regionsQuery.data?.items]
  );
  const memoLogs =
    memoLogsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const privateMemoLogs =
    privateMemoLogsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const taxonomyError = fieldsQuery.error ?? regionsQuery.error ?? null;

  if (companyQuery.isLoading) {
    return <CompanyDetailSkeleton />;
  }

  if (companyQuery.isError) {
    return (
      <CompanyDetailError
        error={companyQuery.error}
        onRetry={() => void companyQuery.refetch()}
      />
    );
  }

  if (!company) {
    return <CompanyDetailSkeleton />;
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-5 py-6">
      <PageHeader
        backHref="/companies"
        backLabel="회사 목록"
        description={[company.companyField.field, company.companyRegion.region].join(" · ")}
        title={company.companyName}
      />

      {notice ? (
        <Toast message={notice} onClose={() => setNotice(null)} variant="success" />
      ) : null}

      {taxonomyError ? (
        <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
          {getApiErrorMessage(taxonomyError)}
        </p>
      ) : null}

      <CompanySummary
        contactCount={contactsQuery.data?.items.length ?? 0}
        createdAt={company.createdAt}
        field={company.companyField.field}
        region={company.companyRegion.region}
        updatedAt={company.updatedAt}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid gap-6">
          <section className="grid gap-4">
            <SectionHeader
              description="회사명, 분야, 지역을 수정합니다."
              title="기본 정보"
            />
            <div className="rounded-lg border bg-white p-4">
              <CompanyEditForm
                company={company}
                fields={fields}
                onSaved={() => setNotice("회사 정보가 저장되었습니다.")}
                regions={regions}
              />
            </div>
          </section>

          <CompanyMemoLogSection
            companyId={company.id}
            error={memoLogsQuery.error}
            hasNextPage={Boolean(memoLogsQuery.hasNextPage)}
            isFetchingNextPage={memoLogsQuery.isFetchingNextPage}
            isLoading={memoLogsQuery.isLoading}
            logs={memoLogs}
            onChanged={setNotice}
            onFetchMore={() => void memoLogsQuery.fetchNextPage()}
            onRetry={() => void memoLogsQuery.refetch()}
          />

          <CompanyPrivateMemoLogSection
            companyId={company.id}
            error={privateMemoLogsQuery.error}
            hasNextPage={Boolean(privateMemoLogsQuery.hasNextPage)}
            isFetchingNextPage={privateMemoLogsQuery.isFetchingNextPage}
            isLoading={privateMemoLogsQuery.isLoading}
            logs={privateMemoLogs}
            onChanged={setNotice}
            onFetchMore={() => void privateMemoLogsQuery.fetchNextPage()}
            onRetry={() => void privateMemoLogsQuery.refetch()}
          />
        </div>

        <aside className="grid content-start gap-6">
          <CompanyContactPanel
            contacts={contactsQuery.data?.items ?? []}
            error={contactsQuery.error}
            isLoading={contactsQuery.isLoading}
            onRetry={() => void contactsQuery.refetch()}
          />
        </aside>
      </div>
    </section>
  );
}

type CompanySummaryProps = {
  readonly field: string;
  readonly region: string;
  readonly contactCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

// 기능 : 회사 상세 요약 지표를 렌더링합니다.
function CompanySummary({
  field,
  region,
  contactCount,
  createdAt,
  updatedAt,
}: CompanySummaryProps) {
  const items = [
    {
      label: "분야",
      value: field,
      icon: Layers3,
      className: "border-sky-200 bg-sky-50 text-sky-900",
    },
    {
      label: "지역",
      value: region,
      icon: MapPin,
      className: "border-emerald-200 bg-emerald-50 text-emerald-900",
    },
    {
      label: "거래처",
      value: String(contactCount),
      icon: IdCard,
      className: "border-violet-200 bg-violet-50 text-violet-900",
    },
    {
      label: "수정일",
      value: formatDateTime(updatedAt, { includeYear: true }),
      icon: CalendarDays,
      className: "border-slate-200 bg-slate-50 text-slate-900",
    },
  ];

  return (
    <section className="grid gap-3 md:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            className={`flex items-center justify-between rounded-lg border px-4 py-3 ${item.className}`}
            key={item.label}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="mt-1 truncate text-lg font-semibold">{item.value}</p>
            </div>
            <Icon className="h-5 w-5" />
          </div>
        );
      })}
      <p className="text-xs text-muted-foreground md:col-span-4">
        등록일 {formatDateTime(createdAt, { includeYear: true })}
      </p>
    </section>
  );
}

type CompanyContactPanelProps = {
  readonly contacts: CompanyContact[];
  readonly isLoading: boolean;
  readonly error: unknown;
  readonly onRetry: () => void;
};

// 기능 : 회사에 연결된 거래처 목록을 렌더링합니다.
function CompanyContactPanel({
  contacts,
  isLoading,
  error,
  onRetry,
}: CompanyContactPanelProps) {
  return (
    <section className="grid gap-3">
      <SectionHeader
        description="회사에 연결된 거래처 전체를 표시합니다."
        title="연결 거래처"
      />
      <div className="overflow-hidden rounded-lg border bg-white">
        {isLoading ? (
          <div className="grid gap-2 p-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="h-12 animate-pulse rounded-md bg-muted" key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="grid justify-items-start gap-3 p-4">
            <p className="text-sm text-destructive">
              {getApiErrorMessage(error)}
            </p>
            <Button onClick={onRetry} size="sm" type="button">
              다시 시도
            </Button>
          </div>
        ) : contacts.length === 0 ? (
          <p className="px-4 py-5 text-sm text-muted-foreground">
            연결된 거래처가 없습니다.
          </p>
        ) : (
          <div className="divide-y">
            {contacts.map((contact) => (
              <article className="grid gap-1 px-4 py-3" key={contact.id}>
                <Link
                  className="truncate text-sm font-medium text-slate-950 hover:text-primary"
                  to={`/contacts/${contact.id}`}
                >
                  {contact.username}
                </Link>
                <p className="truncate text-xs text-muted-foreground">
                  {contact.contactDepartment.departmentName}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// 기능 : 회사 상세 조회 실패 상태를 렌더링합니다.
function CompanyDetailError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <section className="mx-auto grid max-w-3xl justify-items-start gap-3 px-5 py-12">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
        to="/companies"
      >
        <ArrowLeft className="h-4 w-4" />
        회사 목록
      </Link>
      <div className="grid justify-items-start gap-3 rounded-lg border border-destructive/30 bg-red-50 p-5">
        <p className="text-sm font-medium text-destructive">
          {getApiErrorMessage(error)}
        </p>
        <Button onClick={onRetry} size="sm" type="button">
          다시 시도
        </Button>
      </div>
    </section>
  );
}

// 기능 : 회사 상세 로딩 상태를 렌더링합니다.
function CompanyDetailSkeleton() {
  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-5 py-6">
      <div className="h-24 animate-pulse rounded-lg border bg-muted" />
      <div className="grid gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="h-20 animate-pulse rounded-lg border bg-muted" key={index} />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-lg border bg-muted" />
    </section>
  );
}

// 기능 : 회사 분야 선택지에 현재 상세 분야가 누락되어도 폼 값이 유지되도록 병합합니다.
function mergeCompanyField(fields: CompanyField[], current: CompanyField) {
  return fields.some((field) => field.id === current.id)
    ? fields
    : [current, ...fields];
}

// 기능 : 회사 지역 선택지에 현재 상세 지역이 누락되어도 폼 값이 유지되도록 병합합니다.
function mergeCompanyRegion(regions: CompanyRegion[], current: CompanyRegion) {
  return regions.some((region) => region.id === current.id)
    ? regions
    : [current, ...regions];
}
