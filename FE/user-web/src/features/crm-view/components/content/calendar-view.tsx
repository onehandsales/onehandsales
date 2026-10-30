import { useAppI18n } from "@/features/app-i18n";
import { useState } from "react";
import type { ViewContentProps } from "./view-content-shared";
import { viewButton } from "./view-content-shared";
import { DateExceptions } from "./view-date-shared";
import { dayNumber, eventCoversDay } from "../../utils/view-data-dates";
// 기능 : 날짜 전용 기간과 사용자 시간대 일정을 달력 칸에 표시합니다.
export function CalendarView({
  response,
  scope,
  request,
}: ViewContentProps<"CALENDAR">) {
  const { t } = useAppI18n();
  const { data } = response;
  const [week, setWeek] = useState(0);
  const weekly = data.presentation.initialMode === "WEEK";
  const start = dayNumber(data.range.startDate),
    days = dayNumber(data.range.endDateExclusive) - start;
  const sunday = data.presentation.weekStartsOn === "SUNDAY",
    firstDay = new Date(data.range.startDate).getUTCDay(),
    offset = (firstDay + (sunday ? 0 : 6)) % 7;
  const names = sunday
    ? ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
    : ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  return (
    <section data-testid="view-calendar">
      {weekly && <div className="flex items-center gap-2 border-b px-4 py-2"><button type="button" className={viewButton} disabled={week === 0} onClick={() => setWeek(week - 1)}>{t("viewContent.previousWeek")}</button><button type="button" className={viewButton} disabled={week >= Math.ceil((days + offset) / 7) - 1} onClick={() => setWeek(week + 1)}>{t("viewContent.nextWeek")}</button></div>}
      <div className="overflow-x-auto">
        <div className="min-w-[630px]">
          <div className="grid grid-cols-7 border-b text-xs text-[#9B9A97]">
            {names.map((name) => (
              <div key={name} className="px-3 py-2">
                {t(`viewContent.${name}`)}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from(
              { length: weekly ? 7 : Math.ceil((days + offset) / 7) * 7 },
              (_, cellIndex) => {
                const index = cellIndex + (weekly ? week * 7 : 0);
                const active = index >= offset && index - offset < days,
                  date = new Date((start + index - offset) * 86400000)
                    .toISOString()
                    .slice(0, 10);
                const events = active
                  ? data.events.filter((event) =>
                      eventCoversDay(event, date, data.range.timeZone),
                    )
                  : [];
                return (
                  <div
                    key={date}
                    className={`min-h-28 border-b border-r border-[#EEEDEA] p-1.5 ${active ? "bg-white" : "bg-[#FAFAF9] text-[#C7C6C2]"}`}
                  >
                    <time dateTime={date} className="block px-1 pb-1 text-xs">
                      {Number(date.slice(8))}
                    </time>
                    <div className="space-y-1">
                      {events.map((event) => (
                        <article
                          key={event.item.occurrenceKey}
                          className="rounded border border-[#E9E8E5] bg-[#F7F7F5] px-1.5 py-1 text-[11px] text-[#575752]"
                          title={`${event.item.title} · ${event.start}${event.end ? ` → ${event.end}` : ""}`}
                        >
                          {event.item.title}
                        </article>
                      ))}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>
      <DateExceptions
        scope={scope}
        request={request}
        unscheduledCount={data.unscheduledCount}
        invalidDateCount={data.invalidDateCount}
      />
    </section>
  );
}
