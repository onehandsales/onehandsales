import {
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  MapPin,
  Pencil,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/page-header";
import { ScheduleFormDialog } from "@/features/schedule/components/schedule-form-dialog";
import { useScheduleDetail } from "@/features/schedule/hooks/use-schedule-queries";
import { getDefaultScheduleTimeZone } from "@/features/schedule/schemas/schedule-schema";
import type { Schedule } from "@/features/schedule/types/schedule";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDateWithOptions } from "@/utils/format";

type ScheduleDetailScreenProps = {
  readonly scheduleId: string;
};

const defaultTimeZone = getDefaultScheduleTimeZone();

export function ScheduleDetailScreen({ scheduleId }: ScheduleDetailScreenProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const scheduleQuery = useScheduleDetail(scheduleId, scheduleId.length > 0);
  const schedule = scheduleQuery.data;

  return (
    <section className="flex min-h-full flex-col bg-[#FAFAF8]">
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
          <ScheduleDetailContent schedule={schedule} />
        )}
      </div>

      <ScheduleFormDialog
        initialStartAt={null}
        onOpenChange={setIsEditOpen}
        onSaved={setNotice}
        open={isEditOpen}
        schedule={schedule ?? null}
      />
    </section>
  );
}

function ScheduleDetailContent({ schedule }: { readonly schedule: Schedule }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <article className="rounded-lg border border-[#E2E5EC] bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#ECFDF5] text-[#047857]">
            <CalendarDays className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold text-[#111827]">
              {schedule.scheduleTitle}
            </h1>
            <p className="mt-2 text-sm text-[#64748B]">
              {formatScheduleDateRange(schedule)}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          <InfoRow
            icon={Clock3}
            label="시간"
            value={formatScheduleDateRange(schedule)}
          />
          <InfoRow
            icon={MapPin}
            label="장소"
            value={schedule.location || "등록된 장소 없음"}
          />
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

        {schedule.memo ? (
          <section className="mt-6 rounded-lg border border-[#E2E5EC] bg-[#FAFAF8] p-4">
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
              연결된 딜이 없습니다.
            </p>
          ) : (
            schedule.deals.map((deal) => (
              <Link
                className="rounded-md border border-[#E2E5EC] px-3 py-2 text-sm font-medium text-[#1D4ED8] hover:bg-[#EFF6FF]"
                key={deal.id}
                to={`/deals/${deal.id}`}
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

function formatScheduleDateRange(schedule: Schedule) {
  const start = formatDateWithOptions(schedule.startAt, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: schedule.timeZone || defaultTimeZone,
  });
  const end = formatDateWithOptions(schedule.endAt, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: schedule.timeZone || defaultTimeZone,
  });

  return `${start} - ${end}`;
}
