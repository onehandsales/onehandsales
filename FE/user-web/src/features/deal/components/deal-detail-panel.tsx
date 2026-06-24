// 기능 : 딜 상세 패널/페이지 — 다음 행동 로그, 메모 로그, 제품 표시
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  HandCoins,
  Lock,
  Mail,
  Package,
  Pencil,
  Phone,
  Plus,
  Trash2,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Toast } from "@/components/ui/toast";
import {
  useDealDetail,
  useDealFollowingActionLogs,
  useDealMemoLogs,
} from "@/features/deal/hooks/use-deal-detail";
import {
  useCreateFollowingActionLogMutation,
  useCreateMemoLogMutation,
  useDeleteDealMutation,
  useUpdateDealMutation,
  useUpdateFollowingActionLogMutation,
  useUpdateMemoLogMutation,
} from "@/features/deal/hooks/use-deal-mutations";
import {
  followingActionLogFormSchema,
  memoLogFormSchema,
  type FollowingActionLogFormValues,
  type MemoLogFormValues,
} from "@/features/deal/schemas/deal-schema";
import {
  DEAL_STATUS_LABEL,
  DEAL_STATUS_LIST,
  type DealDetail,
  type DealFollowingActionLog,
  type DealMemoLog,
  type DealStatus,
} from "@/features/deal/types/deal";
import { getApiErrorMessage } from "@/lib/api-client";
import { cn } from "@/utils/cn";
import { formatDate, formatDateTime } from "@/utils/format";

type DealDetailPanelProps = {
  readonly dealId: string;
  readonly variant?: "panel" | "page";
};

export function DealDetailPanel({ dealId, variant = "panel" }: DealDetailPanelProps) {
  const navigate = useNavigate();
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const dealQuery = useDealDetail(dealId);
  const followingLogsQuery = useDealFollowingActionLogs(dealId);
  const memoLogsQuery = useDealMemoLogs(dealId);
  const deleteDealMutation = useDeleteDealMutation();
  const detail = dealQuery.data;

  if (!dealId) {
    return (
      <DealStateShell variant={variant}>
        <EmptyPanelState />
      </DealStateShell>
    );
  }

  if (dealQuery.isLoading) {
    return (
      <DealStateShell variant={variant}>
        <DealDetailSkeleton variant={variant} />
      </DealStateShell>
    );
  }

  if (dealQuery.isError || !detail) {
    return (
      <DealStateShell variant={variant}>
        <DealDetailError
          error={dealQuery.error}
          onRetry={() => void dealQuery.refetch()}
        />
      </DealStateShell>
    );
  }

  const followingLogs =
    followingLogsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const memoLogs = memoLogsQuery.data?.pages.flatMap((page) => page.items) ?? [];

  const onDeleteDeal = async () => {
    if (!detail) return;
    if (!window.confirm(`${detail.dealName} 딜을 삭제할까요?`)) return;

    setActionError(null);

    try {
      await deleteDealMutation.mutateAsync(detail.id);
      void navigate("/deals", {
        replace: true,
        state: { notice: "딜이 삭제되었습니다." },
      });
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  if (variant === "page") {
    return (
      <DealDetailPageLayout
        actionError={actionError}
        deletePending={deleteDealMutation.isPending}
        detail={detail}
        followingLogs={followingLogs}
        followingLogsHasNext={Boolean(followingLogsQuery.hasNextPage)}
        followingLogsFetchingNext={followingLogsQuery.isFetchingNextPage}
        followingLogsLoading={followingLogsQuery.isLoading}
        notice={notice}
        onClearActionError={() => setActionError(null)}
        onClearNotice={() => setNotice(null)}
        onDeleteDeal={() => void onDeleteDeal()}
        onDetailSaved={() => {
          void dealQuery.refetch();
          setNotice("딜 정보가 저장되었습니다.");
        }}
        onFetchFollowingLogsNext={() => void followingLogsQuery.fetchNextPage()}
        memoLogs={memoLogs}
        memoLogsHasNext={Boolean(memoLogsQuery.hasNextPage)}
        memoLogsFetchingNext={memoLogsQuery.isFetchingNextPage}
        memoLogsLoading={memoLogsQuery.isLoading}
        onFetchMemoLogsNext={() => void memoLogsQuery.fetchNextPage()}
      />
    );
  }

  return (
    <DealDetailSidePanel
      detail={detail}
      followingLogs={followingLogs}
      followingLogsHasNext={Boolean(followingLogsQuery.hasNextPage)}
      followingLogsFetchingNext={followingLogsQuery.isFetchingNextPage}
      followingLogsLoading={followingLogsQuery.isLoading}
      onFetchFollowingLogsNext={() => void followingLogsQuery.fetchNextPage()}
    />
  );
}

function DealDetailSidePanel({
  detail,
  followingLogs,
  followingLogsHasNext,
  followingLogsFetchingNext,
  followingLogsLoading,
  onFetchFollowingLogsNext,
}: {
  readonly detail: DealDetail;
  readonly followingLogs: DealFollowingActionLog[];
  readonly followingLogsHasNext: boolean;
  readonly followingLogsFetchingNext: boolean;
  readonly followingLogsLoading: boolean;
  readonly onFetchFollowingLogsNext: () => void;
}) {
  const nextAction = followingLogs[0];
  const companyName = formatDealCompanySummary(detail);
  const contactName = formatDealContactSummary(detail);
  const products = Array.isArray(detail.products) ? detail.products : [];
  const dealCost = Number.isFinite(detail.dealCost) ? detail.dealCost : 0;
  const dealName = detail.dealName ?? "-";

  return (
    <div className="flex flex-col bg-white">
      <header className="flex h-[60px] shrink-0 items-center gap-3 border-b border-[#E5EAF0] px-5">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[14px] font-semibold text-[#111827]">
            {dealName}
          </h2>
          <p className="mt-0.5 truncate text-[11px] text-[#94A3B8]">
            {companyName} · {contactName}
          </p>
        </div>
        <StatusBadge status={detail.dealStatus} />
      </header>

      <div className="px-5 py-[18px]">
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-2.5">
            <MetricCard
              icon={HandCoins}
              label="금액"
              value={`${dealCost.toLocaleString("ko-KR")}원`}
            />
            <MetricCard
              icon={CalendarClock}
              label="마감"
              value={formatDate(detail.expectedEndDate)}
              subValue={getDeadlineLabel(detail.expectedEndDate)}
            />
          </div>

          <PanelDivider />

          <NextActionSummary
            isLoading={followingLogsLoading}
            log={nextAction}
            tone="panel"
          />

          <PanelDivider />

          <DealProductsSection products={products} />

          <PanelDivider />

          <FollowingActionLogsSection
            dealId={detail.id}
            hasNext={followingLogsHasNext}
            isFetchingNext={followingLogsFetchingNext}
            isLoading={followingLogsLoading}
            logs={followingLogs}
            onFetchNext={onFetchFollowingLogsNext}
            tone="panel"
          />
        </div>
      </div>
    </div>
  );
}

function DealInlineEditForm({
  detail,
  onSaved,
}: {
  readonly detail: DealDetail;
  readonly onSaved: () => void;
}) {
  const updateMutation = useUpdateDealMutation();
  const initialDealCost = Number.isFinite(detail.dealCost) ? detail.dealCost : 0;
  const [dealName, setDealName] = useState(detail.dealName ?? "");
  const [dealCost, setDealCost] = useState(initialDealCost.toString());
  const [dealStatus, setDealStatus] = useState<DealStatus>(detail.dealStatus);
  const [expectedEndDate, setExpectedEndDate] = useState(
    detail.expectedEndDate ? detail.expectedEndDate.slice(0, 10) : ""
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await updateMutation.mutateAsync({
      dealId: detail.id,
      dealName: dealName.trim(),
      dealCost: Number(dealCost.replace(/,/g, "")),
      dealStatus,
      expectedEndDate,
    });
    onSaved();
  };

  return (
    <form
      className="grid gap-3 rounded-lg border border-[#C7D7FE] bg-[#F8FBFF] p-3"
      onSubmit={(event) => void onSubmit(event)}
    >
      <label className="grid gap-1.5 text-[12px] font-medium text-[#475569]">
        딜명
        <input
          className="h-9 rounded-md border border-[#E2E5EC] bg-white px-3 text-[13px] text-[#111827] outline-none focus:border-[#93C5FD]"
          onChange={(event) => setDealName(event.target.value)}
          value={dealName}
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="grid gap-1.5 text-[12px] font-medium text-[#475569]">
          금액
          <input
            className="h-9 rounded-md border border-[#E2E5EC] bg-white px-3 text-[13px] text-[#111827] outline-none focus:border-[#93C5FD]"
            inputMode="numeric"
            onChange={(event) => setDealCost(event.target.value)}
            value={dealCost}
          />
        </label>
        <label className="grid gap-1.5 text-[12px] font-medium text-[#475569]">
          단계
          <select
            className="h-9 rounded-md border border-[#E2E5EC] bg-white px-3 text-[13px] text-[#111827] outline-none focus:border-[#93C5FD]"
            onChange={(event) => setDealStatus(event.target.value as DealStatus)}
            value={dealStatus}
          >
            {DEAL_STATUS_LIST.map((status) => (
              <option key={status} value={status}>
                {DEAL_STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="grid gap-1.5 text-[12px] font-medium text-[#475569]">
        마감일
        <input
          className="h-9 rounded-md border border-[#E2E5EC] bg-white px-3 text-[13px] text-[#111827] outline-none focus:border-[#93C5FD]"
          onChange={(event) => setExpectedEndDate(event.target.value)}
          type="date"
          value={expectedEndDate}
        />
      </label>
      {updateMutation.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
          {getApiErrorMessage(updateMutation.error)}
        </p>
      ) : null}
      <div className="flex justify-end">
        <button
          className="inline-flex h-8 items-center rounded-md bg-[#2463EB] px-3 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:opacity-60"
          disabled={
            updateMutation.isPending ||
            dealName.trim().length === 0 ||
            Number.isNaN(Number(dealCost.replace(/,/g, "")))
          }
          type="submit"
        >
          {updateMutation.isPending ? "저장 중" : "저장"}
        </button>
      </div>
    </form>
  );
}

function DealDetailPageLayout({
  actionError,
  deletePending,
  detail,
  followingLogs,
  followingLogsHasNext,
  followingLogsFetchingNext,
  followingLogsLoading,
  memoLogs,
  memoLogsHasNext,
  memoLogsFetchingNext,
  memoLogsLoading,
  notice,
  onClearActionError,
  onClearNotice,
  onDeleteDeal,
  onDetailSaved,
  onFetchFollowingLogsNext,
  onFetchMemoLogsNext,
}: {
  readonly actionError: string | null;
  readonly deletePending: boolean;
  readonly detail: DealDetail;
  readonly followingLogs: DealFollowingActionLog[];
  readonly followingLogsHasNext: boolean;
  readonly followingLogsFetchingNext: boolean;
  readonly followingLogsLoading: boolean;
  readonly memoLogs: DealMemoLog[];
  readonly memoLogsHasNext: boolean;
  readonly memoLogsFetchingNext: boolean;
  readonly memoLogsLoading: boolean;
  readonly notice: string | null;
  readonly onClearActionError: () => void;
  readonly onClearNotice: () => void;
  readonly onDeleteDeal: () => void;
  readonly onDetailSaved: () => void;
  readonly onFetchFollowingLogsNext: () => void;
  readonly onFetchMemoLogsNext: () => void;
}) {
  const nextAction = followingLogs[0];
  const [isEditing, setIsEditing] = useState(false);
  const companyName = formatDealCompanySummary(detail);
  const contactName = formatDealContactSummary(detail);
  const contactDepartmentName = formatDealContactDepartmentSummary(detail);
  const products = Array.isArray(detail.products) ? detail.products : [];
  const dealCost = Number.isFinite(detail.dealCost) ? detail.dealCost : 0;
  const dealName = detail.dealName ?? "-";

  return (
    <>
      <div className="md:hidden min-h-screen bg-[#FAFAF8]">
        {notice ? (
          <div className="px-4 pt-3">
            <Toast message={notice} onClose={onClearNotice} variant="success" />
          </div>
        ) : null}
        {actionError ? (
          <div className="px-4 pt-3">
            <Toast message={actionError} onClose={onClearActionError} variant="error" />
          </div>
        ) : null}
        <DealDetailTopBar
          deletePending={deletePending}
          dealName={dealName}
          isEditing={isEditing}
          onDelete={onDeleteDeal}
          onToggleEdit={() => setIsEditing((value) => !value)}
        />

        <div className="flex flex-col gap-4 p-4 pb-24">
          <DealSummaryHeader
            companyName={companyName}
            contactDepartmentName={contactDepartmentName}
            contactName={contactName}
            dealCost={dealCost}
            detail={detail}
            isEditing={isEditing}
            onCancelEdit={() => setIsEditing(false)}
            onSaved={() => {
              onDetailSaved();
              setIsEditing(false);
            }}
          />
          <div className="grid gap-4">
            <DealLinkedCompaniesTable companies={detail.companies} />
            <DealLinkedContactsTable contacts={detail.contacts} />
            <DealLinkedProductsTable products={products} />
            <NextActionSummary
              isLoading={followingLogsLoading}
              log={nextAction}
              tone="page"
            />
            <DealLogPanel>
              <FollowingActionLogsSection
                dealId={detail.id}
                hasNext={followingLogsHasNext}
                isFetchingNext={followingLogsFetchingNext}
                isLoading={followingLogsLoading}
                logs={followingLogs}
                onFetchNext={onFetchFollowingLogsNext}
                tone="page-inner"
              />
            </DealLogPanel>
            <DealLogPanel>
              <MemoLogsSection
                dealId={detail.id}
                hasNext={memoLogsHasNext}
                isFetchingNext={memoLogsFetchingNext}
                isLoading={memoLogsLoading}
                logs={memoLogs}
                onFetchNext={onFetchMemoLogsNext}
                tone="page-inner"
              />
            </DealLogPanel>
          </div>
        </div>
      </div>

      <div className="hidden md:flex h-full flex-col bg-[#FAFAF8]">
        {notice ? (
          <div className="mx-6 mt-3">
            <Toast message={notice} onClose={onClearNotice} variant="success" />
          </div>
        ) : null}
        {actionError ? (
          <div className="mx-6 mt-3">
            <Toast message={actionError} onClose={onClearActionError} variant="error" />
          </div>
        ) : null}
        <DealDetailTopBar
          deletePending={deletePending}
          dealName={dealName}
          isEditing={isEditing}
          onDelete={onDeleteDeal}
          onToggleEdit={() => setIsEditing((value) => !value)}
        />

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
          <DealSummaryHeader
            companyName={companyName}
            contactDepartmentName={contactDepartmentName}
            contactName={contactName}
            dealCost={dealCost}
            detail={detail}
            isEditing={isEditing}
            onCancelEdit={() => setIsEditing(false)}
            onSaved={() => {
              onDetailSaved();
              setIsEditing(false);
            }}
          />

          <div className="grid grid-cols-3 gap-4">
            <DealLinkedCompaniesTable companies={detail.companies} />
            <DealLinkedContactsTable contacts={detail.contacts} />
            <DealLinkedProductsTable products={products} />
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-4">
            <DealLogPanel>
              <FollowingActionLogsSection
                dealId={detail.id}
                hasNext={followingLogsHasNext}
                isFetchingNext={followingLogsFetchingNext}
                isLoading={followingLogsLoading}
                logs={followingLogs}
                onFetchNext={onFetchFollowingLogsNext}
                tone="page-inner"
              />
            </DealLogPanel>
            <div className="grid h-fit gap-4">
              <NextActionSummary
                isLoading={followingLogsLoading}
                log={nextAction}
                tone="page"
              />
              <section className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                <StageProgressSection activeStatus={detail.dealStatus} />
              </section>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DealLogPanel>
              <MemoLogsSection
                dealId={detail.id}
                hasNext={memoLogsHasNext}
                isFetchingNext={memoLogsFetchingNext}
                isLoading={memoLogsLoading}
                logs={memoLogs}
                onFetchNext={onFetchMemoLogsNext}
                tone="page-inner"
              />
            </DealLogPanel>
            <DealInfoPanel
              detail={detail}
              productCount={products.length}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function DealDetailTopBar({
  deletePending,
  dealName,
  isEditing,
  onDelete,
  onToggleEdit,
}: {
  readonly deletePending: boolean;
  readonly dealName: string;
  readonly isEditing: boolean;
  readonly onDelete: () => void;
  readonly onToggleEdit: () => void;
}) {
  return (
    <div className="flex h-16 shrink-0 items-center gap-3 bg-transparent px-6">
      <Link to="/deals">
        <ChevronLeft className="h-5 w-5 text-[#9CA3AF]" />
      </Link>
      <div className="flex min-w-0 flex-1 items-center gap-1.5 text-[13px]">
        <BriefcaseBusiness className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
        <span className="font-medium text-[#6B7280]">딜</span>
        <span className="text-[#9CA3AF]">/</span>
        <span className="truncate font-bold text-[#111827]">{dealName}</span>
      </div>
      <button
        aria-label={isEditing ? "수정 취소" : "수정"}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] transition-colors hover:bg-[#F9FAFB]"
        onClick={onToggleEdit}
        type="button"
      >
        {isEditing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
      </button>
      <button
        aria-label="삭제"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#FEE2E2] bg-white text-[#B91C1C] transition-colors hover:bg-red-50 disabled:opacity-50"
        disabled={deletePending}
        onClick={onDelete}
        type="button"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function DealSummaryHeader({
  companyName,
  contactDepartmentName,
  contactName,
  dealCost,
  detail,
  isEditing,
  onCancelEdit,
  onSaved,
}: {
  readonly companyName: string;
  readonly contactDepartmentName: string;
  readonly contactName: string;
  readonly dealCost: number;
  readonly detail: DealDetail;
  readonly isEditing: boolean;
  readonly onCancelEdit: () => void;
  readonly onSaved: () => void;
}) {
  if (isEditing) {
    return (
      <div className="rounded-xl border border-[#BFDBFE] bg-white p-4">
        <DealInlineEditForm
          detail={detail}
          onSaved={onSaved}
        />
        <div className="mt-3 flex justify-end">
          <button
            className="h-9 rounded-lg border border-[#DDE3EE] bg-white px-3 text-[13px] font-semibold text-[#6B7280] transition-colors hover:bg-[#F9FAFB]"
            onClick={onCancelEdit}
            type="button"
          >
            취소
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[74px] flex-wrap items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-5 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF]">
        <BriefcaseBusiness className="h-5 w-5 text-[#4F46E5]" />
      </div>
      <span className="min-w-[180px] flex-1 truncate text-[20px] font-extrabold leading-none text-[#111827]">
        {detail.dealName}
      </span>
      <StatusBadge status={detail.dealStatus} />
      <div className="hidden h-5 w-px shrink-0 bg-[#E5E7EB] md:block" />
      <DealSummaryChip label="금액" value={`${dealCost.toLocaleString("ko-KR")}원`} />
      <DealSummaryChip label="마감" value={formatDate(detail.expectedEndDate)} />
      <DealSummaryChip label="회사" value={companyName} />
      <DealSummaryChip label="담당자" value={`${contactName} ${contactDepartmentName}`} />
      <div className="flex-1" />
      <div className="flex items-center gap-4 text-[12px] text-[#9CA3AF]">
        <span>등록 {formatDateTime(detail.createdAt, { includeYear: true })}</span>
        <span>수정 {formatDateTime(detail.updatedAt, { includeYear: true })}</span>
      </div>
    </div>
  );
}

function DealSummaryChip({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 text-[13px]">
      <span className="shrink-0 font-semibold text-[#9CA3AF]">{label}</span>
      <span className="truncate font-extrabold text-[#111827]">{value}</span>
    </div>
  );
}

function DealLinkedCompaniesTable({
  companies,
}: {
  readonly companies: DealDetail["companies"];
}) {
  return (
    <DealLinkedTableFrame count={companies.length} title="연결 회사">
      {companies.length === 0 ? (
        <p className="px-4 py-4 text-[13px] text-[#9CA3AF]">연결된 회사가 없습니다.</p>
      ) : (
        <div className={companies.length > 2 ? "max-h-[116px] overflow-y-auto" : ""}>
          {companies.map((company) => (
            <Link
              className="flex h-[58px] items-center gap-3 border-b border-[#F3F4F6] bg-white px-4 transition-colors last:border-0 hover:bg-[#F9FAFB]"
              key={company.id}
              to={`/companies/${company.id}`}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF]">
                <Building2 className="h-3.5 w-3.5 text-[#4F46E5]" />
              </div>
              <div className="grid min-w-0 flex-1 grid-cols-3 items-center gap-3 text-[12px] font-semibold text-[#6B7280]">
                <span
                  className="truncate text-[13px] font-extrabold text-[#111827]"
                  title={company.companyName}
                >
                  {company.companyName}
                </span>
                <span className="truncate text-center" title={company.companyField.field}>
                  {company.companyField.field}
                </span>
                <span className="truncate text-right" title={company.companyRegion.region}>
                  {company.companyRegion.region}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#D1D5DB]" />
            </Link>
          ))}
        </div>
      )}
    </DealLinkedTableFrame>
  );
}

function DealLinkedContactsTable({
  contacts,
}: {
  readonly contacts: DealDetail["contacts"];
}) {
  return (
    <DealLinkedTableFrame count={contacts.length} title="연결 담당자">
      {contacts.length === 0 ? (
        <p className="px-4 py-4 text-[13px] text-[#9CA3AF]">연결된 담당자가 없습니다.</p>
      ) : (
        <div className={contacts.length > 2 ? "max-h-[116px] overflow-y-auto" : ""}>
          {contacts.map((contact) => (
            <Link
              className="flex h-[58px] items-center gap-3 border-b border-[#F3F4F6] bg-white px-4 transition-colors last:border-0 hover:bg-[#F9FAFB]"
              key={contact.id}
              to={`/contacts/${contact.id}`}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE]">
                <UserRound className="h-3.5 w-3.5 text-[#2563EB]" />
              </div>
              <div className="grid min-w-0 flex-1 grid-cols-2 items-center gap-4">
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-1.5 text-[13px] font-extrabold text-[#111827]">
                    <span className="truncate">{contact.username}</span>
                    <span className="shrink-0">{contact.contactJobGrade.jobGradeName}</span>
                  </div>
                  <span
                    className="block truncate text-[11px] font-semibold leading-4 text-[#9CA3AF]"
                    title={`${contact.contactDepartment.departmentName} · ${contact.company.companyName}`}
                  >
                    {contact.contactDepartment.departmentName} · {contact.company.companyName}
                  </span>
                </div>
                <div className="grid min-w-0 gap-0.5 text-[11px] font-semibold leading-4 text-[#9CA3AF]">
                  <span className="inline-flex min-w-0 items-center gap-1">
                    <Mail className="h-3 w-3 shrink-0 text-[#9CA3AF]" />
                    <span className="truncate">{contact.email || "-"}</span>
                  </span>
                  <span className="inline-flex min-w-0 items-center gap-1">
                    <Phone className="h-3 w-3 shrink-0 text-[#9CA3AF]" />
                    <span className="truncate">{contact.mobile || "-"}</span>
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#D1D5DB]" />
            </Link>
          ))}
        </div>
      )}
    </DealLinkedTableFrame>
  );
}

function DealLinkedProductsTable({
  products,
}: {
  readonly products: DealDetail["products"];
}) {
  return (
    <DealLinkedTableFrame count={products.length} title="연결 제품">
      {products.length === 0 ? (
        <p className="px-4 py-4 text-[13px] text-[#9CA3AF]">연결된 제품이 없습니다.</p>
      ) : (
        <div className={products.length > 2 ? "max-h-[116px] overflow-y-auto" : ""}>
          {products.map((product) => (
            <Link
              className="flex h-[58px] items-center gap-3 border-b border-[#F3F4F6] bg-white px-4 transition-colors last:border-0 hover:bg-[#F9FAFB]"
              key={product.id}
              to={`/products/${product.id}`}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F0FDF4]">
                <Package className="h-3.5 w-3.5 text-[#15803D]" />
              </div>
              <div className="grid min-w-0 flex-1 grid-cols-2 items-center gap-4">
                <div className="min-w-0">
                  <span
                    className="block truncate text-[13px] font-extrabold text-[#111827]"
                    title={product.productName}
                  >
                    {product.productName}
                  </span>
                  <span
                    className="block truncate text-[11px] font-semibold leading-4 text-[#9CA3AF]"
                    title={`${product.productCategory.categoryName} · ${product.productStatus.statusName}`}
                  >
                    {product.productCategory.categoryName} · {product.productStatus.statusName}
                  </span>
                </div>
                <div className="grid min-w-0 gap-0.5 text-right text-[11px] font-semibold leading-4">
                  <span className="truncate text-[#374151]">
                    {product.productPrice.toLocaleString("ko-KR")}원
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#D1D5DB]" />
            </Link>
          ))}
        </div>
      )}
    </DealLinkedTableFrame>
  );
}

function DealLinkedTableFrame({
  children,
  count,
  title,
}: {
  readonly children: ReactNode;
  readonly count: number;
  readonly title: string;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
      <div className="flex h-[48px] shrink-0 items-center gap-2 border-b border-[#E5E7EB] px-4">
        <span className="text-[14px] font-extrabold text-[#111827]">{title}</span>
        <span className="text-[13px] font-semibold text-[#9CA3AF]">{count}</span>
      </div>
      {children}
    </div>
  );
}

function DealLogPanel({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
      {children}
    </div>
  );
}

function DealInfoPanel({
  detail,
  productCount,
}: {
  readonly detail: DealDetail;
  readonly productCount: number;
}) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
      <h2 className="mb-3 text-[14px] font-extrabold text-[#111827]">요약 정보</h2>
      <dl className="grid gap-2 text-sm">
        <DetailRow label="단계" value={DEAL_STATUS_LABEL[detail.dealStatus]} />
        <DetailRow label="마감일" value={formatDate(detail.expectedEndDate)} />
        <DetailRow label="제품 수" value={`${productCount}개`} />
        <DetailRow label="수정일" value={formatDateTime(detail.updatedAt)} />
      </dl>
    </div>
  );
}

function DealStateShell({
  children,
  variant,
}: {
  readonly children: ReactNode;
  readonly variant: "panel" | "page";
}) {
  if (variant === "page") {
    return (
      <main className="min-h-[calc(100vh-var(--topbar-height))] bg-[#F9FAFB] px-4 py-6 md:px-6">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    );
  }

  return <div className="grid gap-5 p-5">{children}</div>;
}

function formatDealCompanySummary(detail: DealDetail): string {
  return detail.companies.map((company) => company.companyName).join(", ") || "-";
}

function formatDealContactSummary(detail: DealDetail): string {
  return detail.contacts.map((contact) => contact.username).join(", ") || "-";
}

function formatDealContactDepartmentSummary(detail: DealDetail): string {
  return (
    detail.contacts
      .map((contact) => contact.contactDepartment.departmentName)
      .filter(Boolean)
      .join(", ") || "-"
  );
}

function StatusBadge({ status }: { readonly status: DealStatus }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-[11px] font-semibold",
        getDealStatusClass(status)
      )}
    >
      {DEAL_STATUS_LABEL[status]}
    </span>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  subValue,
}: {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly value: string;
  readonly subValue?: string;
}) {
  return (
    <div className="min-w-0 rounded-lg bg-[#F9FAFB] p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#64748B]">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 truncate text-[13px] font-semibold text-[#111827]">{value}</p>
      {subValue ? <p className="mt-0.5 text-[11px] text-[#94A3B8]">{subValue}</p> : null}
    </div>
  );
}

function DetailRow({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex items-start gap-3">
      <dt className="w-16 shrink-0 text-xs text-[#94A3B8]">{label}</dt>
      <dd className="min-w-0 flex-1 text-right text-[13px] font-medium text-[#111827]">
        {value}
      </dd>
    </div>
  );
}

function PanelDivider() {
  return <div className="h-px bg-[#E5EAF0]" />;
}

function NextActionSummary({
  log,
  isLoading,
  tone,
}: {
  readonly log?: DealFollowingActionLog;
  readonly isLoading: boolean;
  readonly tone: "panel" | "page";
}) {
  const isPage = tone === "page";

  return (
    <section
      className={cn(
        isPage && "rounded-lg border border-[#E5EAF0] bg-white p-4",
        !isPage && "grid gap-2"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[13px] font-semibold text-[#374151]">다음 행동</h3>
        {log ? (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-semibold",
              log.checkComplete
                ? "bg-emerald-100 text-emerald-700"
                : "bg-[#EEEEFF] text-[#5E5CE6]"
            )}
          >
            {log.checkComplete ? "완료" : "진행 중"}
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <div className="mt-3 h-16 animate-pulse rounded-lg bg-[#F3F4F6]" />
      ) : log ? (
        <div className="mt-3 rounded-lg bg-[#F9FAFB] p-3">
          <p className="text-[14px] font-medium leading-relaxed text-[#111827]">
            {log.followingAction}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#94A3B8]">
            <Clock3 className="h-3.5 w-3.5" />
            {formatDateTime(log.updatedAt ?? log.createdAt)}
          </p>
        </div>
      ) : (
        <p className="mt-3 rounded-lg bg-[#F9FAFB] p-3 text-[13px] text-[#94A3B8]">
          등록된 다음 행동이 없습니다.
        </p>
      )}
    </section>
  );
}

function DealProductsSection({
  products,
}: {
  readonly products: Array<{ readonly id: string; readonly productName: string }>;
}) {
  return (
    <section>
      <h3 className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold text-[#374151]">
        <Package className="h-3.5 w-3.5" />
        제품
      </h3>
      {products.length === 0 ? (
        <p className="rounded-lg bg-[#F9FAFB] px-3 py-2 text-[12px] text-[#94A3B8]">
          연결된 제품이 없습니다.
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {products.map((p) => (
            <span
              className="inline-flex h-7 items-center rounded-md bg-[#F3F4F6] px-2.5 text-[12px] font-medium text-[#374151]"
              key={p.id}
            >
              {p.productName}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

function StageProgressSection({ activeStatus }: { readonly activeStatus: DealStatus }) {
  return (
    <section>
      <h3 className="mb-2 text-[13px] font-semibold text-[#374151]">단계</h3>
      <div className="flex flex-wrap gap-1.5">
        {DEAL_STATUS_LIST.map((status) => {
          const isActive = status === activeStatus;

          return (
            <span
              className={cn(
                "inline-flex h-8 items-center rounded-md border px-2.5 text-[12px] font-medium",
                isActive
                  ? "border-[#5E5CE6] bg-[#EEEEFF] text-[#5E5CE6]"
                  : "border-[#E5EAF0] bg-white text-[#64748B]"
              )}
              key={status}
            >
              {DEAL_STATUS_LABEL[status]}
            </span>
          );
        })}
      </div>
    </section>
  );
}

// ── 다음 행동 로그 ──

function FollowingActionLogsSection({
  dealId,
  hasNext,
  isFetchingNext,
  logs,
  isLoading,
  onFetchNext,
  tone,
}: {
  readonly dealId: string;
  readonly hasNext: boolean;
  readonly isFetchingNext: boolean;
  readonly logs: DealFollowingActionLog[];
  readonly isLoading: boolean;
  readonly onFetchNext: () => void;
  readonly tone: "panel" | "page-inner";
}) {
  const [isAdding, setIsAdding] = useState(false);
  const createMutation = useCreateFollowingActionLogMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FollowingActionLogFormValues>({
    resolver: zodResolver(followingActionLogFormSchema),
    defaultValues: { followingAction: "" },
  });

  const onAdd = handleSubmit(async (values) => {
    await createMutation.mutateAsync({ dealId, followingAction: values.followingAction });
    reset();
    setIsAdding(false);
  });

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-[#374151]">
          {tone === "panel" ? "활동 로그" : "활동 로그"}
        </h3>
        <button
          className="inline-flex h-7 items-center gap-1 rounded-md bg-[#F3F4F6] px-2 text-[12px] font-medium text-[#374151] hover:bg-[#E5E7EB]"
          onClick={() => setIsAdding((v) => !v)}
          type="button"
        >
          <Plus className="h-3.5 w-3.5" />
          활동 추가
        </button>
      </div>

      {isAdding ? (
        <form className="mb-3 grid gap-2 rounded-lg border border-[#E5EAF0] p-3" onSubmit={onAdd}>
          <div className="flex gap-2">
            <input
              autoFocus
              className="h-9 min-w-0 flex-1 rounded-md border border-[#E5EAF0] px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="다음에 해야 할 행동"
              {...register("followingAction")}
            />
            <button
              className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-white disabled:opacity-60"
              disabled={createMutation.isPending}
              type="submit"
            >
              저장
            </button>
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#E5EAF0]"
              onClick={() => {
                setIsAdding(false);
                reset();
              }}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {errors.followingAction ? (
            <span className="text-xs text-destructive">{errors.followingAction.message}</span>
          ) : null}
        </form>
      ) : null}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div className="h-10 animate-pulse rounded-md bg-muted" key={i} />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <p className="rounded-lg bg-[#F9FAFB] px-3 py-2 text-[12px] text-[#94A3B8]">
          활동 로그가 없습니다.
        </p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <FollowingActionLogItem dealId={dealId} key={log.id} log={log} />
          ))}
        </div>
      )}

      {!isLoading && hasNext ? (
        <button
          className="mt-2 inline-flex h-8 w-full items-center justify-center rounded-md border border-[#E5EAF0] bg-white text-[12px] font-medium text-[#374151] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isFetchingNext}
          onClick={onFetchNext}
          type="button"
        >
          {isFetchingNext ? "불러오는 중" : "더 보기"}
        </button>
      ) : null}
    </section>
  );
}

function FollowingActionLogItem({
  dealId,
  log,
}: {
  readonly dealId: string;
  readonly log: DealFollowingActionLog;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const updateMutation = useUpdateFollowingActionLogMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FollowingActionLogFormValues>({
    resolver: zodResolver(followingActionLogFormSchema),
    defaultValues: { followingAction: log.followingAction },
  });

  const onSave = handleSubmit(async (values) => {
    await updateMutation.mutateAsync({
      dealId,
      followingActionLogId: log.id,
      followingAction: values.followingAction,
    });
    setIsEditing(false);
  });

  const onToggleComplete = async () => {
    await updateMutation.mutateAsync({
      dealId,
      followingActionLogId: log.id,
      checkComplete: !log.checkComplete,
    });
  };

  if (isEditing) {
    return (
      <form className="grid gap-2 rounded-lg border border-[#E5EAF0] p-3" onSubmit={onSave}>
        <div className="flex gap-2">
          <input
            autoFocus
            className="h-8 min-w-0 flex-1 rounded-md border border-[#E5EAF0] px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            {...register("followingAction")}
          />
          <button
            className="inline-flex h-8 items-center rounded-md bg-primary px-2 text-xs text-white disabled:opacity-60"
            disabled={updateMutation.isPending}
            type="submit"
          >
            저장
          </button>
          <button
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E5EAF0]"
            onClick={() => setIsEditing(false)}
            type="button"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        {errors.followingAction ? (
          <span className="text-xs text-destructive">{errors.followingAction.message}</span>
        ) : null}
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg bg-[#F9FAFB] px-3 py-2.5">
      <button
        aria-label={log.checkComplete ? "완료 취소" : "완료 처리"}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          log.checkComplete ? "border-emerald-500 bg-emerald-500 text-white" : "border-gray-300"
        )}
        disabled={updateMutation.isPending}
        onClick={() => void onToggleComplete()}
        type="button"
      >
        {log.checkComplete ? <Check className="h-3 w-3" /> : null}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-[13px]",
            log.checkComplete ? "text-muted-foreground line-through" : "text-[#111827]"
          )}
        >
          {log.followingAction}
        </p>
        <p className="mt-0.5 text-[11px] text-[#94A3B8]">
          {formatDateTime(log.updatedAt ?? log.createdAt)}
        </p>
      </div>
      <button
        aria-label="수정"
        className="shrink-0 text-muted-foreground hover:text-foreground"
        onClick={() => setIsEditing(true)}
        type="button"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ── 메모 로그 ──

function MemoLogsSection({
  dealId,
  hasNext,
  isFetchingNext,
  logs,
  isLoading,
  onFetchNext,
  tone,
}: {
  readonly dealId: string;
  readonly hasNext: boolean;
  readonly isFetchingNext: boolean;
  readonly logs: DealMemoLog[];
  readonly isLoading: boolean;
  readonly onFetchNext: () => void;
  readonly tone: "panel" | "page-inner";
}) {
  const [isAdding, setIsAdding] = useState(false);
  const createMutation = useCreateMemoLogMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MemoLogFormValues>({
    resolver: zodResolver(memoLogFormSchema),
    defaultValues: { memoType: "일반", memo: "" },
  });

  const onAdd = handleSubmit(async (values) => {
    await createMutation.mutateAsync({ dealId, memoType: values.memoType, memo: values.memo });
    reset({ memoType: "일반", memo: "" });
    setIsAdding(false);
  });

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-[13px] font-semibold text-[#374151]">
          <FileText className="h-3.5 w-3.5" />
          {tone === "panel" ? "메모 로그" : "딜 Memo"}
        </h3>
        <button
          className="inline-flex h-7 items-center gap-1 rounded-md bg-[#F3F4F6] px-2 text-[12px] font-medium text-[#374151] hover:bg-[#E5E7EB]"
          onClick={() => setIsAdding((v) => !v)}
          type="button"
        >
          <Plus className="h-3.5 w-3.5" />
          추가
        </button>
      </div>

      {isAdding ? (
        <form className="mb-3 grid gap-2 rounded-lg border border-[#E5EAF0] p-3" onSubmit={onAdd}>
          <input
            className="h-9 rounded-md border border-[#E5EAF0] px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="메모 타입 (예: 일반, 미팅)"
            {...register("memoType")}
          />
          {errors.memoType ? (
            <span className="text-xs text-destructive">{errors.memoType.message}</span>
          ) : null}
          <textarea
            autoFocus
            className="min-h-[80px] resize-y rounded-md border border-[#E5EAF0] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="메모 내용"
            {...register("memo")}
          />
          {errors.memo ? (
            <span className="text-xs text-destructive">{errors.memo.message}</span>
          ) : null}
          <div className="flex gap-2">
            <button
              className="inline-flex h-9 flex-1 items-center justify-center rounded-md bg-primary text-sm font-medium text-white disabled:opacity-60"
              disabled={createMutation.isPending}
              type="submit"
            >
              저장
            </button>
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#E5EAF0]"
              onClick={() => {
                setIsAdding(false);
                reset();
              }}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </form>
      ) : null}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div className="h-12 animate-pulse rounded-md bg-muted" key={i} />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <p className="rounded-lg bg-[#F9FAFB] px-3 py-2 text-[12px] text-[#94A3B8]">
          메모 로그가 없습니다.
        </p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <MemoLogItem dealId={dealId} key={log.id} log={log} />
          ))}
        </div>
      )}

      {!isLoading && hasNext ? (
        <button
          className="mt-2 inline-flex h-8 w-full items-center justify-center rounded-md border border-[#E5EAF0] bg-white text-[12px] font-medium text-[#374151] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isFetchingNext}
          onClick={onFetchNext}
          type="button"
        >
          {isFetchingNext ? "불러오는 중" : "더 보기"}
        </button>
      ) : null}

      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#B45309]">
        <Lock className="h-3.5 w-3.5" />
        개인 메모는 암호화 저장됩니다.
      </p>
    </section>
  );
}

function MemoLogItem({
  dealId,
  log,
}: {
  readonly dealId: string;
  readonly log: DealMemoLog;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const updateMutation = useUpdateMemoLogMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MemoLogFormValues>({
    resolver: zodResolver(memoLogFormSchema),
    defaultValues: { memoType: log.memoType, memo: log.memo },
  });

  const onSave = handleSubmit(async (values) => {
    await updateMutation.mutateAsync({
      dealId,
      memoLogId: log.id,
      memoType: values.memoType,
      memo: values.memo,
    });
    setIsEditing(false);
  });

  if (isEditing) {
    return (
      <form className="grid gap-2 rounded-lg border border-[#E5EAF0] p-3" onSubmit={onSave}>
        <input
          className="h-8 rounded-md border border-[#E5EAF0] px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          {...register("memoType")}
        />
        {errors.memoType ? (
          <span className="text-xs text-destructive">{errors.memoType.message}</span>
        ) : null}
        <textarea
          className="min-h-[60px] resize-y rounded-md border border-[#E5EAF0] px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          {...register("memo")}
        />
        {errors.memo ? (
          <span className="text-xs text-destructive">{errors.memo.message}</span>
        ) : null}
        <div className="flex gap-2">
          <button
            className="inline-flex h-8 flex-1 items-center justify-center rounded-md bg-primary text-xs text-white disabled:opacity-60"
            disabled={updateMutation.isPending}
            type="submit"
          >
            저장
          </button>
          <button
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E5EAF0]"
            onClick={() => setIsEditing(false)}
            type="button"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    );
  }

  return (
    <article className="overflow-hidden rounded-lg bg-[#F9FAFB]">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          aria-expanded={isOpen}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          onClick={() => setIsOpen((value) => !value)}
          type="button"
        >
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-[#94A3B8] transition-transform",
              isOpen && "rotate-90"
            )}
          />
          <span className="truncate text-[13px] font-semibold text-[#374151]">
            {log.memoType || "메모"}
          </span>
          <span className="shrink-0 text-[11px] text-[#94A3B8]">
            {formatDate(log.createdAt)}
          </span>
        </button>
        <button
          aria-label="수정"
          className="shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => setIsEditing(true)}
          type="button"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>

      {isOpen ? (
        <p className="border-t border-[#E5EAF0] px-3 py-3 text-sm leading-relaxed text-[#374151] whitespace-pre-wrap">
          {log.memo}
        </p>
      ) : null}
    </article>
  );
}

function EmptyPanelState() {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-lg border border-dashed border-[#CBD5E1] bg-white py-12 text-center">
      <p className="text-sm text-muted-foreground">딜을 선택하면 상세 정보가 표시됩니다.</p>
    </div>
  );
}

function DealDetailSkeleton({ variant }: { readonly variant: "panel" | "page" }) {
  if (variant === "page") {
    return (
      <div className="grid gap-5">
        <div className="h-40 animate-pulse rounded-lg bg-white" />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="h-96 animate-pulse rounded-lg bg-white" />
          <div className="h-80 animate-pulse rounded-lg bg-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="h-20 animate-pulse rounded-lg bg-muted" />
      <div className="h-16 animate-pulse rounded-lg bg-muted" />
      <div className="h-32 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}

function DealDetailError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-lg border border-red-100 bg-white py-8 text-center">
      <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
      <button
        className="inline-flex h-9 items-center rounded-md border px-3 text-sm hover:bg-muted"
        onClick={onRetry}
        type="button"
      >
        재시도
      </button>
    </div>
  );
}

function getDealStatusClass(status: DealStatus): string {
  switch (status) {
    case "INITIAL_CONTACT":
      return "bg-sky-100 text-sky-700";
    case "NEEDS_CHECK":
      return "bg-blue-100 text-blue-700";
    case "PROPOSAL_QUOTE":
      return "bg-yellow-100 text-yellow-700";
    case "NEGOTIATION":
      return "bg-amber-100 text-amber-700";
    case "WON":
      return "bg-emerald-100 text-emerald-700";
    case "LOST":
      return "bg-rose-100 text-rose-700";
  }
}

function getDeadlineLabel(date: string): string {
  if (!date) return "마감일 없음";

  const deadline = new Date(date);
  if (Number.isNaN(deadline.getTime())) return "마감일 확인 필요";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);

  const days = Math.ceil((deadline.getTime() - today.getTime()) / 86400000);
  if (days < 0) return `${Math.abs(days)}일 지남`;
  if (days === 0) return "오늘 마감";
  return `${days}일 남음`;
}
