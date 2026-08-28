import { createHash } from "node:crypto";
import { Inject, Injectable, Optional } from "@nestjs/common";
import type {
  ScheduleWeeklyReportDealRecord,
  ScheduleWeeklyReportScheduleRecord,
} from "@/modules/schedule/application/ports/schedule-weekly-report-query.port";
import { ScheduleApplicationService } from "@/modules/schedule/application/services/schedule-application.service";
import {
  AI_WEEKLY_SALES_REPORT_REPOSITORY,
  type AiJobRecord,
  type AiWeeklySalesReportRecord,
  type AiWeeklySalesReportRepository,
  type AiWeeklySalesReportSuggestionRecord,
  type AiWeeklySalesReportSuggestionTypeValue,
  type AiWeeklySnapshotDealRecord,
  type AiWeeklySnapshotMeetingNoteRecord,
} from "@/modules/sales-report/application/ports/ai-weekly-sales-report.repository";
import {
  AiWeeklySalesReportAlreadyGeneratingError,
  AiWeeklySalesReportNotFoundError,
} from "@/modules/sales-report/domain/ai-weekly-sales-report.errors";
import { ProcessAiWeeklySalesReportJobsUseCase } from "@/modules/sales-report/application/use-cases/process-ai-weekly-sales-report-jobs.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  DEFAULT_USER_TIME_ZONE,
  isValidIanaTimeZone,
  normalizeOptionalIanaTimeZone,
} from "@/shared/application/time-zone/time-zone";
import { DEFAULT_CURRENCY_CODE } from "@/shared/application/currency/currency-code";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const LOCALE_PATTERN = /^[A-Za-z]{2,3}(?:[-_][A-Za-z0-9]{2,8})*$/;
const SNAPSHOT_SCHEMA_VERSION = "ai-weekly-sales-report-input-v1";
const MAX_SNAPSHOT_SCHEDULES = 200;
const MAX_SNAPSHOT_DEALS = 200;
const MAX_SNAPSHOT_MEETING_NOTES = 100;
const MAX_IDEMPOTENCY_KEY_LENGTH = 128;
const MAX_SUMMARY_PREVIEW_LENGTH = 160;
const SUMMARY_PREVIEW_SUFFIX = "...";
const SUGGESTION_SECTIONS = [
  { key: "riskSignals", type: "RISK" },
  { key: "nextWeekActions", type: "NEXT_ACTION" },
  { key: "followUpDrafts", type: "FOLLOW_UP" },
  { key: "dataCleanupSuggestions", type: "DATA_CLEANUP" },
] as const satisfies readonly {
  readonly key: string;
  readonly type: AiWeeklySalesReportSuggestionTypeValue;
}[];

// 역할 : CalendarDate AI 주간 영업 리포트의 날짜 전용 값을 정의합니다.
interface CalendarDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

// 역할 : DateTimeParts timezone 변환에 사용하는 local date-time 구성요소를 정의합니다.
interface DateTimeParts extends CalendarDate {
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
  readonly millisecond: number;
}

// 역할 : WeeklyRange AI 주간 영업 리포트의 local 날짜와 UTC 조회 범위를 정의합니다.
interface WeeklyRange {
  readonly weekStart: CalendarDate;
  readonly weekEnd: CalendarDate;
  readonly rangeStartAt: Date;
  readonly rangeEndAt: Date;
}

// 역할 : RequestAiWeeklySalesReportGenerationCommand AI 주간 영업 리포트 생성 요청 값을 정의합니다.
export interface RequestAiWeeklySalesReportGenerationCommand {
  readonly weekStart: string;
  readonly timeZone?: string;
  readonly locale?: string;
}

// 역할 : GetAiWeeklySalesReportWeekQuery AI 주간 영업 리포트 주차 조회 조건을 정의합니다.
export interface GetAiWeeklySalesReportWeekQuery {
  readonly weekStart: string;
  readonly timeZone?: string;
  readonly includeFailed?: boolean | string;
}

// 역할 : AiWeeklySalesReportSummaryResponse AI 주간 영업 리포트 요약 응답을 정의합니다.
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
  readonly summaryPreview: string | null;
  readonly safeErrorCode: string | null;
  readonly safeErrorMessage: string | null;
}

// 역할 : RequestAiWeeklySalesReportGenerationResponse AI 주간 영업 리포트 생성 접수 응답을 정의합니다.
export interface RequestAiWeeklySalesReportGenerationResponse {
  readonly report: AiWeeklySalesReportSummaryResponse;
  readonly job: {
    readonly id: string;
    readonly status: string;
  };
}

// 역할 : AiWeeklySalesReportWeekResponse AI 주간 영업 리포트 주차별 버전 목록 응답을 정의합니다.
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

// 역할 : AiWeeklySalesReportDetailResponse AI 주간 영업 리포트 상세 응답을 정의합니다.
export interface AiWeeklySalesReportDetailResponse
  extends AiWeeklySalesReportSummaryResponse {
  readonly safeErrorCode: string | null;
  readonly safeErrorMessage: string | null;
  readonly sections: Record<string, unknown> | null;
  readonly dataCoverage: Record<string, unknown>;
}

// 역할 : AiWeeklySalesReportSnapshotSummaryResponse AI 주간 영업 리포트 입력 snapshot 요약 응답을 정의합니다.
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

// 역할 : AiWeeklySalesReportApplicationService AI 주간 영업 리포트 생성과 조회 유스케이스를 제공합니다.
@Injectable()
export class AiWeeklySalesReportApplicationService {
  // 기능 : AI 주간 영업 리포트 저장소, schedule application service, logger, job processor를 주입받습니다.
  constructor(
    @Inject(AI_WEEKLY_SALES_REPORT_REPOSITORY)
    private readonly salesReportRepository: AiWeeklySalesReportRepository,
    private readonly scheduleApplicationService: ScheduleApplicationService,
    private readonly logger: AppLogger,
    @Optional()
    private readonly processJobs?: ProcessAiWeeklySalesReportJobsUseCase
  ) {}

  // 기능 : AI 주간 영업 리포트 생성 요청을 검증하고 저장형 생성 job을 등록합니다.
  async requestGeneration(
    currentUser: CurrentUserContext,
    input: RequestAiWeeklySalesReportGenerationCommand,
    idempotencyKeyHeader?: string
  ): Promise<RequestAiWeeklySalesReportGenerationResponse> {
    // 1. 요청 기준 시각과 사용자 선호를 바탕으로 주차, timezone, locale, idempotency key를 정규화한다.
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

    // 2. 동일 idempotency key 요청이면 기존 요청 조건을 확인하고 기존 결과를 반환한다.
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

        this.dispatchGenerationJob(existing.job);

        return this.toGenerationResponse(existing.report, existing.job);
      }
    }

    // 3. 같은 사용자, 주차, timezone에서 이미 생성 중인 리포트가 있는지 확인한다.
    const existingGenerating =
      await this.salesReportRepository.findGeneratingReport(
        currentUser.id,
        weekStartDate,
        timeZone
      );

    if (existingGenerating) {
      throw new AiWeeklySalesReportAlreadyGeneratingError();
    }

    // 4. provider 입력용 snapshot과 coverage metadata를 생성한다.
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

    // 5. 생성 중 report와 job을 저장소에 함께 생성한다.
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

    // 6. 원문 snapshot 없이 생성 요청 이벤트를 기록하고 job 처리를 시작한다.
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
    this.dispatchGenerationJob(result.job);

    // 7. 생성 접수 응답을 반환한다.
    return this.toGenerationResponse(result.report, result.job);
  }

  // 기능 : 사용자의 특정 주 AI 리포트 목록을 조회하고 주차 조회 이벤트를 기록합니다.
  async getWeek(
    currentUser: CurrentUserContext,
    query: GetAiWeeklySalesReportWeekQuery
  ): Promise<AiWeeklySalesReportWeekResponse> {
    // 1. 사용자 선호와 query를 기준으로 조회 timezone과 주간 범위를 확정한다.
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

    // 2. 현재 사용자 소유 report version 목록을 조회한다.
    const reports = await this.salesReportRepository.listReportsForWeek({
      userId: currentUser.id,
      weekStart: weekStartDate,
      timeZone,
    });

    // 3. 화면 응답에 노출할 성공/생성/실패 version을 분리한다.
    const includeFailed = this.normalizeIncludeFailed(query.includeFailed);
    const latestSuccessfulReport =
      reports.find((report) => report.status === "READY") ?? null;
    const generatingReport =
      reports.find((report) => report.status === "GENERATING") ?? null;
    const failedReports = reports.filter((report) => report.status === "FAILED");
    const visibleReports = includeFailed
      ? reports
      : reports.filter((report) => report.status !== "FAILED");

    const response = {
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

    // 4. snapshot과 AI output 원문 없이 주차 조회 이벤트를 최소 식별 정보로 기록한다.
    this.logEvent("ai.weeklyReport.weekViewed", {
      userId: currentUser.id,
      weekStart: response.weekStart,
      weekEnd: response.weekEnd,
      timeZone,
      includeFailed,
      reportCount: reports.length,
      failedVersionCount: failedReports.length,
      latestSuccessfulReportId: latestSuccessfulReport?.id ?? null,
      latestSuccessfulReportVersion: latestSuccessfulReport?.version ?? null,
      generatingReportId: generatingReport?.id ?? null,
      generatingReportVersion: generatingReport?.version ?? null,
    });

    return response;
  }

  // 기능 : 사용자의 AI 주간 영업 리포트 상세를 조회하고 상세 조회 이벤트를 기록합니다.
  async getDetail(
    currentUser: CurrentUserContext,
    reportId: string
  ): Promise<AiWeeklySalesReportDetailResponse> {
    // 1. 현재 사용자 소유 report를 조회해 소유권을 함께 검증한다.
    const report = await this.salesReportRepository.findReportById(
      currentUser.id,
      reportId
    );

    if (!report) {
      throw new AiWeeklySalesReportNotFoundError();
    }

    // 2. report output을 사용자 응답용 section으로 변환한다.
    const response = {
      ...this.toReportSummary(report),
      safeErrorCode: report.safeErrorCode,
      safeErrorMessage: report.safeErrorMessage,
      sections:
        report.status === "READY"
          ? await this.createDetailSections(report)
          : null,
      dataCoverage: this.extractDataCoverage(report),
    };

    // 3. section과 snapshot 원문 없이 report 식별 정보만 상세 조회 이벤트로 기록한다.
    this.logEvent("ai.weeklyReport.detailViewed", {
      userId: currentUser.id,
      ...this.toReportLogFields(report),
    });

    return response;
  }

  // 기능 : 사용자의 AI 입력 snapshot 요약을 조회하고 snapshot 요약 조회 이벤트를 기록합니다.
  async getSnapshotSummary(
    currentUser: CurrentUserContext,
    reportId: string
  ): Promise<AiWeeklySalesReportSnapshotSummaryResponse> {
    // 1. 현재 사용자 소유 report를 조회해 소유권을 함께 검증한다.
    const report = await this.salesReportRepository.findReportById(
      currentUser.id,
      reportId
    );

    if (!report) {
      throw new AiWeeklySalesReportNotFoundError();
    }

    // 2. 저장된 input snapshot 원문을 사용자에게 노출 가능한 요약으로 변환한다.
    const summary = this.toSnapshotSummary(report);

    // 3. snapshot 원문 없이 report 식별 정보만 snapshot 요약 조회 이벤트로 기록한다.
    this.logEvent("ai.weeklyReport.snapshotSummaryViewed", {
      userId: currentUser.id,
      ...this.toReportLogFields(report),
      snapshotSchemaVersion: summary.snapshotSchemaVersion,
    });

    return summary;
  }

  // 기능 : AI Provider 입력에 사용할 주간 영업 snapshot과 metadata를 생성합니다.
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
    // 1. schedule application과 repository에서 provider 입력에 필요한 현재 사용자 데이터를 병렬 조회한다.
    const [schedules, deals, meetingNotes] = await Promise.all([
      this.scheduleApplicationService.listSchedulesForWeeklyReportSnapshot({
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

    // 2. 조회 결과를 provider 입력에 안전한 snapshot 구조로 변환한다.
    const scheduleSnapshot = schedules
      .slice(0, MAX_SNAPSHOT_SCHEDULES)
      .map((schedule) => this.toScheduleSnapshot(schedule));
    const dealSnapshot = deals.map((deal) => this.toDealSnapshot(deal));
    const meetingNoteSnapshot = meetingNotes.map((meetingNote) =>
      this.toMeetingNoteSnapshot(meetingNote)
    );

    // 3. snapshot 품질과 누락 신호를 계산한다.
    const dataCoverage = this.createDataCoverage(
      scheduleSnapshot,
      dealSnapshot,
      meetingNoteSnapshot
    );

    // 4. provider prompt에 들어갈 수 없는 민감/원문 범위를 제외 목록으로 명시한다.
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

    // 5. snapshot 변경 추적용 hash와 metadata를 생성한다.
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

  // 기능 : schedule application contract의 일정 projection을 AI 입력 snapshot 항목으로 변환합니다.
  private toScheduleSnapshot(
    schedule: ScheduleWeeklyReportScheduleRecord
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

  // 기능 : schedule application contract의 연결 딜 projection을 AI 입력 snapshot 항목으로 변환합니다.
  private toScheduleDealSnapshot(
    deal: ScheduleWeeklyReportDealRecord
  ): Record<string, unknown> {
    return {
      id: deal.id,
      dealName: deal.dealName,
      dealStatus: deal.dealStatus,
      dealCost: deal.dealCost,
      currencyCode: deal.currencyCode,
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

  // 기능 : 딜 repository projection을 AI 입력 snapshot 항목으로 변환합니다.
  private toDealSnapshot(
    deal: AiWeeklySnapshotDealRecord
  ): Record<string, unknown> {
    return {
      id: deal.id,
      dealName: deal.dealName,
      dealStatus: deal.dealStatus,
      dealCost: deal.dealCost,
      currencyCode: deal.currencyCode,
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

  // 기능 : 회의록 repository projection을 AI 입력 snapshot 항목으로 변환합니다.
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
        currencyCode: deal.currencyCode,
        expectedEndDate: this.formatDateOnly(deal.expectedEndDate),
      })),
    };
  }

  // 기능 : AI 입력 snapshot 데이터의 개수와 부족 신호를 계산합니다.
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

  // 기능 : 생성 접수 report와 job을 API 응답 형식으로 변환합니다.
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

  // 기능 : 상세 output에 저장된 suggestion ID를 연결해 화면 section을 생성합니다.
  private async createDetailSections(
    report: AiWeeklySalesReportRecord
  ): Promise<Record<string, unknown> | null> {
    if (!report.outputJson) {
      return null;
    }

    const suggestions =
      await this.salesReportRepository.listSuggestionsForReport({
        userId: report.userId,
        reportId: report.id,
      });

    if (suggestions.length === 0) {
      return report.outputJson;
    }

    return this.attachSuggestionIds(report.outputJson, suggestions);
  }

  // 기능 : AI output section 항목에 저장된 suggestion 식별자를 매칭해 붙입니다.
  private attachSuggestionIds(
    sections: Record<string, unknown>,
    suggestions: readonly AiWeeklySalesReportSuggestionRecord[]
  ): Record<string, unknown> {
    const nextSections: Record<string, unknown> = { ...sections };
    const suggestionsByKey = new Map(
      suggestions.map((suggestion) => [suggestion.suggestionKey, suggestion])
    );

    for (const section of SUGGESTION_SECTIONS) {
      const items = this.getObjectArray(sections, section.key);

      if (items.length === 0) {
        continue;
      }

      const sectionSuggestions = suggestions.filter(
        (suggestion) => suggestion.type === section.type
      );

      nextSections[section.key] = items.map((item, index) => {
        const itemKey = this.getString(item, "key") ?? String(index + 1);
        const expectedSuggestionKey = this.createSuggestionKey(
          section.type,
          itemKey,
          index
        );
        const suggestion =
          suggestionsByKey.get(expectedSuggestionKey) ??
          sectionSuggestions[index] ??
          null;

        if (!suggestion) {
          return item;
        }

        return {
          ...item,
          id: suggestion.id,
          sourceSuggestionId: suggestion.id,
          suggestionKey: suggestion.suggestionKey,
        };
      });
    }

    return nextSections;
  }

  // 기능 : suggestion type, key, index를 저장소 matching key로 정규화합니다.
  private createSuggestionKey(
    type: AiWeeklySalesReportSuggestionTypeValue,
    key: string,
    index: number
  ): string {
    const normalizedKey = key
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);

    return `${type.toLowerCase()}-${normalizedKey || index + 1}`;
  }

  // 기능 : AI 주간 영업 리포트 목록/상세 공통 요약 응답을 생성합니다.
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
      summaryPreview:
        report.status === "READY"
          ? this.createSummaryPreview(report.outputJson)
          : null,
      safeErrorCode: report.safeErrorCode,
      safeErrorMessage: report.safeErrorMessage,
    };
  }

  // 기능 : AI output에서 목록에 노출할 짧은 요약 문구를 안전하게 추출합니다.
  private createSummaryPreview(
    output: Record<string, unknown> | null
  ): string | null {
    if (!output) {
      return null;
    }

    const executiveSummary = output.executiveSummary;

    if (
      !executiveSummary ||
      typeof executiveSummary !== "object" ||
      Array.isArray(executiveSummary)
    ) {
      return null;
    }

    const summaryRecord = executiveSummary as Record<string, unknown>;
    const summaryPreview =
      this.getString(summaryRecord, "narrative") ??
      this.getString(summaryRecord, "headline");

    if (!summaryPreview) {
      return null;
    }

    if (summaryPreview.length <= MAX_SUMMARY_PREVIEW_LENGTH) {
      return summaryPreview;
    }

    return `${summaryPreview.slice(
      0,
      MAX_SUMMARY_PREVIEW_LENGTH - SUMMARY_PREVIEW_SUFFIX.length
    )}${SUMMARY_PREVIEW_SUFFIX}`;
  }

  // 기능 : 조회 이벤트 로그에 필요한 report 식별값만 원문 payload 없이 추출합니다.
  private toReportLogFields(
    report: AiWeeklySalesReportRecord
  ): Record<string, string | number> {
    return {
      reportId: report.id,
      weekStart: this.formatDateOnly(report.weekStart),
      weekEnd: this.formatDateOnly(report.weekEnd),
      timeZone: report.timeZone,
      status: report.status,
      version: report.version,
    };
  }

  // 기능 : provider output coverage가 있으면 우선 사용하고 없으면 snapshot coverage를 반환합니다.
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

  // 기능 : 입력 snapshot 원문에서 화면 노출 가능한 요약 정보만 추출합니다.
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
          currencyCode:
            this.getString(deal, "currencyCode") ?? DEFAULT_CURRENCY_CODE,
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

  // 기능 : 요청/사용자/선호 timezone을 IANA 기준으로 정규화합니다.
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

  // 기능 : locale 문자열을 API와 provider에서 사용할 language tag로 정규화합니다.
  private normalizeLocale(locale: string): string {
    const normalized = locale.trim().replace("_", "-");

    if (!normalized || !LOCALE_PATTERN.test(normalized)) {
      throw new ValidationDomainError("locale must be a valid locale tag");
    }

    return normalized;
  }

  // 기능 : Idempotency-Key header를 저장 가능한 nullable key로 정규화합니다.
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

  // 기능 : 실패 리포트 포함 query 값을 boolean 정책으로 정규화합니다.
  private normalizeIncludeFailed(value: boolean | string | undefined): boolean {
    if (value === undefined) {
      return true;
    }

    if (typeof value === "boolean") {
      return value;
    }

    return value.trim().toLowerCase() !== "false";
  }

  // 기능 : 동일 idempotency key 요청이 기존 생성 조건과 같은지 검증합니다.
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

  // 기능 : YYYY-MM-DD 입력을 calendar date로 검증 변환합니다.
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

  // 기능 : 리포트 시작일이 월요일인지 검증합니다.
  private assertMonday(weekStart: CalendarDate): void {
    const date = new Date(
      Date.UTC(weekStart.year, weekStart.month - 1, weekStart.day)
    );

    if (date.getUTCDay() !== 1) {
      throw new ValidationDomainError("weekStart must be a Monday");
    }
  }

  // 기능 : 주차 시작일과 timezone 기준으로 local 주간과 UTC 조회 범위를 계산합니다.
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

  // 기능 : calendar date에 지정 날짜 수를 더한 date-only 값을 반환합니다.
  private addCalendarDays(date: CalendarDate, days: number): CalendarDate {
    const utcDate = new Date(Date.UTC(date.year, date.month - 1, date.day));
    utcDate.setUTCDate(utcDate.getUTCDate() + days);

    return {
      year: utcDate.getUTCFullYear(),
      month: utcDate.getUTCMonth() + 1,
      day: utcDate.getUTCDate(),
    };
  }

  // 기능 : calendar date를 UTC 자정 Date 값으로 변환합니다.
  private toDateOnly(date: CalendarDate): Date {
    return new Date(Date.UTC(date.year, date.month - 1, date.day));
  }

  // 기능 : timezone 기준 local date-time을 UTC instant로 변환합니다.
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

  // 기능 : UTC instant를 지정 timezone의 local 구성요소로 분해합니다.
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

  // 기능 : calendar date를 YYYY-MM-DD 문자열로 포맷합니다.
  private formatCalendarDate(date: CalendarDate): string {
    return [
      String(date.year).padStart(4, "0"),
      String(date.month).padStart(2, "0"),
      String(date.day).padStart(2, "0"),
    ].join("-");
  }

  // 기능 : DB date-only 값을 YYYY-MM-DD 문자열로 포맷합니다.
  private formatDateOnly(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  // 기능 : unknown record 필드에서 object 배열만 안전하게 추출합니다.
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

  // 기능 : unknown record 필드에서 비어 있지 않은 문자열만 추출합니다.
  private getString(value: Record<string, unknown>, key: string): string | null {
    const item = value[key];

    return typeof item === "string" && item.trim().length > 0
      ? item.trim()
      : null;
  }

  // 기능 : unknown record 필드에서 유효한 숫자만 추출하고 없으면 0을 반환합니다.
  private getNumber(value: Record<string, unknown>, key: string): number {
    const item = value[key];

    return typeof item === "number" && Number.isFinite(item) ? item : 0;
  }

  // 기능 : unknown record 필드에서 비어 있지 않은 문자열 배열만 추출합니다.
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

  // 기능 : unknown 값을 숫자 값만 가진 record로 좁힙니다.
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

  // 기능 : 민감정보를 제외한 AI 주간 영업 리포트 구조화 이벤트 로그를 기록합니다.
  private logEvent(event: string, fields: Record<string, unknown>): void {
    this.logger.log(
      JSON.stringify({
        event,
        ...fields,
      }),
      this.constructor.name
    );
  }

  // 기능 : 대기 중인 생성 job을 후속 processor로 비동기 전달합니다.
  private dispatchGenerationJob(job: AiJobRecord): void {
    if (job.status !== "PENDING" || !this.processJobs) {
      return;
    }

    void this.processJobs.processJob(job.id).catch((error: unknown) => {
      this.logger.error(
        JSON.stringify({
          event: "ai.weeklyReport.dispatchFailed",
          jobId: job.id,
          safeErrorCode: "AI_WEEKLY_REPORT_DISPATCH_FAILED",
        }),
        error instanceof Error ? error.message : undefined,
        this.constructor.name
      );
    });
  }
}

export { normalizeSuggestionTargetId } from "./ai-weekly-sales-report-suggestion-target";
