// 기능 : 딜 상세 패널 — 다음 행동 로그, 메모 로그, 제품 표시
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarClock,
  Check,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  useDealDetail,
  useDealFollowingActionLogs,
  useDealMemoLogs,
} from "@/features/deal/hooks/use-deal-detail";
import {
  useCreateFollowingActionLogMutation,
  useCreateMemoLogMutation,
  useUpdateFollowingActionLogMutation,
  useUpdateMemoLogMutation,
} from "@/features/deal/hooks/use-deal-mutations";
import {
  followingActionLogFormSchema,
  memoLogFormSchema,
  type FollowingActionLogFormValues,
  type MemoLogFormValues,
} from "@/features/deal/schemas/deal-schema";
import { DEAL_STATUS_LABEL, type DealFollowingActionLog, type DealMemoLog } from "@/features/deal/types/deal";
import { getApiErrorMessage } from "@/lib/api-client";
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

  const panelClass =
    variant === "panel"
      ? "grid gap-5 p-5"
      : "mx-auto grid max-w-4xl gap-6 px-5 py-6";

  if (!dealId) {
    return (
      <div className={panelClass}>
        <EmptyPanelState />
      </div>
    );
  }

  if (dealQuery.isLoading) {
    return (
      <div className={panelClass}>
        <DealDetailSkeleton />
      </div>
    );
  }

  if (dealQuery.isError || !detail) {
    return (
      <div className={panelClass}>
        <DealDetailError
          error={dealQuery.error}
          onRetry={() => void dealQuery.refetch()}
        />
      </div>
    );
  }

  return (
    <div className={panelClass}>
      {/* 기본 정보 */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-[#374151]">{detail.dealName}</h2>
        <dl className="grid gap-2 text-sm">
          <DlRow label="단계" value={DEAL_STATUS_LABEL[detail.dealStatus]} />
          <DlRow label="금액" value={detail.dealCost.toLocaleString("ko-KR") + "원"} />
          <DlRow label="회사" value={detail.company.companyName} />
          <DlRow
            label="거래처"
            value={`${detail.contact.username} ${detail.contact.contactDepartment.departmentName}`}
          />
          <DlRow label="마감일" value={formatDate(detail.expectedEndDate)} />
          <DlRow label="등록일" value={formatDateTime(detail.createdAt)} icon={CalendarClock} />
          <DlRow label="수정일" value={formatDateTime(detail.updatedAt)} icon={RefreshCw} />
        </dl>
      </section>

      {/* 제품 목록 */}
      <DealProductsSection products={detail.products} />

      {/* 다음 행동 로그 */}
      <FollowingActionLogsSection
        dealId={dealId}
        isLoading={followingLogsQuery.isLoading}
        logs={followingLogsQuery.data?.items ?? []}
      />

      {/* 메모 로그 */}
      <MemoLogsSection
        dealId={dealId}
        isLoading={memoLogsQuery.isLoading}
        logs={memoLogsQuery.data?.items ?? []}
      />
    </div>
  );
}

function DlRow({
  label,
  value,
  icon: Icon,
}: {
  readonly label: string;
  readonly value: string;
  readonly icon?: typeof CalendarClock;
}) {
  return (
    <div className="flex items-start gap-2">
      {Icon ? <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : null}
      <dt className="w-16 shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate font-medium text-[#111827]">{value}</dd>
    </div>
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
        <p className="text-xs text-muted-foreground">연결된 제품이 없습니다.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {products.map((p) => (
            <span
              className="inline-flex h-7 items-center rounded-md bg-[#F3F4F6] px-2.5 text-[12px] text-[#374151]"
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

// ── 다음 행동 로그 ──

function FollowingActionLogsSection({
  dealId,
  logs,
  isLoading,
}: {
  readonly dealId: string;
  readonly logs: DealFollowingActionLog[];
  readonly isLoading: boolean;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const createMutation = useCreateFollowingActionLogMutation();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FollowingActionLogFormValues>({
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
        <h3 className="text-[13px] font-semibold text-[#374151]">다음 행동 로그</h3>
        <button
          className="inline-flex h-7 items-center gap-1 rounded-md bg-[#F3F4F6] px-2 text-[12px] text-[#374151] hover:bg-[#E5E7EB]"
          onClick={() => setIsAdding((v) => !v)}
          type="button"
        >
          <Plus className="h-3.5 w-3.5" />
          추가
        </button>
      </div>

      {isAdding ? (
        <form className="mb-3 flex gap-2" onSubmit={onAdd}>
          <input
            autoFocus
            className="h-9 flex-1 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="다음에 해야 할 행동"
            {...register("followingAction")}
          />
          {errors.followingAction ? (
            <span className="text-xs text-destructive">{errors.followingAction.message}</span>
          ) : null}
          <button
            className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-white disabled:opacity-60"
            disabled={createMutation.isPending}
            type="submit"
          >
            저장
          </button>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border"
            onClick={() => { setIsAdding(false); reset(); }}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </form>
      ) : null}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div className="h-8 animate-pulse rounded-md bg-muted" key={i} />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <p className="text-xs text-muted-foreground">다음 행동 로그가 없습니다.</p>
      ) : (
        <div className="space-y-1.5">
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
  const { register, handleSubmit, formState: { errors } } = useForm<FollowingActionLogFormValues>({
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
      <form className="flex gap-2" onSubmit={onSave}>
        <input
          autoFocus
          className="h-8 flex-1 rounded-md border px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          {...register("followingAction")}
        />
        {errors.followingAction ? (
          <span className="text-xs text-destructive">{errors.followingAction.message}</span>
        ) : null}
        <button
          className="inline-flex h-8 items-center rounded-md bg-primary px-2 text-xs text-white disabled:opacity-60"
          disabled={updateMutation.isPending}
          type="submit"
        >
          저장
        </button>
        <button
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border"
          onClick={() => setIsEditing(false)}
          type="button"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-md border px-3 py-2">
      <button
        aria-label={log.checkComplete ? "완료 취소" : "완료 처리"}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          log.checkComplete
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-gray-300"
        }`}
        disabled={updateMutation.isPending}
        onClick={() => void onToggleComplete()}
        type="button"
      >
        {log.checkComplete ? <Check className="h-3 w-3" /> : null}
      </button>
      <span
        className={`min-w-0 flex-1 truncate text-sm ${
          log.checkComplete ? "text-muted-foreground line-through" : "text-[#111827]"
        }`}
      >
        {log.followingAction}
      </span>
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
}: {
  readonly dealId: string;
  readonly logs: DealMemoLog[];
  readonly isLoading: boolean;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const createMutation = useCreateMemoLogMutation();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<MemoLogFormValues>({
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
        <h3 className="text-[13px] font-semibold text-[#374151]">메모 로그</h3>
        <button
          className="inline-flex h-7 items-center gap-1 rounded-md bg-[#F3F4F6] px-2 text-[12px] text-[#374151] hover:bg-[#E5E7EB]"
          onClick={() => setIsAdding((v) => !v)}
          type="button"
        >
          <Plus className="h-3.5 w-3.5" />
          추가
        </button>
      </div>

      {isAdding ? (
        <form className="mb-3 grid gap-2" onSubmit={onAdd}>
          <input
            className="h-9 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="메모 타입 (예: 일반, 미팅)"
            {...register("memoType")}
          />
          {errors.memoType ? (
            <span className="text-xs text-destructive">{errors.memoType.message}</span>
          ) : null}
          <textarea
            autoFocus
            className="min-h-[80px] resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
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
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border"
              onClick={() => { setIsAdding(false); reset(); }}
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
            <div className="h-16 animate-pulse rounded-md bg-muted" key={i} />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <p className="text-xs text-muted-foreground">메모 로그가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <MemoLogItem dealId={dealId} key={log.id} log={log} />
          ))}
        </div>
      )}
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
  const updateMutation = useUpdateMemoLogMutation();
  const { register, handleSubmit, formState: { errors } } = useForm<MemoLogFormValues>({
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
      <form className="grid gap-2 rounded-md border p-3" onSubmit={onSave}>
        <input
          className="h-8 rounded-md border px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          {...register("memoType")}
        />
        {errors.memoType ? (
          <span className="text-xs text-destructive">{errors.memoType.message}</span>
        ) : null}
        <textarea
          className="min-h-[60px] resize-y rounded-md border px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
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
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border"
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
    <article className="rounded-md border px-3 py-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="rounded-sm bg-[#F3F4F6] px-1.5 py-0.5 text-[11px] font-medium text-[#374151]">
          {log.memoType}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">{formatDate(log.createdAt)}</span>
          <button
            aria-label="수정"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setIsEditing(true)}
            type="button"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#374151]">{log.memo}</p>
    </article>
  );
}

function EmptyPanelState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm text-muted-foreground">딜을 선택하면 상세 정보가 표시됩니다.</p>
    </div>
  );
}

function DealDetailSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="h-20 animate-pulse rounded-lg bg-muted" />
      <div className="h-10 animate-pulse rounded-lg bg-muted" />
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
    <div className="flex flex-col items-center gap-3 py-8 text-center">
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
