import {
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  Loader2,
  LockKeyhole,
  Package,
  RefreshCw,
  RotateCcw,
  StickyNote,
  Trash2,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ModalShell } from "@/components/ui/modal-shell";
import { Pagination } from "@/components/ui/pagination";
import { ListEmptyState } from "@/components/ui/state";
import { Toast } from "@/components/ui/toast";
import { useRestoreTrashItemMutation } from "@/features/trash/hooks/use-trash-mutations";
import {
  useTrashDetail,
  useTrashList,
} from "@/features/trash/hooks/use-trash-queries";
import type {
  TrashDetail,
  TrashDomainFilter,
  TrashItem,
  TrashItemKindFilter,
  TrashLogTypeFilter,
  TrashSort,
  TrashTargetType,
} from "@/features/trash/types/trash";
import { getApiErrorMessage } from "@/lib/api-client";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/format";

const PAGE_SIZE = 12;

const TRASH_TABLE_GRID_STYLE = {
  gridTemplateColumns:
    "minmax(118px,0.75fr) minmax(220px,1.24fr) minmax(260px,1.48fr) minmax(132px,0.76fr) minmax(132px,0.76fr)",
};

const itemKindOptions: readonly {
  readonly value: TrashItemKindFilter;
  readonly label: string;
}[] = [
  { value: "ALL", label: "유형" },
  { value: "ENTITY", label: "주요 데이터" },
  { value: "LOG", label: "로그" },
];

const domainOptions: readonly {
  readonly value: TrashDomainFilter;
  readonly label: string;
}[] = [
  { value: "ALL", label: "도메인" },
  { value: "COMPANY", label: "회사" },
  { value: "CONTACT", label: "담당자" },
  { value: "PRODUCT", label: "제품" },
  { value: "DEAL", label: "딜" },
];

const logTypeOptions: readonly {
  readonly value: TrashLogTypeFilter;
  readonly label: string;
}[] = [
  { value: "ALL", label: "로그 유형" },
  { value: "MEMO", label: "일반 메모" },
  { value: "PRIVATE_MEMO", label: "비밀 메모" },
  { value: "FOLLOWING_ACTION", label: "다음 행동" },
];

const sortOptions: readonly {
  readonly value: TrashSort;
  readonly label: string;
}[] = [
  { value: "RECENT", label: "최신순" },
  { value: "EXPIRES_SOON", label: "만료 임박순" },
];

const domainLabels: Record<Exclude<TrashDomainFilter, "ALL">, string> = {
  COMPANY: "회사",
  CONTACT: "담당자",
  PRODUCT: "제품",
  DEAL: "딜",
};

const targetMeta: Record<
  TrashTargetType,
  {
    readonly label: string;
    readonly icon: LucideIcon;
    readonly domain?: Exclude<TrashDomainFilter, "ALL">;
    readonly kind: "ENTITY" | "LOG";
    readonly isSensitive?: boolean;
  }
> = {
  COMPANY: { label: "회사", icon: Building2, domain: "COMPANY", kind: "ENTITY" },
  CONTACT: { label: "담당자", icon: UserRound, domain: "CONTACT", kind: "ENTITY" },
  PRODUCT: { label: "제품", icon: Package, domain: "PRODUCT", kind: "ENTITY" },
  DEAL: { label: "딜", icon: BriefcaseBusiness, domain: "DEAL", kind: "ENTITY" },
  COMPANY_MEMO_LOG: {
    label: "회사 일반 메모",
    icon: StickyNote,
    domain: "COMPANY",
    kind: "LOG",
  },
  COMPANY_PRIVATE_MEMO_LOG: {
    label: "회사 비밀 메모",
    icon: LockKeyhole,
    domain: "COMPANY",
    kind: "LOG",
    isSensitive: true,
  },
  CONTACT_MEMO_LOG: {
    label: "담당자 일반 메모",
    icon: StickyNote,
    domain: "CONTACT",
    kind: "LOG",
  },
  CONTACT_PRIVATE_MEMO_LOG: {
    label: "담당자 비밀 메모",
    icon: LockKeyhole,
    domain: "CONTACT",
    kind: "LOG",
    isSensitive: true,
  },
  PRODUCT_MEMO_LOG: {
    label: "제품 일반 메모",
    icon: StickyNote,
    domain: "PRODUCT",
    kind: "LOG",
  },
  PRODUCT_PRIVATE_MEMO_LOG: {
    label: "제품 비밀 메모",
    icon: LockKeyhole,
    domain: "PRODUCT",
    kind: "LOG",
    isSensitive: true,
  },
  DEAL_MEMO_LOG: {
    label: "딜 일반 메모",
    icon: StickyNote,
    domain: "DEAL",
    kind: "LOG",
  },
  DEAL_FOLLOWING_ACTION_LOG: {
    label: "다음 행동",
    icon: ClipboardList,
    domain: "DEAL",
    kind: "LOG",
  },
};

export function TrashScreen() {
  const [itemKind, setItemKind] = useState<TrashItemKindFilter>("ALL");
  const [domain, setDomain] = useState<TrashDomainFilter>("ALL");
  const [logType, setLogType] = useState<TrashLogTypeFilter>("ALL");
  const [sort, setSort] = useState<TrashSort>("RECENT");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<TrashItem | null>(null);

  const trashQuery = useTrashList({
    domain,
    itemKind,
    logType: itemKind === "ENTITY" ? "ALL" : logType,
    page,
    pageSize: PAGE_SIZE,
    sort,
  });
  const restoreMutation = useRestoreTrashItemMutation();
  const trashList = trashQuery.data;
  const items = useMemo(() => trashList?.items ?? [], [trashList?.items]);
  const totalPages = trashList?.totalPages ?? 1;
  const pendingTargetKey = restoreMutation.isPending
    ? getItemKey(restoreMutation.variables)
    : null;
  const hasFilter =
    itemKind !== "ALL" ||
    domain !== "ALL" ||
    logType !== "ALL" ||
    sort !== "RECENT";

  useEffect(() => {
    setPage(1);
  }, [domain, itemKind, logType, sort]);

  const clearFilters = () => {
    setItemKind("ALL");
    setDomain("ALL");
    setLogType("ALL");
    setSort("RECENT");
    setPage(1);
    setNotice(null);
  };

  const onItemKindChange = (nextItemKind: TrashItemKindFilter) => {
    setItemKind(nextItemKind);
    if (nextItemKind === "ENTITY") {
      setLogType("ALL");
    }
    setNotice(null);
  };

  const onRestore = async (item: TrashItem) => {
    setNotice(null);
    restoreMutation.reset();
    await restoreMutation.mutateAsync({
      targetType: item.targetType,
      targetId: item.targetId,
    });
    setNotice(`${getDisplayTitle(item)} 복구가 완료되었습니다.`);
    setSelectedItem(null);
  };

  return (
    <section className="flex min-h-full flex-col bg-[#FAFAF8]">
      <PageHeader breadcrumbs={[{ label: "휴지통", icon: Trash2 }]} />

      <div className="flex min-h-10 shrink-0 items-center gap-1.5 overflow-x-auto px-5 py-1 md:flex lg:gap-2">
        <button
          className={
            hasFilter
              ? "inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-[6px] border border-[#E6EAF0] bg-white px-3 text-[13px] font-medium text-[#475569] transition hover:bg-[#F9FAFB]"
              : "inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-[6px] border border-[#C7D7FE] bg-[#EAF2FF] px-3 text-[13px] font-bold text-[#1D4ED8] transition"
          }
          onClick={clearFilters}
          type="button"
        >
          전체
        </button>

        <TrashFilterSelect
          active={itemKind !== "ALL"}
          ariaLabel="데이터 유형 필터"
          options={itemKindOptions}
          value={itemKind}
          onChange={(value) => onItemKindChange(value as TrashItemKindFilter)}
        />
        <TrashFilterSelect
          active={domain !== "ALL"}
          ariaLabel="도메인 필터"
          options={domainOptions}
          value={domain}
          onChange={(value) => {
            setDomain(value as TrashDomainFilter);
            setNotice(null);
          }}
        />
        <TrashFilterSelect
          active={itemKind !== "ENTITY" && logType !== "ALL"}
          ariaLabel="로그 유형 필터"
          disabled={itemKind === "ENTITY"}
          options={logTypeOptions}
          value={logType}
          onChange={(value) => {
            setLogType(value as TrashLogTypeFilter);
            setNotice(null);
          }}
        />
        <TrashFilterSelect
          active={sort !== "RECENT"}
          ariaLabel="정렬"
          options={sortOptions}
          value={sort}
          onChange={(value) => {
            setSort(value as TrashSort);
            setNotice(null);
          }}
        />
        <button
          aria-label="초기화"
          className={cn(
            "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[12px] font-medium transition hover:border-[#93C5FD] focus:border-[#4880EE] focus:outline-none focus:ring-1 focus:ring-[#4880EE]",
            !hasFilter
              ? "border-[#C7D7FE] bg-[#EAF2FF] font-bold text-[#1D4ED8]"
              : "border-[#E5E7EB] bg-[#F3F4F6] text-[#4B5563]",
          )}
          onClick={clearFilters}
          type="button"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      </div>

      {notice ? (
        <div className="px-5 pt-2">
          <Toast
            message={notice}
            onClose={() => setNotice(null)}
            variant="success"
          />
        </div>
      ) : null}
      {trashQuery.error ? (
        <div className="px-5 pt-2">
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
            {getApiErrorMessage(trashQuery.error)}
          </p>
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto px-5 pb-3 pt-1 xl:gap-5">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex w-full min-w-[860px] flex-col overflow-hidden rounded-lg border border-[#E2E5EC] bg-white shadow-sm">
            <div
              className="grid h-11 shrink-0 items-center border-b border-[#E2E5EC] bg-[#F9FAFB] px-3 md:px-4 xl:px-6"
              style={TRASH_TABLE_GRID_STYLE}
            >
              <span className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                유형
              </span>
              <span className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                제목
              </span>
              <span className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                위치
              </span>
              <span className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                삭제일
              </span>
              <span className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                남은 기간
              </span>
            </div>

            {trashQuery.isLoading ? (
              <TrashListSkeleton />
            ) : trashQuery.isError ? (
              <TrashListError
                error={trashQuery.error}
                onRetry={() => void trashQuery.refetch()}
              />
            ) : items.length === 0 ? (
              <ListEmptyState
                icon={Trash2}
                title={
                  hasFilter
                    ? "조건에 맞는 삭제 데이터가 없습니다"
                    : "휴지통에 삭제된 데이터가 없습니다"
                }
              />
            ) : (
              <div className="min-w-0">
                {items.map((item) => {
                  const itemKey = getItemKey(item);
                  return (
                    <TrashListRow
                      item={item}
                      key={itemKey}
                      onPreview={() => {
                        restoreMutation.reset();
                        setSelectedItem(item);
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {trashList ? (
            <Pagination
              page={page}
              totalPages={Math.max(totalPages, 1)}
              onPageChange={setPage}
            />
          ) : null}
        </div>
      </div>

      <TrashDetailDialog
        isRestorePending={
          selectedItem ? pendingTargetKey === getItemKey(selectedItem) : false
        }
        item={selectedItem}
        open={selectedItem !== null}
        restoreError={selectedItem ? restoreMutation.error : null}
        onOpenChange={(open) => {
          if (!open) {
            restoreMutation.reset();
            setSelectedItem(null);
          }
        }}
        onRestore={(item) => void onRestore(item)}
      />
    </section>
  );
}

type TrashFilterSelectProps<TValue extends string> = {
  readonly active: boolean;
  readonly ariaLabel: string;
  readonly disabled?: boolean;
  readonly options: readonly {
    readonly value: TValue;
    readonly label: string;
  }[];
  readonly value: TValue;
  readonly onChange: (value: TValue) => void;
};

function TrashFilterSelect<TValue extends string>({
  active,
  ariaLabel,
  disabled = false,
  options,
  value,
  onChange,
}: TrashFilterSelectProps<TValue>) {
  return (
    <select
      aria-label={ariaLabel}
      className={cn(
        "h-8 w-[clamp(112px,12vw,140px)] shrink-0 appearance-none rounded-md border px-3 text-[13px] outline-none transition disabled:cursor-not-allowed disabled:opacity-60",
        active
          ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
          : "border-[#E2E5EC] bg-transparent text-[#6B7280] hover:bg-[#FAFAF8]",
      )}
      disabled={disabled}
      value={value}
      onChange={(event) => onChange(event.target.value as TValue)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function TrashListRow({
  item,
  onPreview,
}: {
  readonly item: TrashItem;
  readonly onPreview: () => void;
}) {
  const meta = targetMeta[item.targetType];
  const Icon = meta.icon;
  const expiresAt = getTrashExpiresAt(item);
  const remaining = getRemainingState(expiresAt);

  return (
    <div
      className="grid h-[66px] w-full cursor-pointer items-center border-b border-[#E2E5EC] bg-white px-3 transition-colors last:border-b-0 hover:bg-blue-50/60 md:px-4 xl:px-6"
      style={TRASH_TABLE_GRID_STYLE}
      role="button"
      tabIndex={0}
      onClick={onPreview}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onPreview();
        }
      }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#EEF4FF] text-[#4880EE]">
          <Icon className="h-3.5 w-3.5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold text-[#111827]">
            {meta.label}
          </p>
          <span
            className={cn(
              "mt-1 inline-flex max-w-full items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold",
              meta.kind === "ENTITY"
                ? "border-[#D7E3FF] bg-[#F3F7FF] text-[#4880EE]"
                : "border-[#E5E7EB] bg-[#F8FAFC] text-[#475569]",
            )}
          >
            {meta.kind === "ENTITY" ? "주요 데이터" : "로그"}
          </span>
        </div>
      </div>
      <div className="min-w-0 pr-2">
        <p className="truncate text-[13px] font-bold text-[#111827]">
          {getDisplayTitle(item)}
        </p>
      </div>
      <div className="min-w-0 pr-2">
        <p className="truncate text-[13px] font-semibold text-[#111827]">
          {formatLocation(item)}
        </p>
      </div>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium text-[#111827]">
          {formatDateTime(item.deletedAt, { includeYear: true })}
        </p>
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "w-fit rounded-full border px-2 py-1 text-[12px] font-semibold",
            remaining.tone === "expired"
              ? "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]"
              : remaining.tone === "urgent"
                ? "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]"
                : remaining.tone === "warning"
                  ? "border-[#FED7AA] bg-[#FFF7ED] text-[#C2410C]"
                  : remaining.tone === "unknown"
                    ? "border-[#E5E7EB] bg-[#F8FAFC] text-[#64748B]"
                    : "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
          )}
        >
          {remaining.label}
        </p>
      </div>
    </div>
  );
}

type TrashDetailDialogProps = {
  readonly open: boolean;
  readonly item: TrashItem | null;
  readonly isRestorePending: boolean;
  readonly restoreError: unknown;
  readonly onOpenChange: (open: boolean) => void;
  readonly onRestore: (item: TrashItem) => void;
};

function TrashDetailDialog({
  open,
  item,
  isRestorePending,
  restoreError,
  onOpenChange,
  onRestore,
}: TrashDetailDialogProps) {
  const detailInput = item
    ? { targetType: item.targetType, targetId: item.targetId }
    : null;
  const detailQuery = useTrashDetail(detailInput, open && detailInput !== null);
  const detail = detailQuery.data ?? null;
  const displayItem = detail ?? item;
  const expiresAt = displayItem ? getTrashExpiresAt(displayItem) : null;
  const expired = displayItem ? isExpired(displayItem) : false;
  const remaining = getRemainingState(expiresAt);
  const restoreErrorMessage = restoreError
    ? getApiErrorMessage(restoreError)
    : null;

  if (!open || !item) {
    return null;
  }

  return (
    <ModalShell
      footer={
        <>
          <button
            className="h-10 rounded-md border px-4 text-sm font-medium hover:bg-muted"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            닫기
          </button>
          <button
            aria-label="복구"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#4880EE] px-4 text-sm font-semibold text-white transition hover:bg-[#3B73E4] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={expired || isRestorePending}
            onClick={() => onRestore(item)}
            title="복구"
            type="button"
          >
            {isRestorePending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <RotateCcw className="h-4 w-4" aria-hidden />
            )}
            복구
          </button>
        </>
      }
      open={open}
      size="md"
      title="휴지통 상세"
      onOpenChange={onOpenChange}
    >
      <div className="grid gap-4">
        {restoreErrorMessage ? (
          <p
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-medium text-red-600"
            role="alert"
          >
            {restoreErrorMessage}
          </p>
        ) : null}

        {detailQuery.isLoading ? (
          <div className="flex min-h-[260px] items-center justify-center gap-2 text-[13px] text-[#64748B]">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            내용을 불러오는 중입니다.
          </div>
        ) : detailQuery.isError ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
            <p className="text-[13px] text-red-500">
              {getApiErrorMessage(detailQuery.error)}
            </p>
            <button
              className="mt-3 inline-flex h-8 items-center rounded-md border border-[#E2E5EC] bg-white px-3 text-[12px] text-[#6B7280]"
              onClick={() => void detailQuery.refetch()}
              type="button"
            >
              다시 시도
            </button>
          </div>
        ) : detail ? (
          <TrashDetailContent detail={detail} remaining={remaining} />
        ) : null}
      </div>
    </ModalShell>
  );
}

function TrashDetailContent({
  detail,
  remaining,
}: {
  readonly detail: TrashDetail;
  readonly remaining: RemainingState;
}) {
  const meta = targetMeta[detail.targetType];
  const Icon = meta.icon;

  return (
    <div className="grid gap-5">
      <section className="flex min-w-0 items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#EEF4FF] text-[#4880EE]">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[16px] font-bold text-[#111827]">
              {getDisplayTitle(detail)}
            </h3>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                meta.kind === "ENTITY"
                  ? "border-[#D7E3FF] bg-[#F3F7FF] text-[#4880EE]"
                  : "border-[#E5E7EB] bg-[#F8FAFC] text-[#475569]",
              )}
            >
              {meta.kind === "ENTITY" ? "주요 데이터" : "로그"}
            </span>
          </div>
          <p className="mt-1 text-[13px] font-medium text-[#475569]">
            {detail.summary}
          </p>
        </div>
      </section>

      <section className="grid gap-2 rounded-lg border border-[#E2E5EC] bg-[#F9FAFB] p-3">
        <TrashDetailMetaRow label="위치" value={formatLocation(detail)} />
        <TrashDetailMetaRow
          label="삭제일"
          value={formatDateTime(detail.deletedAt, { includeYear: true })}
        />
        <TrashDetailMetaRow label="남은 기간" value={remaining.label} />
      </section>

      <section className="grid gap-3">
        <h4 className="text-[13px] font-bold text-[#111827]">주요 내용</h4>
        <div className="grid gap-2 sm:grid-cols-2">
          {detail.fields.map((field) => (
            <div
              className="min-w-0 rounded-md border border-[#E5E7EB] bg-white px-3 py-2"
              key={field.label}
            >
              <p className="text-[11px] font-semibold text-[#64748B]">
                {field.label}
              </p>
              <p className="mt-1 truncate text-[13px] font-semibold text-[#111827]">
                {field.value?.trim() || "-"}
              </p>
            </div>
          ))}
        </div>
      </section>

      {detail.content ? (
        <section className="grid gap-2">
          <h4 className="text-[13px] font-bold text-[#111827]">내용</h4>
          <div className="max-h-[220px] overflow-y-auto whitespace-pre-wrap rounded-md border border-[#E5E7EB] bg-white px-3 py-3 text-[13px] leading-6 text-[#111827]">
            {detail.content}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function TrashDetailMetaRow({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-2 text-[13px]">
      <span className="font-semibold text-[#64748B]">{label}</span>
      <span className="truncate font-semibold text-[#111827]">{value}</span>
    </div>
  );
}

function TrashListSkeleton() {
  return (
    <div>
      {Array.from({ length: 9 }, (_, index) => (
        <div
          className="h-[66px] animate-pulse border-b border-[#E2E5EC] bg-[#F9FAFB] last:border-b-0"
          key={index}
        />
      ))}
    </div>
  );
}

function TrashListError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-5 py-12 text-center">
      <p className="text-[13px] text-red-500">{getApiErrorMessage(error)}</p>
      <button
        className="mt-3 inline-flex h-8 items-center rounded-md border border-[#E2E5EC] bg-white px-3 text-[12px] text-[#6B7280]"
        onClick={onRetry}
        type="button"
      >
        다시 시도
      </button>
    </div>
  );
}

function getItemKey(
  item: Pick<TrashItem, "targetType" | "targetId"> | undefined,
) {
  if (!item) {
    return "";
  }

  return `${item.targetType}:${item.targetId}`;
}

function getDisplayTitle(
  item: Pick<TrashItem, "targetType" | "title">,
) {
  const meta = targetMeta[item.targetType];

  if (meta.isSensitive) {
    return "비밀 메모";
  }

  return item.title || meta.label;
}

function formatLocation(
  item: Pick<TrashItem, "parentTitle" | "parentType" | "targetType" | "title">,
) {
  const meta = targetMeta[item.targetType];

  if (meta.kind === "ENTITY") {
    return meta.domain ? `${domainLabels[meta.domain]} 데이터` : "-";
  }

  if (item.parentTitle && item.parentType && item.parentType !== "ALL") {
    return `${domainLabels[item.parentType]} > ${item.parentTitle}`;
  }

  if (meta.domain) {
    return `${domainLabels[meta.domain]} > -`;
  }

  return "-";
}

function getTrashExpiresAt(item: {
  readonly trashExpiresAt?: string | null;
  readonly permanentDeleteAt?: string | null;
}) {
  return item.trashExpiresAt ?? item.permanentDeleteAt ?? null;
}

function isExpired(item: {
  readonly trashExpiresAt?: string | null;
  readonly permanentDeleteAt?: string | null;
}) {
  const expiresAt = getTrashExpiresAt(item);

  if (!expiresAt) {
    return false;
  }

  return new Date(expiresAt).getTime() <= Date.now();
}

type RemainingState = {
  readonly label: string;
  readonly tone: "normal" | "warning" | "urgent" | "expired" | "unknown";
};

function getRemainingState(value: string | null): RemainingState {
  if (!value) {
    return { label: "-", tone: "unknown" };
  }

  const diffMs = new Date(value).getTime() - Date.now();

  if (Number.isNaN(diffMs)) {
    return { label: "-", tone: "unknown" };
  }

  if (diffMs <= 0) {
    return { label: "만료됨", tone: "expired" };
  }

  const hours = Math.ceil(diffMs / (60 * 60 * 1000));

  if (hours < 24) {
    return { label: `${hours}시간 남음`, tone: "urgent" };
  }

  const days = Math.ceil(hours / 24);

  if (days <= 1) {
    return { label: "D-1", tone: "urgent" };
  }

  if (days <= 2) {
    return { label: `D-${days}`, tone: "warning" };
  }

  return { label: `D-${days}`, tone: "normal" };
}
