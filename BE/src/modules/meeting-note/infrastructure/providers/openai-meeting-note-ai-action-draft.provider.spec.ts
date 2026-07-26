import { ConfigService } from "@nestjs/config";
import {
  MeetingNoteFollowUpChannelValue,
  MeetingNoteFollowUpToneValue,
  MeetingNoteNextActionConfidenceValue,
  type MeetingNoteAiActionContext,
} from "@/modules/meeting-note/application/ports/meeting-note-ai-action-draft.provider";
import {
  MEETING_NOTE_AI_DRAFT_FAILED_SAFE_MESSAGE,
  MeetingNoteAiDraftProviderUnavailableError,
} from "@/modules/meeting-note/domain/meeting-note.errors";
import type { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { OpenAiMeetingNoteAiActionDraftProvider } from "./openai-meeting-note-ai-action-draft.provider";

describe("OpenAiMeetingNoteAiActionDraftProvider", () => {
  let fetchMock: jest.SpiedFunction<typeof fetch>;

  beforeEach(() => {
    fetchMock = jest.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  it("OpenAI 응답에서 다음 행동 후보와 provider call metadata를 추출한다", async () => {
    const provider = createProvider();
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        200,
        {
          id: "resp-body-1",
          output_text: JSON.stringify({
            items: [
              {
                title: "가격표 보내기",
                memo: "고객 요청 사항입니다.",
                recommendedDueDate: "2026-07-28",
                dealId: "deal-1",
                confidence: "HIGH",
                reason: "requiredAction에 포함되어 있습니다.",
              },
            ],
          }),
          usage: {
            input_tokens: 90,
            output_tokens: 30,
            total_tokens: 120,
          },
        },
        { "x-request-id": "next-action-req-1" }
      )
    );

    const result = await provider.createNextActionDraft({
      context: createContext(),
      targetDealId: "deal-1",
      maxCandidates: 3,
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
      items: [
        {
          title: "가격표 보내기",
          memo: "고객 요청 사항입니다.",
          recommendedDueDate: "2026-07-28",
          dealId: "deal-1",
          confidence: MeetingNoteNextActionConfidenceValue.HIGH,
          reason: "requiredAction에 포함되어 있습니다.",
        },
      ],
      providerCall: {
        requestId: "next-action-req-1",
        inputTokenCount: 90,
        outputTokenCount: 30,
        totalTokenCount: 120,
        estimatedCostAmount: null,
        costCurrency: "USD",
      },
    });
  });

  it("OpenAI 응답에서 follow-up 문안과 provider call metadata를 추출한다", async () => {
    const provider = createProvider();
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        200,
        {
          output_text: JSON.stringify({
            subject: "오늘 미팅 내용 정리드립니다",
            body: "오늘 논의한 내용을 정리드립니다.",
            copyableText: "오늘 논의한 내용을 정리드립니다.",
          }),
        },
        { "openai-request-id": "follow-up-req-1" }
      )
    );

    const result = await provider.createFollowUpDraft({
      context: createContext(),
      channel: MeetingNoteFollowUpChannelValue.EMAIL,
      recipientContactId: "contact-1",
      dealId: "deal-1",
      tone: MeetingNoteFollowUpToneValue.POLITE,
      language: "ko",
    });

    expect(result).toEqual({
      draft: {
        subject: "오늘 미팅 내용 정리드립니다",
        body: "오늘 논의한 내용을 정리드립니다.",
        copyableText: "오늘 논의한 내용을 정리드립니다.",
      },
      providerCall: {
        requestId: "follow-up-req-1",
        inputTokenCount: null,
        outputTokenCount: null,
        totalTokenCount: null,
        estimatedCostAmount: null,
        costCurrency: "USD",
      },
    });
  });

  it("429 실패를 retryable safe provider 오류로 변환한다", async () => {
    const provider = createProvider();
    fetchMock.mockResolvedValueOnce(jsonResponse(429, { error: "quota secret" }));

    await expect(
      provider.createNextActionDraft({
        context: createContext(),
        targetDealId: "deal-1",
        maxCandidates: 3,
      })
    ).rejects.toMatchObject({
      code: "MeetingNoteAiDraftFailed",
      message: MEETING_NOTE_AI_DRAFT_FAILED_SAFE_MESSAGE,
      details: { retryable: true },
    });
  });

  it("잘못된 structured output은 safe provider 오류로 실패한다", async () => {
    const provider = createProvider();
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        output_text: JSON.stringify({ items: [{ memo: "title 없음" }] }),
      })
    );

    await expect(
      provider.createNextActionDraft({
        context: createContext(),
        targetDealId: "deal-1",
        maxCandidates: 3,
      })
    ).rejects.toMatchObject({
      code: "MeetingNoteAiDraftFailed",
      message: MEETING_NOTE_AI_DRAFT_FAILED_SAFE_MESSAGE,
    });
  });

  it("OpenAI API key가 없으면 provider unavailable safe 오류로 실패한다", async () => {
    const provider = createProvider({});

    await expect(
      provider.createFollowUpDraft({
        context: createContext(),
        channel: MeetingNoteFollowUpChannelValue.SMS,
        recipientContactId: "contact-1",
        dealId: "deal-1",
        tone: MeetingNoteFollowUpToneValue.POLITE,
        language: "ko",
      })
    ).rejects.toBeInstanceOf(MeetingNoteAiDraftProviderUnavailableError);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

// 기능 : 테스트용 OpenAI 회의록 후속 작업 provider를 생성합니다.
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

  return new OpenAiMeetingNoteAiActionDraftProvider(
    configService,
    createLogger()
  );
}

// 기능 : 테스트용 OpenAI JSON fetch response를 생성합니다.
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

// 기능 : 테스트용 회의록 AI 후속 작업 provider context를 생성합니다.
function createContext(): MeetingNoteAiActionContext {
  return {
    meetingNoteId: "meeting-note-1",
    title: "Acme 미팅",
    meetingAt: "2026-07-26T05:00:00.000Z",
    details: "고객이 가격표와 보안 자료를 요청했다.",
    nextPlan: "자료 전달 후 다음 미팅 일정을 잡는다.",
    requiredAction: "가격표와 보안 자료 보내기",
    companies: [
      {
        companyId: "company-1",
        name: "Acme",
        field: "Software",
        region: "Global",
      },
    ],
    contacts: [
      {
        contactId: "contact-1",
        companyId: "company-1",
        name: "Kim",
        companyName: "Acme",
        department: "Sales",
        jobGrade: "Manager",
      },
    ],
    products: [],
    deals: [
      {
        dealId: "deal-1",
        name: "Acme Renewal",
        status: "NEGOTIATION",
        cost: 5000,
        expectedEndDate: "2026-08-30",
      },
    ],
  };
}

// 기능 : 테스트용 AppLogger mock을 생성합니다.
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
