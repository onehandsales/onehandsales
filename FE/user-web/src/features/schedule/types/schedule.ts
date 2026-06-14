export type ScheduleViewMode = "month" | "week";

export type ScheduleDeal = {
  readonly id: string;
  readonly dealName: string;
};

export type ScheduleDealOption = ScheduleDeal & {
  readonly createdAt: string;
};

export type Schedule = {
  readonly id: string;
  readonly scheduleTitle: string;
  readonly startAt: string;
  readonly endAt: string;
  readonly timeZone: string;
  readonly location: string | null;
  readonly memo: string | null;
  readonly deals: ScheduleDeal[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ScheduleDetail = Schedule;

export type ScheduleListResponse = {
  readonly items: Schedule[];
};

export type ScheduleDealOptionListResponse = {
  readonly items: ScheduleDealOption[];
};

export type ScheduleListParams = {
  readonly view: ScheduleViewMode;
  readonly baseDate: string;
  readonly timeZone?: string;
};

export type CreateScheduleInput = {
  readonly scheduleTitle: string;
  readonly startAt: string;
  readonly endAt: string;
  readonly timeZone: string;
  readonly location?: string | null;
  readonly memo?: string | null;
  readonly dealIds?: string[];
};

export type UpdateScheduleInput = Partial<CreateScheduleInput> & {
  readonly scheduleId: string;
};
