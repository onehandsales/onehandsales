import {
  ArchiveRestore,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Filter,
  Handshake,
  History,
  Link2,
  Loader2,
  Package,
  StickyNote,
  Trash2,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { useEffect, useMemo, useState } from "react";
import { useRestoreTrashItemMutation } from "@/features/trash/hooks/use-trash-mutations";
import { useTrashList } from "@/features/trash/hooks/use-trash-queries";
import type {
  TrashItem,
  TrashTargetFilter,
  TrashTargetType,
} from "@/features/trash/types/trash";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDateTime } from "@/utils/format";

const PAGE_SIZE = 10;

const targetOptions: readonly {
  readonly value: TrashTargetFilter;
  readonly label: string;
  readonly group: "주요 항목" | "보조 항목";
}[] = [
  { value: "ALL", label: "주요 항목", group: "주요 항목" },
  { value: "COMPANY", label: "회사", group: "주요 항목" },
  { value: "CONTACT", label: "담당자", group: "주요 항목" },
  { value: "PRODUCT", label: "제품", group: "주요 항목" },
  { value: "DEAL", label: "딜", group: "주요 항목" },
  { value: "SCHEDULE", label: "일정", group: "주요 항목" },
  { value: "MEETING_NOTE", label: "회의록", group: "주요 항목" },
  { value: "COMPANY_LOG", label: "회사 기록", group: "보조 항목" },
  { value: "CONTACT_LOG", label: "담당자 기록", group: "보조 항목" },
  { value: "PRODUCT_LOG", label: "제품 기록", group: "보조 항목" },
  { value: "PRODUCT_CONNECTION", label: "제품 연결", group: "보조 항목" },
  { value: "DEAL_ACTIVITY", label: "딜 활동", group: "보조 항목" },
  { value: "PERSONAL_MEMO", label: "개인 메모", group: "보조 항목" },
];

const targetMeta: Record<
  TrashTargetType,
  { readonly label: string; readonly icon: LucideIcon }
> = {
  COMPANY: { label: "회사", icon: Building2 },
  CONTACT: { label: "담당자", icon: UserRound },
  PRODUCT: { label: "제품", icon: Package },
  DEAL: { label: "딜", icon: Handshake },
  SCHEDULE: { label: "일정", icon: CalendarDays },
  MEETING_NOTE: { label: "회의록", icon: FileText },
  COMPANY_LOG: { label: "회사 기록", icon: History },
  CONTACT_LOG: { label: "담당자 기록", icon: History },
  PRODUCT_LOG: { label: "제품 기록", icon: ClipboardList },
  PRODUCT_CONNECTION: { label: "제품 연결", icon: Link2 },
  DEAL_ACTIVITY: { label: "딜 활동", icon: ClipboardList },
  PERSONAL_MEMO: { label: "개인 메모", icon: StickyNote },
};

export function TrashScreen() {
  const [targetType, setTargetType] = useState<TrashTargetFilter>("ALL");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState<string | null>(null);
  const trashQuery = useTrashList({ targetType, page, pageSize: PAGE_SIZE });
  const restoreMutation = useRestoreTrashItemMutation();
  const trashTotalPages = Math.ceil(
    (trashQuery.data?.totalCount ?? 0) / PAGE_SIZE
  );
  const actionError = trashQuery.error ?? restoreMutation.error ?? null;
  const selectedOption = useMemo(
    () => targetOptions.find((option) => option.value === targetType),
    [targetType]
  );
  const pendingTargetKey = restoreMutation.isPending
    ? getItemKey(restoreMutation.variables)
    : null;

  useEffect(() => {
    setPage(1);
  }, [targetType]);

  const onRestore = async (item: TrashItem) => {
    setNotice(null);
    await restoreMutation.mutateAsync({
      targetType: item.targetType,
      targetId: item.targetId,
    });
    setNotice(`${item.title} 복구가 완료되었습니다.`);
  };

  return (
    <section className="mx-auto grid max-w-[1500px] gap-5 px-5 py-6">
      <header className="flex flex-col gap-2 border-b pb-5">
        <h1 className="text-2xl font-semibold">휴지통</h1>
        <p className="text-sm text-muted-foreground">
          삭제된 주요 데이터를 확인하고 완전 삭제 예정일 전에 복구합니다.
        </p>
      </header>

      {notice ? (
        <NoticeMessage message={notice} onDismiss={() => setNotice(null)} />
      ) : null}

      {actionError ? <ErrorMessage message={getApiErrorMessage(actionError)} /> : null}

      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <section className="grid content-start gap-4 rounded-lg border bg-white p-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" aria-hidden />
            <h2 className="text-base font-semibold">유형 필터</h2>
          </div>

          <TargetFilter
            currentTargetType={targetType}
            onChange={(nextTargetType) => {
              setTargetType(nextTargetType);
              setNotice(null);
            }}
          />
        </section>

        <section className="grid content-start gap-4 rounded-lg border bg-white p-4">
          <TrashListHeader
            currentLabel={selectedOption?.label ?? "주요 항목"}
            isFetching={trashQuery.isFetching}
            totalCount={trashQuery.data?.totalCount ?? 0}
          />

          <TrashList
            items={trashQuery.data?.items ?? []}
            isLoading={trashQuery.isLoading}
            pendingTargetKey={pendingTargetKey}
            onRestore={(item) => void onRestore(item)}
          />

          {trashQuery.data && (trashTotalPages > 1 || page > 1) ? (
            <Pagination
              page={page}
              totalCount={trashQuery.data?.totalCount}
              totalPages={trashTotalPages}
              onPageChange={setPage}
            />
          ) : null}
        </section>
      </div>
    </section>
  );
}

type TargetFilterProps = {
  readonly currentTargetType: TrashTargetFilter;
  readonly onChange: (targetType: TrashTargetFilter) => void;
};

function TargetFilter({ currentTargetType, onChange }: TargetFilterProps) {
  return (
    <div className="grid gap-3">
      {(["주요 항목", "보조 항목"] as const).map((group) => (
        <div key={group} className="grid gap-2">
          <div className="text-xs font-semibold text-muted-foreground">
            {group}
          </div>
          <div className="grid gap-1">
            {targetOptions
              .filter((option) => option.group === group)
              .map((option) => {
                const active = option.value === currentTargetType;

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={[
                      "flex min-h-10 items-center justify-between rounded-md border px-3 text-left text-sm transition",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-transparent hover:border-border hover:bg-muted",
                    ].join(" ")}
                    onClick={() => onChange(option.value)}
                  >
                    <span className="font-medium">{option.label}</span>
                    {active ? (
                      <CheckCircle2 className="h-4 w-4" aria-hidden />
                    ) : null}
                  </button>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}

type TrashListHeaderProps = {
  readonly currentLabel: string;
  readonly isFetching: boolean;
  readonly totalCount: number;
};

function TrashListHeader({
  currentLabel,
  isFetching,
  totalCount,
}: TrashListHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-base font-semibold">휴지통 목록</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {currentLabel} · {totalCount.toLocaleString()}개
        </p>
      </div>
      <div className="flex min-h-9 items-center gap-2 rounded-md border bg-muted/40 px-3 text-sm text-muted-foreground">
        {isFetching ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        <Trash2 className="h-4 w-4" aria-hidden />
        <span>30일 보관</span>
      </div>
    </div>
  );
}

type TrashListProps = {
  readonly items: readonly TrashItem[];
  readonly isLoading: boolean;
  readonly pendingTargetKey: string | null;
  readonly onRestore: (item: TrashItem) => void;
};

function TrashList({
  items,
  isLoading,
  pendingTargetKey,
  onRestore,
}: TrashListProps) {
  if (isLoading) {
    return (
      <div className="grid min-h-[320px] place-items-center rounded-lg border border-dashed">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          <span>휴지통을 불러오는 중입니다.</span>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="grid min-h-[320px] place-items-center rounded-lg border border-dashed px-4 text-center">
        <div>
          <Trash2 className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden />
          <p className="mt-3 text-sm font-medium">삭제된 항목이 없습니다.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            삭제된 주요 항목이 생기면 이 목록에 표시됩니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="hidden grid-cols-[130px_minmax(160px,1fr)_150px_170px_96px] gap-3 border-b bg-muted/50 px-4 py-3 text-xs font-semibold text-muted-foreground xl:grid">
        <span>유형</span>
        <span>항목</span>
        <span>삭제일</span>
        <span>완전 삭제 예정일</span>
        <span className="text-right">작업</span>
      </div>

      <div className="divide-y">
        {items.map((item) => {
          const expired = isExpired(item);
          const itemKey = getItemKey(item);
          const pending = pendingTargetKey === itemKey;

          return (
            <TrashRow
              key={itemKey}
              item={item}
              isExpired={expired}
              isPending={pending}
              onRestore={() => onRestore(item)}
            />
          );
        })}
      </div>
    </div>
  );
}

type TrashRowProps = {
  readonly item: TrashItem;
  readonly isExpired: boolean;
  readonly isPending: boolean;
  readonly onRestore: () => void;
};

function TrashRow({ item, isExpired, isPending, onRestore }: TrashRowProps) {
  const meta = targetMeta[item.targetType];
  const Icon = meta.icon;

  return (
    <article className="grid gap-3 px-4 py-4 xl:grid-cols-[130px_minmax(160px,1fr)_150px_170px_96px] xl:items-center">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted">
          <Icon className="h-4 w-4 text-primary" aria-hidden />
        </span>
        <span className="text-sm font-medium">{meta.label}</span>
      </div>

      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold">{item.title}</h3>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {item.targetId}
        </p>
      </div>

      <DateBlock label="삭제일" value={item.deletedAt} />

      <div className="grid gap-1">
        <DateBlock label="완전 삭제 예정일" value={item.permanentDeleteAt} />
        <span
          className={[
            "w-fit rounded-md border px-2 py-1 text-xs font-medium",
            isExpired
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700",
          ].join(" ")}
        >
          {isExpired ? "만료" : formatRemaining(item.permanentDeleteAt)}
        </span>
      </div>

      <div className="flex justify-start xl:justify-end">
        <button
          type="button"
          className="inline-flex min-h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          disabled={isExpired || isPending}
          onClick={onRestore}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <ArchiveRestore className="h-4 w-4" aria-hidden />
          )}
          <span>복구</span>
        </button>
      </div>
    </article>
  );
}

type DateBlockProps = {
  readonly label: string;
  readonly value: string;
};

function DateBlock({ label, value }: DateBlockProps) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground xl:hidden">
        {label}
      </div>
      <div className="text-sm">{formatDateTime(value, { includeYear: true })}</div>
    </div>
  );
}

type NoticeMessageProps = {
  readonly message: string;
  readonly onDismiss: () => void;
};

function NoticeMessage({ message, onDismiss }: NoticeMessageProps) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
        <span>{message}</span>
      </div>
      <button
        type="button"
        className="rounded-md p-1 hover:bg-emerald-100"
        aria-label="알림 닫기"
        onClick={onDismiss}
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

function ErrorMessage({ message }: { readonly message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}

function getItemKey(
  item: Pick<TrashItem, "targetType" | "targetId"> | undefined
) {
  if (!item) {
    return "";
  }

  return `${item.targetType}:${item.targetId}`;
}

function isExpired(item: TrashItem) {
  return new Date(item.permanentDeleteAt).getTime() <= Date.now();
}

function formatRemaining(value: string) {
  const diff = new Date(value).getTime() - Date.now();
  const days = Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));

  if (days === 0) {
    return "오늘 만료";
  }

  return `${days}일 남음`;
}
