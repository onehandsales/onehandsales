import {
  AiWeeklySalesReportProviderFailure,
  type AiWeeklySalesReportOutput,
  type AiWeeklySalesReportProvider,
} from "@/modules/sales-report/application/ports/ai-weekly-sales-report.provider";
import type {
  AiJobRecord,
  AiProviderCallLogRecord,
  AiWeeklySalesReportRecord,
  AiWeeklySalesReportRepository,
} from "@/modules/sales-report/application/ports/ai-weekly-sales-report.repository";
import type { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { ProcessAiWeeklySalesReportJobsUseCase } from "./process-ai-weekly-sales-report-jobs.use-case";

const USER_ID = "7d0b03d4-93fb-47d1-85ad-7f39c15eb4da";
const REPORT_ID = "9d1b57bf-6746-4b2f-9084-0327e03d9e8a";
const JOB_ID = "fa8e6d9e-820e-43be-907e-c69f4115227f";
const CALL_LOG_ID = "bd8a1663-bbd6-4b42-a676-0919b1afbe7c";
const DEAL_ID = "8d7603da-33d2-4c88-8f7d-2daafddfbc13";

describe("ProcessAiWeeklySalesReportJobsUseCase", () => {
  it("stores successful provider output, usage log, and suggestions", async () => {
    const repository = createRepository();
    const provider = createProvider({
      generateReport: jest.fn().mockResolvedValue({
        provider: "deterministic",
        model: "ai-weekly-sales-report-dev-v1",
        requestId: "req-1",
        output: createOutput(),
        usage: {
          inputTokenCount: 10,
          outputTokenCount: 20,
          totalTokenCount: 30,
          estimatedCostAmount: "0",
          costCurrency: "USD",
        },
      }),
    });
    const useCase = new ProcessAiWeeklySalesReportJobsUseCase(
      repository,
      provider,
      createLogger()
    );

    await expect(useCase.processJob(JOB_ID)).resolves.toBe("generated");

    expect(repository.completeReportGeneration).toHaveBeenCalledWith(
      expect.objectContaining({
        reportId: REPORT_ID,
        jobId: JOB_ID,
        providerCallLogId: CALL_LOG_ID,
        provider: "deterministic",
        model: "ai-weekly-sales-report-dev-v1",
        providerCall: expect.objectContaining({
          inputTokenCount: 10,
          outputTokenCount: 20,
          totalTokenCount: 30,
        }),
        suggestions: expect.arrayContaining([
          expect.objectContaining({
            type: "RISK",
            targetId: DEAL_ID,
            suggestionKey: "risk-risk-1",
          }),
          expect.objectContaining({
            type: "FOLLOW_UP",
            payloadJson: expect.objectContaining({
              emailDraft: "Email draft",
            }),
          }),
        ]),
      })
    );
    expect(repository.failReportGeneration).not.toHaveBeenCalled();
  });

  it("stores failed report version with safe provider error", async () => {
    const repository = createRepository();
    const provider = createProvider({
      generateReport: jest.fn().mockRejectedValue(
        new AiWeeklySalesReportProviderFailure(
          "AI_PROVIDER_TIMEOUT",
          "AI provider timed out",
          true
        )
      ),
    });
    const useCase = new ProcessAiWeeklySalesReportJobsUseCase(
      repository,
      provider,
      createLogger()
    );

    await expect(useCase.processJob(JOB_ID)).resolves.toBe("failed");

    expect(repository.failReportGeneration).toHaveBeenCalledWith(
      expect.objectContaining({
        reportId: REPORT_ID,
        jobId: JOB_ID,
        providerCallLogId: CALL_LOG_ID,
        safeErrorCode: "AI_PROVIDER_TIMEOUT",
        safeErrorMessage: "AI provider timed out",
        retryable: true,
      })
    );
    expect(repository.completeReportGeneration).not.toHaveBeenCalled();
  });
});

function createRepository(): AiWeeklySalesReportRepository {
  return {
    runInTransaction: jest.fn(),
    findUserPreferences: jest.fn(),
    findGenerationRequestByIdempotencyKey: jest.fn(),
    findGeneratingReport: jest.fn(),
    createGeneratingReportWithJob: jest.fn(),
    listReportsForWeek: jest.fn(),
    findReportById: jest.fn(),
    listMeetingNotesForSnapshot: jest.fn(),
    listDealsForSnapshot: jest.fn(),
    listPendingWeeklyReportJobs: jest.fn().mockResolvedValue([createJob()]),
    startWeeklyReportJob: jest.fn().mockResolvedValue({
      job: createJob(),
      report: createReport(),
    }),
    createProviderCallLog: jest.fn().mockResolvedValue(createProviderCallLog()),
    completeReportGeneration: jest.fn().mockResolvedValue(undefined),
    failReportGeneration: jest.fn().mockResolvedValue(undefined),
  } as unknown as AiWeeklySalesReportRepository;
}

function createProvider(
  overrides: Partial<AiWeeklySalesReportProvider>
): AiWeeklySalesReportProvider {
  return {
    getMetadata: jest.fn().mockReturnValue({
      provider: "deterministic",
      model: "ai-weekly-sales-report-dev-v1",
    }),
    generateReport: jest.fn(),
    ...overrides,
  };
}

function createOutput(): AiWeeklySalesReportOutput {
  return {
    executiveSummary: {
      headline: "Weekly sales report",
      narrative: "Narrative",
      wins: ["Win"],
      concerns: ["Concern"],
    },
    pipelineSummary: {
      narrative: "Pipeline narrative",
      totalDealCost: 1000,
      statusCounts: [{ status: "NEGOTIATION", count: 1 }],
    },
    riskSignals: [
      {
        key: "risk-1",
        priority: "HIGH",
        title: "Risk",
        body: "Risk body",
        targetType: "DEAL",
        targetId: DEAL_ID,
        targetPath: `/deals/${DEAL_ID}`,
        targetLabel: "Renewal deal",
        payload: {},
      },
    ],
    nextWeekActions: [],
    followUpDrafts: [
      {
        key: "follow-up-1",
        priority: "MEDIUM",
        title: "Follow up",
        body: "Follow up body",
        targetType: "MEETING_NOTE",
        targetId: null,
        targetPath: null,
        targetLabel: "Meeting note",
        payload: {
          emailDraft: "Email draft",
        },
      },
    ],
    dataCleanupSuggestions: [],
    dataCoverage: {
      scheduleCount: 1,
      dealCount: 1,
      meetingNoteCount: 1,
      linkedDealCount: 1,
      missingSignals: [],
    },
  };
}

function createReport(): AiWeeklySalesReportRecord {
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
    startedAt: new Date("2026-07-20T00:00:00.000Z"),
    generatedAt: null,
    failedAt: null,
    createdAt: new Date("2026-07-20T00:00:00.000Z"),
    updatedAt: new Date("2026-07-20T00:00:00.000Z"),
  };
}

function createJob(): AiJobRecord {
  return {
    id: JOB_ID,
    userId: USER_ID,
    operation: "WEEKLY_SALES_REPORT",
    status: "RUNNING",
    targetType: "AI_WEEKLY_SALES_REPORT",
    targetId: REPORT_ID,
    idempotencyKey: null,
    attemptCount: 1,
    maxAttemptCount: 1,
    safeErrorCode: null,
    safeErrorMessage: null,
    requestedAt: new Date("2026-07-20T00:00:00.000Z"),
    startedAt: new Date("2026-07-20T00:00:00.000Z"),
    completedAt: null,
    failedAt: null,
    metadataJson: {},
    createdAt: new Date("2026-07-20T00:00:00.000Z"),
    updatedAt: new Date("2026-07-20T00:00:00.000Z"),
  };
}

function createProviderCallLog(): AiProviderCallLogRecord {
  return {
    id: CALL_LOG_ID,
    userId: USER_ID,
    status: "PENDING",
    reportId: REPORT_ID,
    jobId: JOB_ID,
    provider: "deterministic",
    model: "ai-weekly-sales-report-dev-v1",
    requestId: null,
    latencyMs: null,
    inputTokenCount: null,
    outputTokenCount: null,
    totalTokenCount: null,
    estimatedCostAmount: null,
    costCurrency: "USD",
    safeErrorCode: null,
    safeErrorMessage: null,
    retryable: false,
    retryCount: 0,
    startedAt: new Date("2026-07-20T00:00:00.000Z"),
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
