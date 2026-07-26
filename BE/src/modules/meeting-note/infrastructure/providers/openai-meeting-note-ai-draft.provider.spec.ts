import { ConfigService } from "@nestjs/config";
import {
  MEETING_NOTE_AI_DRAFT_FAILED_SAFE_MESSAGE,
  MeetingNoteAiDraftFailedError,
  MeetingNoteAiDraftProviderUnavailableError,
} from "@/modules/meeting-note/domain/meeting-note.errors";
import type { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { OpenAiMeetingNoteAiDraftProvider } from "./openai-meeting-note-ai-draft.provider";

describe("OpenAiMeetingNoteAiDraftProvider", () => {
  let fetchMock: jest.SpiedFunction<typeof fetch>;

  beforeEach(() => {
    fetchMock = jest.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  it("OpenAI 응답에서 초안과 provider call metadata를 추출한다", async () => {
    const provider = createProvider();
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        200,
        {
          id: "resp-body-1",
          output_text: JSON.stringify({
            details: "회의 내용 초안",
            nextPlan: "다음 계획",
            requiredAction: null,
          }),
          usage: {
            input_tokens: 100,
            output_tokens: 40,
            total_tokens: 140,
          },
        },
        { "x-request-id": "req-header-1" }
      )
    );

    const result = await provider.createTextDraft({
      rawText: "원문 회의 내용",
      context: {
        meetingLocalDateTime: "2026-06-15T09:30:00",
        companies: [
          {
            id: "company-1",
            name: "Acme",
            field: "Software",
            region: "Global",
          },
        ],
        contacts: [
          {
            id: "contact-1",
            companyId: "company-1",
            name: "Kim",
            email: "kim@example.com",
            mobile: "010-0000-0000",
            companyName: "Acme",
            department: "Sales",
            jobGrade: "Manager",
          },
        ],
        products: [],
        deals: [],
      },
    });
    const requestUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    const requestBody = JSON.parse(
      String(fetchMock.mock.calls[0]?.[1]?.body)
    ) as Record<string, unknown>;

    expect(requestUrl.pathname).toBe("/v1/responses");
    expect(requestBody).toEqual(
      expect.objectContaining({ model: "gpt-test", store: false })
    );
    expect(JSON.stringify(requestBody)).not.toContain("kim@example.com");
    expect(JSON.stringify(requestBody)).not.toContain("010-0000-0000");
    expect(provider.getMetadata()).toEqual({
      provider: "openai",
      model: "gpt-test",
    });
    expect(result).toEqual({
      draft: {
        details: "회의 내용 초안",
        nextPlan: "다음 계획",
        requiredAction: null,
      },
      providerCall: {
        requestId: "req-header-1",
        inputTokenCount: 100,
        outputTokenCount: 40,
        totalTokenCount: 140,
        estimatedCostAmount: null,
        costCurrency: "USD",
      },
    });
  });

  it("429 실패를 retryable safe provider 오류로 변환한다", async () => {
    const provider = createProvider();
    fetchMock.mockResolvedValueOnce(jsonResponse(429, { error: "quota secret" }));

    await expect(
      provider.createTextDraft({
        rawText: "원문 회의 내용",
        context: {
          meetingLocalDateTime: "2026-06-15T09:30:00",
          companies: [],
          contacts: [],
          products: [],
          deals: [],
        },
      })
    ).rejects.toMatchObject({
      code: "MeetingNoteAiDraftFailed",
      message: MEETING_NOTE_AI_DRAFT_FAILED_SAFE_MESSAGE,
      details: { retryable: true },
    } satisfies Partial<MeetingNoteAiDraftFailedError>);
  });

  it("OpenAI API key가 없으면 provider unavailable safe 오류로 실패한다", async () => {
    const provider = createProvider({});

    await expect(
      provider.createTextDraft({
        rawText: "원문 회의 내용",
        context: {
          meetingLocalDateTime: "2026-06-15T09:30:00",
          companies: [],
          contacts: [],
          products: [],
          deals: [],
        },
      })
    ).rejects.toBeInstanceOf(MeetingNoteAiDraftProviderUnavailableError);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

function createProvider(
  env: Record<string, string | undefined> = {
    OPENAI_API_KEY: "test-api-key",
    OPENAI_BASE_URL: "https://api.openai.test/v1",
    OPENAI_MEETING_NOTE_DRAFT_MODEL: "gpt-test",
  }
) {
  const configService = {
    get: jest.fn((key: string) => env[key]),
  } as unknown as ConfigService;

  return new OpenAiMeetingNoteAiDraftProvider(configService, createLogger());
}

function jsonResponse(
  status: number,
  body: Record<string, unknown>,
  headers: Record<string, string> = {}
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      ...headers,
    },
  });
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
