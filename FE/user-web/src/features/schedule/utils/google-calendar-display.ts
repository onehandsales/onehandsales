import type {
  ScheduleGoogleCalendar,
  ScheduleSourceType,
} from "@/features/schedule/types/schedule";
import { formatDateWithOptions } from "@/utils/format";

type CalendarDisplaySchedule = {
  readonly startAt: string;
  readonly endAt: string;
  readonly timeZone: string;
  readonly isAllDay: boolean;
  readonly sourceType: ScheduleSourceType;
  readonly googleCalendar: ScheduleGoogleCalendar | null;
};

export function getScheduleSourceBadgeLabel(
  schedule: Pick<CalendarDisplaySchedule, "sourceType" | "googleCalendar">
) {
  if (schedule.sourceType !== "GOOGLE") {
    return null;
  }

  if (schedule.googleCalendar?.badgeLabel) {
    return schedule.googleCalendar.badgeLabel;
  }

  switch (schedule.googleCalendar?.syncStatus) {
    case "LOCAL_MODIFIED":
      return "Google · 로컬 수정";
    case "GOOGLE_DELETED":
      return "Google · 연결 끊김";
    case "LOCAL_DELETED":
      return "Google · 로컬 삭제";
    case "SYNCED":
    default:
      return "Google";
  }
}

export function getScheduleSourceBadgeClassName(
  schedule: Pick<CalendarDisplaySchedule, "sourceType" | "googleCalendar">
) {
  if (schedule.sourceType !== "GOOGLE") {
    return "";
  }

  if (schedule.googleCalendar?.isHidden) {
    return "border-[#CBD5E1] bg-[#F8FAFC] text-[#475569]";
  }

  switch (schedule.googleCalendar?.syncStatus) {
    case "LOCAL_MODIFIED":
      return "border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]";
    case "GOOGLE_DELETED":
    case "LOCAL_DELETED":
      return "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]";
    case "SYNCED":
    default:
      return "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]";
  }
}

export function formatScheduleClockText(
  schedule: Pick<CalendarDisplaySchedule, "startAt" | "timeZone" | "isAllDay">,
  fallbackTimeZone?: string
) {
  if (schedule.isAllDay) {
    return "종일";
  }

  return formatDateWithOptions(schedule.startAt, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: schedule.timeZone || fallbackTimeZone,
  });
}

export function formatScheduleClockRange(
  schedule: Pick<
    CalendarDisplaySchedule,
    "startAt" | "endAt" | "timeZone" | "isAllDay"
  >,
  fallbackTimeZone?: string
) {
  if (schedule.isAllDay) {
    return "종일";
  }

  const timeZone = schedule.timeZone || fallbackTimeZone;

  return `${formatScheduleClockText(schedule, timeZone)} - ${formatDateWithOptions(
    schedule.endAt,
    {
      hour: "2-digit",
      minute: "2-digit",
      timeZone,
    }
  )}`;
}

export function formatScheduleDateRange(
  schedule: Pick<
    CalendarDisplaySchedule,
    "startAt" | "endAt" | "timeZone" | "isAllDay"
  >,
  fallbackTimeZone?: string
) {
  const timeZone = schedule.timeZone || fallbackTimeZone;

  if (schedule.isAllDay) {
    return `${formatDateWithOptions(schedule.startAt, {
      dateStyle: "medium",
      timeZone,
    })} 종일`;
  }

  const start = formatDateWithOptions(schedule.startAt, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  });
  const end = formatDateWithOptions(schedule.endAt, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  });

  return `${start} - ${end}`;
}

export function getUrlDomainLabel(value: string | null | undefined) {
  if (!value) {
    return "미팅 링크";
  }

  try {
    const url = new URL(value);
    return url.hostname.replace(/^www\./, "") || "미팅 링크";
  } catch {
    return "미팅 링크";
  }
}
