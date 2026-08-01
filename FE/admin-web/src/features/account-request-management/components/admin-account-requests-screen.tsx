import {
  Archive,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  RotateCcw,
  UserX,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  useAdminAccountDeletionRequests,
  useAdminDataExportRequests,
} from "../hooks/use-admin-account-requests";
import type {
  AdminAccountDeletionRequestQueueItem,
  AdminAccountDeletionRequestStatus,
  AdminDataExportRequestQueueItem,
  AdminDataExportRequestStatus,
} from "../types/admin-account-request";

const accountRequestPageLimit = 30;
const deletionStatusOptions: readonly (
  | AdminAccountDeletionRequestStatus
  | "ALL"
)[] = ["ALL", "REQUESTED", "CANCELLED", "PROCESSING", "COMPLETED"];
const dataExportStatusOptions: readonly (
  | AdminDataExportRequestStatus
  | "ALL"
)[] = ["ALL", "REQUESTED", "PROCESSING", "READY", "EXPIRED", "FAILED"];

type AccountRequestTab = "deletion" | "export";

// 기능 : Admin 계정 데이터 요청 queue 화면을 렌더링합니다.
export function AdminAccountRequestsScreen() {
  const [activeTab, setActiveTab] = useState<AccountRequestTab>("deletion");
  const [deletionStatus, setDeletionStatus] = useState<
    AdminAccountDeletionRequestStatus | "ALL"
  >("REQUESTED");
  const [dataExportStatus, setDataExportStatus] = useState<
    AdminDataExportRequestStatus | "ALL"
  >("REQUESTED");
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const cursor = cursorStack[pageIndex];
  const deletionParams = useMemo(
    () => ({
      ...(deletionStatus !== "ALL" ? { status: deletionStatus } : {}),
      ...(cursor ? { cursor } : {}),
      limit: accountRequestPageLimit,
    }),
    [cursor, deletionStatus]
  );
  const dataExportParams = useMemo(
    () => ({
      ...(dataExportStatus !== "ALL" ? { status: dataExportStatus } : {}),
      ...(cursor ? { cursor } : {}),
      limit: accountRequestPageLimit,
    }),
    [cursor, dataExportStatus]
  );
  const deletionQuery = useAdminAccountDeletionRequests(
    deletionParams,
    activeTab === "deletion"
  );
  const dataExportQuery = useAdminDataExportRequests(
    dataExportParams,
    activeTab === "export"
  );

  useEffect(() => {
    setCursorStack([]);
    setPageIndex(0);
  }, [activeTab, deletionStatus, dataExportStatus]);

  // 기능 : 다음 cursor 페이지로 이동합니다.
  function handleNextPage(nextCursor: string | null | undefined) {
    if (!nextCursor) {
      return;
    }

    setCursorStack((current) => [
      ...current.slice(0, pageIndex + 1),
      nextCursor,
    ]);
    setPageIndex((current) => current + 1);
  }

  // 기능 : 이전 cursor 페이지로 이동합니다.
  function handlePrevPage() {
    setPageIndex((current) => Math.max(0, current - 1));
  }

  // 기능 : 현재 탭의 필터와 cursor를 초기 상태로 되돌립니다.
  function handleReset() {
    if (activeTab === "deletion") {
      setDeletionStatus("REQUESTED");
    } else {
      setDataExportStatus("REQUESTED");
    }

    setCursorStack([]);
    setPageIndex(0);
  }

  return (
    <section className="grid min-w-0 gap-5 px-5 py-5">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b pb-4">
        <div>
          <p className="text-xs font-semibold uppercase text-primary">
            Account requests
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal">
            계정 데이터 요청 queue
          </h1>
        </div>
        <div className="text-sm text-muted-foreground">
          페이지 {pageIndex + 1}
        </div>
      </header>

      <section className="grid gap-3 rounded-lg border bg-white p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex rounded-md border bg-muted/40 p-1">
            <TabButton
              icon={UserX}
              isActive={activeTab === "deletion"}
              label="계정 삭제"
              onClick={() => setActiveTab("deletion")}
            />
            <TabButton
              icon={Archive}
              isActive={activeTab === "export"}
              label="데이터 export"
              onClick={() => setActiveTab("export")}
            />
          </div>
          <div className="flex flex-wrap items-end gap-2">
            {activeTab === "deletion" ? (
              <QueueSelect
                label="상태"
                options={deletionStatusOptions}
                value={deletionStatus}
                onChange={(value) =>
                  setDeletionStatus(
                    value as AdminAccountDeletionRequestStatus | "ALL"
                  )
                }
              />
            ) : (
              <QueueSelect
                label="상태"
                options={dataExportStatusOptions}
                value={dataExportStatus}
                onChange={(value) =>
                  setDataExportStatus(value as AdminDataExportRequestStatus | "ALL")
                }
              />
            )}
            <button
              aria-label="필터 초기화"
              className="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium hover:bg-muted"
              title="필터 초기화"
              type="button"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              aria-label="새로고침"
              className="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium hover:bg-muted"
              title="새로고침"
              type="button"
              onClick={() => {
                if (activeTab === "deletion") {
                  void deletionQuery.refetch();
                } else {
                  void dataExportQuery.refetch();
                }
              }}
            >
              <RefreshCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {activeTab === "deletion" ? (
          <DeletionQueuePanel
            items={deletionQuery.data?.items ?? []}
            isError={deletionQuery.isError}
            isLoading={deletionQuery.isLoading}
            onRetry={() => void deletionQuery.refetch()}
          />
        ) : (
          <DataExportQueuePanel
            items={dataExportQuery.data?.items ?? []}
            isError={dataExportQuery.isError}
            isLoading={dataExportQuery.isLoading}
            onRetry={() => void dataExportQuery.refetch()}
          />
        )}

        <QueuePagination
          hasPrev={pageIndex > 0}
          hasNext={
            activeTab === "deletion"
              ? Boolean(deletionQuery.data?.nextCursor)
              : Boolean(dataExportQuery.data?.nextCursor)
          }
          onPrev={handlePrevPage}
          onNext={() =>
            handleNextPage(
              activeTab === "deletion"
                ? deletionQuery.data?.nextCursor
                : dataExportQuery.data?.nextCursor
            )
          }
        />
      </section>
    </section>
  );
}

// 기능 : 계정 삭제 요청 queue 상태별 table을 렌더링합니다.
function DeletionQueuePanel({
  items,
  isError,
  isLoading,
  onRetry,
}: {
  readonly items: readonly AdminAccountDeletionRequestQueueItem[];
  readonly isError: boolean;
  readonly isLoading: boolean;
  readonly onRetry: () => void;
}) {
  if (isLoading) {
    return <QueueLoadingState label="계정 삭제 요청을 불러오고 있어요" />;
  }

  if (isError) {
    return <QueueErrorState onRetry={onRetry} />;
  }

  if (items.length === 0) {
    return <QueueEmptyState label="조건에 맞는 계정 삭제 요청이 없어요" />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <div className="min-w-[980px]">
        <div className="grid grid-cols-[150px_190px_130px_170px_170px_180px] gap-3 border-b bg-muted/60 px-4 py-2 text-xs font-semibold text-muted-foreground">
          <span>요청일</span>
          <span>사용자</span>
          <span>상태</span>
          <span>삭제 예정</span>
          <span>사유</span>
          <span>요청 ID</span>
        </div>
        <div className="divide-y">
          {items.map((item) => (
            <div
              className="grid grid-cols-[150px_190px_130px_170px_170px_180px] gap-3 px-4 py-3 text-sm"
              key={item.id}
            >
              <span className="text-muted-foreground">
                {formatDateTime(item.requestedAt)}
              </span>
              <Link
                className="truncate font-medium text-primary hover:underline"
                to={`/users/${item.userId}`}
              >
                {item.userEmailMasked ?? item.userId}
              </Link>
              <StatusBadge status={item.status} />
              <span className="text-muted-foreground">
                {formatDateTime(item.scheduledDeletionAt)}
              </span>
              <span className="truncate">{item.reasonCode ?? "-"}</span>
              <span className="truncate font-mono text-xs text-muted-foreground">
                {item.id}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 기능 : 데이터 export 요청 queue 상태별 table을 렌더링합니다.
function DataExportQueuePanel({
  items,
  isError,
  isLoading,
  onRetry,
}: {
  readonly items: readonly AdminDataExportRequestQueueItem[];
  readonly isError: boolean;
  readonly isLoading: boolean;
  readonly onRetry: () => void;
}) {
  if (isLoading) {
    return <QueueLoadingState label="데이터 export 요청을 불러오고 있어요" />;
  }

  if (isError) {
    return <QueueErrorState onRetry={onRetry} />;
  }

  if (items.length === 0) {
    return <QueueEmptyState label="조건에 맞는 데이터 export 요청이 없어요" />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <div className="min-w-[980px]">
        <div className="grid grid-cols-[150px_190px_130px_120px_150px_170px_180px] gap-3 border-b bg-muted/60 px-4 py-2 text-xs font-semibold text-muted-foreground">
          <span>요청일</span>
          <span>사용자</span>
          <span>상태</span>
          <span>민감 포함</span>
          <span>형식</span>
          <span>만료</span>
          <span>요청 ID</span>
        </div>
        <div className="divide-y">
          {items.map((item) => (
            <div
              className="grid grid-cols-[150px_190px_130px_120px_150px_170px_180px] gap-3 px-4 py-3 text-sm"
              key={item.id}
            >
              <span className="text-muted-foreground">
                {formatDateTime(item.requestedAt)}
              </span>
              <Link
                className="truncate font-medium text-primary hover:underline"
                to={`/users/${item.userId}`}
              >
                {item.userEmailMasked ?? item.userId}
              </Link>
              <StatusBadge status={item.status} />
              <span>{item.includeSensitive ? "YES" : "NO"}</span>
              <span>{item.format}</span>
              <span className="text-muted-foreground">
                {item.expiresAt ? formatDateTime(item.expiresAt) : "-"}
              </span>
              <span className="truncate font-mono text-xs text-muted-foreground">
                {item.id}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 기능 : Admin 계정 데이터 요청 tab 버튼을 렌더링합니다.
function TabButton({
  icon: Icon,
  isActive,
  label,
  onClick,
}: {
  readonly icon: typeof UserX;
  readonly isActive: boolean;
  readonly label: string;
  readonly onClick: () => void;
}) {
  return (
    <button
      className={[
        "inline-flex h-8 items-center gap-1.5 rounded px-3 text-sm font-semibold",
        isActive
          ? "bg-white text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      ].join(" ")}
      type="button"
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

// 기능 : Admin queue filter select를 렌더링합니다.
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

// 기능 : Admin queue pagination 버튼을 렌더링합니다.
function QueuePagination({
  hasPrev,
  hasNext,
  onPrev,
  onNext,
}: {
  readonly hasPrev: boolean;
  readonly hasNext: boolean;
  readonly onPrev: () => void;
  readonly onNext: () => void;
}) {
  return (
    <div className="flex justify-end gap-2">
      <button
        aria-label="이전 페이지"
        className="inline-flex h-9 items-center gap-1 rounded-md border px-3 text-sm font-medium disabled:opacity-40"
        disabled={!hasPrev}
        type="button"
        onClick={onPrev}
      >
        <ChevronLeft className="h-4 w-4" />
        이전
      </button>
      <button
        aria-label="다음 페이지"
        className="inline-flex h-9 items-center gap-1 rounded-md border px-3 text-sm font-medium disabled:opacity-40"
        disabled={!hasNext}
        type="button"
        onClick={onNext}
      >
        다음
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// 기능 : Admin queue status badge를 렌더링합니다.
function StatusBadge({
  status,
}: {
  readonly status: AdminAccountDeletionRequestStatus | AdminDataExportRequestStatus;
}) {
  return (
    <span
      className={`w-fit rounded-md px-2 py-0.5 text-xs font-semibold ${getStatusClassName(status)}`}
    >
      {status}
    </span>
  );
}

// 기능 : Admin queue status별 badge className을 반환합니다.
function getStatusClassName(
  status: AdminAccountDeletionRequestStatus | AdminDataExportRequestStatus
): string {
  switch (status) {
    case "READY":
      return "bg-emerald-50 text-emerald-700";
    case "REQUESTED":
    case "PROCESSING":
      return "bg-blue-50 text-blue-700";
    case "CANCELLED":
    case "EXPIRED":
      return "bg-slate-100 text-slate-600";
    case "FAILED":
    case "COMPLETED":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

// 기능 : Admin queue loading 상태를 렌더링합니다.
function QueueLoadingState({ label }: { readonly label: string }) {
  return (
    <div className="grid min-h-48 place-items-center rounded-lg border bg-white text-sm text-muted-foreground">
      {label}
    </div>
  );
}

// 기능 : Admin queue error 상태를 렌더링합니다.
function QueueErrorState({ onRetry }: { readonly onRetry: () => void }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border bg-white px-4 text-center">
      <p className="text-sm text-muted-foreground">
        계정 데이터 요청을 불러오지 못했어요
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

// 기능 : Admin queue empty 상태를 렌더링합니다.
function QueueEmptyState({ label }: { readonly label: string }) {
  return (
    <div className="grid min-h-48 place-items-center rounded-md border bg-muted/20 text-sm text-muted-foreground">
      {label}
    </div>
  );
}

// 기능 : ISO 문자열을 Admin queue 표시용 날짜·시간으로 변환합니다.
function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
