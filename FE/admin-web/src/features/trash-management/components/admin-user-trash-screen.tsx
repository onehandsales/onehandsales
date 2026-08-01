import { ArrowLeft, Database, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  useAdminUserTrashRecords,
  useAdminUserTrashSummary,
} from "../hooks/use-admin-trash";
import type {
  AdminTrashDomain,
  AdminTrashRecordItem,
  AdminTrashRestoreWindowFilter,
  AdminTrashSummaryResponse,
} from "../types/admin-trash";

const domainOptions: readonly (AdminTrashDomain | "ALL")[] = [
  "ALL",
  "COMPANY",
  "CONTACT",
  "PRODUCT",
  "DEAL",
  "SCHEDULE",
  "MEETING_NOTE",
];
const restoreWindowOptions: readonly AdminTrashRestoreWindowFilter[] = [
  "ALL",
  "ACTIVE",
  "EXPIRED",
];
const domainLabels: Record<AdminTrashDomain, string> = {
  COMPANY: "회사",
  CONTACT: "담당자",
  PRODUCT: "제품",
  DEAL: "딜",
  SCHEDULE: "일정",
  MEETING_NOTE: "회의록",
};

// 기능 : Admin 사용자별 Trash 운영 조회 화면을 렌더링합니다.
export function AdminUserTrashScreen() {
  const { userId } = useParams<{ userId: string }>();
  const normalizedUserId = userId ?? "";
  const [domain, setDomain] = useState<AdminTrashDomain | "ALL">("ALL");
  const [restoreWindow, setRestoreWindow] =
    useState<AdminTrashRestoreWindowFilter>("ALL");
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const cursor = cursorStack[cursorStack.length - 1];
  const summaryQuery = useAdminUserTrashSummary(normalizedUserId);
  const recordsQuery = useAdminUserTrashRecords(normalizedUserId, {
    ...(domain !== "ALL" ? { domain } : {}),
    restoreWindow,
    ...(cursor ? { cursor } : {}),
    limit: 30,
  });

  useEffect(() => {
    setCursorStack([]);
  }, [domain, restoreWindow]);

  if (!normalizedUserId) {
    return (
      <section className="grid min-h-screen place-items-center px-5 text-sm text-muted-foreground">
        사용자 ID를 확인해 주세요
      </section>
    );
  }

  return (
    <section className="grid min-w-0 gap-5 px-5 py-5">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            aria-label="사용자 상세로"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted"
            title="사용자 상세로"
            to={`/users/${normalizedUserId}`}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-primary">
              User trash
            </p>
            <h1 className="mt-1 truncate text-2xl font-semibold tracking-normal">
              Trash 운영 조회
            </h1>
          </div>
        </div>
        <div className="truncate text-sm text-muted-foreground">
          {normalizedUserId}
        </div>
      </header>

      <nav className="flex flex-wrap items-center gap-2">
        <Link
          className="inline-flex h-9 items-center rounded-md border px-3 text-sm font-semibold text-muted-foreground hover:bg-muted"
          to={`/users/${normalizedUserId}`}
        >
          Overview
        </Link>
        <Link
          className="inline-flex h-9 items-center rounded-md border px-3 text-sm font-semibold text-muted-foreground hover:bg-muted"
          to={`/users/${normalizedUserId}/domain`}
        >
          도메인
        </Link>
        <Link
          className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground"
          to={`/users/${normalizedUserId}/trash`}
        >
          Trash
        </Link>
      </nav>

      {summaryQuery.data ? (
        <TrashSummaryPanel summary={summaryQuery.data} />
      ) : summaryQuery.isLoading ? (
        <LoadingState label="Trash summary를 불러오고 있어요" />
      ) : null}

      <section className="grid gap-3 rounded-lg border bg-white p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap items-end gap-3">
            <TrashSelect
              label="도메인"
              value={domain}
              options={domainOptions}
              onChange={(value) => setDomain(value as AdminTrashDomain | "ALL")}
            />
            <TrashSelect
              label="복구 기간"
              value={restoreWindow}
              options={restoreWindowOptions}
              onChange={(value) =>
                setRestoreWindow(value as AdminTrashRestoreWindowFilter)
              }
            />
            <button
              aria-label="필터 초기화"
              className="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium hover:bg-muted"
              title="필터 초기화"
              type="button"
              onClick={() => {
                setDomain("ALL");
                setRestoreWindow("ALL");
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
          <Link
            className="inline-flex h-9 items-center rounded-md border px-3 text-sm font-semibold text-primary hover:bg-muted"
            to="/trash/recovery-requests"
          >
            복구 요청 queue
          </Link>
        </div>

        {recordsQuery.isLoading ? (
          <LoadingState label="Trash row를 불러오고 있어요" />
        ) : recordsQuery.isError ? (
          <ErrorState onRetry={() => void recordsQuery.refetch()} />
        ) : (
          <TrashRecordsTable items={recordsQuery.data?.items ?? []} />
        )}

        <CursorPager
          canGoBack={cursorStack.length > 0}
          nextCursor={recordsQuery.data?.nextCursor ?? null}
          onBack={() => setCursorStack((stack) => stack.slice(0, -1))}
          onNext={(nextCursor) =>
            setCursorStack((stack) => [...stack, nextCursor])
          }
        />
      </section>
    </section>
  );
}

// 기능 : Admin Trash summary metric과 도메인별 count를 렌더링합니다.
function TrashSummaryPanel({
  summary,
}: {
  readonly summary: AdminTrashSummaryResponse;
}) {
  return (
    <section className="grid gap-3 rounded-lg border bg-white p-4">
      <div className="flex items-center gap-2">
        <Trash2 className="h-4 w-4 text-primary" />
        <h2 className="text-base font-semibold">Trash summary</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-5">
        <Metric label="전체" value={summary.total} />
        <Metric label="셀프 복구 가능" value={summary.activeRestoreWindow} />
        <Metric label="만료" value={summary.expiredRestoreWindow} />
        <Metric label="요청" value={summary.recoveryRequests.requested} />
        <Metric label="검토/정책" value={summary.recoveryRequests.reviewing} />
      </div>
      <div className="grid gap-2 lg:grid-cols-3">
        {domainOptions
          .filter((value): value is AdminTrashDomain => value !== "ALL")
          .map((domain) => (
            <div className="rounded-md border bg-muted/30 p-3" key={domain}>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Database className="h-4 w-4 text-primary" />
                {domainLabels[domain]}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                <span>전체 {summary.byDomain[domain].total}</span>
                <span>가능 {summary.byDomain[domain].active}</span>
                <span>만료 {summary.byDomain[domain].expired}</span>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}

// 기능 : Admin Trash row table을 렌더링합니다.
function TrashRecordsTable({
  items,
}: {
  readonly items: readonly AdminTrashRecordItem[];
}) {
  if (items.length === 0) {
    return (
      <div className="grid min-h-40 place-items-center rounded-md border bg-muted/20 text-sm text-muted-foreground">
        조건에 맞는 Trash row가 없어요
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <div className="min-w-[1040px]">
        <div className="grid grid-cols-[150px_110px_260px_130px_150px_150px_150px] gap-3 border-b bg-muted/60 px-4 py-2 text-xs font-semibold text-muted-foreground">
          <span>삭제일</span>
          <span>도메인</span>
          <span>제목</span>
          <span>복구 기간</span>
          <span>만료</span>
          <span>민감 flag</span>
          <span>복구 요청</span>
        </div>
        <div className="divide-y">
          {items.map((item) => (
            <div
              className="grid grid-cols-[150px_110px_260px_130px_150px_150px_150px] gap-3 px-4 py-3 text-sm"
              key={`${item.targetType}:${item.targetId}`}
            >
              <span className="text-muted-foreground">
                {formatDateTime(item.deletedAt)}
              </span>
              <span className="font-medium">{domainLabels[item.targetType]}</span>
              <span className="truncate font-medium">{item.titleSnapshot}</span>
              <span>{item.restoreWindow}</span>
              <span>{formatDateTime(item.trashExpiresAt)}</span>
              <span className="text-muted-foreground">
                {item.sensitiveFlags.hasPrivateMemo ? "private memo" : "-"}
              </span>
              <span className="text-muted-foreground">
                {item.recoveryRequest?.status ?? "-"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 기능 : Admin Trash filter select를 렌더링합니다.
function TrashSelect({
  label,
  value,
  options,
  onChange,
}: {
  readonly label: string;
  readonly value: string;
  readonly options: readonly string[];
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
          <option key={option} value={option}>
            {option === "ALL" ? "전체" : option}
          </option>
        ))}
      </select>
    </label>
  );
}

// 기능 : cursor 기반 페이지 이동 버튼을 렌더링합니다.
function CursorPager({
  canGoBack,
  nextCursor,
  onBack,
  onNext,
}: {
  readonly canGoBack: boolean;
  readonly nextCursor: string | null;
  readonly onBack: () => void;
  readonly onNext: (cursor: string) => void;
}) {
  return (
    <div className="flex justify-end gap-2">
      <button
        className="h-9 rounded-md border px-3 text-sm font-medium disabled:opacity-40"
        disabled={!canGoBack}
        type="button"
        onClick={onBack}
      >
        이전
      </button>
      <button
        className="h-9 rounded-md border px-3 text-sm font-medium disabled:opacity-40"
        disabled={!nextCursor}
        type="button"
        onClick={() => nextCursor && onNext(nextCursor)}
      >
        다음
      </button>
    </div>
  );
}

// 기능 : 숫자 metric을 compact하게 렌더링합니다.
function Metric({ label, value }: { readonly label: string; readonly value: number }) {
  return (
    <div className="rounded-md border bg-muted/30 p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value.toLocaleString("ko-KR")}</p>
    </div>
  );
}

// 기능 : Admin Trash loading 상태를 렌더링합니다.
function LoadingState({ label }: { readonly label: string }) {
  return (
    <div className="grid min-h-40 place-items-center rounded-lg border bg-white text-sm text-muted-foreground">
      {label}
    </div>
  );
}

// 기능 : Admin Trash error 상태를 렌더링합니다.
function ErrorState({ onRetry }: { readonly onRetry: () => void }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border bg-white px-4 text-center">
      <p className="text-sm text-muted-foreground">Trash 데이터를 불러오지 못했어요</p>
      <button
        className="inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium hover:bg-muted"
        type="button"
        onClick={onRetry}
      >
        다시 시도
      </button>
    </div>
  );
}

// 기능 : ISO 문자열을 Admin table 표시용 날짜·시간으로 변환합니다.
function formatDateTime(value: string | null): string {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
