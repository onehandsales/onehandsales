import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  ServerCrash,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  useAdminProviderFailureDetail,
  useAdminProviderFailures,
} from "../hooks/use-admin-provider-failures";
import type {
  AdminProviderFailureFeatureArea,
  AdminProviderFailureItem,
  AdminProviderFailureListParams,
  AdminProviderFailureStatus,
  AdminProviderFailureStatusFilter,
  AdminProviderFailureType,
} from "../types/admin-provider-failure";

const providerFailurePageLimit = 50;
const providerTypeOptions: readonly (AdminProviderFailureType | "")[] = [
  "",
  "AI",
  "OCR",
  "STT",
  "CALENDAR",
  "PUSH",
  "EMAIL",
  "SMS",
];
const featureAreaOptions: readonly (AdminProviderFailureFeatureArea | "")[] = [
  "",
  "AI_WEEKLY_REPORT",
  "FOLLOW_UP",
  "MEETING_NOTE",
  "BUSINESS_CARD_SCAN",
  "NOTIFICATION",
  "CALENDAR_SYNC",
];
const statusOptions: readonly AdminProviderFailureStatusFilter[] = [
  "ALL",
  "FAILED",
  "RETRYABLE",
];
const retryableOptions = ["", "true", "false"] as const;

type RetryableFilterValue = (typeof retryableOptions)[number];

type ProviderFailureFilterFormState = {
  readonly providerType: "" | AdminProviderFailureType;
  readonly featureArea: "" | AdminProviderFailureFeatureArea;
  readonly status: AdminProviderFailureStatusFilter;
  readonly retryable: RetryableFilterValue;
  readonly userId: string;
  readonly from: string;
  readonly to: string;
};

const emptyFilters: ProviderFailureFilterFormState = {
  providerType: "",
  featureArea: "",
  status: "ALL",
  retryable: "",
  userId: "",
  from: "",
  to: "",
};

// 기능 : Admin provider 실패 목록, 필터, safe 상세 패널을 렌더링합니다.
export function AdminProviderFailuresScreen() {
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedFailureId, setSelectedFailureId] = useState("");
  const params = useMemo(
    () =>
      toProviderFailureListParams(
        appliedFilters,
        cursorStack[pageIndex],
        providerFailurePageLimit
      ),
    [appliedFilters, cursorStack, pageIndex]
  );
  const failuresQuery = useAdminProviderFailures(params);
  const detailQuery = useAdminProviderFailureDetail(selectedFailureId);

  // 기능 : 필터 form submit 시 첫 cursor 페이지부터 다시 조회합니다.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedFilters(draftFilters);
    setCursorStack([]);
    setPageIndex(0);
    setSelectedFailureId("");
  }

  // 기능 : provider 실패 필터를 초기 상태로 되돌립니다.
  function handleReset() {
    setDraftFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setCursorStack([]);
    setPageIndex(0);
    setSelectedFailureId("");
  }

  // 기능 : 다음 cursor 페이지로 이동합니다.
  function handleNextPage() {
    const nextCursor = failuresQuery.data?.nextCursor;

    if (!nextCursor) {
      return;
    }

    setCursorStack((current) => [
      ...current.slice(0, pageIndex + 1),
      nextCursor,
    ]);
    setPageIndex((current) => current + 1);
    setSelectedFailureId("");
  }

  // 기능 : 이전 cursor 페이지로 이동합니다.
  function handlePrevPage() {
    setPageIndex((current) => Math.max(0, current - 1));
    setSelectedFailureId("");
  }

  return (
    <section className="grid min-w-0 gap-5 px-5 py-5">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b pb-4">
        <div>
          <p className="text-xs font-semibold uppercase text-primary">
            Provider failures
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal">
            Provider 실패 운영
          </h1>
        </div>
        <div className="text-sm text-muted-foreground">
          페이지 {pageIndex + 1}
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px] 2xl:grid-cols-[minmax(0,1fr)_440px]">
        <section className="grid min-w-0 content-start gap-4">
          <ProviderFailureFilterForm
            filters={draftFilters}
            onChange={setDraftFilters}
            onReset={handleReset}
            onSubmit={handleSubmit}
          />

          {failuresQuery.isLoading ? <ProviderFailureLoadingState /> : null}
          {failuresQuery.isError ? (
            <ProviderFailureErrorState
              onRetry={() => void failuresQuery.refetch()}
            />
          ) : null}
          {failuresQuery.data ? (
            <ProviderFailureTable
              items={failuresQuery.data.items}
              selectedFailureId={selectedFailureId}
              onSelect={setSelectedFailureId}
            />
          ) : null}
          {failuresQuery.data && failuresQuery.data.items.length === 0 ? (
            <ProviderFailureEmptyState />
          ) : null}
          {failuresQuery.data ? (
            <ProviderFailurePagination
              pageIndex={pageIndex}
              hasNext={failuresQuery.data.nextCursor !== null}
              onPrev={handlePrevPage}
              onNext={handleNextPage}
            />
          ) : null}
        </section>

        <ProviderFailureDetailPanel
          failureId={selectedFailureId}
          detail={detailQuery.data ?? null}
          isLoading={detailQuery.isLoading}
          isError={detailQuery.isError}
          onRetry={() => void detailQuery.refetch()}
        />
      </div>
    </section>
  );
}

// 기능 : provider 실패 목록 필터 form을 렌더링합니다.
function ProviderFailureFilterForm({
  filters,
  onChange,
  onReset,
  onSubmit,
}: {
  readonly filters: ProviderFailureFilterFormState;
  readonly onChange: (filters: ProviderFailureFilterFormState) => void;
  readonly onReset: () => void;
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      className="grid gap-3 rounded-lg border bg-white p-4 xl:grid-cols-[120px_180px_140px_120px_minmax(190px,1fr)_180px_180px_auto]"
      onSubmit={onSubmit}
    >
      <ProviderFailureSelect
        label="Provider"
        value={filters.providerType}
        options={providerTypeOptions}
        emptyLabel="전체"
        onChange={(value) =>
          onChange({
            ...filters,
            providerType: value as "" | AdminProviderFailureType,
          })
        }
      />
      <ProviderFailureSelect
        label="Feature"
        value={filters.featureArea}
        options={featureAreaOptions}
        emptyLabel="전체"
        onChange={(value) =>
          onChange({
            ...filters,
            featureArea: value as "" | AdminProviderFailureFeatureArea,
          })
        }
      />
      <ProviderFailureSelect
        label="상태"
        value={filters.status}
        options={statusOptions}
        emptyLabel="전체"
        onChange={(value) =>
          onChange({
            ...filters,
            status: value as AdminProviderFailureStatusFilter,
          })
        }
      />
      <ProviderFailureSelect
        label="Retry"
        value={filters.retryable}
        options={retryableOptions}
        emptyLabel="전체"
        onChange={(value) =>
          onChange({ ...filters, retryable: value as RetryableFilterValue })
        }
      />
      <ProviderFailureTextFilter
        label="사용자 ID"
        value={filters.userId}
        onChange={(value) => onChange({ ...filters, userId: value })}
      />
      <ProviderFailureDateFilter
        label="시작"
        value={filters.from}
        onChange={(value) => onChange({ ...filters, from: value })}
      />
      <ProviderFailureDateFilter
        label="종료"
        value={filters.to}
        onChange={(value) => onChange({ ...filters, to: value })}
      />
      <div className="flex items-end gap-2">
        <button
          aria-label="검색"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground"
          title="검색"
          type="submit"
        >
          <Search className="h-4 w-4" />
        </button>
        <button
          aria-label="초기화"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted"
          title="초기화"
          type="button"
          onClick={onReset}
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

// 기능 : provider 실패 select 필터를 렌더링합니다.
function ProviderFailureSelect({
  label,
  value,
  options,
  emptyLabel,
  onChange,
}: {
  readonly label: string;
  readonly value: string;
  readonly options: readonly string[];
  readonly emptyLabel: string;
  readonly onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-xs font-medium text-muted-foreground">
      <span>{label}</span>
      <select
        className="h-9 rounded-md border bg-white px-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option || "ALL"} value={option}>
            {formatFilterOption(option, emptyLabel)}
          </option>
        ))}
      </select>
    </label>
  );
}

// 기능 : provider 실패 텍스트 필터 입력을 렌더링합니다.
function ProviderFailureTextFilter({
  label,
  value,
  onChange,
}: {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-xs font-medium text-muted-foreground">
      <span>{label}</span>
      <input
        className="h-9 rounded-md border bg-white px-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

// 기능 : provider 실패 날짜 범위 필터 입력을 렌더링합니다.
function ProviderFailureDateFilter({
  label,
  value,
  onChange,
}: {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-xs font-medium text-muted-foreground">
      <span>{label}</span>
      <input
        className="h-9 rounded-md border bg-white px-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        type="datetime-local"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

// 기능 : Admin provider 실패 목록 table을 렌더링합니다.
function ProviderFailureTable({
  items,
  selectedFailureId,
  onSelect,
}: {
  readonly items: readonly AdminProviderFailureItem[];
  readonly selectedFailureId: string;
  readonly onSelect: (failureId: string) => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <div className="min-w-[1320px]">
        <div className="grid grid-cols-[150px_90px_150px_110px_minmax(280px,1fr)_180px_190px_100px_80px] gap-3 border-b bg-muted/60 px-4 py-2 text-xs font-semibold text-muted-foreground">
          <span>발생</span>
          <span>Provider</span>
          <span>Feature</span>
          <span>상태</span>
          <span>Error</span>
          <span>사용자</span>
          <span>Target</span>
          <span>Latency</span>
          <span>Retry</span>
        </div>
        <div className="divide-y">
          {items.map((item) => (
            <button
              className={[
                "grid w-full grid-cols-[150px_90px_150px_110px_minmax(280px,1fr)_180px_190px_100px_80px] gap-3 px-4 py-3 text-left text-sm hover:bg-muted/60",
                selectedFailureId === item.id ? "bg-primary/5" : "",
              ].join(" ")}
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
            >
              <span className="text-muted-foreground">
                {formatDateTime(item.occurredAt)}
              </span>
              <span className="font-medium">{item.providerType}</span>
              <span className="truncate">{item.featureArea}</span>
              <span className={getStatusClassName(item.status)}>
                {item.status}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium">
                  {item.safeErrorCode ?? "-"}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {item.safeErrorMessage ?? "-"}
                </span>
              </span>
              <span className="truncate text-primary">
                {item.userEmailMasked ?? item.userId}
              </span>
              <span className="truncate text-muted-foreground">
                {item.targetType}:{item.targetId ?? "-"}
              </span>
              <span>{formatLatency(item.latencyMs)}</span>
              <span>{item.retryable ? "Y" : "N"}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// 기능 : 선택한 provider 실패 상세 safe panel을 렌더링합니다.
function ProviderFailureDetailPanel({
  failureId,
  detail,
  isLoading,
  isError,
  onRetry,
}: {
  readonly failureId: string;
  readonly detail: AdminProviderFailureItem & {
    readonly safeContext: Record<string, string | number | boolean | null>;
  } | null;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly onRetry: () => void;
}) {
  if (!failureId) {
    return (
      <aside className="grid min-h-[360px] min-w-0 place-items-center rounded-lg border bg-white px-5 text-center text-sm text-muted-foreground">
        행을 선택하면 상세가 보여요
      </aside>
    );
  }

  if (isLoading) {
    return (
      <aside className="grid min-h-[360px] min-w-0 place-items-center rounded-lg border bg-white px-5 text-center text-sm text-muted-foreground">
        상세를 불러오고 있어요
      </aside>
    );
  }

  if (isError || !detail) {
    return (
      <aside className="flex min-h-[360px] min-w-0 flex-col items-center justify-center gap-3 rounded-lg border bg-white px-5 text-center">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <p className="text-sm text-muted-foreground">
          상세를 불러오지 못했어요
        </p>
        <button
          className="inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium hover:bg-muted"
          type="button"
          onClick={onRetry}
        >
          다시 시도
        </button>
      </aside>
    );
  }

  return (
    <aside className="grid min-w-0 content-start gap-4 rounded-lg border bg-white p-4">
      <div className="flex items-start gap-3 border-b pb-4">
        <ServerCrash className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="min-w-0">
          <h2 className="text-base font-semibold">실패 상세</h2>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {detail.id}
          </p>
        </div>
      </div>
      <ProviderFailureDetailRow
        label="발생"
        value={formatDateTime(detail.occurredAt)}
      />
      <ProviderFailureDetailRow label="Provider" value={detail.providerType} />
      <ProviderFailureDetailRow label="Source" value={detail.sourceModel} />
      <ProviderFailureDetailRow label="Feature" value={detail.featureArea} />
      <ProviderFailureDetailRow label="Operation" value={detail.operation} />
      <ProviderFailureDetailRow label="상태" value={detail.status} />
      <ProviderFailureDetailRow
        label="사용자"
        value={detail.userEmailMasked ?? detail.userId}
      />
      <Link
        className="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium text-primary hover:bg-muted"
        to={`/users/${detail.userId}`}
      >
        사용자 상세
      </Link>
      <ProviderFailureDetailRow label="사용자 ID" value={detail.userId} />
      <ProviderFailureDetailRow label="Target" value={detail.targetType} />
      <ProviderFailureDetailRow
        label="Target ID"
        value={detail.targetId ?? "-"}
      />
      <ProviderFailureDetailRow
        label="Request ID"
        value={detail.requestId ?? "-"}
      />
      <ProviderFailureDetailRow
        label="Latency"
        value={formatLatency(detail.latencyMs)}
      />
      <ProviderFailureDetailRow
        label="Safe code"
        value={detail.safeErrorCode ?? "-"}
      />
      <div className="grid gap-2">
        <div className="text-xs font-semibold uppercase text-muted-foreground">
          Safe message
        </div>
        <div className="min-h-16 whitespace-pre-wrap break-words rounded-md border bg-muted/40 p-3 text-sm">
          {detail.safeErrorMessage ?? "-"}
        </div>
      </div>
      <div className="grid gap-2">
        <div className="text-xs font-semibold uppercase text-muted-foreground">
          Safe context
        </div>
        <div className="grid divide-y rounded-md border bg-muted/30">
          {Object.entries(detail.safeContext).map(([key, value]) => (
            <div className="grid grid-cols-[150px_minmax(0,1fr)] gap-3 px-3 py-2 text-sm" key={key}>
              <span className="truncate font-medium text-muted-foreground">
                {key}
              </span>
              <span className="break-words">{formatContextValue(value)}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

// 기능 : provider 실패 상세 label/value 행을 렌더링합니다.
function ProviderFailureDetailRow({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="grid gap-1">
      <div className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </div>
      <div className="break-words text-sm">{value}</div>
    </div>
  );
}

// 기능 : provider 실패 목록 loading 상태를 렌더링합니다.
function ProviderFailureLoadingState() {
  return (
    <div className="grid min-h-48 place-items-center rounded-lg border bg-white text-sm text-muted-foreground">
      불러오는 중이에요
    </div>
  );
}

// 기능 : provider 실패 목록 empty 상태를 렌더링합니다.
function ProviderFailureEmptyState() {
  return (
    <div className="grid min-h-48 place-items-center rounded-lg border bg-white px-4 text-center text-sm text-muted-foreground">
      조건에 맞는 provider 실패가 없어요
    </div>
  );
}

// 기능 : provider 실패 목록 error 상태를 렌더링합니다.
function ProviderFailureErrorState({ onRetry }: { readonly onRetry: () => void }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border bg-white px-4 text-center">
      <AlertTriangle className="h-5 w-5 text-destructive" />
      <p className="text-sm text-muted-foreground">
        Provider 실패 목록을 불러오지 못했어요
      </p>
      <button
        className="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium hover:bg-muted"
        type="button"
        onClick={onRetry}
      >
        다시 시도
      </button>
    </div>
  );
}

// 기능 : cursor 기반 provider 실패 페이지 이동 버튼을 렌더링합니다.
function ProviderFailurePagination({
  pageIndex,
  hasNext,
  onPrev,
  onNext,
}: {
  readonly pageIndex: number;
  readonly hasNext: boolean;
  readonly onPrev: () => void;
  readonly onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        aria-label="이전"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted disabled:opacity-40"
        disabled={pageIndex === 0}
        title="이전"
        type="button"
        onClick={onPrev}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        aria-label="다음"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted disabled:opacity-40"
        disabled={!hasNext}
        title="다음"
        type="button"
        onClick={onNext}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// 기능 : provider 실패 filter form state를 API params로 변환합니다.
function toProviderFailureListParams(
  filters: ProviderFailureFilterFormState,
  cursor: string | undefined,
  limit: number
): AdminProviderFailureListParams {
  return {
    limit,
    ...(cursor ? { cursor } : {}),
    ...(filters.providerType ? { providerType: filters.providerType } : {}),
    ...(filters.featureArea ? { featureArea: filters.featureArea } : {}),
    ...(filters.status !== "ALL" ? { status: filters.status } : {}),
    ...(filters.retryable ? { retryable: filters.retryable === "true" } : {}),
    ...(filters.userId.trim() ? { userId: filters.userId.trim() } : {}),
    ...(filters.from ? { from: filters.from } : {}),
    ...(filters.to ? { to: filters.to } : {}),
  };
}

// 기능 : filter option 값을 화면 표시 문자열로 변환합니다.
function formatFilterOption(value: string, emptyLabel: string): string {
  if (!value) {
    return emptyLabel;
  }

  if (value === "true") {
    return "가능";
  }

  if (value === "false") {
    return "불가";
  }

  if (value === "RETRYABLE") {
    return "재시도 가능";
  }

  return value;
}

// 기능 : ISO 날짜 문자열을 Admin Web 테이블 표시용으로 변환합니다.
function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

// 기능 : latency 값을 Admin table 표시 문자열로 변환합니다.
function formatLatency(value: number | null): string {
  return value === null ? "-" : `${value}ms`;
}

// 기능 : safe context 값을 key/value 행 표시 문자열로 변환합니다.
function formatContextValue(value: string | number | boolean | null): string {
  if (value === null) {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return String(value);
}

// 기능 : provider 실패 상태별 table badge className을 반환합니다.
function getStatusClassName(status: AdminProviderFailureStatus): string {
  if (status === "FAILED") {
    return "text-destructive";
  }

  if (status === "PENDING") {
    return "text-amber-700";
  }

  return "text-muted-foreground";
}
