import { ConfigService } from "@nestjs/config";
import type {
  CreateMeetingNoteTextDraftInput,
  MeetingNoteAiDraftProvider,
  MeetingNoteDraftContent,
  MeetingNoteDraftContext,
} from "@/modules/meeting-note/application/ports/meeting-note-ai-draft.provider";
import {
  MeetingNoteAiDraftFailedError,
  MeetingNoteAiDraftProviderUnavailableError,
} from "@/modules/meeting-note/domain/meeting-note.errors";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";
const OPENAI_PROVIDER = "openai";

// 역할 : OpenAiConfig OpenAI provider 호출에 필요한 설정 값을 정의합니다.
interface OpenAiConfig {
  readonly apiKey: string;
  readonly baseUrl: string;
  readonly draftModel: string;
}

// 역할 : OpenAiDraftJson OpenAI structured output의 회의록 초안 JSON schema를 정의합니다.
interface OpenAiDraftJson {
  readonly details: string;
  readonly nextPlan: string | null;
  readonly requiredAction: string | null;
}

// 역할 : OpenAiMeetingNoteAiDraftProvider OpenAI API로 회의록 AI 초안을 생성하는 infrastructure adapter입니다.
export class OpenAiMeetingNoteAiDraftProvider
  implements MeetingNoteAiDraftProvider
{
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger
  ) {}

  // 기능 : 회의 원문과 사용자가 선택한 맥락을 OpenAI Responses API에 전달해 회의록 본문 초안을 생성합니다.
  async createTextDraft(
    input: CreateMeetingNoteTextDraftInput
  ): Promise<MeetingNoteDraftContent> {
    // 1. Provider 설정이 준비되어 있는지 검증합니다.
    const config = this.getConfig();

    // 2. 사용자가 직접 선택한 엔티티 맥락과 원문을 prompt로 구성합니다.
    const responseBody = await this.postJson("/responses", {
      model: config.draftModel,
      instructions: this.createInstructions(),
      input: this.createTextInput(input.rawText, input.context),
      store: false,
      text: {
        format: {
          type: "json_schema",
          name: "meeting_note_draft",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              details: { type: "string" },
              nextPlan: { type: ["string", "null"] },
              requiredAction: { type: ["string", "null"] },
            },
            required: ["details", "nextPlan", "requiredAction"],
          },
        },
      },
    });

    // 3. Provider 응답에서 구조화 JSON을 추출하고 내부 DTO로 정규화합니다.
    return this.parseDraftResponse(responseBody);
  }

  // 기능 : OpenAI API 호출에 필요한 환경변수를 ConfigService에서 읽고 검증합니다.
  private getConfig(): OpenAiConfig {
    const apiKey = this.getRequiredConfig("OPENAI_API_KEY");
    const draftModel = this.getRequiredConfig("OPENAI_MEETING_NOTE_DRAFT_MODEL");
    const baseUrl =
      this.configService.get<string>("OPENAI_BASE_URL")?.trim() ||
      DEFAULT_OPENAI_BASE_URL;

    return {
      apiKey,
      baseUrl: baseUrl.replace(/\/+$/, ""),
      draftModel,
    };
  }

  // 기능 : 필수 provider 환경변수가 비어 있으면 설정 오류로 변환합니다.
  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key)?.trim();

    if (!value) {
      throw new MeetingNoteAiDraftProviderUnavailableError(`${key} is required`);
    }

    return value;
  }

  // 기능 : 회의록 초안 생성 모델이 지켜야 할 출력 규칙을 정의합니다.
  private createInstructions(): string {
    return [
      "You draft Korean B2B sales meeting notes.",
      "Do not select, invent, or modify company, contact, product, deal, or meeting datetime.",
      "Only generate details, nextPlan, and requiredAction from the supplied meeting text.",
      "If next plan or required action is not present, return null for that field.",
      "Do not include markdown, IDs, or unrelated metadata in the generated fields.",
    ].join("\n");
  }

  // 기능 : 회의 원문과 사용자가 선택한 엔티티 맥락을 Responses API input으로 구성합니다.
  private createTextInput(rawText: string, context: MeetingNoteDraftContext) {
    return [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: JSON.stringify({
              selectedContext: context,
              meetingText: rawText,
            }),
          },
        ],
      },
    ];
  }

  // 기능 : OpenAI JSON API에 요청을 보내고 응답 body를 unknown으로 반환합니다.
  private async postJson(path: string, body: unknown): Promise<unknown> {
    const config = this.getConfig();
    const response = await fetch(`${config.baseUrl}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      this.logProviderFailure("responses", response.status, response.statusText);
      throw new MeetingNoteAiDraftFailedError(
        "OpenAI meeting note draft request failed"
      );
    }

    try {
      return await response.json();
    } catch {
      throw new MeetingNoteAiDraftFailedError(
        "OpenAI meeting note draft response was not JSON"
      );
    }
  }

  // 기능 : Responses API 응답에서 JSON 문자열을 추출해 회의록 초안 필드로 검증합니다.
  private parseDraftResponse(responseBody: unknown): MeetingNoteDraftContent {
    const outputText = this.extractOutputText(responseBody);

    if (!outputText) {
      throw new MeetingNoteAiDraftFailedError(
        "OpenAI meeting note draft response was empty"
      );
    }

    const parsed = this.parseJson(outputText);

    if (!this.isDraftJson(parsed)) {
      throw new MeetingNoteAiDraftFailedError(
        "OpenAI meeting note draft response did not match schema"
      );
    }

    return parsed;
  }

  // 기능 : OpenAI 응답의 여러 text 위치 중 구조화 출력 문자열을 찾습니다.
  private extractOutputText(value: unknown): string | null {
    if (!this.isRecord(value)) {
      return null;
    }

    const directOutputText = this.readStringField(value, "output_text");

    if (directOutputText) {
      return directOutputText;
    }

    const output = value["output"];

    if (!Array.isArray(output)) {
      return null;
    }

    const textParts: string[] = [];

    for (const item of output) {
      this.collectOutputTextParts(item, textParts);
    }

    return textParts.length > 0 ? textParts.join("\n") : null;
  }

  // 기능 : Responses API output item 안의 output_text content를 수집합니다.
  private collectOutputTextParts(item: unknown, textParts: string[]): void {
    if (!this.isRecord(item)) {
      return;
    }

    const content = item["content"];

    if (!Array.isArray(content)) {
      return;
    }

    for (const contentItem of content) {
      if (!this.isRecord(contentItem)) {
        continue;
      }

      const text = this.readStringField(contentItem, "text");

      if (text) {
        textParts.push(text);
      }
    }
  }

  // 기능 : JSON 문자열을 unknown 값으로 파싱하고 실패 시 provider 오류로 변환합니다.
  private parseJson(value: string): unknown {
    try {
      return JSON.parse(value);
    } catch {
      throw new MeetingNoteAiDraftFailedError(
        "OpenAI meeting note draft response was not valid JSON"
      );
    }
  }

  // 기능 : OpenAI structured output이 회의록 초안 schema와 맞는지 검증합니다.
  private isDraftJson(value: unknown): value is OpenAiDraftJson {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      typeof value["details"] === "string" &&
      this.isNullableString(value["nextPlan"]) &&
      this.isNullableString(value["requiredAction"])
    );
  }

  // 기능 : unknown 값이 string 또는 null인지 확인합니다.
  private isNullableString(value: unknown): value is string | null {
    return value === null || typeof value === "string";
  }

  // 기능 : unknown 값이 key 조회 가능한 object인지 확인합니다.
  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  // 기능 : record에서 문자열 필드를 읽고 없으면 null을 반환합니다.
  private readStringField(
    value: Record<string, unknown>,
    fieldName: string
  ): string | null {
    const fieldValue = value[fieldName];

    return typeof fieldValue === "string" ? fieldValue : null;
  }

  // 기능 : 회의 본문 없이 provider 실패 추적에 필요한 안전한 context만 남깁니다.
  private logProviderFailure(
    operation: string,
    statusCode: number,
    statusText: string
  ): void {
    this.logger.error(
      JSON.stringify({
        event: "provider.openai.meetingNoteDraft.failed",
        provider: OPENAI_PROVIDER,
        operation,
        statusCode,
        retryable: statusCode >= 500 || statusCode === 429,
      }),
      statusText,
      "OpenAiMeetingNoteAiDraftProvider"
    );
  }
}
