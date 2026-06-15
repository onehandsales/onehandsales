type MeetingDateValue = Date | string | null | undefined;

type MeetingDateParts = {
  readonly compactDate: string;
  readonly date: string;
  readonly full: string;
  readonly hasValue: boolean;
  readonly time: string;
  readonly weekday: string;
};

const LOCALE = "ko-KR";
const DEFAULT_FALLBACK = "-";

export function getMeetingDateParts(
  value: MeetingDateValue,
  fallback = DEFAULT_FALLBACK
): MeetingDateParts {
  if (!value) {
    return {
      compactDate: fallback,
      date: fallback,
      full: fallback,
      hasValue: false,
      time: "",
      weekday: "",
    };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    const text = typeof value === "string" ? value : String(value);

    return {
      compactDate: text,
      date: text,
      full: text,
      hasValue: false,
      time: "",
      weekday: "",
    };
  }

  const dateLabel = new Intl.DateTimeFormat(LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
  const compactDate = new Intl.DateTimeFormat(LOCALE, {
    day: "numeric",
    month: "long",
  }).format(date);
  const weekday = new Intl.DateTimeFormat(LOCALE, {
    weekday: "short",
  }).format(date);
  const time = new Intl.DateTimeFormat(LOCALE, {
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
  }).format(date);
  const dateWithWeekday = `${dateLabel} (${weekday})`;

  return {
    compactDate: `${compactDate} (${weekday})`,
    date: dateWithWeekday,
    full: `${dateWithWeekday} ${time}`,
    hasValue: true,
    time,
    weekday,
  };
}
