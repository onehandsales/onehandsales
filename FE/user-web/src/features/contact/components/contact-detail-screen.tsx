import {
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  Copy,
  Mail,
  Pencil,
  Phone,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
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
import { formatDateTime } from "@/utils/format";
import { cn } from "@/utils/cn";

type ContactDetailScreenProps = {
  readonly contactId: string;
};

// 기능 : 담당자 상세 화면을 렌더링합니다.
export function ContactDetailScreen({ contactId }: ContactDetailScreenProps) {
  const [notice, setNotice] = useState<string | null>(null);
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
            to="/contacts"
          >
            <ArrowLeft className="h-4 w-4" />
            담당자 목록
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
              <ContactEditForm
                contact={contact}
                onSaved={() => {
                  void contactQuery.refetch();
                  setNotice("담당자 정보가 저장되었습니다.");
                  setIsEditing(false);
                }}
              />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <InfoField label="이름" value={contact.username} />
                <InfoField
                  label="회사"
                  value={contact.company.companyName}
                  to={`/companies/${contact.company.id}`}
                />
                <InfoField label="부서" value={contact.contactDepartment.departmentName} />
                <InfoField label="직급" value={contact.contactJobGrade.jobGradeName} />
                <InfoField label="핸드폰" value={contact.mobile || "-"} />
                <InfoField label="이메일" value={contact.email || "-"} />
                <InfoField
                  label="등록일"
                  value={formatDateTime(contact.createdAt, { includeYear: true })}
                />
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <CopyChip icon={Phone} label={contact.mobile || "-"} value={contact.mobile} onCopied={setNotice} />
              <CopyChip icon={Mail} label={contact.email || "-"} value={contact.email} onCopied={setNotice} />
            </div>
          </div>

          <ContactMemoLogSection
            contactId={contactId}
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
            <h3 className="mb-3 text-[13px] font-semibold text-[#111827]">담당자 현황</h3>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="연결 딜" value={`${deals.length.toLocaleString("ko-KR")}건`} />
              <StatCard label="회사" value={contact.company.companyName} />
            </div>
          </div>

          <DealsTab
            deals={deals}
            error={dealsQuery.error}
            isLoading={dealsQuery.isLoading}
            onRetry={() => void dealsQuery.refetch()}
          />
          <ContactPrivateMemoLogSection
            contactId={contactId}
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
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <BriefcaseBusiness className="h-4 w-4 text-[#6B7280]" />
        <h3 className="flex-1 text-[13px] font-semibold text-[#111827]">연결 딜</h3>
        <span className="text-[12px] text-[#9CA3AF]">{deals.length}건</span>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <PanelError error={error} onRetry={onRetry} />
      ) : deals.length === 0 ? (
        <p className="py-2 text-[13px] text-[#9CA3AF]">연결된 딜이 없습니다.</p>
      ) : (
        <div className="grid gap-2">
          {deals.map((deal) => (
            <Link
              className="grid gap-1 rounded-lg border border-[#E5E7EB] px-3 py-2.5 hover:bg-[#F9FAFB]"
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

// ── 공통 소형 컴포넌트 ──────────────────────────────────────────────

function InfoField({
  label,
  value,
  to,
}: {
  readonly label: string;
  readonly value: string;
  readonly to?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-[11px] font-semibold text-[#6B7280]">{label}</span>
      {to ? (
        <Link className="truncate text-[13px] text-[#111827] hover:text-[#2563EB] hover:underline" to={to}>
          {value}
        </Link>
      ) : (
        <span className="truncate text-[13px] text-[#111827]">{value}</span>
      )}
    </div>
  );
}

function StatCard({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-lg bg-[#F9FAFB] p-3">
      <span className="text-[11px] font-medium text-[#6B7280]">{label}</span>
      <span className="truncate text-[20px] font-bold text-[#111827]">{value}</span>
    </div>
  );
}

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

// 기능 : 담당자 상세 조회 실패 상태를 렌더링합니다.
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

// 기능 : 담당자 상세 로딩 상태를 렌더링합니다.
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
