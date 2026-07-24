import type { ScheduleRepository } from "@/modules/schedule/application/ports/schedule.repository";
import {
  type AiJobRecord,
  type AiWeeklySalesReportRecord,
  type AiWeeklySalesReportRepository,
  type CreateGeneratingReportInput,
} from "@/modules/sales-report/application/ports/ai-weekly-sales-report.repository";
import { AiWeeklySalesReportAlreadyGeneratingError } from "@/modules/sales-report/domain/ai-weekly-sales-report.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { AiWeeklySalesReportApplicationService } from "./ai-weekly-sales-report-application.service";

const USER_ID = "7d0b03d4-93fb-47d1-85ad-7f39c15eb4da";
const REPORT_ID = "9d1b57bf-6746-4b2f-9084-0327e03d9e8a";
const JOB_ID = "fa8e6d9e-820e-43be-907e-c69f4115227f";
const DEAL_ID = "8d7603da-33d2-4c88-8f7d-2daafddfbc13";

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
    const service = new AiWeeklySalesReportApplicationService(
      repository,
      createScheduleRepository(),
      createLogger()
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
    expect(response.job.status).toBe("PENDING");
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
    const meetingNotes = createdInputs[0]?.inputSnapshotJson
      .meetingNotes as Record<string, unknown>[];
    expect(meetingNotes[0]).toMatchObject({
      details: "Discussed renewal risk and next plan.",
      requiredAction: "Send renewal proposal",
    });
  });

  it("blocks duplicate generation for the same user, week, and timezone", async () => {
    const repository = createRepository({
      findGeneratingReport: jest.fn().mockResolvedValue(createReport()),
    });
    const service = new AiWeeklySalesReportApplicationService(
      repository,
      createScheduleRepository(),
      createLogger()
    );

    await expect(
      service.requestGeneration(CURRENT_USER, {
        weekStart: "2026-07-20",
        timeZone: "Asia/Seoul",
      })
    ).rejects.toBeInstanceOf(AiWeeklySalesReportAlreadyGeneratingError);
  });

  it("returns snapshot summary without raw meeting note body", async () => {
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
      createScheduleRepository(),
      createLogger()
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
  });
});

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

function createScheduleRepository(): ScheduleRepository {
  return {
    listSchedulesForWeeklyReport: jest.fn().mockResolvedValue([
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
            expectedEndDate: new Date("2026-07-24T00:00:00.000Z"),
            companies: [],
            contacts: [],
            nextFollowingAction: null,
          },
        ],
      },
    ]),
  } as unknown as ScheduleRepository;
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
