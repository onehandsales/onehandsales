import {
  BriefcaseBusiness,
  Building2,
  IdCard,
  MapPin,
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
  CompanyDetail,
  CompanyField,
  CompanyMemoLog,
  CompanyPrivateMemoLog,
  CompanyRegion,
} from "@/features/company/types/company";
import { PageHeader } from "@/components/layout/page-header";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDateTime } from "@/utils/format";
import { useMemo } from "react";
import { cn } from "@/utils/cn";

type Tab = "memo" | "contacts" | "deals";

type CompanyDetailScreenProps = {
  readonly companyId: string;
};

export function CompanyDetailScreen({ companyId }: CompanyDetailScreenProps) {
  const [notice, setNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("memo");
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

  const tabs: Array<{ key: Tab; label: string; count?: number }> = [
    { key: "memo", label: "메모" },
    { key: "contacts", label: "거래처", count: contacts.length },
    { key: "deals", label: "딜", count: deals.length },
  ];

  return (
    <div className="flex min-h-full flex-col bg-[#FAFAF8]">
      {/* PageHeader */}
      <PageHeader
        breadcrumbs={[
          { label: "회사", to: "/companies", icon: Building2 },
          { label: company.companyName },
        ]}
        actions={[
          {
            icon: isEditing ? X : Pencil,
            tooltip: isEditing ? "수정 취소" : "정보 수정",
            onClick: () => {
              setIsEditing(!isEditing);
              if (!isEditing) setActiveTab("memo");
            },
          },
        ]}
      />

      {/* 회사 요약 카드 */}
      <div className="px-6 pb-4">
        {isEditing ? (
          <div className="rounded-xl border border-[#C7D7FE] bg-white p-5 shadow-sm">
            <p className="mb-3 text-[12px] font-semibold text-[#1D4ED8]">기본 정보 수정</p>
            <CompanyEditForm
              company={company}
              fields={fields}
              regions={regions}
              onSaved={() => {
                setNotice("회사 정보가 저장되었습니다.");
                setIsEditing(false);
              }}
            />
          </div>
        ) : (
          <div className="rounded-xl border border-[#E6EAF0] bg-white px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[16px] font-bold text-[#2563EB]">
                {company.companyName.charAt(0)}
              </div>
              <div className="min-w-0">
                <h1 className="text-[17px] font-bold text-[#111827]">{company.companyName}</h1>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[12px] text-[#6B7280]">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {company.companyField.field}
                  </span>
                  <span className="text-[#D1D5DB]">·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {company.companyRegion.region}
                  </span>
                  <span className="text-[#D1D5DB]">·</span>
                  <span className="flex items-center gap-1">
                    <IdCard className="h-3 w-3" />
                    거래처 {contacts.length}명
                  </span>
                  <span className="text-[#D1D5DB]">·</span>
                  <span className="flex items-center gap-1">
                    <BriefcaseBusiness className="h-3 w-3" />
                    딜 {deals.length}건
                  </span>
                  <span className="ml-auto text-[11px] text-[#9CA3AF]">
                    등록 {formatDateTime(company.createdAt, { includeYear: true })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 탭 바 */}
      <div className="relative shrink-0 border-b border-[#E6EAF0] bg-[#FAFAF8] px-6">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              className={cn(
                "relative flex h-10 items-center gap-1.5 px-4 text-[13px] font-medium transition",
                activeTab === tab.key
                  ? "text-[#1D4ED8] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#1D4ED8]"
                  : "text-[#6B7280] hover:text-[#374151]"
              )}
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                if (tab.key !== "memo") setIsEditing(false);
              }}
              type="button"
            >
              {tab.label}
              {tab.count !== undefined ? (
                <span
                  className={cn(
                    "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold",
                    activeTab === tab.key
                      ? "bg-[#DBEAFE] text-[#1D4ED8]"
                      : "bg-[#F3F4F6] text-[#6B7280]"
                  )}
                >
                  {tab.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="px-6 py-5">
        {notice ? (
          <div className="mb-4">
            <Toast message={notice} onClose={() => setNotice(null)} variant="success" />
          </div>
        ) : null}

        {activeTab === "memo" && (
          <MemoTab
            companyId={companyId}
            memoLogs={memoLogs}
            memoLogsQuery={memoLogsQuery}
            privateMemoLogs={privateMemoLogs}
            privateMemoLogsQuery={privateMemoLogsQuery}
            onChanged={setNotice}
          />
        )}

        {activeTab === "contacts" && (
          <ContactsTab
            contacts={contacts}
            error={contactsQuery.error}
            isLoading={contactsQuery.isLoading}
            onRetry={() => void contactsQuery.refetch()}
          />
        )}

        {activeTab === "deals" && (
          <DealsTab
            deals={deals}
            error={dealsQuery.error}
            isLoading={dealsQuery.isLoading}
            onRetry={() => void dealsQuery.refetch()}
          />
        )}
      </div>
    </div>
  );
}

// ── 탭 콘텐츠 ──────────────────────────────────────────────────────

function MemoTab({
  companyId,
  memoLogs,
  memoLogsQuery,
  privateMemoLogs,
  privateMemoLogsQuery,
  onChanged,
}: {
  readonly companyId: string;
  readonly memoLogs: CompanyMemoLog[];
  readonly memoLogsQuery: ReturnType<typeof useCompanyMemoLogs>;
  readonly privateMemoLogs: CompanyPrivateMemoLog[];
  readonly privateMemoLogsQuery: ReturnType<typeof useCompanyPrivateMemoLogs>;
  readonly onChanged: (notice: string) => void;
}) {
  return (
    <div className="grid gap-5">
      <CompanyMemoLogSection
        companyId={companyId}
        error={memoLogsQuery.error}
        hasNextPage={Boolean(memoLogsQuery.hasNextPage)}
        isFetchingNextPage={memoLogsQuery.isFetchingNextPage}
        isLoading={memoLogsQuery.isLoading}
        logs={memoLogs}
        onChanged={onChanged}
        onFetchMore={() => void memoLogsQuery.fetchNextPage()}
        onRetry={() => void memoLogsQuery.refetch()}
      />
      <CompanyPrivateMemoLogSection
        companyId={companyId}
        error={privateMemoLogsQuery.error}
        hasNextPage={Boolean(privateMemoLogsQuery.hasNextPage)}
        isFetchingNextPage={privateMemoLogsQuery.isFetchingNextPage}
        isLoading={privateMemoLogsQuery.isLoading}
        logs={privateMemoLogs}
        onChanged={onChanged}
        onFetchMore={() => void privateMemoLogsQuery.fetchNextPage()}
        onRetry={() => void privateMemoLogsQuery.refetch()}
      />
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
    <div className="overflow-hidden rounded-xl border border-[#E6EAF0] bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-[#F3F4F6] px-5 py-3.5">
        <IdCard className="h-4 w-4 text-[#6B7280]" />
        <h2 className="text-[13px] font-semibold text-[#111827]">연결 거래처</h2>
        <span className="ml-1 text-[12px] text-[#9CA3AF]">{contacts.length}명</span>
      </div>
      {isLoading ? (
        <TabLoadingState />
      ) : error ? (
        <PanelError error={error} onRetry={onRetry} />
      ) : contacts.length === 0 ? (
        <PanelEmpty text="연결된 거래처가 없습니다." />
      ) : (
        <div>
          {contacts.map((contact) => (
            <Link
              className="flex items-center gap-3 border-b border-[#F9FAFB] px-5 py-3 last:border-b-0 hover:bg-[#FAFBFC]"
              key={contact.id}
              to={`/contacts/${contact.id}`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-[#111827]">
                  {contact.username}
                </p>
                <p className="truncate text-[12px] text-[#9CA3AF]">
                  {contact.contactDepartment.departmentName}
                </p>
              </div>
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
    <div className="overflow-hidden rounded-xl border border-[#E6EAF0] bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-[#F3F4F6] px-5 py-3.5">
        <BriefcaseBusiness className="h-4 w-4 text-[#6B7280]" />
        <h2 className="text-[13px] font-semibold text-[#111827]">연결 딜</h2>
        <span className="ml-1 text-[12px] text-[#9CA3AF]">{deals.length}건</span>
      </div>
      {isLoading ? (
        <TabLoadingState />
      ) : error ? (
        <PanelError error={error} onRetry={onRetry} />
      ) : deals.length === 0 ? (
        <PanelEmpty text="연결된 딜이 없습니다." />
      ) : (
        <div>
          {deals.map((deal) => (
            <Link
              className="flex items-center justify-between gap-3 border-b border-[#F9FAFB] px-5 py-3 last:border-b-0 hover:bg-[#FAFBFC]"
              key={deal.id}
              to={`/deals/${deal.id}`}
            >
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-[#111827]">{deal.dealName}</p>
                <p className="text-[12px] text-[#9CA3AF]">
                  {formatDateTime(deal.createdAt, { includeYear: true })}
                </p>
              </div>
              <span className="shrink-0 text-[13px] font-semibold text-[#374151]">
                {deal.dealCost.toLocaleString("ko-KR")}원
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 공통 ────────────────────────────────────────────────────────────

function TabLoadingState() {
  return (
    <div className="grid gap-2 p-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div className="h-11 animate-pulse rounded-lg bg-[#F3F4F6]" key={i} />
      ))}
    </div>
  );
}

function PanelEmpty({ text }: { readonly text: string }) {
  return <p className="px-5 py-8 text-center text-[13px] text-[#9CA3AF]">{text}</p>;
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
