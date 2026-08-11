import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  NotebookPen,
  Plus,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAppI18n, type AppI18nKey } from "@/features/app-i18n";
import {
  DEAL_STATUS_LABEL,
  DEAL_STATUS_LIST,
  type DealListItem,
  type DealStageCount,
  type DealStatus,
  useDealList,
  useDealStageCounts,
} from "@/features/deal";
import {
  useMeetingNoteList,
  type MeetingNoteListItem,
} from "@/features/meeting-note";
import { useScheduleList, type Schedule } from "@/features/schedule";
import { cn } from "@/utils/cn";

const ACTIVE_DEAL_STATUSES: DealStatus[] = [
  "INITIAL_CONTACT",
  "NEEDS_CHECK",
  "PROPOSAL_QUOTE",
  "NEGOTIATION",
];

const QUICK_ACTIONS: QuickAction[] = [
  {
    descriptionKey: "home.dealRegisterDescription",
    href: "/app/deals/new",
    icon: BriefcaseBusiness,
    labelKey: "home.dealRegister",
    tone: "blue",
  },
  {
    descriptionKey: "home.meetingNoteCreateDescription",
    href: "/app/meeting-notes?create=1",
    icon: NotebookPen,
    labelKey: "home.meetingNoteCreate",
    tone: "emerald",
  },
  {
    descriptionKey: "home.scheduleViewDescription",
    href: "/app/schedules",
    icon: CalendarDays,
    labelKey: "home.scheduleView",
    tone: "amber",
  },
  {
    descriptionKey: "home.companyCreateDescription",
    href: "/app/companies/new",
    icon: Building2,
    labelKey: "home.companyCreate",
    tone: "slate",
  },
];

type QuickAction = {
  readonly descriptionKey: AppI18nKey;
  readonly href: string;
  readonly icon: LucideIcon;
  readonly labelKey: AppI18nKey;
  readonly tone: "amber" | "blue" | "emerald" | "slate";
};

type ActivityItem = {
  readonly createdAt: string;
  readonly href: string;
  readonly meta: string;
  readonly title: string;
  readonly type: "deal" | "meeting";
};

// 기능 : CRM 시작 화면을 렌더링합니다.
export function HomePage() {
  const { formatCurrency, formatDateTime, locale, t, timeZone } = useAppI18n();
  const numberFormatter = useMemo(() => new Intl.NumberFormat(getIntlLocale(locale)), [locale]);
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(
    () => toDateKeyInTimeZone(today.toISOString(), timeZone),
    [timeZone, today]
  );

  const scheduleQuery = useScheduleList({
    baseDate: todayKey,
    timeZone,
    view: "week",
  });
  const recentDealsQuery = useDealList({ page: 1, sort: "createdAtDesc" });
  const deadlineDealsQuery = useDealList({ page: 1, sort: "expectedEndDateAsc" });
  const stageCountsQuery = useDealStageCounts();
  const meetingNotesQuery = useMeetingNoteList({ page: 1, sort: "createdAtDesc" });

  const schedules = useMemo(
    () => scheduleQuery.data?.items ?? [],
    [scheduleQuery.data?.items]
  );
  const recentDeals = useMemo(
    () => recentDealsQuery.data?.items ?? [],
    [recentDealsQuery.data?.items]
  );
  const deadlineDeals = useMemo(
    () => deadlineDealsQuery.data?.items ?? [],
    [deadlineDealsQuery.data?.items]
  );
  const meetingNotes = useMemo(
    () => meetingNotesQuery.data?.items ?? [],
    [meetingNotesQuery.data?.items]
  );
  const stageCounts = useMemo(
    () => stageCountsQuery.data?.items ?? [],
    [stageCountsQuery.data?.items]
  );

  const todaySchedules = useMemo(
    () =>
      schedules
        .filter((schedule) => toDateKeyInTimeZone(schedule.startAt, timeZone) === todayKey)
        .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()),
    [schedules, timeZone, todayKey]
  );

  const upcomingSchedules = useMemo(
    () =>
      schedules
        .filter((schedule) => new Date(schedule.endAt).getTime() >= today.getTime())
        .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
        .slice(0, 5),
    [schedules, today]
  );

  const activeDeadlineDeals = useMemo(
    () =>
      deadlineDeals
        .filter((deal) => ACTIVE_DEAL_STATUSES.includes(deal.dealStatus))
        .slice(0, 5),
    [deadlineDeals]
  );

  const followUpDeals = useMemo(
    () =>
      recentDeals
        .filter((deal) => deal.latestFollowingAction && !deal.latestFollowingAction.checkComplete)
        .slice(0, 5),
    [recentDeals]
  );

  const activeDealCount = getActiveDealCount(stageCounts);
  const pipelineValue = recentDeals
    .filter((deal) => ACTIVE_DEAL_STATUSES.includes(deal.dealStatus))
    .reduce((sum, deal) => sum + deal.dealCost, 0);
  const dueSoonCount = activeDeadlineDeals.filter(
    (deal) => getDaysUntil(deal.expectedEndDate, today) <= 7
  ).length;
  const recentActivity = buildRecentActivity({
    deals: recentDeals,
    formatCurrency,
    formatDateTime,
    meetingNotes,
    t,
  });

  const isAnyLoading =
    scheduleQuery.isLoading ||
    recentDealsQuery.isLoading ||
    deadlineDealsQuery.isLoading ||
    stageCountsQuery.isLoading ||
    meetingNotesQuery.isLoading;

  return (
    <section className="min-h-0 flex-1 overflow-y-auto bg-white px-5 pb-8 pt-2 md:px-8 md:pt-4">
      <div className="mx-auto grid w-full max-w-[1480px] gap-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={CalendarClock}
            label={t("home.scheduleToday")}
            tone="emerald"
            value={t("home.countItems", {
              values: { count: numberFormatter.format(todaySchedules.length) },
            })}
          />
          <SummaryCard
            icon={BriefcaseBusiness}
            label={t("home.totalDeals")}
            tone="blue"
            value={t("home.countCases", {
              values: { count: numberFormatter.format(activeDealCount) },
            })}
          />
          <SummaryCard
            icon={AlertCircle}
            label={t("home.dueSoon")}
            tone="amber"
            value={t("home.countCases", {
              values: { count: numberFormatter.format(dueSoonCount) },
            })}
          />
          <SummaryCard
            icon={NotebookPen}
            label={t("home.recentMeetingNotes")}
            tone="blue"
            value={t("home.countCases", {
              values: {
                count: numberFormatter.format(meetingNotesQuery.data?.totalCount ?? 0),
              },
            })}
          />
        </div>

        <div className="grid min-h-0 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
          <div className="grid content-start gap-5">
            <DashboardSection
              actionHref="/app/schedules"
              actionLabel={t("navigation.schedules")}
              icon={CalendarDays}
              title={t("home.taskToday")}
            >
              <div className="grid gap-4 lg:grid-cols-2">
                <TaskPanel
                  emptyText={t("home.emptyTodaySchedules")}
                  isLoading={scheduleQuery.isLoading}
                  title={t("home.scheduleToday")}
                >
                  {todaySchedules.slice(0, 5).map((schedule) => (
                    <ScheduleTaskItem key={schedule.id} schedule={schedule} timeZone={timeZone} />
                  ))}
                </TaskPanel>
                <TaskPanel
                  emptyText={t("home.emptyFollowUps")}
                  isLoading={recentDealsQuery.isLoading}
                  title={t("home.dealsFollowUp")}
                >
                  {followUpDeals.map((deal) => (
                    <FollowUpTaskItem deal={deal} key={deal.id} />
                  ))}
                </TaskPanel>
              </div>
            </DashboardSection>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <DashboardSection
                actionHref="/app/deals"
                actionLabel={t("navigation.deals")}
                icon={TrendingUp}
                title={t("home.dealStatus")}
              >
                <div className="grid gap-3">
                  <div className="grid gap-3 rounded-lg border border-[#EEF2F7] bg-[#FAFBFC] p-3 sm:grid-cols-2">
                    <MiniMetric label={t("home.totalDealAmount")} value={formatCurrency(pipelineValue)} />
                    <MiniMetric
                      label={t("home.recentScope")}
                      value={t("home.countCases", {
                        values: { count: numberFormatter.format(recentDeals.length) },
                      })}
                    />
                  </div>
                  <StageBreakdown
                    counts={stageCounts}
                    isLoading={stageCountsQuery.isLoading}
                    numberFormatter={numberFormatter}
                    t={t}
                  />
                </div>
              </DashboardSection>

              <DashboardSection
                actionHref="/app/deals"
                actionLabel={t("home.all")}
                icon={AlertCircle}
                title={t("home.dueSoonDeals")}
              >
                <ListState
                  emptyText={t("home.emptyDueSoonDeals")}
                  isLoading={deadlineDealsQuery.isLoading}
                >
                  {activeDeadlineDeals.map((deal) => (
                    <DeadlineDealItem
                      deal={deal}
                      formatCurrency={formatCurrency}
                      key={deal.id}
                      t={t}
                      today={today}
                    />
                  ))}
                </ListState>
              </DashboardSection>
            </div>
          </div>

          <div className="grid content-start gap-5">
            <QuickActionPanel />

            <DashboardSection
              actionHref="/app/schedules"
              actionLabel={t("home.all")}
              icon={Clock3}
              title={t("home.upcomingSchedules")}
            >
              <ListState
                emptyText={t("home.emptySchedules")}
                isLoading={scheduleQuery.isLoading}
              >
                {upcomingSchedules.map((schedule) => (
                  <UpcomingScheduleItem key={schedule.id} schedule={schedule} timeZone={timeZone} />
                ))}
              </ListState>
            </DashboardSection>

            <DashboardSection
              actionHref="/app/deals"
              actionLabel={t("home.all")}
              icon={CheckCircle2}
              title={t("home.activitiesTitle")}
            >
              <ListState emptyText={t("home.emptyActivities")} isLoading={isAnyLoading}>
                {recentActivity.map((activity) => (
                  <ActivityItemRow activity={activity} key={`${activity.type}-${activity.href}`} />
                ))}
              </ListState>
            </DashboardSection>
          </div>
        </div>
      </div>
    </section>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  tone,
  value,
}: {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly tone: "amber" | "blue" | "emerald";
  readonly value: string;
}) {
  const styles = {
    amber: "border-[#FED7AA] bg-[#FFF7ED] text-[#C2410C]",
    blue: "border-[#BFDBFE] bg-[#EFF6FF] text-[#4880EE]",
    emerald: "border-[#BBF7D0] bg-[#F0FDF4] text-[#047857]",
  };

  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium text-[#64748B]">{label}</p>
          <p className="mt-2 text-[26px] font-bold leading-none text-[#111827]">
            {value}
          </p>
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border", styles[tone])}>
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </div>
      </div>
    </div>
  );
}

function DashboardSection({
  actionHref,
  actionLabel,
  children,
  icon: Icon,
  title,
}: {
  readonly actionHref?: string;
  readonly actionLabel?: string;
  readonly children: React.ReactNode;
  readonly icon: LucideIcon;
  readonly title: string;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-sm">
      <div className="flex h-12 items-center justify-between gap-3 border-b border-[#EEF2F7] px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-[#64748B]" strokeWidth={1.8} />
          <h2 className="truncate text-[14px] font-semibold text-[#111827]">{title}</h2>
        </div>
        {actionHref && actionLabel ? (
          <Link
            className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[12px] font-medium text-[#64748B] transition hover:bg-[#F8FAFC] hover:text-[#111827]"
            to={actionHref}
          >
            {actionLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function TaskPanel({
  children,
  emptyText,
  isLoading,
  title,
}: {
  readonly children: React.ReactNode;
  readonly emptyText: string;
  readonly isLoading: boolean;
  readonly title: string;
}) {
  const hasChildren = Boolean(toArrayLength(children));

  return (
    <div className="min-w-0 rounded-lg border border-[#EEF2F7] bg-[#FAFBFC]">
      <div className="flex h-10 items-center border-b border-[#EEF2F7] px-3">
        <h3 className="text-[13px] font-semibold text-[#334155]">{title}</h3>
      </div>
      <div className="divide-y divide-[#EEF2F7]">
        {isLoading ? (
          <LoadingRows count={3} />
        ) : hasChildren ? (
          children
        ) : (
          <EmptyLine text={emptyText} />
        )}
      </div>
    </div>
  );
}

function ScheduleTaskItem({
  schedule,
  timeZone,
}: {
  readonly schedule: Schedule;
  readonly timeZone: string;
}) {
  const { formatDateTime, t } = useAppI18n();

  return (
    <Link
      className="grid min-w-0 grid-cols-[72px_minmax(0,1fr)] gap-3 px-3 py-3 transition hover:bg-white"
      to={`/app/schedules/${schedule.id}`}
    >
      <span className="text-[12px] font-bold text-[#047857]">
        {formatDateTime(schedule.startAt, { timeZone })}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold text-[#111827]">
          {schedule.scheduleTitle}
        </p>
        <p className="mt-0.5 truncate text-[12px] text-[#64748B]">
          {schedule.location || getScheduleDealLabel(schedule, t)}
        </p>
      </div>
    </Link>
  );
}

function FollowUpTaskItem({ deal }: { readonly deal: DealListItem }) {
  const { t } = useAppI18n();

  return (
    <Link
      className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-3 px-3 py-3 transition hover:bg-white"
      to={`/app/deals/${deal.id}`}
    >
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold text-[#111827]">
          {deal.latestFollowingAction?.followingAction ?? "-"}
        </p>
        <p className="mt-0.5 truncate text-[12px] text-[#64748B]">
          {deal.dealName} · {getDealCompanyLabel(deal, t)}
        </p>
      </div>
      <span className="h-fit rounded-full bg-[#EFF6FF] px-2 py-1 text-[11px] font-semibold text-[#4880EE]">
        {deal.dealStatusLabel}
      </span>
    </Link>
  );
}

function MiniMetric({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[12px] font-medium text-[#64748B]">{label}</p>
      <p className="mt-1 truncate text-[20px] font-bold text-[#111827]">{value}</p>
    </div>
  );
}

function StageBreakdown({
  counts,
  isLoading,
  numberFormatter,
  t,
}: {
  readonly counts: readonly DealStageCount[];
  readonly isLoading: boolean;
  readonly numberFormatter: Intl.NumberFormat;
  readonly t: (key: AppI18nKey, options?: { readonly values?: Record<string, string | number> }) => string;
}) {
  const countMap = new Map(counts.map((item) => [item.dealStatus, item.count]));
  const maxCount = Math.max(1, ...DEAL_STATUS_LIST.map((status) => countMap.get(status) ?? 0));

  if (isLoading) {
    return <LoadingRows count={4} />;
  }

  return (
    <div className="grid gap-2">
      {DEAL_STATUS_LIST.map((status) => {
        const count = countMap.get(status) ?? 0;
        const width = `${Math.max(5, (count / maxCount) * 100)}%`;
        const isClosed = status === "WON" || status === "LOST";

        return (
          <div className="grid gap-1" key={status}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-medium text-[#475569]">
                {DEAL_STATUS_LABEL[status]}
              </span>
              <span className="text-[11px] font-semibold text-[#111827]">
                {t("home.countCases", { values: { count: numberFormatter.format(count) } })}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#F1F5F9]">
              <div
                className={cn(
                  "h-full rounded-full",
                  isClosed ? "bg-[#94A3B8]" : "bg-[#10B981]"
                )}
                style={{ width }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DeadlineDealItem({
  deal,
  formatCurrency,
  t,
  today,
}: {
  readonly deal: DealListItem;
  readonly formatCurrency: (amount: number | null | undefined) => string;
  readonly t: (key: AppI18nKey, options?: { readonly values?: Record<string, string | number> }) => string;
  readonly today: Date;
}) {
  const daysUntil = getDaysUntil(deal.expectedEndDate, today);

  return (
    <Link
      className="flex min-w-0 items-center justify-between gap-3 px-1 py-2.5 transition hover:bg-[#FAFBFC]"
      to={`/app/deals/${deal.id}`}
    >
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold text-[#111827]">{deal.dealName}</p>
        <p className="mt-0.5 truncate text-[12px] text-[#64748B]">
          {getDealCompanyLabel(deal, t)} · {formatCurrency(deal.dealCost)}
        </p>
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold",
          daysUntil < 0
            ? "bg-[#FEF2F2] text-[#B91C1C]"
            : daysUntil <= 3
              ? "bg-[#FFF7ED] text-[#C2410C]"
              : "bg-[#F8FAFC] text-[#475569]"
        )}
      >
        {formatDueLabel(daysUntil, t)}
      </span>
    </Link>
  );
}


function QuickActionPanel() {
  const { t } = useAppI18n();

  return (
    <section className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-sm">
      <div className="flex h-12 items-center justify-between border-b border-[#EEF2F7] px-4">
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-[#64748B]" strokeWidth={1.8} />
          <h2 className="text-[14px] font-semibold text-[#111827]">{t("home.quickActions")}</h2>
        </div>
      </div>
      <div className="grid gap-2 p-4">
        {QUICK_ACTIONS.map((action) => (
          <QuickActionLink action={action} key={action.href} />
        ))}
      </div>
    </section>
  );
}

function QuickActionLink({ action }: { readonly action: QuickAction }) {
  const Icon = action.icon;
  const { t } = useAppI18n();
  const toneClass = {
    amber: "bg-[#FFF7ED] text-[#C2410C]",
    blue: "bg-[#EFF6FF] text-[#4880EE]",
    emerald: "bg-[#ECFDF5] text-[#047857]",
    slate: "bg-[#F8FAFC] text-[#475569]",
  }[action.tone];

  return (
    <Link
      className="group flex items-center gap-3 rounded-lg border border-[#EEF2F7] bg-[#FAFBFC] px-3 py-3 transition hover:border-[#CBD5E1] hover:bg-white"
      to={action.href}
    >
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", toneClass)}>
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold text-[#111827]">{t(action.labelKey)}</span>
        <span className="mt-0.5 block truncate text-[12px] text-[#64748B]">
          {t(action.descriptionKey)}
        </span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-[#94A3B8] transition group-hover:text-[#111827]" />
    </Link>
  );
}

function UpcomingScheduleItem({
  schedule,
  timeZone,
}: {
  readonly schedule: Schedule;
  readonly timeZone: string;
}) {
  const { formatDate, formatDateTime, t } = useAppI18n();

  return (
    <Link
      className="grid min-w-0 grid-cols-[54px_minmax(0,1fr)] gap-3 px-1 py-2.5 transition hover:bg-[#FAFBFC]"
      to={`/app/schedules/${schedule.id}`}
    >
      <div className="rounded-lg bg-[#ECFDF5] px-2 py-1 text-center">
        <p className="text-[11px] font-bold text-[#047857]">
          {formatDate(schedule.startAt, { timeZone })}
        </p>
        <p className="mt-0.5 text-[11px] font-semibold text-[#065F46]">
          {formatDateTime(schedule.startAt, { timeZone })}
        </p>
      </div>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold text-[#111827]">
          {schedule.scheduleTitle}
        </p>
        <p className="mt-0.5 truncate text-[12px] text-[#64748B]">
          {schedule.location || getScheduleDealLabel(schedule, t)}
        </p>
      </div>
    </Link>
  );
}

function ActivityItemRow({ activity }: { readonly activity: ActivityItem }) {
  const isDeal = activity.type === "deal";

  return (
    <Link
      className="grid min-w-0 grid-cols-[30px_minmax(0,1fr)] gap-3 px-1 py-2.5 transition hover:bg-[#FAFBFC]"
      to={activity.href}
    >
      <span
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-lg",
          isDeal ? "bg-[#EFF6FF] text-[#4880EE]" : "bg-[#EFF6FF] text-[#4880EE]"
        )}
      >
        {isDeal ? (
          <BriefcaseBusiness className="h-3.5 w-3.5" />
        ) : (
          <NotebookPen className="h-3.5 w-3.5" />
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-semibold text-[#111827]">
          {activity.title}
        </span>
        <span className="mt-0.5 block truncate text-[12px] text-[#64748B]">
          {activity.meta}
        </span>
      </span>
    </Link>
  );
}

function ListState({
  children,
  emptyText,
  isLoading,
}: {
  readonly children: React.ReactNode;
  readonly emptyText: string;
  readonly isLoading: boolean;
}) {
  const hasChildren = Boolean(toArrayLength(children));

  if (isLoading) {
    return <LoadingRows count={4} />;
  }

  if (!hasChildren) {
    return <EmptyLine text={emptyText} />;
  }

  return <div className="divide-y divide-[#EEF2F7]">{children}</div>;
}

function LoadingRows({ count }: { readonly count: number }) {
  return (
    <div className="grid gap-2">
      {Array.from({ length: count }, (_, index) => (
        <div className="h-11 animate-pulse rounded-md bg-[#F1F5F9]" key={index} />
      ))}
    </div>
  );
}

function EmptyLine({ text }: { readonly text: string }) {
  return (
    <div className="flex min-h-20 items-center justify-center rounded-md bg-[#FAFBFC] px-4 py-5 text-center text-[13px] text-[#94A3B8]">
      {text}
    </div>
  );
}

function getActiveDealCount(counts: readonly DealStageCount[]) {
  return counts
    .filter((item) => ACTIVE_DEAL_STATUSES.includes(item.dealStatus))
    .reduce((sum, item) => sum + item.count, 0);
}

type HomeTranslate = (
  key: AppI18nKey,
  options?: { readonly values?: Record<string, string | number> }
) => string;

function getDealCompanyLabel(deal: DealListItem, t: HomeTranslate) {
  return (
    deal.companies
      .map((company) => formatDeletedLabel(company.companyName, company.isDeleted, t))
      .join(", ") || t("common.none")
  );
}

function formatDeletedLabel(label: string, isDeleted: boolean, t: HomeTranslate): string {
  return isDeleted ? `${label} (${t("home.deleted")})` : label;
}

function buildRecentActivity({
  deals,
  formatCurrency,
  formatDateTime,
  meetingNotes,
  t,
}: {
  readonly deals: readonly DealListItem[];
  readonly formatCurrency: (amount: number | null | undefined) => string;
  readonly formatDateTime: (value: string | null | undefined) => string;
  readonly meetingNotes: readonly MeetingNoteListItem[];
  readonly t: HomeTranslate;
}) {
  const dealItems: ActivityItem[] = deals.slice(0, 5).map((deal) => ({
    createdAt: deal.createdAt,
    href: `/app/deals/${deal.id}`,
    meta: `${getDealCompanyLabel(deal, t)} · ${formatCurrency(deal.dealCost)}`,
    title: deal.dealName,
    type: "deal",
  }));
  const meetingItems: ActivityItem[] = meetingNotes.slice(0, 5).map((meetingNote) => ({
    createdAt: meetingNote.createdAt,
    href: `/app/meeting-notes/${meetingNote.id}`,
    meta: getMeetingNoteSubtitle(meetingNote, formatDateTime),
    title: getMeetingNoteTitle(meetingNote, t),
    type: "meeting",
  }));

  return [...dealItems, ...meetingItems]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);
}

function getMeetingNoteTitle(meetingNote: MeetingNoteListItem, t: HomeTranslate) {
  if (meetingNote.companies.label && meetingNote.contacts.label) {
    return `${meetingNote.companies.label} · ${meetingNote.contacts.label}`;
  }

  return meetingNote.companies.label || meetingNote.contacts.label || t("home.meetingNote");
}

function getMeetingNoteSubtitle(
  meetingNote: MeetingNoteListItem,
  formatDateTime: (value: string | null | undefined) => string
) {
  return [meetingNote.deals.label, formatDateTime(meetingNote.createdAt)]
    .filter(Boolean)
    .join(" · ");
}

function getScheduleDealLabel(schedule: Schedule, t: HomeTranslate) {
  return schedule.deals.map((deal) => deal.dealName).join(" · ") || t("home.connectedDealMissing");
}

function formatDueLabel(daysUntil: number, t: HomeTranslate) {
  if (daysUntil < 0) {
    return t("home.daysOverdue", { values: { days: Math.abs(daysUntil) } });
  }
  if (daysUntil === 0) return t("common.today");

  return `D-${daysUntil}`;
}

function getDaysUntil(value: string, today: Date) {
  const target = startOfDay(new Date(value));
  const base = startOfDay(today);

  if (Number.isNaN(target.getTime())) {
    return 999;
  }

  return Math.ceil((target.getTime() - base.getTime()) / 86_400_000);
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);

  return next;
}

function toDateKeyInTimeZone(value: string, timeZone: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  const formatter = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  });
  const parts = new Map(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return `${parts.get("year")}-${parts.get("month")}-${parts.get("day")}`;
}

function toArrayLength(children: React.ReactNode) {
  return Array.isArray(children) ? children.filter(Boolean).length : children ? 1 : 0;
}

function getIntlLocale(locale: string) {
  return locale === "en" ? "en-US" : locale;
}
