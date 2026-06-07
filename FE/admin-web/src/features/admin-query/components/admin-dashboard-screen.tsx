import {
  Building2,
  Handshake,
  Package,
  ScrollText,
  Users,
  UserCheck,
} from "lucide-react";
import { useAdminDashboard } from "@/features/admin-query/hooks/use-admin-query";
import {
  ErrorState,
  LoadingState,
  PageHeader,
} from "./admin-screen-shared";
import { formatDate, getErrorMessage } from "../utils/admin-query-ui";

export function AdminDashboardScreen() {
  const dashboardQuery = useAdminDashboard();

  return (
    <section className="mx-auto grid max-w-[1500px] gap-5 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="관리자 대시보드"
        description="전체 사용자와 주요 도메인 데이터, 최근 감사 신호를 확인합니다."
      />

      {dashboardQuery.isLoading ? <LoadingState /> : null}

      {dashboardQuery.isError ? (
        <ErrorState
          message={getErrorMessage(dashboardQuery.error)}
          onRetry={() => void dashboardQuery.refetch()}
        />
      ) : null}

      {dashboardQuery.data ? (
        <>
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            <MetricCard
              icon={Users}
              label="전체 사용자"
              value={dashboardQuery.data.userCount}
            />
            <MetricCard
              icon={UserCheck}
              label="활성 사용자"
              value={dashboardQuery.data.activeUserCount}
            />
            <MetricCard
              icon={Building2}
              label="회사"
              value={dashboardQuery.data.companyCount}
            />
            <MetricCard
              icon={Users}
              label="거래처"
              value={dashboardQuery.data.contactCount}
            />
            <MetricCard
              icon={Package}
              label="제품"
              value={dashboardQuery.data.productCount}
            />
            <MetricCard
              icon={Handshake}
              label="딜"
              value={dashboardQuery.data.dealCount}
            />
          </div>

          <section className="overflow-hidden rounded-lg border bg-white">
            <div className="flex items-center gap-2 border-b px-4 py-3 text-sm font-semibold">
              <ScrollText className="h-4 w-4 text-primary" aria-hidden />
              최근 감사 로그
            </div>
            {dashboardQuery.data.recentAuditLogs.length === 0 ? (
              <div className="px-4 py-10 text-sm text-muted-foreground">
                최근 감사 로그가 없습니다.
              </div>
            ) : (
              <div className="divide-y">
                {dashboardQuery.data.recentAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="grid gap-2 px-4 py-3 text-sm lg:grid-cols-[minmax(220px,260px)_minmax(0,1fr)_140px]"
                  >
                    <span className="min-w-0 break-words font-medium">
                      {log.action}
                    </span>
                    <span className="min-w-0 break-words text-muted-foreground">
                      {log.targetType} · {log.targetId ?? "-"} ·{" "}
                      {log.reasonSummary ?? "사유 없음"}
                    </span>
                    <span className="text-muted-foreground lg:text-right">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  readonly icon: typeof Users;
  readonly label: string;
  readonly value: number;
}) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <Icon className="h-4 w-4 text-primary" aria-hidden />
      </div>
      <div className="mt-3 text-2xl font-semibold">
        {value.toLocaleString()}
      </div>
    </div>
  );
}
