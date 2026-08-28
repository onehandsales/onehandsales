import type { ScheduleApplicationService } from "@/modules/schedule/application/services/schedule-application.service";
import {
  type AiJobRecord,
  type AiWeeklySalesReportRecord,
  type AiWeeklySalesReportRepository,
  type CreateGeneratingReportInput,
} from "@/modules/sales-report/application/ports/ai-weekly-sales-report.repository";
import { AiWeeklySalesReportAlreadyGeneratingError } from "@/modules/sales-report/domain/ai-weekly-sales-report.errors";
import type { ProcessAiWeeklySalesReportJobsUseCase } from "@/modules/sales-report/application/use-cases/process-ai-weekly-sales-report-jobs.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { AiWeeklySalesReportApplicationService } from "./ai-weekly-sales-report-application.service";

const USER_ID = "7d0b03d4-93fb-47d1-85ad-7f39c15eb4da";
const REPORT_ID = "9d1b57bf-6746-4b2f-9084-0327e03d9e8a";
const JOB_ID = "fa8e6d9e-820e-43be-907e-c69f4115227f";
const DEAL_ID = "8d7603da-33d2-4c88-8f7d-2daafddfbc13";
const SUGGESTION_ID = "1d74e42d-b412-4a53-9fa1-76a5f837ae9e";

const CURRENT_USER: CurrentUserContext = {
  id: USER_ID,
  sessionId: "session-1",
  email: "user@example.com",
  displayName: "User",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

describe("AiWeeklySalesReportApplicationService", () => {
  it("creates a generating report, job, and redacted metadata snapshot", async () => {
    const createdInputs: CreateGeneratingReportInput[] = [];
    const repository = createRepository({
      createGeneratingReportWithJob: jest.fn(async (input) => {
        createdInputs.push(input);

        return {
          report: createReport({
            weekStart: input.weekStart,
            weekEnd: input.weekEnd,
            timeZone: input.timeZone,
            locale: input.locale,
            inputSnapshotJson: input.inputSnapshotJson,
            inputMetadataJson: input.inputMetadataJson,
            dataCoverageJson: input.dataCoverageJson,
          }),
          job: createJob(input.idempotencyKey),
        };
      }),
    });
    const processJobs = createProcessJobs();
    const logger = createLogger();
    const service = new AiWeeklySalesReportApplicationService(
      repository,
      createScheduleApplicationService(),
      logger,
      processJobs
    );

    const response = await service.requestGeneration(
      CURRENT_USER,
      {
        weekStart: "2026-07-20",
        timeZone: "America/New_York",
      },
      "idem-123"
    );

    expect(response.report.status).toBe("GENERATING");
    expect(response.report.locale).toBe("en-US");
    expect(response.report.summaryPreview).toBeNull();
    expect(response.report.safeErrorCode).toBeNull();
    expect(response.report.safeErrorMessage).toBeNull();
    expect(response.job.status).toBe("PENDING");
    expect(processJobs.processJob).toHaveBeenCalledWith(JOB_ID);
    expect(createdInputs).toHaveLength(1);
    expect(createdInputs[0]?.idempotencyKey).toBe("idem-123");
    expect(createdInputs[0]?.inputMetadataJson).toHaveProperty("inputHash");
    expect(createdInputs[0]?.inputSnapshotJson).toMatchObject({
      schemaVersion: "ai-weekly-sales-report-input-v1",
      weekStart: "2026-07-20",
      timeZone: "America/New_York",
      counts: {
        schedules: 1,
        deals: 1,
        meetingNotes: 1,
      },
    });
    expect(createdInputs[0]?.inputSnapshotJson).toMatchObject({
      deals: [expect.objectContaining({ currencyCode: "USD" })],
      schedules: [
        expect.objectContaining({
          deals: [expect.objectContaining({ currencyCode: "USD" })],
        }),
      ],
    });
    const meetingNotes = createdInputs[0]?.inputSnapshotJson
      .meetingNotes as Record<string, unknown>[];
    expect(meetingNotes[0]).toMatchObject({
      details: "Discussed renewal risk and next plan.",
      requiredAction: "Send renewal proposal",
    });
    const generationEvent = getLoggedEvent(
      logger,
      "ai.weeklyReport.generationRequested"
    );
    expect(generationEvent).toMatchObject({
      event: "ai.weeklyReport.generationRequested",
      userId: USER_ID,
      reportId: REPORT_ID,
      jobId: JOB_ID,
      weekStart: "2026-07-20",
      weekEnd: "2026-07-26",
      timeZone: "America/New_York",
      locale: "en-US",
      version: 1,
    });
    expect(JSON.stringify(generationEvent)).not.toContain(
      "Discussed renewal risk"
    );
  });

  it("blocks duplicate generation for the same user, week, and timezone", async () => {
    const repository = createRepository({
      findGeneratingReport: jest.fn().mockResolvedValue(createReport()),
    });
    const service = new AiWeeklySalesReportApplicationService(
      repository,
      createScheduleApplicationService(),
      createLogger()
    );

    await expect(
      service.requestGeneration(CURRENT_USER, {
        weekStart: "2026-07-20",
        timeZone: "Asia/Seoul",
      })
    ).rejects.toBeInstanceOf(AiWeeklySalesReportAlreadyGeneratingError);
  });

  it("logs week view event with safe aggregate payload", async () => {
    const logger = createLogger();
    const repository = createRepository({
      listReportsForWeek: jest.fn().mockResolvedValue([
        createReport({
          id: "ready-report-id",
          status: "READY",
          version: 2,
          outputJson: {
            executiveSummary: {
              headline: "Weekly summary headline",
              narrative: "Sensitive weekly summary preview",
              body: "Sensitive AI section body",
            },
          },
        }),
        createReport({
          id: "failed-report-id",
          status: "FAILED",
          version: 1,
          safeErrorCode: "AI_PROVIDER_TIMEOUT",
          safeErrorMessage: "리포트를 만들지 못했어요.",
        }),
      ]),
    });
    const service = new AiWeeklySalesReportApplicationService(
      repository,
      createScheduleApplicationService(),
      logger
    );

    const response = await service.getWeek(CURRENT_USER, {
      weekStart: "2026-07-20",
      timeZone: "Asia/Seoul",
      includeFailed: "false",
    });

    expect(response.versions).toHaveLength(1);
    expect(response.latestSuccessfulReport?.summaryPreview).toBe(
      "Sensitive weekly summary preview"
    );
    expect(response.versions[0]?.summaryPreview).toBe(
      "Sensitive weekly summary preview"
    );
    expect(response.failedVersionCount).toBe(1);
    expect(response.failedVersions).toEqual([]);
    const weekViewedEvent = getLoggedEvent(
      logger,
      "ai.weeklyReport.weekViewed"
    );
    expect(weekViewedEvent).toMatchObject({
      event: "ai.weeklyReport.weekViewed",
      userId: USER_ID,
      weekStart: "2026-07-20",
      weekEnd: "2026-07-26",
      timeZone: "Asia/Seoul",
      includeFailed: false,
      reportCount: 2,
      failedVersionCount: 1,
      latestSuccessfulReportId: "ready-report-id",
      latestSuccessfulReportVersion: 2,
      generatingReportId: null,
      generatingReportVersion: null,
    });
    expect(JSON.stringify(weekViewedEvent)).not.toContain(
      "Sensitive AI section body"
    );
    expect(JSON.stringify(weekViewedEvent)).not.toContain(
      "Sensitive weekly summary preview"
    );
  });

  it("maps summary preview fallback only for ready reports", async () => {
    const repository = createRepository({
      listReportsForWeek: jest.fn().mockResolvedValue([
        createReport({
          id: "headline-ready-report-id",
          status: "READY",
          version: 3,
          outputJson: {
            executiveSummary: {
              headline: "Headline fallback preview",
            },
          },
        }),
        createReport({
          id: "generating-report-id",
          status: "GENERATING",
          version: 2,
          outputJson: {
            executiveSummary: {
              narrative: "Generating report preview",
            },
          },
        }),
        createReport({
          id: "failed-report-id",
          status: "FAILED",
          version: 1,
          outputJson: {
            executiveSummary: {
              narrative: "Failed report preview",
            },
          },
          failedAt: new Date("2026-07-20T01:00:00.000Z"),
          safeErrorCode: "AI_PROVIDER_TIMEOUT",
          safeErrorMessage: "Safe failed message",
        }),
      ]),
    });
    const service = new AiWeeklySalesReportApplicationService(
      repository,
      createScheduleApplicationService(),
      createLogger()
    );

    const response = await service.getWeek(CURRENT_USER, {
      weekStart: "2026-07-20",
      timeZone: "Asia/Seoul",
      includeFailed: true,
    });

    expect(response.latestSuccessfulReport?.summaryPreview).toBe(
      "Headline fallback preview"
    );
    expect(response.generatingReport?.summaryPreview).toBeNull();
    expect(response.failedVersions[0]?.summaryPreview).toBeNull();
    expect(response.failedVersions[0]?.safeErrorCode).toBe(
      "AI_PROVIDER_TIMEOUT"
    );
    expect(response.failedVersions[0]?.safeErrorMessage).toBe(
      "Safe failed message"
    );
  });

  it("returns snapshot summary without raw meeting note body", async () => {
    const logger = createLogger();
    const repository = createRepository({
      findReportById: jest.fn().mockResolvedValue(
        createReport({
          inputSnapshotJson: {
            schemaVersion: "ai-weekly-sales-report-input-v1",
            capturedAt: "2026-07-20T00:00:00.000Z",
            counts: {
              schedules: 0,
              deals: 0,
              meetingNotes: 1,
              linkedDeals: 0,
            },
            schedules: [],
            deals: [],
            meetingNotes: [
              {
                id: "note-1",
                title: "Renewal meeting",
                meetingAt: "2026-07-20T01:00:00.000Z",
                details: "Sensitive meeting note body",
                nextPlan: "Next plan",
                requiredAction: "Required action",
                deals: [],
              },
            ],
            excluded: ["providerRawResponses"],
          },
        })
      ),
    });
    const service = new AiWeeklySalesReportApplicationService(
      repository,
      createScheduleApplicationService(),
      logger
    );

    const summary = await service.getSnapshotSummary(CURRENT_USER, REPORT_ID);

    expect(summary.records.meetingNotes[0]).toMatchObject({
      id: "note-1",
      title: "Renewal meeting",
      hasDetails: true,
      hasNextPlan: true,
      hasRequiredAction: true,
    });
    expect(summary.records.meetingNotes[0]).not.toHaveProperty("details");
    expect(summary.excluded).toContain("providerRawResponses");
    const snapshotSummaryViewedEvent = getLoggedEvent(
      logger,
      "ai.weeklyReport.snapshotSummaryViewed"
    );
    expect(snapshotSummaryViewedEvent).toMatchObject({
      event: "ai.weeklyReport.snapshotSummaryViewed",
      userId: USER_ID,
      reportId: REPORT_ID,
      weekStart: "2026-07-20",
      weekEnd: "2026-07-26",
      timeZone: "Asia/Seoul",
      status: "GENERATING",
      version: 1,
      snapshotSchemaVersion: "ai-weekly-sales-report-input-v1",
    });
    expect(JSON.stringify(snapshotSummaryViewedEvent)).not.toContain(
      "Sensitive meeting note body"
    );
    expect(JSON.stringify(snapshotSummaryViewedEvent)).not.toContain(
      "providerRawResponses"
    );
  });

  it("attaches stored suggestion ids to ready report detail sections", async () => {
    const logger = createLogger();
    const repository = createRepository({
      findReportById: jest.fn().mockResolvedValue(
        createReport({
          status: "READY",
          outputJson: {
            executiveSummary: {
              headline: "Detail summary headline",
              narrative: "Sensitive detail summary preview",
            },
            followUpDrafts: [
              {
                key: "follow-up-note-1",
                priority: "MEDIUM",
                title: "Follow up",
                body: "Send the next step.",
              },
            ],
          },
        })
      ),
      listSuggestionsForReport: jest.fn().mockResolvedValue([
        {
          id: SUGGESTION_ID,
          userId: USER_ID,
          reportId: REPORT_ID,
          type: "FOLLOW_UP",
          suggestionKey: "follow_up-follow-up-note-1",
          priority: "MEDIUM",
          title: "Follow up",
          body: "Send the next step.",
          reason: null,
          targetType: "MEETING_NOTE",
          targetId: null,
          targetPath: null,
          targetLabel: null,
          payloadJson: {},
        },
      ]),
    });
    const service = new AiWeeklySalesReportApplicationService(
      repository,
      createScheduleApplicationService(),
      logger
    );

    const detail = await service.getDetail(CURRENT_USER, REPORT_ID);
    const sections = detail.sections as {
      readonly followUpDrafts?: readonly Record<string, unknown>[];
    };

    expect(detail.summaryPreview).toBe("Sensitive detail summary preview");
    expect(sections.followUpDrafts?.[0]).toMatchObject({
      id: SUGGESTION_ID,
      sourceSuggestionId: SUGGESTION_ID,
      suggestionKey: "follow_up-follow-up-note-1",
    });
    const detailViewedEvent = getLoggedEvent(
      logger,
      "ai.weeklyReport.detailViewed"
    );
    expect(detailViewedEvent).toMatchObject({
      event: "ai.weeklyReport.detailViewed",
      userId: USER_ID,
      reportId: REPORT_ID,
      weekStart: "2026-07-20",
      weekEnd: "2026-07-26",
      timeZone: "Asia/Seoul",
      status: "READY",
      version: 1,
    });
    expect(JSON.stringify(detailViewedEvent)).not.toContain(
      "Send the next step."
    );
    expect(JSON.stringify(detailViewedEvent)).not.toContain(
      "Sensitive detail summary preview"
    );
  });
});

// 기능 : logger mock에서 특정 이벤트 payload를 찾아 반환합니다.
function getLoggedEvent(
  logger: AppLogger,
  event: string
): Record<string, unknown> {
  const loggedEvent = getLoggedEvents(logger).find(
    (entry) => entry.event === event
  );
  expect(loggedEvent).toBeDefined();

  return loggedEvent ?? {};
}

// 기능 : logger mock의 JSON 메시지를 구조화 이벤트 목록으로 변환합니다.
function getLoggedEvents(logger: AppLogger): Record<string, unknown>[] {
  const logMock = logger.log as jest.MockedFunction<AppLogger["log"]>;

  return logMock.mock.calls.map(([message]) => {
    const parsed: unknown = JSON.parse(message);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return parsed as Record<string, unknown>;
  });
}

function createRepository(
  overrides: Partial<AiWeeklySalesReportRepository> = {}
): AiWeeklySalesReportRepository {
  return {
    runInTransaction: jest.fn(async (work) => work(createRepository(overrides))),
    findUserPreferences: jest.fn().mockResolvedValue({
      timeZone: "Asia/Seoul",
      preferredLocale: "en-US",
    }),
    findGenerationRequestByIdempotencyKey: jest.fn().mockResolvedValue(null),
    findGeneratingReport: jest.fn().mockResolvedValue(null),
    createGeneratingReportWithJob: jest.fn().mockResolvedValue({
      report: createReport(),
      job: createJob(null),
    }),
    listReportsForWeek: jest.fn().mockResolvedValue([]),
    findReportById: jest.fn().mockResolvedValue(createReport()),
    listSuggestionsForReport: jest.fn().mockResolvedValue([]),
    listMeetingNotesForSnapshot: jest.fn().mockResolvedValue([
      {
        id: "note-1",
        sourceType: "MANUAL",
        title: "Renewal meeting",
        meetingAt: new Date("2026-07-20T01:00:00.000Z"),
        timeZone: "Asia/Seoul",
        details: "Discussed renewal risk and next plan.",
        nextPlan: "Send commercial terms",
        requiredAction: "Send renewal proposal",
        companies: [],
        contacts: [],
        products: [],
        deals: [
          {
            id: "note-deal-1",
            dealId: DEAL_ID,
            dealName: "Renewal deal",
            dealStatus: "NEGOTIATION",
            dealCost: 1000,
            currencyCode: "USD",
            expectedEndDate: new Date("2026-07-24T00:00:00.000Z"),
          },
        ],
      },
    ]),
    listDealsForSnapshot: jest.fn().mockResolvedValue([
      {
        id: DEAL_ID,
        dealName: "Renewal deal",
        dealStatus: "NEGOTIATION",
        dealCost: 1000,
        currencyCode: "USD",
        expectedEndDate: new Date("2026-07-24T00:00:00.000Z"),
        companies: [],
        contacts: [],
        products: [],
        nextFollowingActions: [],
        openFollowingActionCount: 0,
      },
    ]),
    listPendingWeeklyReportJobs: jest.fn().mockResolvedValue([]),
    startWeeklyReportJob: jest.fn().mockResolvedValue(null),
    createProviderCallLog: jest.fn(),
    completeReportGeneration: jest.fn(),
    failReportGeneration: jest.fn(),
    ...overrides,
  };
}

// 기능 : sales-report 테스트에서 사용할 schedule application service mock을 생성합니다.
function createScheduleApplicationService(): ScheduleApplicationService {
  return {
    listSchedulesForWeeklyReportSnapshot: jest.fn().mockResolvedValue([
      {
        id: "schedule-1",
        scheduleTitle: "Renewal meeting",
        startAt: new Date("2026-07-20T01:00:00.000Z"),
        endAt: new Date("2026-07-20T02:00:00.000Z"),
        timeZone: "Asia/Seoul",
        location: "Zoom",
        meetingUrl: null,
        memo: "Meeting memo",
        isAllDay: false,
        sourceType: "INTERNAL",
        googleCalendar: null,
        deals: [
          {
            id: DEAL_ID,
            dealName: "Renewal deal",
            dealStatus: "NEGOTIATION",
            dealCost: 1000,
            currencyCode: "USD",
            expectedEndDate: new Date("2026-07-24T00:00:00.000Z"),
            companies: [],
            contacts: [],
            nextFollowingAction: null,
          },
        ],
      },
    ]),
  } as unknown as ScheduleApplicationService;
}

function createReport(
  overrides: Partial<AiWeeklySalesReportRecord> = {}
): AiWeeklySalesReportRecord {
  return {
    id: REPORT_ID,
    userId: USER_ID,
    weekStart: new Date("2026-07-20T00:00:00.000Z"),
    weekEnd: new Date("2026-07-26T00:00:00.000Z"),
    timeZone: "Asia/Seoul",
    locale: "ko-KR",
    version: 1,
    status: "GENERATING",
    provider: null,
    model: null,
    inputSnapshotJson: {},
    inputMetadataJson: {},
    outputJson: null,
    dataCoverageJson: {},
    safeErrorCode: null,
    safeErrorMessage: null,
    requestedAt: new Date("2026-07-20T00:00:00.000Z"),
    startedAt: null,
    generatedAt: null,
    failedAt: null,
    createdAt: new Date("2026-07-20T00:00:00.000Z"),
    updatedAt: new Date("2026-07-20T00:00:00.000Z"),
    ...overrides,
  };
}

function createJob(idempotencyKey: string | null): AiJobRecord {
  return {
    id: JOB_ID,
    userId: USER_ID,
    operation: "WEEKLY_SALES_REPORT",
    status: "PENDING",
    targetType: "AI_WEEKLY_SALES_REPORT",
    targetId: REPORT_ID,
    idempotencyKey,
    attemptCount: 0,
    maxAttemptCount: 1,
    safeErrorCode: null,
    safeErrorMessage: null,
    requestedAt: new Date("2026-07-20T00:00:00.000Z"),
    startedAt: null,
    completedAt: null,
    failedAt: null,
    metadataJson: {},
    createdAt: new Date("2026-07-20T00:00:00.000Z"),
    updatedAt: new Date("2026-07-20T00:00:00.000Z"),
  };
}

function createLogger(): AppLogger {
  return {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
    write: jest.fn(),
  } as unknown as AppLogger;
}

function createProcessJobs(): ProcessAiWeeklySalesReportJobsUseCase {
  return {
    processJob: jest.fn().mockResolvedValue("generated"),
  } as unknown as ProcessAiWeeklySalesReportJobsUseCase;
}
