import {
  BriefcaseBusiness,
  Check,
  Copy,
  IdCard,
  Mail,
  Pencil,
  Phone,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/page-header";
import { Toast } from "@/components/ui/toast";
import { ContactEditForm } from "@/features/contact/components/contact-edit-form";
import {
  ContactMemoLogSection,
  ContactPrivateMemoLogSection,
} from "@/features/contact/components/contact-log-section";
import {
  useContactDeals,
  useContactDetail,
  useContactMemoLogs,
  useContactPrivateMemoLogs,
} from "@/features/contact/hooks/use-contact-detail";
import type {
  ContactDeal,
  ContactMemoLog,
  ContactPrivateMemoLog,
} from "@/features/contact/types/contact";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate, formatDateTime } from "@/utils/format";
import { cn } from "@/utils/cn";

type Tab = "memo" | "deals";

type ContactDetailScreenProps = {
  readonly contactId: string;
};

// 기능 : 거래처 상세 화면을 렌더링합니다.
export function ContactDetailScreen({ contactId }: ContactDetailScreenProps) {
  const [notice, setNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("memo");
  const [isEditing, setIsEditing] = useState(false);

  const contactQuery = useContactDetail(contactId);
  const dealsQuery = useContactDeals(contactId);
  const memoLogsQuery = useContactMemoLogs(contactId);
  const privateMemoLogsQuery = useContactPrivateMemoLogs(contactId);

  const memoLogs: ContactMemoLog[] =
    memoLogsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const privateMemoLogs: ContactPrivateMemoLog[] =
    privateMemoLogsQuery.data?.pages.flatMap((page) => page.items) ?? [];

  if (contactQuery.isLoading) {
    return <ContactDetailSkeleton />;
  }

  if (contactQuery.isError) {
    return (
      <ContactDetailError
        error={contactQuery.error}
        onRetry={() => void contactQuery.refetch()}
      />
    );
  }

  const contact = contactQuery.data;

  if (!contact) {
    return <ContactDetailSkeleton />;
  }

  const deals = dealsQuery.data?.items ?? [];

  const tabs: Array<{ key: Tab; label: string; count?: number }> = [
    { key: "memo", label: "메모" },
    { key: "deals", label: "딜", count: deals.length },
  ];

  return (
    <div className="min-h-full bg-[#FAFAF8]">
      {/* PageHeader */}
      <PageHeader
        breadcrumbs={[
          { label: "담당자", to: "/contacts", icon: IdCard },
          { label: contact.username },
        ]}
        actions={[
          {
            icon: isEditing ? X : Pencil,
            tooltip: isEditing ? "수정 취소" : "수정",
            onClick: () => setIsEditing(!isEditing),
          },
        ]}
      />

      {/* 담당자 요약 카드 */}
      <div className="border-b border-[#E6EAF0] bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[18px] font-bold text-[#2563EB]">
            {contact.username.charAt(0)}
          </div>
          <div className="min-w-0">
            <h1 className="text-[18px] font-bold leading-tight text-[#111827]">
              {contact.username}
            </h1>
            <p className="mt-0.5 text-[13px] text-[#6B7280]">
              <Link
                className="hover:text-[#2563EB] hover:underline"
                to={`/companies/${contact.company.id}`}
              >
                {contact.company.companyName}
              </Link>
              <span className="mx-1.5 text-[#D1D5DB]">·</span>
              {contact.contactDepartment.departmentName}
              <span className="mx-1.5 text-[#D1D5DB]">·</span>
              {contact.contactJobGrade.jobGradeName}
            </p>
          </div>
        </div>

        {/* 연락처 퀵 복사 */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyChip icon={Phone} label={contact.mobile || "-"} value={contact.mobile} onCopied={setNotice} />
          <CopyChip icon={Mail} label={contact.email || "-"} value={contact.email} onCopied={setNotice} />
          <span className="ml-auto text-[11px] text-[#9CA3AF]">
            등록 {formatDate(contact.createdAt, { year: "numeric" })}
          </span>
        </div>
      </div>

      {/* 수정 폼 */}
      {isEditing ? (
        <div className="border-b border-[#E6EAF0] bg-[#F0F4FF] px-6 py-5">
          <p className="mb-3 text-[12px] font-semibold text-[#1D4ED8]">정보 수정</p>
          <div className="rounded-xl border border-[#C7D7FE] bg-white p-5">
            <ContactEditForm
              contact={contact}
              onSaved={() => {
                void contactQuery.refetch();
                setNotice("거래처 정보가 저장되었습니다.");
                setIsEditing(false);
              }}
            />
          </div>
        </div>
      ) : null}

      {/* 탭 바 */}
      <div className="relative border-b border-[#E6EAF0] bg-white px-6">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-[#E6EAF0]" />
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              className={cn(
                "relative flex h-11 items-center gap-1.5 px-4 text-[13px] font-medium transition",
                activeTab === tab.key
                  ? "text-[#1D4ED8] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#1D4ED8]"
                  : "text-[#6B7280] hover:text-[#374151]"
              )}
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
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
      <div className="px-6 py-6">
        {notice ? (
          <div className="mb-4">
            <Toast message={notice} onClose={() => setNotice(null)} variant="success" />
          </div>
        ) : null}

        {activeTab === "memo" && (
          <MemoTab
            contactId={contactId}
            memoLogs={memoLogs}
            memoLogsQuery={memoLogsQuery}
            privateMemoLogs={privateMemoLogs}
            privateMemoLogsQuery={privateMemoLogsQuery}
            onChanged={setNotice}
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

// ── 탭 콘텐츠 컴포넌트 ──────────────────────────────────────────────

function MemoTab({
  contactId,
  memoLogs,
  memoLogsQuery,
  privateMemoLogs,
  privateMemoLogsQuery,
  onChanged,
}: {
  readonly contactId: string;
  readonly memoLogs: ContactMemoLog[];
  readonly memoLogsQuery: ReturnType<typeof useContactMemoLogs>;
  readonly privateMemoLogs: ContactPrivateMemoLog[];
  readonly privateMemoLogsQuery: ReturnType<typeof useContactPrivateMemoLogs>;
  readonly onChanged: (notice: string) => void;
}) {
  return (
    <div className="grid gap-6">
      <ContactMemoLogSection
        contactId={contactId}
        error={memoLogsQuery.error}
        hasNextPage={memoLogsQuery.hasNextPage}
        isFetchingNextPage={memoLogsQuery.isFetchingNextPage}
        isLoading={memoLogsQuery.isLoading}
        logs={memoLogs}
        onChanged={onChanged}
        onFetchMore={() => void memoLogsQuery.fetchNextPage()}
        onRetry={() => void memoLogsQuery.refetch()}
      />
      <ContactPrivateMemoLogSection
        contactId={contactId}
        error={privateMemoLogsQuery.error}
        hasNextPage={privateMemoLogsQuery.hasNextPage}
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

function DealsTab({
  deals,
  isLoading,
  error,
  onRetry,
}: {
  readonly deals: ContactDeal[];
  readonly isLoading: boolean;
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="rounded-xl border border-[#E6EAF0] bg-white">
      <div className="flex items-center gap-2 border-b border-[#F3F4F6] px-5 py-4">
        <BriefcaseBusiness className="h-4 w-4 text-[#6B7280]" />
        <h2 className="text-[14px] font-semibold text-[#111827]">연결 딜</h2>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <PanelError error={error} onRetry={onRetry} />
      ) : deals.length === 0 ? (
        <PanelEmpty text="연결된 딜이 없습니다." />
      ) : (
        <div className="divide-y divide-[#F9FAFB]">
          {deals.map((deal) => (
            <Link
              className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-[#FAFBFC]"
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

// ── 공통 소형 컴포넌트 ──────────────────────────────────────────────

function CopyChip({
  icon: Icon,
  label,
  value,
  onCopied,
}: {
  readonly icon: typeof Phone;
  readonly label: string;
  readonly value: string;
  readonly onCopied: (msg: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    onCopied("복사되었습니다.");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      className="inline-flex h-8 items-center gap-2 rounded-lg border border-[#E6EAF0] bg-white px-3 text-[12px] text-[#374151] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
      disabled={!value}
      onClick={() => void onCopy()}
      type="button"
    >
      <Icon className="h-3.5 w-3.5 text-[#9CA3AF]" />
      {label}
      {copied ? (
        <Check className="h-3 w-3 text-[#16A34A]" />
      ) : (
        <Copy className="h-3 w-3 text-[#D1D5DB]" />
      )}
    </button>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-2 p-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div className="h-12 animate-pulse rounded-lg bg-[#F3F4F6]" key={i} />
      ))}
    </div>
  );
}

function PanelEmpty({ text }: { readonly text: string }) {
  return (
    <p className="px-5 py-8 text-center text-[13px] text-[#9CA3AF]">{text}</p>
  );
}

function PanelError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
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

// 기능 : 거래처 상세 조회 실패 상태를 렌더링합니다.
function ContactDetailError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="px-6 py-12">
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
  );
}

// 기능 : 거래처 상세 로딩 상태를 렌더링합니다.
function ContactDetailSkeleton() {
  return (
    <div className="min-h-full bg-[#FAFAF8]">
      <div className="flex h-[var(--topbar-height)] items-center gap-2 border-b border-[#E6EAF0] bg-white px-6">
        <div className="h-4 w-20 animate-pulse rounded bg-[#F3F4F6]" />
      </div>
      <div className="border-b border-[#E6EAF0] bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 animate-pulse rounded-full bg-[#F3F4F6]" />
          <div className="grid gap-2">
            <div className="h-5 w-32 animate-pulse rounded bg-[#F3F4F6]" />
            <div className="h-3.5 w-48 animate-pulse rounded bg-[#F3F4F6]" />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <div className="h-8 w-36 animate-pulse rounded-lg bg-[#F3F4F6]" />
          <div className="h-8 w-44 animate-pulse rounded-lg bg-[#F3F4F6]" />
        </div>
      </div>
      <div className="border-b border-[#E6EAF0] bg-white px-6">
        <div className="flex gap-4 py-1">
          {Array.from({ length: 2 }).map((_, i) => (
            <div className="h-10 w-16 animate-pulse rounded bg-[#F3F4F6]" key={i} />
          ))}
        </div>
      </div>
      <div className="px-6 py-6">
        <div className="h-56 animate-pulse rounded-xl bg-white" />
      </div>
    </div>
  );
}
