// 기능 : 딜 상세 패널/페이지 — 다음 행동 로그, 메모 로그, 제품 표시
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  HandCoins,
  Lock,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  useDealDetail,
  useDealFollowingActionLogs,
  useDealMemoLogs,
} from "@/features/deal/hooks/use-deal-detail";
import {
  useCreateFollowingActionLogMutation,
  useCreateMemoLogMutation,
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
  const dealQuery = useDealDetail(dealId);
  const followingLogsQuery = useDealFollowingActionLogs(dealId);
  const memoLogsQuery = useDealMemoLogs(dealId);
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

  const followingLogs = followingLogsQuery.data?.items ?? [];
  const memoLogs = memoLogsQuery.data?.items ?? [];

  if (variant === "page") {
    return (
      <DealDetailPageLayout
        detail={detail}
        followingLogs={followingLogs}
        followingLogsLoading={followingLogsQuery.isLoading}
        memoLogs={memoLogs}
        memoLogsLoading={memoLogsQuery.isLoading}
      />
    );
  }

  return (
    <DealDetailSidePanel
      detail={detail}
      followingLogs={followingLogs}
      followingLogsLoading={followingLogsQuery.isLoading}
      memoLogs={memoLogs}
      memoLogsLoading={memoLogsQuery.isLoading}
    />
  );
}

function DealDetailSidePanel({
  detail,
  followingLogs,
  followingLogsLoading,
  memoLogs,
  memoLogsLoading,
}: {
  readonly detail: DealDetail;
  readonly followingLogs: DealFollowingActionLog[];
  readonly followingLogsLoading: boolean;
  readonly memoLogs: DealMemoLog[];
  readonly memoLogsLoading: boolean;
}) {
  const nextAction = followingLogs[0];
  const companyName = detail.company?.companyName ?? "-";
  const contactName = detail.contact?.username ?? "-";
  const contactDepartmentName = detail.contact?.contactDepartment?.departmentName ?? "-";
  const products = Array.isArray(detail.products) ? detail.products : [];
  const dealCost = Number.isFinite(detail.dealCost) ? detail.dealCost : 0;
  const dealName = detail.dealName ?? "-";

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
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

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-[18px]">
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
              <MetricCard
                icon={Building2}
                label="회사"
                value={companyName}
              />
              <MetricCard
                icon={UserRound}
                label="담당자"
                value={`${contactName} ${contactDepartmentName}`}
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
            isLoading={followingLogsLoading}
            logs={followingLogs}
            tone="panel"
          />

          <PanelDivider />

          <StageProgressSection activeStatus={detail.dealStatus} />

          <PanelDivider />

          <MemoLogsSection
            dealId={detail.id}
            isLoading={memoLogsLoading}
            logs={memoLogs}
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
  detail,
  followingLogs,
  followingLogsLoading,
  memoLogs,
  memoLogsLoading,
}: {
  readonly detail: DealDetail;
  readonly followingLogs: DealFollowingActionLog[];
  readonly followingLogsLoading: boolean;
  readonly memoLogs: DealMemoLog[];
  readonly memoLogsLoading: boolean;
}) {
  const nextAction = followingLogs[0];
  const [isEditing, setIsEditing] = useState(false);
  const companyName = detail.company?.companyName ?? "-";
  const contactName = detail.contact?.username ?? "-";
  const contactDepartmentName = detail.contact?.contactDepartment?.departmentName ?? "-";
  const products = Array.isArray(detail.products) ? detail.products : [];
  const dealCost = Number.isFinite(detail.dealCost) ? detail.dealCost : 0;
  const dealName = detail.dealName ?? "-";

  return (
    <main className="min-h-[calc(100vh-var(--topbar-height))] bg-[#F9FAFB] px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto grid max-w-7xl gap-5">
        <Link
          className="inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-[#64748B] hover:text-[#374151]"
          to="/deals"
        >
          <ArrowLeft className="h-4 w-4" />
          딜 목록
        </Link>

        <section className="rounded-lg border border-[#E5EAF0] bg-white p-4 md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={detail.dealStatus} />
                <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-medium text-[#64748B]">
                  {getDeadlineLabel(detail.expectedEndDate)}
                </span>
              </div>
              <h1 className="mt-3 text-[22px] font-semibold leading-tight text-[#111827] md:text-[26px]">
                {dealName}
              </h1>
              <p className="mt-2 text-[13px] text-[#64748B]">
                {companyName} · {contactName} · {contactDepartmentName}
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-3 lg:min-w-[260px]">
              <button
                className={cn(
                  "inline-flex h-9 items-center justify-center gap-1.5 rounded-md border px-3 text-[13px] font-semibold transition",
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
              <div className="rounded-lg bg-[#F9FAFB] px-4 py-3">
                <p className="text-[12px] font-medium text-[#64748B]">예상 금액</p>
                <p className="mt-1 text-[26px] font-semibold tracking-normal text-[#111827]">
                  {dealCost.toLocaleString("ko-KR")}원
                </p>
                <p className="mt-2 text-[12px] text-[#94A3B8]">
                  마감 예정일 {formatDate(detail.expectedEndDate)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <MetricCard icon={Building2} label="회사" value={companyName} />
            <MetricCard
              icon={UserRound}
              label="담당자"
              value={`${contactName} ${contactDepartmentName}`}
            />
            <MetricCard
              icon={CalendarClock}
              label="등록일"
              value={formatDateTime(detail.createdAt)}
            />
            <MetricCard
              icon={RefreshCw}
              label="수정일"
              value={formatDateTime(detail.updatedAt)}
            />
          </div>

          {isEditing ? (
            <div className="mt-5">
              <DealInlineEditForm
                detail={detail}
                onSaved={() => setIsEditing(false)}
              />
            </div>
          ) : null}
        </section>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid min-w-0 gap-5">
            <NextActionSummary
              isLoading={followingLogsLoading}
              log={nextAction}
              tone="page"
            />

            <section className="rounded-lg border border-[#E5EAF0] bg-white">
              <div className="flex h-11 items-center border-b border-[#E5EAF0] px-2">
                <span className="inline-flex h-8 items-center rounded-md bg-[#EEEEFF] px-3 text-[13px] font-semibold text-[#5E5CE6]">
                  활동 로그
                </span>
                <span className="inline-flex h-8 items-center px-3 text-[13px] font-medium text-[#64748B]">
                  Memo
                </span>
                <span className="inline-flex h-8 items-center px-3 text-[13px] font-medium text-[#64748B]">
                  일정
                </span>
              </div>
              <div className="grid gap-5 p-4">
                <FollowingActionLogsSection
                  dealId={detail.id}
                  isLoading={followingLogsLoading}
                  logs={followingLogs}
                  tone="page-inner"
                />
                <MemoLogsSection
                  dealId={detail.id}
                  isLoading={memoLogsLoading}
                  logs={memoLogs}
                  tone="page-inner"
                />
              </div>
            </section>
          </div>

          <aside className="grid h-fit gap-5">
            <section className="rounded-lg border border-[#E5EAF0] bg-white p-4">
              <DealProductsSection products={products} />
            </section>
            <section className="rounded-lg border border-[#E5EAF0] bg-white p-4">
              <StageProgressSection activeStatus={detail.dealStatus} />
            </section>
            <section className="rounded-lg border border-[#E5EAF0] bg-white p-4">
              <h3 className="text-[13px] font-semibold text-[#374151]">요약 정보</h3>
              <dl className="mt-3 grid gap-2 text-sm">
                <DetailRow label="단계" value={DEAL_STATUS_LABEL[detail.dealStatus]} />
                <DetailRow label="마감일" value={formatDate(detail.expectedEndDate)} />
                <DetailRow label="제품 수" value={`${products.length}개`} />
                <DetailRow label="수정일" value={formatDateTime(detail.updatedAt)} />
              </dl>
            </section>
          </aside>
        </div>
      </div>
    </main>
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
  logs,
  isLoading,
  tone,
}: {
  readonly dealId: string;
  readonly logs: DealFollowingActionLog[];
  readonly isLoading: boolean;
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
  logs,
  isLoading,
  tone,
}: {
  readonly dealId: string;
  readonly logs: DealMemoLog[];
  readonly isLoading: boolean;
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
