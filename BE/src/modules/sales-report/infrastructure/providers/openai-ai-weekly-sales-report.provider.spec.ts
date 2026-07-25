import { ConfigService } from "@nestjs/config";
import { AiWeeklySalesReportProviderFailure } from "@/modules/sales-report/application/ports/ai-weekly-sales-report.provider";
import type { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { OpenAiWeeklySalesReportProvider } from "./openai-ai-weekly-sales-report.provider";

const DEAL_ID = "8d7603da-33d2-4c88-8f7d-2daafddfbc13";
const SCHEDULE_ID = "7757930f-7cff-494b-af2c-e2c98354e6fe";
const MEETING_NOTE_ID = "3b1ad57f-f1f4-42a8-a7c9-65de84aab132";

describe("OpenAiWeeklySalesReportProvider", () => {
  let fetchMock: jest.SpiedFunction<typeof fetch>;

  beforeEach(() => {
    fetchMock = jest.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  it("calls OpenAI and normalizes metrics and targets from the snapshot", async () => {
    const provider = createProvider();
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        id: "resp-1",
        output_text: JSON.stringify(createOpenAiOutput()),
        usage: {
          input_tokens: 100,
          output_tokens: 50,
          total_tokens: 150,
        },
      })
    );

    const result = await provider.generateReport({
      reportId: "report-1",
      userId: "user-1",
      weekStart: "2026-07-20",
      weekEnd: "2026-07-26",
      timeZone: "Asia/Seoul",
      locale: "ko-KR",
      inputSnapshot: createSnapshot(),
    });
    const requestUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    const requestBody = JSON.parse(
      String(fetchMock.mock.calls[0]?.[1]?.body)
    ) as Record<string, unknown>;

    expect(requestUrl.pathname).toBe("/v1/responses");
    expect(requestBody).toEqual(
      expect.objectContaining({ model: "gpt-test", store: true })
    );
    expect(result.provider).toBe("openai");
    expect(result.model).toBe("gpt-test");
    expect(result.requestId).toBe("resp-1");
    expect(result.usage).toEqual(
      expect.objectContaining({
        inputTokenCount: 100,
        outputTokenCount: 50,
        totalTokenCount: 150,
      })
    );
    expect(result.output.pipelineSummary.totalDealCost).toBe(2000);
    expect(result.output.pipelineSummary.statusCounts).toEqual([
      { status: "NEGOTIATION", count: 1 },
    ]);
    expect(result.output.dataCoverage).toEqual({
      scheduleCount: 1,
      dealCount: 1,
      meetingNoteCount: 1,
      linkedDealCount: 1,
      missingSignals: ["DEAL_NEXT_ACTION_MISSING"],
    });
    expect(result.output.riskSignals[0]).toEqual(
      expect.objectContaining({
        targetType: "DEAL",
        targetId: DEAL_ID,
        targetPath: `/deals/${DEAL_ID}`,
        targetLabel: "Renewal deal",
      })
    );
    expect(result.output.nextWeekActions[0]).toEqual(
      expect.objectContaining({
        targetType: null,
        targetId: null,
        targetPath: null,
      })
    );
    expect(result.output.followUpDrafts[0]?.payload).toEqual({
      emailDraft: "안녕하세요. 회의 후속으로 다음 단계를 공유드립니다.",
      smsDraft: "회의 후속으로 다음 단계 확인 부탁드립니다.",
    });
  });

  it("fails safely when OPENAI_API_KEY is missing", async () => {
    const provider = createProvider({});

    await expect(
      provider.generateReport({
        reportId: "report-1",
        userId: "user-1",
        weekStart: "2026-07-20",
        weekEnd: "2026-07-26",
        timeZone: "Asia/Seoul",
        locale: "ko-KR",
        inputSnapshot: createSnapshot(),
      })
    ).rejects.toEqual(
      new AiWeeklySalesReportProviderFailure(
        "AI_PROVIDER_UNAVAILABLE",
        "OPENAI_API_KEY is required",
        false
      )
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

function createProvider(
  env: Record<string, string | undefined> = {
    OPENAI_API_KEY: "test-api-key",
    OPENAI_BASE_URL: "https://api.openai.test/v1",
    OPENAI_AI_WEEKLY_SALES_REPORT_MODEL: "gpt-test",
  }
) {
  const configService = {
    get: jest.fn((key: string) => env[key]),
  } as unknown as ConfigService;

  return new OpenAiWeeklySalesReportProvider(configService, createLogger());
}

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });
}

function createSnapshot(): Record<string, unknown> {
  return {
    counts: {
      schedules: 1,
      deals: 1,
      meetingNotes: 1,
      linkedDeals: 1,
    },
    schedules: [
      {
        id: SCHEDULE_ID,
        scheduleTitle: "Customer meeting",
        deals: [
          {
            id: DEAL_ID,
            dealName: "Renewal deal",
          },
        ],
      },
    ],
    deals: [
      {
        id: DEAL_ID,
        dealName: "Renewal deal",
        dealStatus: "NEGOTIATION",
        dealCost: 2000,
        nextFollowingActions: [],
      },
    ],
    meetingNotes: [
      {
        id: MEETING_NOTE_ID,
        title: "Renewal meeting note",
        deals: [
          {
            dealId: DEAL_ID,
            dealName: "Renewal deal",
          },
        ],
      },
    ],
    dataQuality: {
      missingSignals: ["DEAL_NEXT_ACTION_MISSING"],
    },
  };
}

function createOpenAiOutput(): Record<string, unknown> {
  return {
    executiveSummary: {
      headline: "이번 주 영업 요약",
      narrative: "갱신 딜의 다음 액션을 명확히 해야 합니다.",
      wins: ["고객 미팅이 진행되었습니다."],
      concerns: ["다음 액션이 비어 있습니다."],
    },
    pipelineSummary: {
      narrative: "협상 단계 딜의 후속 일정이 필요합니다.",
      totalDealCost: 999999,
      statusCounts: [{ status: "WRONG", count: 99 }],
    },
    riskSignals: [
      {
        key: "risk-renewal",
        priority: "HIGH",
        title: "다음 액션 누락",
        body: "갱신 딜의 다음 액션을 정해야 합니다.",
        reason: "스냅샷에 미완료 후속 액션이 없습니다.",
        targetType: "DEAL",
        targetId: DEAL_ID,
        targetPath: "https://example.com/not-allowed",
        targetLabel: "Wrong label",
        payload: {
          emailDraft: null,
          smsDraft: null,
        },
      },
    ],
    nextWeekActions: [
      {
        key: "next-action-invalid-target",
        priority: "MEDIUM",
        title: "소유자 확인",
        body: "후속 일정 담당자를 확인합니다.",
        reason: null,
        targetType: "DEAL",
        targetId: "not-a-real-id",
        targetPath: "/deals/not-a-real-id",
        targetLabel: "Invalid",
        payload: {
          emailDraft: null,
          smsDraft: null,
        },
      },
    ],
    followUpDrafts: [
      {
        key: "follow-up-meeting",
        priority: "MEDIUM",
        title: "회의 후속 연락",
        body: "회의 참석자에게 다음 단계를 공유합니다.",
        reason: "회의록에 후속 계획이 필요합니다.",
        targetType: "MEETING_NOTE",
        targetId: MEETING_NOTE_ID,
        targetPath: `/meeting-notes/${MEETING_NOTE_ID}`,
        targetLabel: "Renewal meeting note",
        payload: {
          emailDraft: "안녕하세요. 회의 후속으로 다음 단계를 공유드립니다.",
          smsDraft: "회의 후속으로 다음 단계 확인 부탁드립니다.",
        },
      },
    ],
    dataCleanupSuggestions: [],
    dataCoverage: {
      scheduleCount: 99,
      dealCount: 99,
      meetingNoteCount: 99,
      linkedDealCount: 99,
      missingSignals: ["WRONG"],
    },
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
