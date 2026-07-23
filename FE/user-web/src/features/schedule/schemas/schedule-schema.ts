import { z } from "zod";
import type {
  CreateScheduleInput,
  Schedule,
  ScheduleDetail,
  UpdateScheduleInput,
} from "@/features/schedule/types/schedule";

const DEFAULT_TIME_ZONE = "Asia/Seoul";

export const scheduleFormSchema = z
  .object({
    scheduleTitle: z.string().trim().min(1, "일정 제목을 입력해 주세요.").max(100),
    startAt: z.string().min(1, "시작일시를 입력해 주세요."),
    endAt: z.string().min(1, "종료일시를 입력해 주세요."),
    timeZone: z.string().trim().min(1, "시간대를 선택해 주세요."),
    location: z.string().max(200).optional(),
    meetingUrl: z
      .string()
      .trim()
      .max(2048)
      .optional()
      .refine((value) => !value || value.startsWith("https://"), {
        message: "https://로 시작하는 링크를 입력해 주세요.",
      }),
    memo: z.string().max(2000).optional(),
    dealIds: z.array(z.string()),
    dealSearch: z.string().optional(),
  })
  .refine((values) => toDate(values.startAt) < toDate(values.endAt), {
    message: "종료일시는 시작일시보다 늦게 입력해 주세요.",
    path: ["endAt"],
  })
  .refine((values) => new Set(values.dealIds).size === values.dealIds.length, {
    message: "같은 딜은 한 번만 연결할 수 있어요.",
    path: ["dealIds"],
  });

export type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

export const emptyScheduleFormValues: ScheduleFormValues = {
  scheduleTitle: "",
  startAt: "",
  endAt: "",
  timeZone: getDefaultScheduleTimeZone(),
  location: "",
  meetingUrl: "",
  memo: "",
  dealIds: [],
  dealSearch: "",
};

export function getDefaultScheduleTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIME_ZONE;
}

export function toCreateScheduleInput(
  values: ScheduleFormValues
): CreateScheduleInput {
  return {
    scheduleTitle: values.scheduleTitle.trim(),
    startAt: values.startAt,
    endAt: values.endAt,
    timeZone: values.timeZone,
    location: toOptionalText(values.location),
    meetingUrl: toOptionalText(values.meetingUrl),
    memo: toOptionalText(values.memo),
    dealIds: values.dealIds,
  };
}

export function toUpdateScheduleInput(
  scheduleId: string,
  values: ScheduleFormValues
): UpdateScheduleInput {
  return {
    scheduleId,
    ...toCreateScheduleInput(values),
  };
}

export function toScheduleFormValues(
  detail: ScheduleDetail | null,
  fallback: Schedule | null
): ScheduleFormValues {
  const schedule = detail ?? fallback;

  if (!schedule) {
    return emptyScheduleFormValues;
  }

  return {
    scheduleTitle: schedule.scheduleTitle,
    startAt: toDateTimeLocalValue(schedule.startAt, schedule.timeZone),
    endAt: toDateTimeLocalValue(schedule.endAt, schedule.timeZone),
    timeZone: schedule.timeZone,
    location: schedule.location ?? "",
    meetingUrl: schedule.meetingUrl ?? "",
    memo: schedule.memo ?? "",
    dealIds: schedule.deals.map((deal) => deal.id),
    dealSearch: "",
  };
}

export function toDateTimeLocalValue(
  value: string | Date,
  timeZone = getDefaultScheduleTimeZone()
) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const formatter = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
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

  return `${parts.get("year")}-${parts.get("month")}-${parts.get("day")}T${parts.get("hour")}:${parts.get("minute")}`;
}

function toDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date(NaN);
  }

  return date;
}

function toOptionalText(value: string | undefined) {
  const trimmed = value?.trim() ?? "";

  return trimmed.length > 0 ? trimmed : null;
}
