import { Buffer } from "node:buffer";
import { ConfigService } from "@nestjs/config";
import {
  MEETING_NOTE_AI_DRAFT_FAILED_SAFE_MESSAGE,
  MeetingNoteAiDraftProviderUnavailableError,
} from "@/modules/meeting-note/domain/meeting-note.errors";
import type { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { OpenAiMeetingNoteSttProvider } from "./openai-meeting-note-stt.provider";

describe("OpenAiMeetingNoteSttProvider", () => {
  let fetchMock: jest.SpiedFunction<typeof fetch>;

  beforeEach(() => {
    fetchMock = jest.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  it("OpenAI transcription 응답에서 transcript와 provider metadata를 추출한다", async () => {
    const provider = createProvider();
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, { text: "  녹취 transcript  " }, {
        "x-request-id": "stt-req-1",
      })
    );

    const result = await provider.transcribe({
      audioFile: {
        buffer: Buffer.from("audio"),
        fileName: "meeting.webm",
        mimeType: "audio/webm",
        size: 5,
      },
    });
    const requestUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    const requestBody = fetchMock.mock.calls[0]?.[1]?.body;

    expect(requestUrl.pathname).toBe("/v1/audio/transcriptions");
    expect(requestBody).toBeInstanceOf(FormData);
    expect(provider.getMetadata()).toEqual({
      provider: "openai",
      model: "gpt-4o-mini-transcribe",
    });
    expect(result).toEqual({
      transcript: "녹취 transcript",
      providerCall: {
        requestId: "stt-req-1",
        inputTokenCount: null,
        outputTokenCount: null,
        totalTokenCount: null,
        estimatedCostAmount: null,
        costCurrency: "USD",
      },
    });
  });

  it("OpenAI STT 실패를 retryable safe provider 오류로 변환한다", async () => {
    const provider = createProvider();
    fetchMock.mockResolvedValueOnce(jsonResponse(503, { error: "provider down" }));

    await expect(
      provider.transcribe({
        audioFile: {
          buffer: Buffer.from("audio"),
          fileName: "meeting.webm",
          mimeType: "audio/webm",
          size: 5,
        },
      })
    ).rejects.toMatchObject({
      code: "MeetingNoteAiDraftFailed",
      message: MEETING_NOTE_AI_DRAFT_FAILED_SAFE_MESSAGE,
      details: { retryable: true },
    });
  });

  it("OpenAI API key가 없으면 provider unavailable safe 오류로 실패한다", async () => {
    const provider = createProvider({});

    await expect(
      provider.transcribe({
        audioFile: {
          buffer: Buffer.from("audio"),
          fileName: "meeting.webm",
          mimeType: "audio/webm",
          size: 5,
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
    OPENAI_MEETING_NOTE_STT_MODEL: "gpt-4o-mini-transcribe",
  }
) {
  const configService = {
    get: jest.fn((key: string) => env[key]),
  } as unknown as ConfigService;

  return new OpenAiMeetingNoteSttProvider(configService, createLogger());
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
