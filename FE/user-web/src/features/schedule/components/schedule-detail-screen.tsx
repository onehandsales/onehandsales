import {
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  ExternalLink,
  Link2,
  MapPin,
  Pencil,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/page-header";
import { useAuthSession } from "@/features/auth";
import { ScheduleFormDialog } from "@/features/schedule/components/schedule-form-dialog";
import { useScheduleDetail } from "@/features/schedule/hooks/use-schedule-queries";
import { getDefaultScheduleTimeZone } from "@/features/schedule/schemas/schedule-schema";
import type { Schedule } from "@/features/schedule/types/schedule";
import {
  formatScheduleDateRange as formatGoogleScheduleDateRange,
  getScheduleSourceBadgeClassName,
  getScheduleSourceBadgeLabel,
  getUrlDomainLabel,
} from "@/features/schedule/utils/google-calendar-display";
import { getApiErrorMessage } from "@/lib/api-client";

type ScheduleDetailScreenProps = {
  readonly scheduleId: string;
};

export function ScheduleDetailScreen({ scheduleId }: ScheduleDetailScreenProps) {
  const { user } = useAuthSession();
  const defaultTimeZone = user?.timeZone ?? getDefaultScheduleTimeZone();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const scheduleQuery = useScheduleDetail(scheduleId, scheduleId.length > 0);
  const schedule = scheduleQuery.data;

  return (
    <section className="flex min-h-full flex-col bg-white">
      <PageHeader
        breadcrumbs={[
          { label: "일정", to: "/schedules", icon: CalendarDays },
          { label: schedule?.scheduleTitle ?? "상세" },
        ]}
        actions={[
          {
            icon: Pencil,
            tooltip: "수정",
            onClick: () => setIsEditOpen(true),
            disabled: !schedule,
            variant: "primary",
          },
        ]}
      />

      <div className="px-5 pb-8">
        {notice ? (
          <p className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {notice}
          </p>
        ) : null}

        {scheduleQuery.isLoading ? (
          <ScheduleDetailSkeleton />
        ) : scheduleQuery.isError || !schedule ? (
          <ScheduleDetailError
            message={getApiErrorMessage(scheduleQuery.error)}
            onRetry={() => void scheduleQuery.refetch()}
          />
        ) : (
          <ScheduleDetailContent
            defaultTimeZone={defaultTimeZone}
            schedule={schedule}
          />
        )}
      </div>

      <ScheduleFormDialog
        defaultTimeZone={defaultTimeZone}
        initialStartAt={null}
        onOpenChange={setIsEditOpen}
        onSaved={setNotice}
        open={isEditOpen}
        schedule={schedule ?? null}
      />
    </section>
  );
}

function ScheduleDetailContent({
  defaultTimeZone,
  schedule,
}: {
  readonly defaultTimeZone: string;
  readonly schedule: Schedule;
}) {
  const badgeLabel = getScheduleSourceBadgeLabel(schedule);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <article className="rounded-lg border border-[#E2E5EC] bg-white p-5 shadow-sm">
        {schedule.googleCalendar?.isHidden ? (
          <p className="mb-4 rounded-md border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-2 text-sm font-medium text-[#475569]">
            숨긴 Google 일정입니다.
          </p>
        ) : null}
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#ECFDF5] text-[#047857]">
            <CalendarDays className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h1 className="break-words text-xl font-semibold text-[#111827]">
                {schedule.scheduleTitle}
              </h1>
              {badgeLabel ? (
                <span
                  className={`inline-flex h-6 shrink-0 items-center rounded-md border px-2 text-[11px] font-semibold ${getScheduleSourceBadgeClassName(
                    schedule,
                  )}`}
                >
                  {badgeLabel}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-[#64748B]">
              {formatScheduleDateRange(schedule, defaultTimeZone)}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          <InfoRow
            icon={Clock3}
            label="시간"
            value={formatScheduleDateRange(schedule, defaultTimeZone)}
          />
          <InfoRow
            icon={MapPin}
            label="장소"
            value={schedule.location || "등록된 장소 없음"}
          />
          {schedule.meetingUrl ? (
            <ExternalInfoRow
              href={schedule.meetingUrl}
              icon={Link2}
              label="미팅 링크"
              value={getUrlDomainLabel(schedule.meetingUrl)}
            />
          ) : null}
          <InfoRow
            icon={BriefcaseBusiness}
            label="연결 딜"
            value={
              schedule.deals.length > 0
                ? schedule.deals.map((deal) => deal.dealName).join(", ")
                : "연결된 딜 없음"
            }
          />
        </div>

        {schedule.googleCalendar?.externalHtmlLink ? (
          <div className="mt-4">
            <a
              className="inline-flex h-10 items-center gap-1.5 rounded-md border border-[#D7DCE5] bg-white px-3 text-[13px] font-semibold text-[#374151] transition hover:bg-[#F1F5F9]"
              href={schedule.googleCalendar.externalHtmlLink}
              rel="noopener noreferrer"
              target="_blank"
            >
              <ExternalLink className="h-4 w-4" />
              Google에서 열기
            </a>
          </div>
        ) : null}

        {schedule.memo ? (
          <section className="mt-6 rounded-lg border border-[#E2E5EC] bg-white p-4">
            <h2 className="text-sm font-semibold text-[#111827]">메모</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#374151]">
              {schedule.memo}
            </p>
          </section>
        ) : null}
      </article>

      <aside className="rounded-lg border border-[#E2E5EC] bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-[#111827]">연결 정보</h2>
        <div className="mt-3 grid gap-2">
          {schedule.deals.length === 0 ? (
            <p className="rounded-md border border-dashed border-[#CBD5E1] px-3 py-3 text-sm text-[#64748B]">
              딜을 연결하면 여기에서 볼 수 있어요.
            </p>
          ) : (
            schedule.deals.map((deal) => (
              <Link
                className="rounded-md border border-[#E2E5EC] px-3 py-2 text-sm font-medium text-[#1D4ED8] hover:bg-[#EFF6FF]"
                key={deal.id}
                to={`/app/deals/${deal.id}`}
              >
                {deal.dealName}
              </Link>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  readonly icon: typeof CalendarDays;
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-[#E2E5EC] bg-white px-3 py-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#94A3B8]" />
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#94A3B8]">{label}</p>
        <p className="mt-1 break-words text-sm font-medium text-[#111827]">
          {value}
        </p>
      </div>
    </div>
  );
}

function ExternalInfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  readonly icon: typeof CalendarDays;
  readonly label: string;
  readonly value: string;
  readonly href: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-[#E2E5EC] bg-white px-3 py-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#94A3B8]" />
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#94A3B8]">{label}</p>
        <a
          className="mt-1 inline-flex min-w-0 items-center gap-1 break-all text-sm font-semibold text-[#1D4ED8] hover:underline"
          href={href}
          rel="noopener noreferrer"
          target="_blank"
        >
          {value}
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
        </a>
      </div>
    </div>
  );
}

function ScheduleDetailSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="h-72 animate-pulse rounded-lg border bg-white" />
      <div className="h-52 animate-pulse rounded-lg border bg-white" />
    </div>
  );
}

function ScheduleDetailError({
  message,
  onRetry,
}: {
  readonly message: string;
  readonly onRetry: () => void;
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-5">
      <p className="text-sm font-medium text-red-700">{message}</p>
      <button
        className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 text-sm font-medium text-red-700 hover:bg-red-100"
        onClick={onRetry}
        type="button"
      >
        <RotateCcw className="h-4 w-4" />
        다시 시도
      </button>
    </div>
  );
}

function formatScheduleDateRange(schedule: Schedule, defaultTimeZone: string) {
  return formatGoogleScheduleDateRange(schedule, defaultTimeZone);
}
