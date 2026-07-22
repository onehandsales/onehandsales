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

export type WeeklyScheduleReportWeekday =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type WeeklyScheduleReportParams = {
  readonly weekStart: string;
  readonly timeZone?: string;
};

export type WeeklyScheduleReportResponse = {
  readonly weekStart: string;
  readonly weekEnd: string;
  readonly timeZone: string;
  readonly rangeStartAt: string;
  readonly rangeEndAt: string;
  readonly generatedAt: string;
  readonly summary: WeeklyScheduleReportSummary;
  readonly days: WeeklyScheduleReportDay[];
};

export type WeeklyScheduleReportSummary = {
  readonly totalScheduleCount: number;
  readonly totalScheduleEntryCount: number;
  readonly scheduledDayCount: number;
  readonly unlinkedScheduleCount: number;
  readonly scheduleDealLinkCount: number;
  readonly distinctLinkedDealCount: number;
  readonly totalDealCost: number;
  readonly dealStatusCounts: WeeklyScheduleReportDealStatusCount[];
};

export type WeeklyScheduleReportDealStatusCount = {
  readonly dealStatus: string;
  readonly dealStatusLabel: string;
  readonly count: number;
};

export type WeeklyScheduleReportDay = {
  readonly date: string;
  readonly weekday: WeeklyScheduleReportWeekday;
  readonly weekdayLabel: string;
  readonly scheduleCount: number;
  readonly linkedDealCount: number;
  readonly schedules: WeeklyScheduleReportSchedule[];
};

export type WeeklyScheduleReportSchedule = {
  readonly id: string;
  readonly scheduleTitle: string;
  readonly startAt: string;
  readonly endAt: string;
  readonly timeZone: string;
  readonly location: string | null;
  readonly hasMemo: boolean;
  readonly deals: WeeklyScheduleReportDeal[];
};

export type WeeklyScheduleReportDeal = {
  readonly id: string;
  readonly dealName: string;
  readonly dealCost: number;
  readonly dealStatus: string;
  readonly dealStatusLabel: string;
  readonly expectedEndDate: string;
  readonly companies: WeeklyScheduleReportCompany[];
  readonly contacts: WeeklyScheduleReportContact[];
  readonly nextFollowingAction: WeeklyScheduleReportNextFollowingAction | null;
};

export type WeeklyScheduleReportCompany = {
  readonly id: string;
  readonly companyName: string;
};

export type WeeklyScheduleReportContact = {
  readonly id: string;
  readonly username: string;
  readonly companyId: string;
  readonly companyName: string;
};

export type WeeklyScheduleReportNextFollowingAction = {
  readonly id: string;
  readonly followingAction: string;
  readonly checkComplete: boolean;
  readonly createdAt: string;
  readonly remainingCount: number;
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
