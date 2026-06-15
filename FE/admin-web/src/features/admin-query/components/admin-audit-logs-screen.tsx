import { Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useAdminAuditLog, useAdminAuditLogs } from "@/features/admin-query/hooks/use-admin-query";
import type { AdminAuditLogSummary } from "@/features/admin-query/types/admin-query";
import { formatDate, getErrorMessage } from "../utils/admin-query-ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  PaginationControls,
} from "./admin-screen-shared";

const pageSize = 10;
const actionOptions = ["ADMIN_SENSITIVE_RAW_VIEW", "ADMIN_USER_STATUS_CHANGED"];
const targetTypeOptions = [
  "USER",
  "COMPANY",
  "CONTACT",
  "PRODUCT",
  "DEAL",
  "MEETING_NOTE",
  "PERSONAL_MEMO",
];

export function AdminAuditLogsScreen() {
  const [page, setPage] = useState(1);
  const [filtersDraft, setFiltersDraft] = useState({
    actorUserId: "",
    action: "",
    targetType: "",
    from: "",
    to: "",
  });
  const [filters, setFilters] = useState(filtersDraft);
  const [selectedAuditLogId, setSelectedAuditLogId] = useState("");
  const auditLogsQuery = useAdminAuditLogs({
    page,
    pageSize,
    actorUserId: filters.actorUserId || undefined,
    action: filters.action || undefined,
    targetType: filters.targetType || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
  });

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setFilters(filtersDraft);
  };

  return (
    <section className="mx-auto grid max-w-[1500px] gap-5 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="감사 로그"
        description="민감 원문 조회와 위험 액션 기록을 필터링해 확인합니다."
      />

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="grid min-w-0 content-start gap-4">
          <form
            className="grid gap-3 rounded-lg border bg-white p-4 2xl:grid-cols-[minmax(180px,1fr)_220px_180px_160px_160px_96px]"
            onSubmit={onSubmit}
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className="h-10 w-full rounded-md border bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="actor user id"
                value={filtersDraft.actorUserId}
                onChange={(event) =>
                  setFiltersDraft((current) => ({
                    ...current,
                    actorUserId: event.target.value,
                  }))
                }
              />
            </div>
            <select
              className="h-10 rounded-md border bg-white px-3 text-sm"
              value={filtersDraft.action}
              onChange={(event) =>
                setFiltersDraft((current) => ({
                  ...current,
                  action: event.target.value,
                }))
              }
            >
              <option value="">전체 action</option>
              {actionOptions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-md border bg-white px-3 text-sm"
              value={filtersDraft.targetType}
              onChange={(event) =>
                setFiltersDraft((current) => ({
                  ...current,
                  targetType: event.target.value,
                }))
              }
            >
              <option value="">전체 target</option>
              {targetTypeOptions.map((targetType) => (
                <option key={targetType} value={targetType}>
                  {targetType}
                </option>
              ))}
            </select>
            <input
              className="h-10 rounded-md border bg-white px-3 text-sm"
              type="date"
              value={filtersDraft.from}
              onChange={(event) =>
                setFiltersDraft((current) => ({
                  ...current,
                  from: event.target.value,
                }))
              }
            />
            <input
              className="h-10 rounded-md border bg-white px-3 text-sm"
              type="date"
              value={filtersDraft.to}
              onChange={(event) =>
                setFiltersDraft((current) => ({
                  ...current,
                  to: event.target.value,
                }))
              }
            />
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground"
            >
              <Search className="h-4 w-4" aria-hidden />
              검색
            </button>
          </form>

          {auditLogsQuery.isLoading ? <LoadingState /> : null}
          {auditLogsQuery.isError ? (
            <ErrorState
              message={getErrorMessage(auditLogsQuery.error)}
              onRetry={() => void auditLogsQuery.refetch()}
            />
          ) : null}
          {auditLogsQuery.data ? (
            <AuditLogTable
              items={auditLogsQuery.data.items}
              selectedAuditLogId={selectedAuditLogId}
              onSelect={setSelectedAuditLogId}
            />
          ) : null}
          {auditLogsQuery.data && auditLogsQuery.data.items.length === 0 ? (
            <EmptyState message="조건에 맞는 감사 로그가 없습니다." />
          ) : null}
          {auditLogsQuery.data ? (
            <PaginationControls
              page={page}
              totalCount={auditLogsQuery.data.totalCount}
              hasNext={auditLogsQuery.data.hasNext}
              onPrev={() => setPage((current) => Math.max(1, current - 1))}
              onNext={() => setPage((current) => current + 1)}
            />
          ) : null}
        </section>

        <AuditLogDetailPanel auditLogId={selectedAuditLogId} />
      </div>
    </section>
  );
}

function AuditLogTable({
  items,
  selectedAuditLogId,
  onSelect,
}: {
  readonly items: readonly AdminAuditLogSummary[];
  readonly selectedAuditLogId: string;
  readonly onSelect: (auditLogId: string) => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <div className="min-w-[940px]">
        <div className="grid grid-cols-[130px_100px_210px_80px_90px_160px_60px] gap-3 border-b bg-muted/50 px-4 py-3 text-xs font-semibold text-muted-foreground">
          <span>시간</span>
          <span>actor</span>
          <span>action</span>
          <span>target</span>
          <span>target id</span>
          <span>사유 요약</span>
          <span>IP</span>
        </div>
        <div className="divide-y">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={[
                "grid w-full grid-cols-[130px_100px_210px_80px_90px_160px_60px] gap-3 px-4 py-3 text-left text-sm hover:bg-muted/60",
                selectedAuditLogId === item.id ? "bg-primary/5" : "",
              ].join(" ")}
              onClick={() => onSelect(item.id)}
            >
              <span className="text-muted-foreground">
                {formatDate(item.createdAt)}
              </span>
              <span className="truncate">{item.actorUserName ?? item.actorUserId ?? "-"}</span>
              <span className="truncate font-medium">{item.action}</span>
              <span>{item.targetType}</span>
              <span className="truncate text-muted-foreground">
                {item.targetId ?? "-"}
              </span>
              <span className="truncate text-muted-foreground">
                {item.reasonSummary ?? "-"}
              </span>
              <span className="truncate text-muted-foreground">
                {item.ipAddress ?? "-"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuditLogDetailPanel({
  auditLogId,
}: {
  readonly auditLogId: string;
}) {
  const auditLogQuery = useAdminAuditLog(auditLogId);

  if (!auditLogId) {
    return (
      <aside className="grid min-h-[420px] min-w-0 place-items-center rounded-lg border bg-white px-4 text-center text-sm text-muted-foreground">
        감사 로그 행을 선택하면 상세 요약을 확인할 수 있습니다.
      </aside>
    );
  }

  return (
    <aside className="grid min-w-0 content-start gap-4 rounded-lg border bg-white p-4">
      <div className="flex items-center gap-2 border-b pb-4">
        <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
        <div>
          <h2 className="text-base font-semibold">감사 로그 상세</h2>
          <p className="mt-1 text-xs text-muted-foreground">{auditLogId}</p>
        </div>
      </div>
      {auditLogQuery.isLoading ? <LoadingState /> : null}
      {auditLogQuery.isError ? (
        <ErrorState
          message="감사 로그를 불러오지 못했습니다."
          onRetry={() => void auditLogQuery.refetch()}
        />
      ) : null}
      {auditLogQuery.data ? (
        <div className="grid gap-2 text-sm">
          <Info label="시간" value={formatDate(auditLogQuery.data.createdAt)} />
          <Info
            label="actor"
            value={
              auditLogQuery.data.actorUserName ??
              auditLogQuery.data.actorUserId ??
              "-"
            }
          />
          <Info label="action" value={auditLogQuery.data.action} />
          <Info
            label="target"
            value={`${auditLogQuery.data.targetType} / ${
              auditLogQuery.data.targetId ?? "-"
            }`}
          />
          <Info label="사유 요약" value={auditLogQuery.data.reasonSummary ?? "-"} />
          <Info label="IP" value={auditLogQuery.data.ipAddress ?? "-"} />
          <Info label="User-Agent" value={auditLogQuery.data.userAgent ?? "-"} />
        </div>
      ) : null}
    </aside>
  );
}

function Info({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-md border bg-muted/30 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 break-words font-medium">{value}</div>
    </div>
  );
}
