import {
  ChevronLeft,
  ChevronRight,
  FileText,
  RotateCcw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useAdminAuditLogs } from "../hooks/use-admin-audit-logs";
import type {
  AdminAuditAction,
  AdminAuditLogListItem,
  AdminAuditLogListParams,
  AdminAuditResult,
} from "../types/admin-audit-log";

const auditLogPageLimit = 50;

const actionOptions: AdminAuditAction[] = [
  "ADMIN_LOGIN",
  "ADMIN_USER_LIST_VIEW",
  "ADMIN_USER_DETAIL_VIEW",
  "ADMIN_DOMAIN_RECORDS_VIEW",
  "ADMIN_TRASH_VIEW",
  "ADMIN_PROVIDER_FAILURE_VIEW",
  "ADMIN_ANALYTICS_VIEW",
  "ADMIN_ACCOUNT_DELETION_VIEW",
  "ADMIN_DATA_EXPORT_VIEW",
  "ADMIN_SYSTEM_CHECK_VIEW",
  "ADMIN_SYSTEM_CHECK_RECORDED",
  "ADMIN_SENSITIVE_RAW_ACCESS",
];

const resultOptions: AdminAuditResult[] = ["SUCCESS", "DENIED", "FAILED"];

type AuditLogFilterFormState = {
  readonly adminUserId: string;
  readonly targetUserId: string;
  readonly action: "" | AdminAuditAction;
  readonly result: "" | AdminAuditResult;
  readonly from: string;
  readonly to: string;
};

const emptyFilters: AuditLogFilterFormState = {
  adminUserId: "",
  targetUserId: "",
  action: "",
  result: "",
  from: "",
  to: "",
};

// 기능 : Admin 감사 로그 목록, 필터, 상세 패널을 렌더링합니다.
export function AuditLogsScreen() {
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedAuditLogId, setSelectedAuditLogId] = useState("");
  const params = useMemo(
    () =>
      toAuditLogListParams(
        appliedFilters,
        cursorStack[pageIndex],
        auditLogPageLimit
      ),
    [appliedFilters, cursorStack, pageIndex]
  );
  const auditLogsQuery = useAdminAuditLogs(params);
  const selectedAuditLog =
    auditLogsQuery.data?.items.find((item) => item.id === selectedAuditLogId) ??
    null;

  // 기능 : 필터 form submit 시 cursor 페이지를 첫 페이지로 초기화합니다.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedFilters(draftFilters);
    setCursorStack([]);
    setPageIndex(0);
    setSelectedAuditLogId("");
  }

  // 기능 : 감사 로그 필터를 초기 상태로 되돌립니다.
  function handleReset() {
    setDraftFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setCursorStack([]);
    setPageIndex(0);
    setSelectedAuditLogId("");
  }

  // 기능 : 다음 cursor 페이지로 이동합니다.
  function handleNextPage() {
    const nextCursor = auditLogsQuery.data?.nextCursor;

    if (!nextCursor) {
      return;
    }

    setCursorStack((current) => [
      ...current.slice(0, pageIndex + 1),
      nextCursor,
    ]);
    setPageIndex((current) => current + 1);
    setSelectedAuditLogId("");
  }

  // 기능 : 이전 cursor 페이지로 이동합니다.
  function handlePrevPage() {
    setPageIndex((current) => Math.max(0, current - 1));
    setSelectedAuditLogId("");
  }

  return (
    <section className="grid min-w-0 gap-5 px-5 py-5">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b pb-4">
        <div>
          <p className="text-xs font-semibold uppercase text-primary">
            Security audit
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal">
            감사 로그
          </h1>
        </div>
        <div className="text-sm text-muted-foreground">
          페이지 {pageIndex + 1}
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="grid min-w-0 content-start gap-4">
          <AuditLogFilterForm
            filters={draftFilters}
            onChange={setDraftFilters}
            onReset={handleReset}
            onSubmit={handleSubmit}
          />

          {auditLogsQuery.isLoading ? <AuditLogLoadingState /> : null}
          {auditLogsQuery.isError ? (
            <AuditLogErrorState onRetry={() => void auditLogsQuery.refetch()} />
          ) : null}
          {auditLogsQuery.data ? (
            <AuditLogTable
              items={auditLogsQuery.data.items}
              selectedAuditLogId={selectedAuditLogId}
              onSelect={setSelectedAuditLogId}
            />
          ) : null}
          {auditLogsQuery.data && auditLogsQuery.data.items.length === 0 ? (
            <AuditLogEmptyState />
          ) : null}
          {auditLogsQuery.data ? (
            <AuditLogPagination
              pageIndex={pageIndex}
              hasNext={auditLogsQuery.data.nextCursor !== null}
              onPrev={handlePrevPage}
              onNext={handleNextPage}
            />
          ) : null}
        </section>

        <AuditLogDetailPanel auditLog={selectedAuditLog} />
      </div>
    </section>
  );
}

// 기능 : 감사 로그 필터 form을 렌더링합니다.
function AuditLogFilterForm({
  filters,
  onChange,
  onReset,
  onSubmit,
}: {
  readonly filters: AuditLogFilterFormState;
  readonly onChange: (filters: AuditLogFilterFormState) => void;
  readonly onReset: () => void;
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      className="grid gap-3 rounded-lg border bg-white p-4 xl:grid-cols-[minmax(180px,1fr)_minmax(180px,1fr)_220px_150px_190px_190px_auto]"
      onSubmit={onSubmit}
    >
      <AuditLogTextFilter
        label="관리자 ID"
        value={filters.adminUserId}
        onChange={(value) => onChange({ ...filters, adminUserId: value })}
      />
      <AuditLogTextFilter
        label="대상 사용자 ID"
        value={filters.targetUserId}
        onChange={(value) => onChange({ ...filters, targetUserId: value })}
      />
      <label className="grid gap-1 text-xs font-medium text-muted-foreground">
        <span>Action</span>
        <select
          className="h-9 rounded-md border bg-white px-2 text-sm text-foreground"
          value={filters.action}
          onChange={(event) =>
            onChange({
              ...filters,
              action: event.target.value as "" | AdminAuditAction,
            })
          }
        >
          <option value="">전체</option>
          {actionOptions.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-xs font-medium text-muted-foreground">
        <span>Result</span>
        <select
          className="h-9 rounded-md border bg-white px-2 text-sm text-foreground"
          value={filters.result}
          onChange={(event) =>
            onChange({
              ...filters,
              result: event.target.value as "" | AdminAuditResult,
            })
          }
        >
          <option value="">전체</option>
          {resultOptions.map((result) => (
            <option key={result} value={result}>
              {result}
            </option>
          ))}
        </select>
      </label>
      <AuditLogDateFilter
        label="시작"
        value={filters.from}
        onChange={(value) => onChange({ ...filters, from: value })}
      />
      <AuditLogDateFilter
        label="종료"
        value={filters.to}
        onChange={(value) => onChange({ ...filters, to: value })}
      />
      <div className="flex items-end gap-2">
        <button
          type="submit"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground"
          aria-label="검색"
          title="검색"
        >
          <Search className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted"
          onClick={onReset}
          aria-label="초기화"
          title="초기화"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

// 기능 : 감사 로그 UUID 텍스트 필터 입력을 렌더링합니다.
function AuditLogTextFilter({
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

// 기능 : 감사 로그 날짜 범위 필터 입력을 렌더링합니다.
function AuditLogDateFilter({
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

// 기능 : Admin 감사 로그 테이블을 렌더링합니다.
function AuditLogTable({
  items,
  selectedAuditLogId,
  onSelect,
}: {
  readonly items: readonly AdminAuditLogListItem[];
  readonly selectedAuditLogId: string;
  readonly onSelect: (auditLogId: string) => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <div className="min-w-[1060px]">
        <div className="grid grid-cols-[150px_170px_230px_90px_120px_150px_minmax(160px,1fr)] gap-3 border-b bg-muted/60 px-4 py-2 text-xs font-semibold text-muted-foreground">
          <span>시간</span>
          <span>관리자</span>
          <span>Action</span>
          <span>Result</span>
          <span>Target</span>
          <span>Request</span>
          <span>사유</span>
        </div>
        <div className="divide-y">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={[
                "grid w-full grid-cols-[150px_170px_230px_90px_120px_150px_minmax(160px,1fr)] gap-3 px-4 py-3 text-left text-sm hover:bg-muted/60",
                selectedAuditLogId === item.id ? "bg-primary/5" : "",
              ].join(" ")}
              onClick={() => onSelect(item.id)}
            >
              <span className="text-muted-foreground">
                {formatDateTime(item.createdAt)}
              </span>
              <span className="truncate">
                {item.adminEmailMasked ?? item.adminUserId}
              </span>
              <span className="truncate font-medium">{item.action}</span>
              <span className={getResultClassName(item.result)}>
                {item.result}
              </span>
              <span className="truncate">{item.targetType}</span>
              <span className="truncate text-muted-foreground">
                {item.requestId ?? "-"}
              </span>
              <span className="truncate text-muted-foreground">
                {item.reasonPreview ?? "-"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// 기능 : 선택된 감사 로그 상세 패널을 렌더링합니다.
function AuditLogDetailPanel({
  auditLog,
}: {
  readonly auditLog: AdminAuditLogListItem | null;
}) {
  if (!auditLog) {
    return (
      <aside className="grid min-h-[360px] min-w-0 place-items-center rounded-lg border bg-white px-5 text-center text-sm text-muted-foreground">
        행을 선택하면 상세가 보여요
      </aside>
    );
  }

  return (
    <aside className="grid min-w-0 content-start gap-4 rounded-lg border bg-white p-4">
      <div className="flex items-start gap-3 border-b pb-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="min-w-0">
          <h2 className="text-base font-semibold">감사 로그 상세</h2>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {auditLog.id}
          </p>
        </div>
      </div>
      <AuditLogDetailRow
        label="생성 시각"
        value={formatDateTime(auditLog.createdAt)}
      />
      <AuditLogDetailRow
        label="관리자"
        value={auditLog.adminEmailMasked ?? auditLog.adminUserId}
      />
      <AuditLogDetailRow label="관리자 ID" value={auditLog.adminUserId} />
      <AuditLogDetailRow
        label="대상 사용자"
        value={auditLog.targetUserId ?? "-"}
      />
      <AuditLogDetailRow label="대상 타입" value={auditLog.targetType} />
      <AuditLogDetailRow label="대상 ID" value={auditLog.targetId ?? "-"} />
      <AuditLogDetailRow label="Action" value={auditLog.action} />
      <AuditLogDetailRow label="Result" value={auditLog.result} />
      <AuditLogDetailRow label="Request ID" value={auditLog.requestId ?? "-"} />
      <div className="grid gap-2">
        <div className="text-xs font-semibold uppercase text-muted-foreground">
          Reason
        </div>
        <div className="min-h-20 whitespace-pre-wrap break-words rounded-md border bg-muted/40 p-3 text-sm">
          {auditLog.reasonPreview ?? "기록된 사유가 없어요"}
        </div>
      </div>
    </aside>
  );
}

// 기능 : 감사 로그 상세 label/value 행을 렌더링합니다.
function AuditLogDetailRow({
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

// 기능 : 감사 로그 목록 loading 상태를 렌더링합니다.
function AuditLogLoadingState() {
  return (
    <div className="grid min-h-48 place-items-center rounded-lg border bg-white text-sm text-muted-foreground">
      불러오는 중이에요
    </div>
  );
}

// 기능 : 감사 로그 목록 empty 상태를 렌더링합니다.
function AuditLogEmptyState() {
  return (
    <div className="grid min-h-48 place-items-center rounded-lg border bg-white px-4 text-center text-sm text-muted-foreground">
      조건에 맞는 감사 로그가 없어요
    </div>
  );
}

// 기능 : 감사 로그 목록 error 상태를 렌더링합니다.
function AuditLogErrorState({ onRetry }: { readonly onRetry: () => void }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border bg-white px-4 text-center">
      <FileText className="h-5 w-5 text-destructive" />
      <p className="text-sm text-muted-foreground">
        감사 로그를 불러오지 못했어요
      </p>
      <button
        type="button"
        className="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium hover:bg-muted"
        onClick={onRetry}
      >
        다시 시도
      </button>
    </div>
  );
}

// 기능 : cursor 기반 감사 로그 페이지 이동 버튼을 렌더링합니다.
function AuditLogPagination({
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
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted disabled:opacity-40"
        onClick={onPrev}
        disabled={pageIndex === 0}
        aria-label="이전"
        title="이전"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted disabled:opacity-40"
        onClick={onNext}
        disabled={!hasNext}
        aria-label="다음"
        title="다음"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// 기능 : 감사 로그 filter form state를 API params로 변환합니다.
function toAuditLogListParams(
  filters: AuditLogFilterFormState,
  cursor: string | undefined,
  limit: number
): AdminAuditLogListParams {
  return {
    limit,
    ...(cursor ? { cursor } : {}),
    ...(filters.adminUserId.trim()
      ? { adminUserId: filters.adminUserId.trim() }
      : {}),
    ...(filters.targetUserId.trim()
      ? { targetUserId: filters.targetUserId.trim() }
      : {}),
    ...(filters.action ? { action: filters.action } : {}),
    ...(filters.result ? { result: filters.result } : {}),
    ...(filters.from ? { from: filters.from } : {}),
    ...(filters.to ? { to: filters.to } : {}),
  };
}

// 기능 : ISO 날짜 문자열을 Admin Web 테이블 표시용으로 변환합니다.
function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

// 기능 : 감사 로그 결과별 table badge className을 반환합니다.
function getResultClassName(result: AdminAuditResult): string {
  if (result === "SUCCESS") {
    return "text-emerald-700";
  }

  if (result === "DENIED") {
    return "text-amber-700";
  }

  return "text-destructive";
}
