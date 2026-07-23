export type ScheduleViewMode = "month" | "week";

export type ScheduleSourceType = "INTERNAL" | "GOOGLE";

export type ScheduleVisibility = "ACTIVE" | "HIDDEN_GOOGLE" | "ALL";

export type ScheduleSourceTypeFilter = "ALL" | ScheduleSourceType;

export type GoogleCalendarConnectionStatus =
  | "CONNECTED"
  | "RECONNECT_REQUIRED"
  | "DISCONNECTED";

export type GoogleCalendarSourceStatus = "SELECTED" | "UNSELECTED";

export type GoogleCalendarSyncTrigger = "AUTO" | "MANUAL";

export type GoogleCalendarDisconnectScheduleAction = "KEEP" | "HIDE" | "TRASH";

export type ScheduleExternalSyncStatus =
  | "SYNCED"
  | "LOCAL_MODIFIED"
  | "GOOGLE_DELETED"
  | "LOCAL_DELETED";

export type ScheduleDeal = {
  readonly id: string;
  readonly dealName: string;
};

export type ScheduleDealOption = ScheduleDeal & {
  readonly createdAt: string;
};

export type GoogleCalendarConnection = {
  readonly provider: "GOOGLE";
  readonly status: GoogleCalendarConnectionStatus;
  readonly providerAccountEmail: string | null;
  readonly connectedAt: string | null;
  readonly reconnectRequiredAt: string | null;
  readonly disconnectedAt: string | null;
  readonly lastSyncedAt: string | null;
  readonly lastSyncStartedAt: string | null;
  readonly lastSyncFailedAt: string | null;
  readonly lastSyncErrorCode: string | null;
  readonly syncLockExpiresAt: string | null;
};

export type GoogleCalendarAutoSyncStatus = {
  readonly enabled: boolean;
  readonly freshnessMinutes: number;
  readonly shouldSyncOnScheduleEntry: boolean;
  readonly nextAutoSyncAvailableAt: string | null;
};

export type GoogleCalendarStatusResponse = {
  readonly connected: boolean;
  readonly connection: GoogleCalendarConnection | null;
  readonly selectedCalendarCount: number;
  readonly availableCalendarCount: number;
  readonly autoSync: GoogleCalendarAutoSyncStatus;
};

export type GoogleCalendarSource = {
  readonly id: string;
  readonly calendarId: string;
  readonly calendarName: string;
  readonly calendarTimeZone: string | null;
  readonly isPrimary: boolean;
  readonly isSystemCalendar: boolean;
  readonly status: GoogleCalendarSourceStatus;
  readonly lastSyncedAt: string | null;
  readonly lastSyncFailedAt: string | null;
  readonly lastSyncErrorCode: string | null;
};

export type ListGoogleCalendarsResponse = {
  readonly connection: GoogleCalendarConnection;
  readonly calendars: GoogleCalendarSource[];
};

export type StartGoogleCalendarConnectInput = {
  readonly returnTo: string;
};

export type StartGoogleCalendarConnectResponse = {
  readonly connectUrl: string;
  readonly expiresAt: string;
  readonly returnTo: string;
};

export type UpdateGoogleCalendarSelectionInput = {
  readonly selectedCalendarIds: string[];
};

export type SyncGoogleCalendarInput = {
  readonly trigger?: GoogleCalendarSyncTrigger;
};

export type GoogleCalendarSyncResult = {
  readonly importedCount: number;
  readonly updatedCount: number;
  readonly localModifiedSkippedCount: number;
  readonly googleDeletedCount: number;
  readonly hiddenByCalendarSelectionCount: number;
  readonly trashedCount: number;
  readonly reminderScheduledCount: number;
  readonly reminderCanceledCount: number;
  readonly errorCount: number;
};

export type GoogleCalendarSyncResponse = {
  readonly trigger: GoogleCalendarSyncTrigger;
  readonly connectionStatus: GoogleCalendarConnectionStatus;
  readonly rangeStartAt: string;
  readonly rangeEndAt: string;
  readonly startedAt: string;
  readonly finishedAt: string;
  readonly selectedCalendarCount: number;
  readonly result: GoogleCalendarSyncResult;
  readonly nextAutoSyncAvailableAt: string | null;
};

export type DisconnectGoogleCalendarInput = {
  readonly scheduleAction?: GoogleCalendarDisconnectScheduleAction;
};

export type DisconnectGoogleCalendarResponse = {
  readonly connectionStatus: GoogleCalendarConnectionStatus;
  readonly scheduleAction: GoogleCalendarDisconnectScheduleAction;
  readonly affectedScheduleCount: number;
  readonly trashedScheduleCount: number;
  readonly hiddenScheduleCount: number;
  readonly keptScheduleCount: number;
  readonly disconnectedAt: string;
};

export type ScheduleGoogleCalendar = {
  readonly sourceId: string;
  readonly calendarId: string;
  readonly calendarName: string;
  readonly syncStatus: ScheduleExternalSyncStatus;
  readonly badgeLabel: string;
  readonly externalHtmlLink: string | null;
  readonly lastExternalSyncedAt: string | null;
  readonly externalDeletedAt: string | null;
  readonly isHidden: boolean;
  readonly canEditLocalFields: boolean;
};

export type Schedule = {
  readonly id: string;
  readonly scheduleTitle: string;
  readonly startAt: string;
  readonly endAt: string;
  readonly timeZone: string;
  readonly location: string | null;
  readonly meetingUrl: string | null;
  readonly memo: string | null;
  readonly isAllDay: boolean;
  readonly sourceType: ScheduleSourceType;
  readonly googleCalendar: ScheduleGoogleCalendar | null;
  readonly deletedAt: string | null;
  readonly trashExpiresAt: string | null;
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
  readonly visibility?: ScheduleVisibility;
  readonly sourceType?: ScheduleSourceTypeFilter;
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
  readonly meetingUrl: string | null;
  readonly isAllDay: boolean;
  readonly sourceType: ScheduleSourceType;
  readonly googleCalendar: ScheduleGoogleCalendar | null;
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
  readonly meetingUrl?: string | null;
  readonly memo?: string | null;
  readonly dealIds?: string[];
};

export type UpdateScheduleInput = Partial<CreateScheduleInput> & {
  readonly scheduleId: string;
};
