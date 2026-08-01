import {
  AlertTriangle,
  BarChart3,
  Bot,
  CalendarClock,
  ClipboardList,
  MapPinned,
  RotateCcw,
  Search,
  Smartphone,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState, type ComponentType, type FormEvent } from "react";
import { useAdminAnalyticsOverview } from "../hooks/use-admin-analytics-overview";
import type {
  AdminAnalyticsEventCount,
  AdminAnalyticsMobileFieldUseSummary,
  AdminAnalyticsOverviewParams,
  AdminAnalyticsOverviewResponse,
  AdminAnalyticsRetentionRow,
  AdminAnalyticsRouteView,
} from "../types/admin-analytics-overview";

const analyticsTimeZoneOptions = [
  "Asia/Seoul",
  "UTC",
  "Asia/Tokyo",
  "America/Los_Angeles",
  "Europe/London",
] as const;
const compactNumberFormatter = new Intl.NumberFormat("ko-KR");

type AnalyticsFilterFormState = {
  readonly from: string;
  readonly to: string;
  readonly timeZone: string;
};

type AnalyticsStatCard = {
  readonly label: string;
  readonly value: string;
  readonly subValue: string;
  readonly icon: ComponentType<{ className?: string }>;
};

const mobileFieldUseRows = [
  { key: "businessCardCaptureStarted", label: "명함 촬영 시작" },
  { key: "businessCardCaptureRetried", label: "명함 촬영 재시도" },
  { key: "businessCardOcrFailed", label: "명함 OCR 실패" },
  { key: "meetingNoteRecordingStarted", label: "회의 녹음 시작" },
  { key: "meetingNoteRecordingCompleted", label: "회의 녹음 완료" },
  { key: "meetingNoteRecordingFailed", label: "회의 녹음 실패" },
  { key: "localDraftSaved", label: "로컬 초안 저장" },
  { key: "localDraftRestored", label: "로컬 초안 복구" },
  { key: "localDraftDiscarded", label: "로컬 초안 폐기" },
  {
    key: "mobilePushPermissionPromptOpened",
    label: "모바일 push 권한 요청",
  },
] as const satisfies readonly {
  readonly key: Exclude<
    keyof AdminAnalyticsMobileFieldUseSummary,
    "mobilePushPermissionResult"
  >;
  readonly label: string;
}[];

// 기능 : Admin analytics overview 필터와 집계 table 화면을 렌더링합니다.
export function AdminAnalyticsOverviewScreen() {
  const [draftFilters, setDraftFilters] = useState(createDefaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(createDefaultFilters);
  const params = useMemo(
    () => toAnalyticsOverviewParams(appliedFilters),
    [appliedFilters]
  );
  const overviewQuery = useAdminAnalyticsOverview(params);

  // 기능 : 필터 form submit 시 현재 draft 기간으로 analytics overview를 다시 조회합니다.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedFilters(draftFilters);
  }

  // 기능 : analytics overview 필터를 기본 30일 범위로 되돌립니다.
  function handleReset() {
    const nextFilters = createDefaultFilters();

    setDraftFilters(nextFilters);
    setAppliedFilters(nextFilters);
  }

  return (
    <section className="grid min-w-0 gap-5 px-5 py-5">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b pb-4">
        <div>
          <p className="text-xs font-semibold uppercase text-primary">
            Analytics
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal">
            사용량 분석
          </h1>
        </div>
        <div className="text-sm text-muted-foreground">
          {overviewQuery.data
            ? formatRangeLabel(overviewQuery.data)
            : "조회 범위를 선택해 주세요"}
        </div>
      </header>

      <AnalyticsFilterForm
        filters={draftFilters}
        onChange={setDraftFilters}
        onReset={handleReset}
        onSubmit={handleSubmit}
      />

      {overviewQuery.isLoading ? <AnalyticsLoadingState /> : null}
      {overviewQuery.isError ? (
        <AnalyticsErrorState onRetry={() => void overviewQuery.refetch()} />
      ) : null}
      {overviewQuery.data ? (
        <AnalyticsOverviewContent overview={overviewQuery.data} />
      ) : null}
    </section>
  );
}

// 기능 : analytics overview 기간/timezone 필터 form을 렌더링합니다.
function AnalyticsFilterForm({
  filters,
  onChange,
  onReset,
  onSubmit,
}: {
  readonly filters: AnalyticsFilterFormState;
  readonly onChange: (filters: AnalyticsFilterFormState) => void;
  readonly onReset: () => void;
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-[190px_190px_190px_auto]"
      onSubmit={onSubmit}
    >
      <AnalyticsDateTimeFilter
        label="시작"
        value={filters.from}
        onChange={(value) => onChange({ ...filters, from: value })}
      />
      <AnalyticsDateTimeFilter
        label="종료"
        value={filters.to}
        onChange={(value) => onChange({ ...filters, to: value })}
      />
      <label className="grid gap-1 text-xs font-medium text-muted-foreground">
        <span>Timezone</span>
        <select
          className="h-9 rounded-md border bg-white px-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          value={filters.timeZone}
          onChange={(event) =>
            onChange({ ...filters, timeZone: event.target.value })
          }
        >
          {analyticsTimeZoneOptions.map((timeZone) => (
            <option key={timeZone} value={timeZone}>
              {timeZone}
            </option>
          ))}
        </select>
      </label>
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

// 기능 : analytics overview datetime-local 입력을 렌더링합니다.
function AnalyticsDateTimeFilter({
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

// 기능 : analytics overview 조회 결과의 주요 section을 렌더링합니다.
function AnalyticsOverviewContent({
  overview,
}: {
  readonly overview: AdminAnalyticsOverviewResponse;
}) {
  const statCards: readonly AnalyticsStatCard[] = [
    {
      label: "Activation rate",
      value: formatPercent(overview.activation.activationRate),
      subValue: `${formatNumber(
        overview.activation.activatedUsers
      )} activated / ${formatNumber(overview.activation.notActivatedUsers)} open`,
      icon: TrendingUp,
    },
    {
      label: "AI requests",
      value: formatNumber(overview.aiUsage.requestCount),
      subValue: `${formatNumber(
        overview.aiUsage.successCount
      )} success / ${formatNumber(overview.aiUsage.failureCount)} failure`,
      icon: Bot,
    },
    {
      label: "AI cost",
      value: formatCost(overview.aiUsage.estimatedCost),
      subValue: "estimated USD",
      icon: BarChart3,
    },
    {
      label: "Route views",
      value: formatNumber(
        overview.routes.reduce((sum, route) => sum + route.viewCount, 0)
      ),
      subValue: `${formatNumber(overview.routes.length)} routes`,
      icon: MapPinned,
    },
  ];

  return (
    <div className="grid min-w-0 gap-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <AnalyticsStatCardView card={card} key={card.label} />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <AnalyticsRetentionTable items={overview.retention} />
        <AnalyticsMobileFieldUseTable summary={overview.mobileFieldUse} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <AnalyticsEventCountTable items={overview.events} />
        <AnalyticsRouteViewTable items={overview.routes} />
      </div>
    </div>
  );
}

// 기능 : analytics overview 핵심 숫자 카드를 렌더링합니다.
function AnalyticsStatCardView({ card }: { readonly card: AnalyticsStatCard }) {
  const Icon = card.icon;

  return (
    <section className="grid gap-3 rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase text-muted-foreground">
          {card.label}
        </span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="text-2xl font-semibold tracking-normal">{card.value}</div>
      <div className="text-xs text-muted-foreground">{card.subValue}</div>
    </section>
  );
}

// 기능 : retention cohort table을 렌더링합니다.
function AnalyticsRetentionTable({
  items,
}: {
  readonly items: readonly AdminAnalyticsRetentionRow[];
}) {
  return (
    <section className="grid min-w-0 content-start gap-3">
      <AnalyticsSectionHeader
        icon={CalendarClock}
        title="Retention"
        value={`${formatNumber(items.length)} rows`}
      />
      {items.length === 0 ? (
        <AnalyticsEmptyState message="조건에 맞는 retention snapshot이 없어요" />
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[160px_110px_150px_150px_120px] gap-3 border-b bg-muted/60 px-4 py-2 text-xs font-semibold text-muted-foreground">
              <span>Cohort</span>
              <span>D</span>
              <span>Users</span>
              <span>Retained</span>
              <span>Rate</span>
            </div>
            <div className="divide-y">
              {items.map((item) => (
                <div
                  className="grid grid-cols-[160px_110px_150px_150px_120px] gap-3 px-4 py-3 text-sm"
                  key={`${item.cohortDate}-${item.dayOffset}`}
                >
                  <span className="font-medium">{item.cohortDate}</span>
                  <span>D{item.dayOffset}</span>
                  <span>{formatNumber(item.cohortUserCount)}</span>
                  <span>{formatNumber(item.retainedUserCount)}</span>
                  <span>{formatPercent(item.retentionRate)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// 기능 : core event count table을 렌더링합니다.
function AnalyticsEventCountTable({
  items,
}: {
  readonly items: readonly AdminAnalyticsEventCount[];
}) {
  return (
    <section className="grid min-w-0 content-start gap-3">
      <AnalyticsSectionHeader
        icon={ClipboardList}
        title="Core events"
        value={`${formatNumber(sumEventCounts(items))} total`}
      />
      <AnalyticsCountTable
        emptyMessage="조건에 맞는 core event가 없어요"
        items={items}
        labelHeader="Event"
        valueHeader="Count"
        getLabel={(item) => item.eventName}
        getValue={(item) => item.count}
      />
    </section>
  );
}

// 기능 : route view count table을 렌더링합니다.
function AnalyticsRouteViewTable({
  items,
}: {
  readonly items: readonly AdminAnalyticsRouteView[];
}) {
  return (
    <section className="grid min-w-0 content-start gap-3">
      <AnalyticsSectionHeader
        icon={MapPinned}
        title="Routes"
        value={`${formatNumber(sumRouteViews(items))} views`}
      />
      <AnalyticsCountTable
        emptyMessage="조건에 맞는 route view가 없어요"
        items={items}
        labelHeader="Route"
        valueHeader="Views"
        getLabel={(item) => item.routeKey}
        getValue={(item) => item.viewCount}
      />
    </section>
  );
}

// 기능 : mobile field-use count와 push permission bucket table을 렌더링합니다.
function AnalyticsMobileFieldUseTable({
  summary,
}: {
  readonly summary: AdminAnalyticsMobileFieldUseSummary;
}) {
  const permissionRows = [
    { label: "granted", value: summary.mobilePushPermissionResult.granted },
    { label: "denied", value: summary.mobilePushPermissionResult.denied },
    { label: "default", value: summary.mobilePushPermissionResult.default },
    {
      label: "unsupported",
      value: summary.mobilePushPermissionResult.unsupported,
    },
    {
      label: "browserPushEnabled true",
      value: summary.mobilePushPermissionResult.browserPushEnabledTrue,
    },
    {
      label: "browserPushEnabled false",
      value: summary.mobilePushPermissionResult.browserPushEnabledFalse,
    },
  ];

  return (
    <section className="grid min-w-0 content-start gap-3">
      <AnalyticsSectionHeader
        icon={Smartphone}
        title="Mobile field-use"
        value={`${formatNumber(sumMobileFieldUse(summary))} events`}
      />
      <div className="overflow-hidden rounded-lg border bg-white">
        <div className="grid grid-cols-[minmax(0,1fr)_96px] gap-3 border-b bg-muted/60 px-4 py-2 text-xs font-semibold text-muted-foreground">
          <span>Event</span>
          <span>Count</span>
        </div>
        <div className="divide-y">
          {mobileFieldUseRows.map((item) => (
            <div
              className="grid grid-cols-[minmax(0,1fr)_96px] gap-3 px-4 py-3 text-sm"
              key={item.key}
            >
              <span className="truncate">{item.label}</span>
              <span>{formatNumber(summary[item.key])}</span>
            </div>
          ))}
        </div>
        <div className="border-t bg-muted/30 px-4 py-2 text-xs font-semibold uppercase text-muted-foreground">
          Push permission
        </div>
        <div className="divide-y">
          {permissionRows.map((item) => (
            <div
              className="grid grid-cols-[minmax(0,1fr)_96px] gap-3 px-4 py-3 text-sm"
              key={item.label}
            >
              <span className="truncate">{item.label}</span>
              <span>{formatNumber(item.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 기능 : 단순 label/count table을 렌더링합니다.
function AnalyticsCountTable<TItem>({
  items,
  labelHeader,
  valueHeader,
  emptyMessage,
  getLabel,
  getValue,
}: {
  readonly items: readonly TItem[];
  readonly labelHeader: string;
  readonly valueHeader: string;
  readonly emptyMessage: string;
  readonly getLabel: (item: TItem) => string;
  readonly getValue: (item: TItem) => number;
}) {
  if (items.length === 0) {
    return <AnalyticsEmptyState message={emptyMessage} />;
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <div className="grid grid-cols-[minmax(0,1fr)_110px] gap-3 border-b bg-muted/60 px-4 py-2 text-xs font-semibold text-muted-foreground">
        <span>{labelHeader}</span>
        <span>{valueHeader}</span>
      </div>
      <div className="divide-y">
        {items.map((item) => (
          <div
            className="grid grid-cols-[minmax(0,1fr)_110px] gap-3 px-4 py-3 text-sm"
            key={getLabel(item)}
          >
            <span className="truncate font-medium">{getLabel(item)}</span>
            <span>{formatNumber(getValue(item))}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 기능 : analytics section 제목과 우측 summary 값을 렌더링합니다.
function AnalyticsSectionHeader({
  icon: Icon,
  title,
  value,
}: {
  readonly icon: ComponentType<{ className?: string }>;
  readonly title: string;
  readonly value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-base font-semibold tracking-normal">{title}</h2>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{value}</span>
    </div>
  );
}

// 기능 : analytics overview loading 상태를 렌더링합니다.
function AnalyticsLoadingState() {
  return (
    <div className="grid min-h-48 place-items-center rounded-lg border bg-white text-sm text-muted-foreground">
      분석 요약을 불러오고 있어요
    </div>
  );
}

// 기능 : analytics overview error 상태를 렌더링합니다.
function AnalyticsErrorState({ onRetry }: { readonly onRetry: () => void }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border bg-white px-4 text-center">
      <AlertTriangle className="h-5 w-5 text-destructive" />
      <p className="text-sm text-muted-foreground">
        분석 요약을 불러오지 못했어요
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

// 기능 : analytics table empty 상태를 렌더링합니다.
function AnalyticsEmptyState({ message }: { readonly message: string }) {
  return (
    <div className="grid min-h-40 place-items-center rounded-lg border bg-white px-4 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

// 기능 : 기본 30일 analytics filter 값을 생성합니다.
function createDefaultFilters(): AnalyticsFilterFormState {
  const to = new Date();
  const from = new Date(to);
  from.setDate(to.getDate() - 30);
  from.setHours(0, 0, 0, 0);

  return {
    from: toDateTimeLocalValue(from),
    to: toDateTimeLocalValue(to),
    timeZone: "Asia/Seoul",
  };
}

// 기능 : form state를 UTC ISO 기반 Admin analytics API params로 변환합니다.
function toAnalyticsOverviewParams(
  filters: AnalyticsFilterFormState
): AdminAnalyticsOverviewParams {
  return {
    from: toIsoString(filters.from),
    to: toIsoString(filters.to),
    timeZone: filters.timeZone,
  };
}

// 기능 : Date 값을 datetime-local 입력 형식으로 변환합니다.
function toDateTimeLocalValue(value: Date): string {
  const offsetMs = value.getTimezoneOffset() * 60 * 1000;

  return new Date(value.getTime() - offsetMs).toISOString().slice(0, 16);
}

// 기능 : datetime-local 값을 UTC ISO 문자열로 변환합니다.
function toIsoString(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }

  return date.toISOString();
}

// 기능 : overview 응답 범위를 header 표시 문자열로 변환합니다.
function formatRangeLabel(overview: AdminAnalyticsOverviewResponse): string {
  return `${formatDate(overview.range.from)} - ${formatDate(
    overview.range.to
  )} · ${overview.range.timeZone}`;
}

// 기능 : ISO 날짜 문자열을 Admin analytics 표시용 날짜로 변환합니다.
function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

// 기능 : 정수 값을 Admin analytics 표시 문자열로 변환합니다.
function formatNumber(value: number): string {
  return compactNumberFormatter.format(value);
}

// 기능 : 0~1 비율 값을 백분율 문자열로 변환합니다.
function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

// 기능 : 비용 문자열을 USD 표시 문자열로 변환합니다.
function formatCost(value: string): string {
  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return `$${value}`;
  }

  return `$${numericValue.toFixed(6)}`;
}

// 기능 : core event count 총합을 계산합니다.
function sumEventCounts(items: readonly AdminAnalyticsEventCount[]): number {
  return items.reduce((sum, item) => sum + item.count, 0);
}

// 기능 : route view count 총합을 계산합니다.
function sumRouteViews(items: readonly AdminAnalyticsRouteView[]): number {
  return items.reduce((sum, item) => sum + item.viewCount, 0);
}

// 기능 : mobile field-use event count 총합을 계산합니다.
function sumMobileFieldUse(summary: AdminAnalyticsMobileFieldUseSummary): number {
  return mobileFieldUseRows.reduce((sum, item) => sum + summary[item.key], 0);
}
