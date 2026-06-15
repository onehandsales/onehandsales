import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  IdCard,
  Pencil,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Toast } from "@/components/ui/toast";
import { CompanyEditForm } from "@/features/company/components/company-edit-form";
import {
  CompanyMemoLogSection,
  CompanyPrivateMemoLogSection,
} from "@/features/company/components/company-log-section";
import {
  useCompanyContacts,
  useCompanyDeals,
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
  CompanyDeal,
  CompanyField,
  CompanyRegion,
} from "@/features/company/types/company";
import { PageHeader } from "@/components/layout/page-header";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDateTime } from "@/utils/format";
import { useMemo } from "react";
import { cn } from "@/utils/cn";

type CompanyDetailScreenProps = {
  readonly companyId: string;
};

export function CompanyDetailScreen({ companyId }: CompanyDetailScreenProps) {
  const [notice, setNotice] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const companyQuery = useCompanyDetail(companyId);
  const contactsQuery = useCompanyContacts(companyId);
  const dealsQuery = useCompanyDeals(companyId);
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
        ? mergeCompanyRegion(regionsQuery.data?.items ?? [], company.companyRegion)
        : (regionsQuery.data?.items ?? []),
    [company, regionsQuery.data?.items]
  );
  const memoLogs = memoLogsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const privateMemoLogs = privateMemoLogsQuery.data?.pages.flatMap((page) => page.items) ?? [];

  if (companyQuery.isLoading) return <CompanyDetailSkeleton />;
  if (companyQuery.isError) {
    return (
      <CompanyDetailError
        error={companyQuery.error}
        onRetry={() => void companyQuery.refetch()}
      />
    );
  }
  if (!company) return <CompanyDetailSkeleton />;

  const contacts = contactsQuery.data?.items ?? [];
  const deals = dealsQuery.data?.items ?? [];

  return (
    <div className="flex h-full flex-col">
      {notice ? (
        <div className="mx-6 mt-3">
          <Toast message={notice} onClose={() => setNotice(null)} variant="success" />
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 overflow-hidden bg-[#F9FAFB]">
        <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
          <Link
            className="inline-flex w-fit items-center gap-2 text-[13px] font-medium text-[#64748B] hover:text-[#374151]"
            to="/companies"
          >
            <ArrowLeft className="h-4 w-4" />
            회사 목록
          </Link>

          <div className="rounded-lg border border-[#E5E7EB] bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-[14px] font-semibold text-[#111827]">기본 정보</h2>
              <button
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border px-3 text-[13px] font-semibold transition",
                  isEditing
                    ? "border-[#C7D7FE] bg-[#EAF2FF] text-[#1D4ED8]"
                    : "border-[#E2E5EC] bg-white text-[#374151] hover:bg-[#F5F6F8]"
                )}
                onClick={() => setIsEditing((value) => !value)}
                type="button"
              >
                {isEditing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                {isEditing ? "수정 취소" : "정보 수정"}
              </button>
            </div>
            {isEditing ? (
              <CompanyEditForm
                company={company}
                fields={fields}
                regions={regions}
                onSaved={() => {
                  void companyQuery.refetch();
                  setNotice("회사 정보가 저장되었습니다.");
                  setIsEditing(false);
                }}
              />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <InfoField label="회사명" value={company.companyName} />
                <InfoField
                  label="등록일"
                  value={formatDateTime(company.createdAt, { includeYear: true })}
                />
                <InfoField label="분야" value={company.companyField.field} />
                <InfoField label="지역" value={company.companyRegion.region} />
                <InfoField
                  label="수정일"
                  value={formatDateTime(company.updatedAt, { includeYear: true })}
                />
              </div>
            )}
          </div>

          <CompanyMemoLogSection
            companyId={companyId}
            error={memoLogsQuery.error}
            hasNextPage={Boolean(memoLogsQuery.hasNextPage)}
            isFetchingNextPage={memoLogsQuery.isFetchingNextPage}
            isLoading={memoLogsQuery.isLoading}
            logs={memoLogs}
            onChanged={setNotice}
            onFetchMore={() => void memoLogsQuery.fetchNextPage()}
            onRetry={() => void memoLogsQuery.refetch()}
          />
        </div>

        <div className="flex w-[415px] shrink-0 flex-col gap-4 overflow-y-auto bg-[#F9FAFB] p-6">
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
            <h3 className="mb-3 text-[13px] font-semibold text-[#111827]">회사 현황</h3>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="거래처" value={`${contacts.length.toLocaleString("ko-KR")}명`} />
              <StatCard label="딜" value={`${deals.length.toLocaleString("ko-KR")}건`} />
            </div>
          </div>

          <ContactsTab
            contacts={contacts}
            error={contactsQuery.error}
            isLoading={contactsQuery.isLoading}
            onRetry={() => void contactsQuery.refetch()}
          />
          <DealsTab
            deals={deals}
            error={dealsQuery.error}
            isLoading={dealsQuery.isLoading}
            onRetry={() => void dealsQuery.refetch()}
          />
          <CompanyPrivateMemoLogSection
            companyId={companyId}
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
      </div>
    </div>
  );
}

function ContactsTab({
  contacts,
  isLoading,
  error,
  onRetry,
}: {
  readonly contacts: CompanyContact[];
  readonly isLoading: boolean;
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <IdCard className="h-4 w-4 text-[#6B7280]" />
        <h3 className="flex-1 text-[13px] font-semibold text-[#111827]">연결 거래처</h3>
        <span className="ml-1 text-[12px] text-[#9CA3AF]">{contacts.length}명</span>
      </div>
      {isLoading ? (
        <TabLoadingState />
      ) : error ? (
        <PanelError error={error} onRetry={onRetry} />
      ) : contacts.length === 0 ? (
        <p className="py-2 text-[13px] text-[#9CA3AF]">연결된 거래처가 없습니다.</p>
      ) : (
        <div className="grid gap-2">
          {contacts.map((contact) => (
            <Link
              className="grid gap-1 rounded-lg border border-[#E5E7EB] px-3 py-2.5 transition-colors hover:bg-[#F9FAFB]"
              key={contact.id}
              to={`/contacts/${contact.id}`}
            >
              <p className="truncate text-[13px] font-semibold text-[#111827]">
                {contact.username}
              </p>
              <p className="truncate text-[12px] text-[#6B7280]">
                {contact.contactDepartment.departmentName}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function DealsTab({
  deals,
  isLoading,
  error,
  onRetry,
}: {
  readonly deals: CompanyDeal[];
  readonly isLoading: boolean;
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <BriefcaseBusiness className="h-4 w-4 text-[#6B7280]" />
        <h3 className="flex-1 text-[13px] font-semibold text-[#111827]">연결 딜</h3>
        <span className="ml-1 text-[12px] text-[#9CA3AF]">{deals.length}건</span>
      </div>
      {isLoading ? (
        <TabLoadingState />
      ) : error ? (
        <PanelError error={error} onRetry={onRetry} />
      ) : deals.length === 0 ? (
        <p className="py-2 text-[13px] text-[#9CA3AF]">연결된 딜이 없습니다.</p>
      ) : (
        <div className="grid gap-2">
          {deals.map((deal) => (
            <Link
              className="grid gap-1 rounded-lg border border-[#E5E7EB] px-3 py-2.5 transition-colors hover:bg-[#F9FAFB]"
              key={deal.id}
              to={`/deals/${deal.id}`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-[13px] font-medium text-[#111827]">{deal.dealName}</p>
                <span className="shrink-0 text-[13px] font-semibold text-[#374151]">
                  {deal.dealCost.toLocaleString("ko-KR")}원
                </span>
              </div>
              <p className="text-[12px] text-[#6B7280]">
                {formatDateTime(deal.createdAt, { includeYear: true })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 공통 ────────────────────────────────────────────────────────────

function InfoField({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-[11px] font-semibold text-[#6B7280]">{label}</span>
      <span className="truncate text-[13px] text-[#111827]">{value}</span>
    </div>
  );
}

function StatCard({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-[#F9FAFB] p-3">
      <span className="text-[11px] font-medium text-[#6B7280]">{label}</span>
      <span className="text-[20px] font-bold text-[#111827]">{value}</span>
    </div>
  );
}

function TabLoadingState() {
  return (
    <div className="grid gap-2 p-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div className="h-11 animate-pulse rounded-lg bg-[#F3F4F6]" key={i} />
      ))}
    </div>
  );
}

function PanelError({ error, onRetry }: { readonly error: unknown; readonly onRetry: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3 p-5">
      <p className="text-[13px] text-red-500">{getApiErrorMessage(error)}</p>
      <button
        className="inline-flex h-8 items-center rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#374151] hover:bg-[#F9FAFB]"
        onClick={onRetry}
        type="button"
      >
        다시 시도
      </button>
    </div>
  );
}

function CompanyDetailError({ error, onRetry }: { readonly error: unknown; readonly onRetry: () => void }) {
  return (
    <div className="flex min-h-full flex-col bg-[#FAFAF8]">
      <PageHeader breadcrumbs={[{ label: "회사", to: "/companies", icon: Building2 }, { label: "오류" }]} />
      <div className="mx-auto max-w-xl px-6 py-12">
        <div className="rounded-xl border border-red-100 bg-red-50 p-5">
          <p className="text-[13px] text-red-600">{getApiErrorMessage(error)}</p>
          <button
            className="mt-3 inline-flex h-8 items-center rounded-lg border border-red-200 bg-white px-3 text-[13px] text-red-600 hover:bg-red-50"
            onClick={onRetry}
            type="button"
          >
            다시 시도
          </button>
        </div>
      </div>
    </div>
  );
}

function CompanyDetailSkeleton() {
  return (
    <div className="flex min-h-full flex-col bg-[#FAFAF8]">
      <div className="flex h-[var(--topbar-height)] items-center px-6">
        <div className="h-4 w-40 animate-pulse rounded bg-[#F3F4F6]" />
      </div>
      <div className="px-6 pb-4">
        <div className="h-[72px] animate-pulse rounded-xl bg-white" />
      </div>
      <div className="border-b border-[#E6EAF0] px-6">
        <div className="flex gap-2 py-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div className="h-8 w-14 animate-pulse rounded bg-[#F3F4F6]" key={i} />
          ))}
        </div>
      </div>
      <div className="px-6 py-5">
        <div className="h-48 animate-pulse rounded-xl bg-white" />
      </div>
    </div>
  );
}

function mergeCompanyField(fields: CompanyField[], current: CompanyField) {
  return fields.some((f) => f.id === current.id) ? fields : [current, ...fields];
}

function mergeCompanyRegion(regions: CompanyRegion[], current: CompanyRegion) {
  return regions.some((r) => r.id === current.id) ? regions : [current, ...regions];
}
