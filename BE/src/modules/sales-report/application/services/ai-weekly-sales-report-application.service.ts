import { createHash } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import {
  SCHEDULE_REPOSITORY,
  type ScheduleRepository,
  type WeeklyReportDealRecord,
  type WeeklyReportScheduleRecord,
} from "@/modules/schedule/application/ports/schedule.repository";
import {
  AI_WEEKLY_SALES_REPORT_REPOSITORY,
  type AiJobRecord,
  type AiWeeklySalesReportRecord,
  type AiWeeklySalesReportRepository,
  type AiWeeklySnapshotDealRecord,
  type AiWeeklySnapshotMeetingNoteRecord,
} from "@/modules/sales-report/application/ports/ai-weekly-sales-report.repository";
import {
  AiWeeklySalesReportAlreadyGeneratingError,
  AiWeeklySalesReportNotFoundError,
} from "@/modules/sales-report/domain/ai-weekly-sales-report.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  DEFAULT_USER_TIME_ZONE,
  isValidIanaTimeZone,
  normalizeOptionalIanaTimeZone,
} from "@/shared/application/time-zone/time-zone";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const LOCALE_PATTERN = /^[A-Za-z]{2,3}(?:[-_][A-Za-z0-9]{2,8})*$/;
const SNAPSHOT_SCHEMA_VERSION = "ai-weekly-sales-report-input-v1";
const MAX_SNAPSHOT_SCHEDULES = 200;
const MAX_SNAPSHOT_DEALS = 200;
const MAX_SNAPSHOT_MEETING_NOTES = 100;
const MAX_IDEMPOTENCY_KEY_LENGTH = 128;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface CalendarDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

interface DateTimeParts extends CalendarDate {
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
  readonly millisecond: number;
}

interface WeeklyRange {
  readonly weekStart: CalendarDate;
  readonly weekEnd: CalendarDate;
  readonly rangeStartAt: Date;
  readonly rangeEndAt: Date;
}

export interface RequestAiWeeklySalesReportGenerationCommand {
  readonly weekStart: string;
  readonly timeZone?: string;
  readonly locale?: string;
}

export interface GetAiWeeklySalesReportWeekQuery {
  readonly weekStart: string;
  readonly timeZone?: string;
  readonly includeFailed?: boolean | string;
}

export interface AiWeeklySalesReportSummaryResponse {
  readonly id: string;
  readonly weekStart: string;
  readonly weekEnd: string;
  readonly timeZone: string;
  readonly locale: string;
  readonly version: number;
  readonly status: string;
  readonly requestedAt: string;
  readonly generatedAt: string | null;
  readonly failedAt: string | null;
}

export interface RequestAiWeeklySalesReportGenerationResponse {
  readonly report: AiWeeklySalesReportSummaryResponse;
  readonly job: {
    readonly id: string;
    readonly status: string;
  };
}

export interface AiWeeklySalesReportWeekResponse {
  readonly weekStart: string;
  readonly weekEnd: string;
  readonly timeZone: string;
  readonly latestSuccessfulReport: AiWeeklySalesReportSummaryResponse | null;
  readonly generatingReport: AiWeeklySalesReportSummaryResponse | null;
  readonly versions: readonly AiWeeklySalesReportSummaryResponse[];
  readonly failedVersionCount: number;
  readonly failedVersions: readonly AiWeeklySalesReportSummaryResponse[];
}

export interface AiWeeklySalesReportDetailResponse
  extends AiWeeklySalesReportSummaryResponse {
  readonly safeErrorCode: string | null;
  readonly safeErrorMessage: string | null;
  readonly sections: Record<string, unknown> | null;
  readonly dataCoverage: Record<string, unknown>;
}

export interface AiWeeklySalesReportSnapshotSummaryResponse {
  readonly reportId: string;
  readonly snapshotSchemaVersion: string;
  readonly capturedAt: string | null;
  readonly counts: Record<string, number>;
  readonly records: {
    readonly schedules: readonly Record<string, unknown>[];
    readonly deals: readonly Record<string, unknown>[];
    readonly meetingNotes: readonly Record<string, unknown>[];
  };
  readonly excluded: readonly string[];
}

@Injectable()
export class AiWeeklySalesReportApplicationService {
  constructor(
    @Inject(AI_WEEKLY_SALES_REPORT_REPOSITORY)
    private readonly salesReportRepository: AiWeeklySalesReportRepository,
    @Inject(SCHEDULE_REPOSITORY)
    private readonly scheduleRepository: ScheduleRepository,
    private readonly logger: AppLogger
  ) {}

  async requestGeneration(
    currentUser: CurrentUserContext,
    input: RequestAiWeeklySalesReportGenerationCommand,
    idempotencyKeyHeader?: string
  ): Promise<RequestAiWeeklySalesReportGenerationResponse> {
    const now = new Date();
    const preferences = await this.salesReportRepository.findUserPreferences(
      currentUser.id
    );
    const timeZone = this.normalizeTimeZone(
      input.timeZone,
      currentUser.timeZone,
      preferences?.timeZone
    );
    const locale = this.normalizeLocale(
      input.locale ?? preferences?.preferredLocale ?? "ko-KR"
    );
    const weekStart = this.parseDateOnly(input.weekStart, "weekStart");
    this.assertMonday(weekStart);
    const range = this.createWeeklyRange(weekStart, timeZone);
    const weekStartDate = this.toDateOnly(range.weekStart);
    const weekEndDate = this.toDateOnly(range.weekEnd);
    const idempotencyKey = this.normalizeIdempotencyKey(idempotencyKeyHeader);

    if (idempotencyKey) {
      const existing =
        await this.salesReportRepository.findGenerationRequestByIdempotencyKey(
          currentUser.id,
          idempotencyKey
        );

      if (existing) {
        this.assertSameIdempotentRequest(existing.report, {
          weekStart: weekStartDate,
          timeZone,
          locale,
        });

        return this.toGenerationResponse(existing.report, existing.job);
      }
    }

    const existingGenerating =
      await this.salesReportRepository.findGeneratingReport(
        currentUser.id,
        weekStartDate,
        timeZone
      );

    if (existingGenerating) {
      throw new AiWeeklySalesReportAlreadyGeneratingError();
    }

    const snapshot = await this.buildInputSnapshot({
      userId: currentUser.id,
      weekStart: range.weekStart,
      weekEnd: range.weekEnd,
      weekStartDate,
      weekEndDate,
      rangeStartAt: range.rangeStartAt,
      rangeEndAt: range.rangeEndAt,
      timeZone,
      locale,
      capturedAt: now,
    });
    const result = await this.salesReportRepository.createGeneratingReportWithJob({
      userId: currentUser.id,
      weekStart: weekStartDate,
      weekEnd: weekEndDate,
      timeZone,
      locale,
      inputSnapshotJson: snapshot.inputSnapshot,
      inputMetadataJson: snapshot.inputMetadata,
      dataCoverageJson: snapshot.dataCoverage,
      idempotencyKey,
      now,
    });

    this.logEvent("ai.weeklyReport.generationRequested", {
      userId: currentUser.id,
      reportId: result.report.id,
      jobId: result.job.id,
      weekStart: this.formatDateOnly(weekStartDate),
      weekEnd: this.formatDateOnly(weekEndDate),
      timeZone,
      locale,
      version: result.report.version,
    });

    return this.toGenerationResponse(result.report, result.job);
  }

  async getWeek(
    currentUser: CurrentUserContext,
    query: GetAiWeeklySalesReportWeekQuery
  ): Promise<AiWeeklySalesReportWeekResponse> {
    const preferences = await this.salesReportRepository.findUserPreferences(
      currentUser.id
    );
    const timeZone = this.normalizeTimeZone(
      query.timeZone,
      currentUser.timeZone,
      preferences?.timeZone
    );
    const weekStart = this.parseDateOnly(query.weekStart, "weekStart");
    this.assertMonday(weekStart);
    const range = this.createWeeklyRange(weekStart, timeZone);
    const weekStartDate = this.toDateOnly(range.weekStart);
    const reports = await this.salesReportRepository.listReportsForWeek({
      userId: currentUser.id,
      weekStart: weekStartDate,
      timeZone,
    });
    const includeFailed = this.normalizeIncludeFailed(query.includeFailed);
    const latestSuccessfulReport =
      reports.find((report) => report.status === "READY") ?? null;
    const generatingReport =
      reports.find((report) => report.status === "GENERATING") ?? null;
    const failedReports = reports.filter((report) => report.status === "FAILED");
    const visibleReports = includeFailed
      ? reports
      : reports.filter((report) => report.status !== "FAILED");

    return {
      weekStart: this.formatCalendarDate(range.weekStart),
      weekEnd: this.formatCalendarDate(range.weekEnd),
      timeZone,
      latestSuccessfulReport: latestSuccessfulReport
        ? this.toReportSummary(latestSuccessfulReport)
        : null,
      generatingReport: generatingReport
        ? this.toReportSummary(generatingReport)
        : null,
      versions: visibleReports.map((report) => this.toReportSummary(report)),
      failedVersionCount: failedReports.length,
      failedVersions: includeFailed
        ? failedReports.map((report) => this.toReportSummary(report))
        : [],
    };
  }

  async getDetail(
    currentUser: CurrentUserContext,
    reportId: string
  ): Promise<AiWeeklySalesReportDetailResponse> {
    const report = await this.salesReportRepository.findReportById(
      currentUser.id,
      reportId
    );

    if (!report) {
      throw new AiWeeklySalesReportNotFoundError();
    }

    return {
      ...this.toReportSummary(report),
      safeErrorCode: report.safeErrorCode,
      safeErrorMessage: report.safeErrorMessage,
      sections: report.status === "READY" ? report.outputJson : null,
      dataCoverage: this.extractDataCoverage(report),
    };
  }

  async getSnapshotSummary(
    currentUser: CurrentUserContext,
    reportId: string
  ): Promise<AiWeeklySalesReportSnapshotSummaryResponse> {
    const report = await this.salesReportRepository.findReportById(
      currentUser.id,
      reportId
    );

    if (!report) {
      throw new AiWeeklySalesReportNotFoundError();
    }

    return this.toSnapshotSummary(report);
  }

  private async buildInputSnapshot(input: {
    readonly userId: string;
    readonly weekStart: CalendarDate;
    readonly weekEnd: CalendarDate;
    readonly weekStartDate: Date;
    readonly weekEndDate: Date;
    readonly rangeStartAt: Date;
    readonly rangeEndAt: Date;
    readonly timeZone: string;
    readonly locale: string;
    readonly capturedAt: Date;
  }): Promise<{
    readonly inputSnapshot: Record<string, unknown>;
    readonly inputMetadata: Record<string, unknown>;
    readonly dataCoverage: Record<string, unknown>;
  }> {
    const [schedules, deals, meetingNotes] = await Promise.all([
      this.scheduleRepository.listSchedulesForWeeklyReport({
        userId: input.userId,
        rangeStartAt: input.rangeStartAt,
        rangeEndAt: input.rangeEndAt,
      }),
      this.salesReportRepository.listDealsForSnapshot({
        userId: input.userId,
        weekStart: input.weekStartDate,
        weekEnd: input.weekEndDate,
        limit: MAX_SNAPSHOT_DEALS,
      }),
      this.salesReportRepository.listMeetingNotesForSnapshot({
        userId: input.userId,
        rangeStartAt: input.rangeStartAt,
        rangeEndAt: input.rangeEndAt,
        limit: MAX_SNAPSHOT_MEETING_NOTES,
      }),
    ]);
    const scheduleSnapshot = schedules
      .slice(0, MAX_SNAPSHOT_SCHEDULES)
      .map((schedule) => this.toScheduleSnapshot(schedule));
    const dealSnapshot = deals.map((deal) => this.toDealSnapshot(deal));
    const meetingNoteSnapshot = meetingNotes.map((meetingNote) =>
      this.toMeetingNoteSnapshot(meetingNote)
    );
    const dataCoverage = this.createDataCoverage(
      scheduleSnapshot,
      dealSnapshot,
      meetingNoteSnapshot
    );
    const inputSnapshot = {
      schemaVersion: SNAPSHOT_SCHEMA_VERSION,
      capturedAt: input.capturedAt.toISOString(),
      weekStart: this.formatCalendarDate(input.weekStart),
      weekEnd: this.formatCalendarDate(input.weekEnd),
      timeZone: input.timeZone,
      locale: input.locale,
      rangeStartAt: input.rangeStartAt.toISOString(),
      rangeEndAt: input.rangeEndAt.toISOString(),
      counts: {
        schedules: scheduleSnapshot.length,
        deals: dealSnapshot.length,
        meetingNotes: meetingNoteSnapshot.length,
        linkedDeals: dataCoverage.linkedDealCount,
      },
      schedules: scheduleSnapshot,
      deals: dealSnapshot,
      meetingNotes: meetingNoteSnapshot,
      dataQuality: {
        missingSignals: dataCoverage.missingSignals,
      },
      excluded: [
        "providerPrompts",
        "providerRawResponses",
        "apiKeys",
        "privateMemoCiphertexts",
        "businessCardPromptSnapshots",
        "sttRawAudio",
        "deletedRecords",
        "crossUserRecords",
      ],
    };
    const inputHash = createHash("sha256")
      .update(JSON.stringify(inputSnapshot))
      .digest("hex");

    return {
      inputSnapshot,
      inputMetadata: {
        snapshotSchemaVersion: SNAPSHOT_SCHEMA_VERSION,
        inputHash,
        capturedAt: input.capturedAt.toISOString(),
        counts: inputSnapshot.counts,
      },
      dataCoverage,
    };
  }

  private toScheduleSnapshot(
    schedule: WeeklyReportScheduleRecord
  ): Record<string, unknown> {
    return {
      id: schedule.id,
      scheduleTitle: schedule.scheduleTitle,
      startAt: schedule.startAt.toISOString(),
      endAt: schedule.endAt.toISOString(),
      timeZone: schedule.timeZone,
      location: schedule.location,
      meetingUrl: schedule.meetingUrl,
      memo: schedule.memo,
      hasMemo: Boolean(schedule.memo?.trim()),
      isAllDay: schedule.isAllDay,
      sourceType: schedule.sourceType,
      googleCalendar: schedule.googleCalendar
        ? {
            sourceId: schedule.googleCalendar.sourceId,
            calendarName: schedule.googleCalendar.calendarName,
            syncStatus: schedule.googleCalendar.syncStatus,
            isHidden: schedule.googleCalendar.isHidden,
          }
        : null,
      deals: schedule.deals.map((deal) => this.toScheduleDealSnapshot(deal)),
    };
  }

  private toScheduleDealSnapshot(
    deal: WeeklyReportDealRecord
  ): Record<string, unknown> {
    return {
      id: deal.id,
      dealName: deal.dealName,
      dealStatus: deal.dealStatus,
      dealCost: deal.dealCost,
      expectedEndDate: this.formatDateOnly(deal.expectedEndDate),
      companies: deal.companies.map((company) => ({
        id: company.id,
        companyName: company.companyName,
      })),
      contacts: deal.contacts.map((contact) => ({
        id: contact.id,
        username: contact.username,
        companyId: contact.companyId,
        companyName: contact.companyName,
      })),
      nextFollowingAction: deal.nextFollowingAction
        ? {
            id: deal.nextFollowingAction.id,
            followingAction: deal.nextFollowingAction.followingAction,
            checkComplete: deal.nextFollowingAction.checkComplete,
            createdAt: deal.nextFollowingAction.createdAt.toISOString(),
            remainingCount: deal.nextFollowingAction.remainingCount,
          }
        : null,
    };
  }

  private toDealSnapshot(
    deal: AiWeeklySnapshotDealRecord
  ): Record<string, unknown> {
    return {
      id: deal.id,
      dealName: deal.dealName,
      dealStatus: deal.dealStatus,
      dealCost: deal.dealCost,
      expectedEndDate: this.formatDateOnly(deal.expectedEndDate),
      companies: deal.companies,
      contacts: deal.contacts,
      products: deal.products,
      nextFollowingActions: deal.nextFollowingActions.map((action) => ({
        id: action.id,
        followingAction: action.followingAction,
        checkComplete: action.checkComplete,
        createdAt: action.createdAt.toISOString(),
      })),
      openFollowingActionCount: deal.openFollowingActionCount,
    };
  }

  private toMeetingNoteSnapshot(
    meetingNote: AiWeeklySnapshotMeetingNoteRecord
  ): Record<string, unknown> {
    return {
      id: meetingNote.id,
      sourceType: meetingNote.sourceType,
      title: meetingNote.title,
      meetingAt: meetingNote.meetingAt.toISOString(),
      timeZone: meetingNote.timeZone,
      details: meetingNote.details,
      nextPlan: meetingNote.nextPlan,
      requiredAction: meetingNote.requiredAction,
      companies: meetingNote.companies,
      contacts: meetingNote.contacts,
      products: meetingNote.products,
      deals: meetingNote.deals.map((deal) => ({
        id: deal.id,
        dealId: deal.dealId,
        dealName: deal.dealName,
        dealStatus: deal.dealStatus,
        dealCost: deal.dealCost,
        expectedEndDate: this.formatDateOnly(deal.expectedEndDate),
      })),
    };
  }

  private createDataCoverage(
    schedules: readonly Record<string, unknown>[],
    deals: readonly Record<string, unknown>[],
    meetingNotes: readonly Record<string, unknown>[]
  ): Record<string, unknown> {
    const linkedDealIds = new Set<string>();

    for (const schedule of schedules) {
      for (const deal of this.getObjectArray(schedule, "deals")) {
        const id = this.getString(deal, "id");

        if (id) {
          linkedDealIds.add(id);
        }
      }
    }

    const missingSignals: string[] = [];

    if (schedules.length === 0) {
      missingSignals.push("NO_WEEKLY_SCHEDULES");
    }

    if (deals.length === 0) {
      missingSignals.push("NO_ACTIVE_OR_DUE_DEALS");
    }

    if (meetingNotes.length === 0) {
      missingSignals.push("NO_WEEKLY_MEETING_NOTES");
    }

    if (deals.some((deal) => this.getObjectArray(deal, "nextFollowingActions").length === 0)) {
      missingSignals.push("DEAL_NEXT_ACTION_MISSING");
    }

    return {
      scheduleCount: schedules.length,
      dealCount: deals.length,
      meetingNoteCount: meetingNotes.length,
      linkedDealCount: linkedDealIds.size,
      missingSignals: [...new Set(missingSignals)],
    };
  }

  private toGenerationResponse(
    report: AiWeeklySalesReportRecord,
    job: AiJobRecord
  ): RequestAiWeeklySalesReportGenerationResponse {
    return {
      report: this.toReportSummary(report),
      job: {
        id: job.id,
        status: job.status,
      },
    };
  }

  private toReportSummary(
    report: AiWeeklySalesReportRecord
  ): AiWeeklySalesReportSummaryResponse {
    return {
      id: report.id,
      weekStart: this.formatDateOnly(report.weekStart),
      weekEnd: this.formatDateOnly(report.weekEnd),
      timeZone: report.timeZone,
      locale: report.locale,
      version: report.version,
      status: report.status,
      requestedAt: report.requestedAt.toISOString(),
      generatedAt: report.generatedAt?.toISOString() ?? null,
      failedAt: report.failedAt?.toISOString() ?? null,
    };
  }

  private extractDataCoverage(
    report: AiWeeklySalesReportRecord
  ): Record<string, unknown> {
    const outputCoverage = report.outputJson?.dataCoverage;

    if (
      outputCoverage &&
      typeof outputCoverage === "object" &&
      !Array.isArray(outputCoverage)
    ) {
      return outputCoverage as Record<string, unknown>;
    }

    return report.dataCoverageJson;
  }

  private toSnapshotSummary(
    report: AiWeeklySalesReportRecord
  ): AiWeeklySalesReportSnapshotSummaryResponse {
    const snapshot = report.inputSnapshotJson;
    const schedules = this.getObjectArray(snapshot, "schedules");
    const deals = this.getObjectArray(snapshot, "deals");
    const meetingNotes = this.getObjectArray(snapshot, "meetingNotes");
    const counts = this.toNumberRecord(snapshot.counts);

    return {
      reportId: report.id,
      snapshotSchemaVersion:
        this.getString(snapshot, "schemaVersion") ?? SNAPSHOT_SCHEMA_VERSION,
      capturedAt: this.getString(snapshot, "capturedAt"),
      counts: {
        schedules: counts.schedules ?? schedules.length,
        deals: counts.deals ?? deals.length,
        meetingNotes: counts.meetingNotes ?? meetingNotes.length,
        linkedDeals: counts.linkedDeals ?? 0,
      },
      records: {
        schedules: schedules.map((schedule) => ({
          id: this.getString(schedule, "id"),
          scheduleTitle: this.getString(schedule, "scheduleTitle"),
          startAt: this.getString(schedule, "startAt"),
          endAt: this.getString(schedule, "endAt"),
          sourceType: this.getString(schedule, "sourceType"),
          hasMemo: schedule.hasMemo === true,
          dealCount: this.getObjectArray(schedule, "deals").length,
        })),
        deals: deals.map((deal) => ({
          id: this.getString(deal, "id"),
          dealName: this.getString(deal, "dealName"),
          dealStatus: this.getString(deal, "dealStatus"),
          dealCost: this.getNumber(deal, "dealCost"),
          expectedEndDate: this.getString(deal, "expectedEndDate"),
          companyCount: this.getObjectArray(deal, "companies").length,
          contactCount: this.getObjectArray(deal, "contacts").length,
          nextActionCount: this.getObjectArray(deal, "nextFollowingActions").length,
        })),
        meetingNotes: meetingNotes.map((meetingNote) => ({
          id: this.getString(meetingNote, "id"),
          title: this.getString(meetingNote, "title"),
          meetingAt: this.getString(meetingNote, "meetingAt"),
          sourceType: this.getString(meetingNote, "sourceType"),
          hasDetails: Boolean(this.getString(meetingNote, "details")),
          hasNextPlan: Boolean(this.getString(meetingNote, "nextPlan")),
          hasRequiredAction: Boolean(
            this.getString(meetingNote, "requiredAction")
          ),
          linkedDealCount: this.getObjectArray(meetingNote, "deals").length,
        })),
      },
      excluded: this.getStringArray(snapshot, "excluded"),
    };
  }

  private normalizeTimeZone(
    requestedTimeZone: string | undefined,
    currentUserTimeZone: string | undefined,
    preferenceTimeZone: string | undefined
  ): string {
    const normalizedRequested = normalizeOptionalIanaTimeZone(requestedTimeZone);

    if (normalizedRequested) {
      return normalizedRequested;
    }

    const fallback = [currentUserTimeZone, preferenceTimeZone, DEFAULT_USER_TIME_ZONE]
      .map((value) => value?.trim())
      .find((value): value is string => Boolean(value));

    if (!fallback || !isValidIanaTimeZone(fallback)) {
      return DEFAULT_USER_TIME_ZONE;
    }

    return fallback;
  }

  private normalizeLocale(locale: string): string {
    const normalized = locale.trim().replace("_", "-");

    if (!normalized || !LOCALE_PATTERN.test(normalized)) {
      throw new ValidationDomainError("locale must be a valid locale tag");
    }

    return normalized;
  }

  private normalizeIdempotencyKey(value: string | undefined): string | null {
    if (value === undefined) {
      return null;
    }

    const normalized = value.trim();

    if (!normalized) {
      return null;
    }

    if (normalized.length > MAX_IDEMPOTENCY_KEY_LENGTH) {
      throw new ValidationDomainError("Idempotency-Key is too long");
    }

    return normalized;
  }

  private normalizeIncludeFailed(value: boolean | string | undefined): boolean {
    if (value === undefined) {
      return true;
    }

    if (typeof value === "boolean") {
      return value;
    }

    return value.trim().toLowerCase() !== "false";
  }

  private assertSameIdempotentRequest(
    report: AiWeeklySalesReportRecord,
    input: {
      readonly weekStart: Date;
      readonly timeZone: string;
      readonly locale: string;
    }
  ): void {
    if (
      report.weekStart.getTime() !== input.weekStart.getTime() ||
      report.timeZone !== input.timeZone ||
      report.locale !== input.locale
    ) {
      throw new ValidationDomainError(
        "Idempotency-Key was already used for another AI weekly report request"
      );
    }
  }

  private parseDateOnly(value: string, fieldName: string): CalendarDate {
    if (!DATE_ONLY_PATTERN.test(value)) {
      throw new ValidationDomainError(`${fieldName} must be YYYY-MM-DD`);
    }

    const [yearText, monthText, dayText] = value.split("-");
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      throw new ValidationDomainError(`${fieldName} must be a valid date`);
    }

    return { year, month, day };
  }

  private assertMonday(weekStart: CalendarDate): void {
    const date = new Date(
      Date.UTC(weekStart.year, weekStart.month - 1, weekStart.day)
    );

    if (date.getUTCDay() !== 1) {
      throw new ValidationDomainError("weekStart must be a Monday");
    }
  }

  private createWeeklyRange(
    weekStart: CalendarDate,
    timeZone: string
  ): WeeklyRange {
    const weekEnd = this.addCalendarDays(weekStart, 6);
    const nextWeekStart = this.addCalendarDays(weekStart, 7);

    return {
      weekStart,
      weekEnd,
      rangeStartAt: this.zonedTimeToUtc(
        { ...weekStart, hour: 0, minute: 0, second: 0, millisecond: 0 },
        timeZone
      ),
      rangeEndAt: this.zonedTimeToUtc(
        { ...nextWeekStart, hour: 0, minute: 0, second: 0, millisecond: 0 },
        timeZone
      ),
    };
  }

  private addCalendarDays(date: CalendarDate, days: number): CalendarDate {
    const utcDate = new Date(Date.UTC(date.year, date.month - 1, date.day));
    utcDate.setUTCDate(utcDate.getUTCDate() + days);

    return {
      year: utcDate.getUTCFullYear(),
      month: utcDate.getUTCMonth() + 1,
      day: utcDate.getUTCDate(),
    };
  }

  private toDateOnly(date: CalendarDate): Date {
    return new Date(Date.UTC(date.year, date.month - 1, date.day));
  }

  private zonedTimeToUtc(parts: DateTimeParts, timeZone: string): Date {
    const utcGuess = new Date(
      Date.UTC(
        parts.year,
        parts.month - 1,
        parts.day,
        parts.hour,
        parts.minute,
        parts.second,
        parts.millisecond
      )
    );
    const timeZoneParts = this.getTimeZoneParts(utcGuess, timeZone);
    const asUtc = Date.UTC(
      timeZoneParts.year,
      timeZoneParts.month - 1,
      timeZoneParts.day,
      timeZoneParts.hour,
      timeZoneParts.minute,
      timeZoneParts.second,
      timeZoneParts.millisecond
    );

    return new Date(utcGuess.getTime() - (asUtc - utcGuess.getTime()));
  }

  private getTimeZoneParts(date: Date, timeZone: string): DateTimeParts {
    const formatter = new Intl.DateTimeFormat("en-US", {
      calendar: "iso8601",
      day: "2-digit",
      hour: "2-digit",
      hour12: false,
      minute: "2-digit",
      month: "2-digit",
      second: "2-digit",
      timeZone,
      year: "numeric",
    });
    const values = new Map(
      formatter
        .formatToParts(date)
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, Number(part.value)])
    );

    return {
      year: values.get("year") ?? 0,
      month: values.get("month") ?? 0,
      day: values.get("day") ?? 0,
      hour: values.get("hour") ?? 0,
      minute: values.get("minute") ?? 0,
      second: values.get("second") ?? 0,
      millisecond: 0,
    };
  }

  private formatCalendarDate(date: CalendarDate): string {
    return [
      String(date.year).padStart(4, "0"),
      String(date.month).padStart(2, "0"),
      String(date.day).padStart(2, "0"),
    ].join("-");
  }

  private formatDateOnly(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private getObjectArray(
    value: Record<string, unknown>,
    key: string
  ): Record<string, unknown>[] {
    const item = value[key];

    if (!Array.isArray(item)) {
      return [];
    }

    return item.filter(
      (entry): entry is Record<string, unknown> =>
        Boolean(entry) && typeof entry === "object" && !Array.isArray(entry)
    );
  }

  private getString(value: Record<string, unknown>, key: string): string | null {
    const item = value[key];

    return typeof item === "string" && item.trim().length > 0
      ? item.trim()
      : null;
  }

  private getNumber(value: Record<string, unknown>, key: string): number {
    const item = value[key];

    return typeof item === "number" && Number.isFinite(item) ? item : 0;
  }

  private getStringArray(
    value: Record<string, unknown>,
    key: string
  ): string[] {
    const item = value[key];

    if (!Array.isArray(item)) {
      return [];
    }

    return item.filter(
      (entry): entry is string =>
        typeof entry === "string" && entry.trim().length > 0
    );
  }

  private toNumberRecord(value: unknown): Record<string, number> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(value).filter(
        (entry): entry is [string, number] =>
          typeof entry[1] === "number" && Number.isFinite(entry[1])
      )
    );
  }

  private logEvent(event: string, fields: Record<string, unknown>): void {
    this.logger.log(
      JSON.stringify({
        event,
        ...fields,
      }),
      this.constructor.name
    );
  }
}

export function normalizeSuggestionTargetId(targetId: string | null): string | null {
  return targetId && UUID_PATTERN.test(targetId) ? targetId : null;
}
