import { ArrowLeft, Bell, ChartNoAxesColumn, Database, Trash2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  useAdminUserActivityTimeline,
  useAdminUserOverview,
} from "../hooks/use-admin-users";
import type {
  AdminUserActivityTimelineItem,
  AdminUserOverviewResponse,
} from "../types/admin-user";

const timelineLimit = 30;

// 기능 : Admin 사용자 상세 overview와 활동 timeline을 렌더링합니다.
export function AdminUserDetailScreen() {
  const { userId } = useParams<{ userId: string }>();
  const normalizedUserId = userId ?? "";
  const overviewQuery = useAdminUserOverview(normalizedUserId);
  const timelineQuery = useAdminUserActivityTimeline(normalizedUserId, {
    limit: timelineLimit,
  });

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
            to="/users"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted"
            aria-label="목록으로"
            title="목록으로"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-primary">
              User detail
            </p>
            <h1 className="mt-1 truncate text-2xl font-semibold tracking-normal">
              {overviewQuery.data?.profile.displayNameMasked ?? normalizedUserId}
            </h1>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {overviewQuery.data?.profile.emailMasked ?? "-"}
        </div>
      </header>

      <nav className="flex flex-wrap items-center gap-2">
        <Link
          to={`/users/${normalizedUserId}`}
          className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground"
        >
          Overview
        </Link>
        <Link
          to={`/users/${normalizedUserId}/domain`}
          className="inline-flex h-9 items-center rounded-md border px-3 text-sm font-semibold text-muted-foreground hover:bg-muted"
        >
          도메인
        </Link>
        <Link
          to={`/users/${normalizedUserId}/trash`}
          className="inline-flex h-9 items-center rounded-md border px-3 text-sm font-semibold text-muted-foreground hover:bg-muted"
        >
          Trash
        </Link>
      </nav>

      {overviewQuery.isLoading ? <DetailLoadingState /> : null}
      {overviewQuery.isError ? (
        <DetailErrorState onRetry={() => void overviewQuery.refetch()} />
      ) : null}
      {overviewQuery.data ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="grid min-w-0 content-start gap-4">
            <ProfilePanel overview={overviewQuery.data} />
            <DomainCountPanel overview={overviewQuery.data} />
            <div className="grid gap-4 lg:grid-cols-3">
              <TrashSummaryPanel overview={overviewQuery.data} />
              <AnalyticsSummaryPanel overview={overviewQuery.data} />
              <NotificationSummaryPanel overview={overviewQuery.data} />
            </div>
          </section>
          <TimelinePanel
            items={timelineQuery.data?.items ?? []}
            isLoading={timelineQuery.isLoading}
            isError={timelineQuery.isError}
            onRetry={() => void timelineQuery.refetch()}
          />
        </div>
      ) : null}
    </section>
  );
}

// 기능 : 사용자 profile summary panel을 렌더링합니다.
function ProfilePanel({ overview }: { readonly overview: AdminUserOverviewResponse }) {
  return (
    <section className="grid gap-3 rounded-lg border bg-white p-4">
      <h2 className="text-base font-semibold">Profile</h2>
      <div className="grid gap-3 md:grid-cols-4">
        <Info label="상태" value={overview.profile.status} />
        <Info label="역할" value={overview.profile.role} />
        <Info label="국가" value={overview.profile.countryCode} />
        <Info label="Locale" value={overview.profile.preferredLocale} />
        <Info label="Timezone" value={overview.profile.timeZone} />
        <Info label="통화" value={overview.profile.defaultCurrencyCode} />
        <Info label="가입" value={formatDateTime(overview.profile.createdAt)} />
        <Info
          label="최근 로그인"
          value={formatDateTime(overview.profile.lastLoginAt)}
        />
      </div>
    </section>
  );
}

// 기능 : 사용자 domain count panel을 렌더링합니다.
function DomainCountPanel({
  overview,
}: {
  readonly overview: AdminUserOverviewResponse;
}) {
  const counts = overview.domainCounts;

  return (
    <section className="grid gap-3 rounded-lg border bg-white p-4">
      <div className="flex items-center gap-2">
        <Database className="h-4 w-4 text-primary" />
        <h2 className="text-base font-semibold">Domain counts</h2>
      </div>
      <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-5">
        <Metric label="회사" value={counts.companies} />
        <Metric label="담당자" value={counts.contacts} />
        <Metric label="제품" value={counts.products} />
        <Metric label="딜" value={counts.deals} />
        <Metric label="일정" value={counts.schedules} />
        <Metric label="회의록" value={counts.meetingNotes} />
        <Metric label="명함 스캔" value={counts.businessCardScans} />
        <Metric label="가져오기" value={counts.imports} />
        <Metric label="내보내기" value={counts.exports} />
      </div>
    </section>
  );
}

// 기능 : 사용자 Trash summary panel을 렌더링합니다.
function TrashSummaryPanel({
  overview,
}: {
  readonly overview: AdminUserOverviewResponse;
}) {
  return (
    <section className="grid gap-3 rounded-lg border bg-white p-4">
      <div className="flex items-center gap-2">
        <Trash2 className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">Trash</h2>
      </div>
      <Metric label="복구 가능" value={overview.trashSummary.active} />
      <Metric label="만료" value={overview.trashSummary.expired} />
      <Metric label="복구 요청" value={overview.trashSummary.recoveryRequests} />
      <Link
        className="inline-flex h-9 items-center justify-center rounded-md border text-sm font-semibold text-primary hover:bg-muted"
        to={`/users/${overview.id}/trash`}
      >
        Trash row 보기
      </Link>
    </section>
  );
}

// 기능 : 사용자 analytics summary panel을 렌더링합니다.
function AnalyticsSummaryPanel({
  overview,
}: {
  readonly overview: AdminUserOverviewResponse;
}) {
  return (
    <section className="grid gap-3 rounded-lg border bg-white p-4">
      <div className="flex items-center gap-2">
        <ChartNoAxesColumn className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">Analytics</h2>
      </div>
      <Info
        label="Activation"
        value={overview.analyticsSummary.activationStatus ?? "-"}
      />
      <Info
        label="활성화"
        value={formatDateTime(overview.analyticsSummary.activatedAt)}
      />
      <Info
        label="최근 활동"
        value={formatDateTime(overview.analyticsSummary.lastActiveEventAt)}
      />
      <Metric
        label="AI 30일 요청"
        value={overview.analyticsSummary.aiRequestCount30d}
      />
      <Info
        label="AI 30일 비용"
        value={overview.analyticsSummary.aiEstimatedCost30d}
      />
    </section>
  );
}

// 기능 : 사용자 notification safe summary panel을 렌더링합니다.
function NotificationSummaryPanel({
  overview,
}: {
  readonly overview: AdminUserOverviewResponse;
}) {
  return (
    <section className="grid gap-3 rounded-lg border bg-white p-4">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">Notification</h2>
      </div>
      <Info
        label="Browser push"
        value={overview.notificationSummary.browserPushEnabled ? "ON" : "OFF"}
      />
      <Metric
        label="Active"
        value={overview.notificationSummary.activeBrowserPushSubscriptions}
      />
      <Metric
        label="Revoked"
        value={overview.notificationSummary.revokedBrowserPushSubscriptions}
      />
      <Info
        label="최근 발송"
        value={overview.notificationSummary.lastBrowserPushDeliveryStatus ?? "-"}
      />
      <Info
        label="최근 실패 코드"
        value={overview.notificationSummary.lastDeliveryFailureSafeErrorCode ?? "-"}
      />
    </section>
  );
}

// 기능 : 사용자 활동 timeline panel을 렌더링합니다.
function TimelinePanel({
  items,
  isLoading,
  isError,
  onRetry,
}: {
  readonly items: readonly AdminUserActivityTimelineItem[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly onRetry: () => void;
}) {
  return (
    <aside className="grid min-w-0 content-start gap-3 rounded-lg border bg-white p-4">
      <h2 className="text-base font-semibold">Activity timeline</h2>
      {isLoading ? (
        <div className="grid min-h-40 place-items-center text-sm text-muted-foreground">
          불러오는 중이에요
        </div>
      ) : null}
      {isError ? (
        <div className="grid gap-3 rounded-md border p-4 text-sm">
          <p className="text-muted-foreground">
            활동 timeline을 불러오지 못했어요
          </p>
          <button
            type="button"
            className="inline-flex h-9 w-fit items-center rounded-md border px-3 font-medium hover:bg-muted"
            onClick={onRetry}
          >
            다시 시도
          </button>
        </div>
      ) : null}
      {!isLoading && !isError && items.length === 0 ? (
        <div className="grid min-h-40 place-items-center text-center text-sm text-muted-foreground">
          표시할 활동이 아직 없어요
        </div>
      ) : null}
      <div className="grid gap-2">
        {items.map((item) => (
          <TimelineItem key={item.id} item={item} />
        ))}
      </div>
    </aside>
  );
}

// 기능 : 사용자 활동 timeline item을 렌더링합니다.
function TimelineItem({ item }: { readonly item: AdminUserActivityTimelineItem }) {
  return (
    <div className="grid gap-1 rounded-md border px-3 py-2 text-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium">{item.title}</span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {formatDateTime(item.occurredAt)}
        </span>
      </div>
      <p className="text-muted-foreground">{item.summary}</p>
      <div className="truncate text-xs text-muted-foreground">
        {item.eventType} · {item.targetType ?? "-"}
      </div>
    </div>
  );
}

// 기능 : label/value 정보 행을 렌더링합니다.
function Info({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="grid gap-1">
      <div className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </div>
      <div className="break-words text-sm">{value}</div>
    </div>
  );
}

// 기능 : 작은 수치 metric을 렌더링합니다.
function Metric({ label, value }: { readonly label: string; readonly value: number }) {
  return (
    <div className="grid gap-1 rounded-md border bg-muted/30 px-3 py-2">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value.toLocaleString("ko-KR")}</div>
    </div>
  );
}

// 기능 : 상세 loading 상태를 렌더링합니다.
function DetailLoadingState() {
  return (
    <div className="grid min-h-64 place-items-center rounded-lg border bg-white text-sm text-muted-foreground">
      불러오는 중이에요
    </div>
  );
}

// 기능 : 상세 error 상태를 렌더링합니다.
function DetailErrorState({ onRetry }: { readonly onRetry: () => void }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-lg border bg-white px-4 text-center">
      <p className="text-sm text-muted-foreground">
        사용자 상세를 불러오지 못했어요
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

// 기능 : ISO 날짜 문자열을 Admin Web 표시용 날짜/시간으로 변환합니다.
function formatDateTime(value: string | null): string {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
