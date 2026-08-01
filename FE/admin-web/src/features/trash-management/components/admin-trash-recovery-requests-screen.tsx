import { MessageSquare, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAdminTrashRecoveryRequests } from "../hooks/use-admin-trash";
import type {
  AdminTrashDomain,
  AdminTrashRecoveryRequestQueueItem,
  AdminTrashRecoveryRequestStatus,
} from "../types/admin-trash";

const statusOptions: readonly (AdminTrashRecoveryRequestStatus | "ALL")[] = [
  "ALL",
  "REQUESTED",
  "REVIEWING",
  "WAITING_RECOVERY_POLICY",
  "RECOVERY_AVAILABLE",
  "REJECTED",
  "CLOSED",
];
const targetTypeOptions: readonly (AdminTrashDomain | "ALL")[] = [
  "ALL",
  "COMPANY",
  "CONTACT",
  "PRODUCT",
  "DEAL",
  "SCHEDULE",
  "MEETING_NOTE",
];

// 기능 : Admin Trash 복구 요청 queue 화면을 렌더링합니다.
export function AdminTrashRecoveryRequestsScreen() {
  const [status, setStatus] =
    useState<AdminTrashRecoveryRequestStatus | "ALL">("REQUESTED");
  const [targetType, setTargetType] = useState<AdminTrashDomain | "ALL">("ALL");
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const cursor = cursorStack[cursorStack.length - 1];
  const requestsQuery = useAdminTrashRecoveryRequests({
    ...(status !== "ALL" ? { status } : {}),
    ...(targetType !== "ALL" ? { targetType } : {}),
    ...(cursor ? { cursor } : {}),
    limit: 30,
  });

  useEffect(() => {
    setCursorStack([]);
  }, [status, targetType]);

  return (
    <section className="grid min-w-0 gap-5 px-5 py-5">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-primary">
            Trash recovery
          </p>
          <h1 className="mt-1 truncate text-2xl font-semibold tracking-normal">
            복구 요청 queue
          </h1>
        </div>
        <Link
          className="inline-flex h-9 items-center rounded-md border px-3 text-sm font-semibold text-muted-foreground hover:bg-muted"
          to="/users"
        >
          사용자 목록
        </Link>
      </header>

      <section className="grid gap-3 rounded-lg border bg-white p-4">
        <div className="flex flex-wrap items-end gap-3">
          <QueueSelect
            label="상태"
            options={statusOptions}
            value={status}
            onChange={(value) =>
              setStatus(value as AdminTrashRecoveryRequestStatus | "ALL")
            }
          />
          <QueueSelect
            label="대상"
            options={targetTypeOptions}
            value={targetType}
            onChange={(value) => setTargetType(value as AdminTrashDomain | "ALL")}
          />
          <button
            aria-label="필터 초기화"
            className="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium hover:bg-muted"
            title="필터 초기화"
            type="button"
            onClick={() => {
              setStatus("REQUESTED");
              setTargetType("ALL");
            }}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {requestsQuery.isLoading ? (
          <LoadingState />
        ) : requestsQuery.isError ? (
          <ErrorState onRetry={() => void requestsQuery.refetch()} />
        ) : (
          <RecoveryRequestsTable items={requestsQuery.data?.items ?? []} />
        )}

        <div className="flex justify-end gap-2">
          <button
            className="h-9 rounded-md border px-3 text-sm font-medium disabled:opacity-40"
            disabled={cursorStack.length === 0}
            type="button"
            onClick={() => setCursorStack((stack) => stack.slice(0, -1))}
          >
            이전
          </button>
          <button
            className="h-9 rounded-md border px-3 text-sm font-medium disabled:opacity-40"
            disabled={!requestsQuery.data?.nextCursor}
            type="button"
            onClick={() => {
              const nextCursor = requestsQuery.data?.nextCursor;

              if (nextCursor) {
                setCursorStack((stack) => [...stack, nextCursor]);
              }
            }}
          >
            다음
          </button>
        </div>
      </section>
    </section>
  );
}

// 기능 : Admin 복구 요청 queue table을 렌더링합니다.
function RecoveryRequestsTable({
  items,
}: {
  readonly items: readonly AdminTrashRecoveryRequestQueueItem[];
}) {
  if (items.length === 0) {
    return (
      <div className="grid min-h-48 place-items-center rounded-md border bg-muted/20 text-sm text-muted-foreground">
        조건에 맞는 복구 요청이 없어요
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <div className="min-w-[1120px]">
        <div className="grid grid-cols-[150px_170px_120px_260px_140px_150px_150px] gap-3 border-b bg-muted/60 px-4 py-2 text-xs font-semibold text-muted-foreground">
          <span>요청일</span>
          <span>사용자</span>
          <span>상태</span>
          <span>대상</span>
          <span>유형</span>
          <span>삭제일</span>
          <span>만료</span>
        </div>
        <div className="divide-y">
          {items.map((item) => (
            <div
              className="grid grid-cols-[150px_170px_120px_260px_140px_150px_150px] gap-3 px-4 py-3 text-sm"
              key={item.id}
            >
              <span className="text-muted-foreground">
                {formatDateTime(item.createdAt)}
              </span>
              <Link
                className="truncate font-medium text-primary hover:underline"
                to={`/users/${item.userId}/trash`}
              >
                {item.userEmailMasked ?? item.userId}
              </Link>
              <span>{item.status}</span>
              <span className="flex min-w-0 items-center gap-2">
                <MessageSquare className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate font-medium">
                  {item.titleSnapshot}
                </span>
              </span>
              <span>{item.targetType}</span>
              <span className="text-muted-foreground">
                {formatDateTime(item.deletedAt)}
              </span>
              <span className="text-muted-foreground">
                {formatDateTime(item.trashExpiresAt)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 기능 : Admin 복구 요청 filter select를 렌더링합니다.
function QueueSelect({
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

// 기능 : Admin 복구 요청 queue loading 상태를 렌더링합니다.
function LoadingState() {
  return (
    <div className="grid min-h-48 place-items-center rounded-lg border bg-white text-sm text-muted-foreground">
      복구 요청을 불러오고 있어요
    </div>
  );
}

// 기능 : Admin 복구 요청 queue error 상태를 렌더링합니다.
function ErrorState({ onRetry }: { readonly onRetry: () => void }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border bg-white px-4 text-center">
      <p className="text-sm text-muted-foreground">
        복구 요청을 불러오지 못했어요
      </p>
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
function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
