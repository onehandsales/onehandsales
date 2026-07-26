import { ConfigService } from "@nestjs/config";
import {
  MeetingNoteFollowUpChannelValue,
  MeetingNoteNextActionConfidenceValue,
  type CreateMeetingNoteFollowUpDraftInput,
  type CreateMeetingNoteNextActionDraftInput,
  type MeetingNoteAiActionDraftProvider,
  type MeetingNoteFollowUpDraftContent,
  type MeetingNoteFollowUpDraftProviderResult,
  type MeetingNoteNextActionDraftCandidate,
  type MeetingNoteNextActionDraftProviderResult,
} from "@/modules/meeting-note/application/ports/meeting-note-ai-action-draft.provider";
import {
  MeetingNoteAiDraftFailedError,
  MeetingNoteAiDraftProviderUnavailableError,
} from "@/modules/meeting-note/domain/meeting-note.errors";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";
const OPENAI_PROVIDER = "openai";
const COST_CURRENCY = "USD";
const UNKNOWN_MODEL = "unknown";

// 역할 : OpenAiActionDraftConfig OpenAI 후속 작업 provider 호출 설정을 정의합니다.
interface OpenAiActionDraftConfig {
  readonly apiKey: string;
  readonly baseUrl: string;
  readonly model: string;
}

// 역할 : OpenAiJsonResponse OpenAI JSON body와 request id를 함께 표현합니다.
interface OpenAiJsonResponse {
  readonly body: unknown;
  readonly requestId: string | null;
}

// 역할 : OpenAiNextActionDraftJson OpenAI 다음 행동 후보 structured output을 정의합니다.
interface OpenAiNextActionDraftJson {
  readonly items: readonly MeetingNoteNextActionDraftCandidate[];
}

// 역할 : OpenAiMeetingNoteAiActionDraftProvider 저장된 회의록 기반 AI 후속 작업 OpenAI adapter입니다.
export class OpenAiMeetingNoteAiActionDraftProvider
  implements MeetingNoteAiActionDraftProvider
{
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger
  ) {}

  // 기능 : provider call log에 기록할 OpenAI 식별 정보를 반환합니다.
  getMetadata() {
    return {
      provider: OPENAI_PROVIDER,
      model: this.getActionModel(),
    };
  }

  // 기능 : 저장된 회의록 snapshot으로 다음 행동 후보를 생성합니다.
  async createNextActionDraft(
    input: CreateMeetingNoteNextActionDraftInput
  ): Promise<MeetingNoteNextActionDraftProviderResult> {
    // 1. Provider 설정이 준비되어 있는지 검증합니다.
    const config = this.getConfig();

    // 2. 회의록 본문과 redacted linked record 맥락을 구조화 출력 요청으로 전달합니다.
    const response = await this.postJson(config, "/responses", {
      model: config.model,
      instructions: this.createNextActionInstructions(),
      input: this.createNextActionInput(input),
      store: false,
      text: {
        format: {
          type: "json_schema",
          name: "meeting_note_next_action_draft",
          strict: true,
          schema: this.createNextActionSchema(input.maxCandidates),
        },
      },
    });

    // 3. Provider 응답에서 후보 목록과 사용량 metadata를 추출합니다.
    return {
      items: this.parseNextActionResponse(response.body).items,
      providerCall: {
        requestId: response.requestId ?? this.extractRequestId(response.body),
        ...this.parseUsage(response.body),
      },
    };
  }

  // 기능 : 저장된 회의록 snapshot으로 고객 follow-up 문안 초안을 생성합니다.
  async createFollowUpDraft(
    input: CreateMeetingNoteFollowUpDraftInput
  ): Promise<MeetingNoteFollowUpDraftProviderResult> {
    // 1. Provider 설정이 준비되어 있는지 검증합니다.
    const config = this.getConfig();

    // 2. 채널과 redacted 회의록 맥락을 구조화 출력 요청으로 전달합니다.
    const response = await this.postJson(config, "/responses", {
      model: config.model,
      instructions: this.createFollowUpInstructions(input.channel),
      input: this.createFollowUpInput(input),
      store: false,
      text: {
        format: {
          type: "json_schema",
          name: "meeting_note_follow_up_draft",
          strict: true,
          schema: this.createFollowUpSchema(),
        },
      },
    });

    // 3. Provider 응답에서 문안과 사용량 metadata를 추출합니다.
    return {
      draft: this.parseFollowUpResponse(response.body),
      providerCall: {
        requestId: response.requestId ?? this.extractRequestId(response.body),
        ...this.parseUsage(response.body),
      },
    };
  }

  // 기능 : OpenAI API 호출에 필요한 환경변수를 ConfigService에서 읽고 검증합니다.
  private getConfig(): OpenAiActionDraftConfig {
    const apiKey = this.getRequiredConfig("OPENAI_API_KEY");
    const model = this.getRequiredConfig("OPENAI_MEETING_NOTE_DRAFT_MODEL");
    const baseUrl =
      this.configService.get<string>("OPENAI_BASE_URL")?.trim() ||
      DEFAULT_OPENAI_BASE_URL;

    return {
      apiKey,
      baseUrl: baseUrl.replace(/\/+$/, ""),
      model,
    };
  }

  // 기능 : log 생성 시 설정이 없어도 provider model 값을 안전하게 채웁니다.
  private getActionModel(): string {
    return (
      this.configService.get<string>("OPENAI_MEETING_NOTE_DRAFT_MODEL")?.trim() ||
      UNKNOWN_MODEL
    );
  }

  // 기능 : 필수 provider 환경변수가 비어 있으면 설정 오류로 변환합니다.
  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key)?.trim();

    if (!value) {
      throw new MeetingNoteAiDraftProviderUnavailableError(`${key} is required`);
    }

    return value;
  }

  // 기능 : 다음 행동 후보 생성 모델이 지켜야 할 출력 규칙을 정의합니다.
  private createNextActionInstructions(): string {
    return [
      "You generate concise B2B sales next-action candidates from a saved meeting note.",
      "Return only user-reviewable candidates; do not imply that anything was saved.",
      "Use only deal IDs provided in the input context or null.",
      "Prefer concrete customer-facing actions that can be saved as a short followingAction.",
      "Do not include markdown, emails, phone numbers, provider details, or unrelated metadata.",
    ].join("\n");
  }

  // 기능 : follow-up 문안 생성 모델이 지켜야 할 출력 규칙을 정의합니다.
  private createFollowUpInstructions(
    channel: MeetingNoteFollowUpChannelValue
  ): string {
    const channelRule =
      channel === MeetingNoteFollowUpChannelValue.SMS
        ? "SMS body must be short, natural, and under 300 Korean characters."
        : "Email subject must be concise, and body should be structured but not markdown-heavy.";

    return [
      "You draft a customer follow-up message from a saved B2B sales meeting note.",
      "The user will review, edit, copy, or send manually; do not say that it was sent.",
      channelRule,
      "Do not include contact email, phone number, provider details, or raw metadata.",
      "Return only subject, body, and copyableText in the requested language.",
    ].join("\n");
  }

  // 기능 : 다음 행동 후보 생성 요청 input에 회의록 맥락과 개수 제한을 담습니다.
  private createNextActionInput(input: CreateMeetingNoteNextActionDraftInput) {
    return [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: JSON.stringify({
              meetingNote: input.context,
              targetDealId: input.targetDealId,
              maxCandidates: input.maxCandidates,
            }),
          },
        ],
      },
    ];
  }

  // 기능 : follow-up 문안 생성 요청 input에 회의록 맥락과 채널 옵션을 담습니다.
  private createFollowUpInput(input: CreateMeetingNoteFollowUpDraftInput) {
    return [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: JSON.stringify({
              meetingNote: input.context,
              channel: input.channel,
              recipientContactId: input.recipientContactId,
              dealId: input.dealId,
              tone: input.tone,
              language: input.language,
            }),
          },
        ],
      },
    ];
  }

  // 기능 : 다음 행동 후보 structured output JSON schema를 생성합니다.
  private createNextActionSchema(maxCandidates: number) {
    return {
      type: "object",
      additionalProperties: false,
      properties: {
        items: {
          type: "array",
          minItems: 0,
          maxItems: maxCandidates,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              title: { type: "string" },
              memo: { type: ["string", "null"] },
              recommendedDueDate: { type: ["string", "null"] },
              dealId: { type: ["string", "null"] },
              confidence: {
                type: "string",
                enum: ["LOW", "MEDIUM", "HIGH"],
              },
              reason: { type: ["string", "null"] },
            },
            required: [
              "title",
              "memo",
              "recommendedDueDate",
              "dealId",
              "confidence",
              "reason",
            ],
          },
        },
      },
      required: ["items"],
    };
  }

  // 기능 : follow-up 문안 structured output JSON schema를 생성합니다.
  private createFollowUpSchema() {
    return {
      type: "object",
      additionalProperties: false,
      properties: {
        subject: { type: ["string", "null"] },
        body: { type: "string" },
        copyableText: { type: "string" },
      },
      required: ["subject", "body", "copyableText"],
    };
  }

  // 기능 : OpenAI JSON API에 요청을 보내고 응답 body와 request id를 반환합니다.
  private async postJson(
    config: OpenAiActionDraftConfig,
    path: string,
    body: unknown
  ): Promise<OpenAiJsonResponse> {
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
        "OpenAI meeting note action draft request failed",
        response.status >= 500 || response.status === 429
      );
    }

    try {
      return {
        body: await response.json(),
        requestId: this.extractHeaderRequestId(response),
      };
    } catch {
      throw new MeetingNoteAiDraftFailedError(
        "OpenAI meeting note action draft response was not JSON"
      );
    }
  }

  // 기능 : OpenAI usage 필드에서 token/cost metadata를 안전하게 추출합니다.
  private parseUsage(responseBody: unknown) {
    if (!this.isRecord(responseBody) || !this.isRecord(responseBody["usage"])) {
      return {
        inputTokenCount: null,
        outputTokenCount: null,
        totalTokenCount: null,
        estimatedCostAmount: null,
        costCurrency: COST_CURRENCY,
      };
    }

    const usage = responseBody["usage"];

    return {
      inputTokenCount:
        this.readNumberField(usage, "input_tokens") ??
        this.readNumberField(usage, "prompt_tokens"),
      outputTokenCount:
        this.readNumberField(usage, "output_tokens") ??
        this.readNumberField(usage, "completion_tokens"),
      totalTokenCount: this.readNumberField(usage, "total_tokens"),
      estimatedCostAmount: null,
      costCurrency: COST_CURRENCY,
    };
  }

  // 기능 : Responses API 응답에서 다음 행동 후보 JSON을 추출합니다.
  private parseNextActionResponse(responseBody: unknown): OpenAiNextActionDraftJson {
    const parsed = this.parseOutputJson(responseBody);

    if (!this.isRecord(parsed) || !Array.isArray(parsed["items"])) {
      throw new MeetingNoteAiDraftFailedError(
        "OpenAI next action draft response did not match schema"
      );
    }

    return {
      items: parsed["items"].map((item) => this.toNextActionCandidate(item)),
    };
  }

  // 기능 : Responses API 응답에서 follow-up 문안 JSON을 추출합니다.
  private parseFollowUpResponse(responseBody: unknown): MeetingNoteFollowUpDraftContent {
    const parsed = this.parseOutputJson(responseBody);

    if (!this.isRecord(parsed)) {
      throw new MeetingNoteAiDraftFailedError(
        "OpenAI follow-up draft response did not match schema"
      );
    }

    const subject = this.readNullableStringField(parsed, "subject");
    const body = this.readStringField(parsed, "body");
    const copyableText = this.readStringField(parsed, "copyableText");

    if (!body || !copyableText) {
      throw new MeetingNoteAiDraftFailedError(
        "OpenAI follow-up draft response did not match schema"
      );
    }

    return {
      subject,
      body,
      copyableText,
    };
  }

  // 기능 : OpenAI output_text를 JSON으로 파싱합니다.
  private parseOutputJson(responseBody: unknown): unknown {
    const outputText = this.extractOutputText(responseBody);

    if (!outputText) {
      throw new MeetingNoteAiDraftFailedError(
        "OpenAI meeting note action draft response was empty"
      );
    }

    try {
      return JSON.parse(outputText);
    } catch {
      throw new MeetingNoteAiDraftFailedError(
        "OpenAI meeting note action draft response was not valid JSON"
      );
    }
  }

  // 기능 : unknown item을 다음 행동 후보 구조로 검증해 변환합니다.
  private toNextActionCandidate(
    value: unknown
  ): MeetingNoteNextActionDraftCandidate {
    if (!this.isRecord(value)) {
      throw new MeetingNoteAiDraftFailedError(
        "OpenAI next action draft item did not match schema"
      );
    }

    const title = this.readStringField(value, "title");

    if (!title) {
      throw new MeetingNoteAiDraftFailedError(
        "OpenAI next action draft item did not match schema"
      );
    }

    return {
      title,
      memo: this.readNullableStringField(value, "memo"),
      recommendedDueDate: this.readNullableStringField(
        value,
        "recommendedDueDate"
      ),
      dealId: this.readNullableStringField(value, "dealId"),
      confidence: this.toConfidence(this.readStringField(value, "confidence")),
      reason: this.readNullableStringField(value, "reason"),
    };
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

  // 기능 : OpenAI response body의 id 값을 request 추적 ID로 사용합니다.
  private extractRequestId(responseBody: unknown): string | null {
    return this.isRecord(responseBody) ? this.readStringField(responseBody, "id") : null;
  }

  // 기능 : OpenAI response header의 request id를 읽습니다.
  private extractHeaderRequestId(response: Response): string | null {
    return (
      response.headers.get("x-request-id") ??
      response.headers.get("openai-request-id")
    );
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

  // 기능 : record에서 string 또는 null 필드를 읽고 없으면 null을 반환합니다.
  private readNullableStringField(
    value: Record<string, unknown>,
    fieldName: string
  ): string | null {
    const fieldValue = value[fieldName];

    return typeof fieldValue === "string" || fieldValue === null
      ? fieldValue
      : null;
  }

  // 기능 : record에서 숫자 필드를 읽고 없으면 null을 반환합니다.
  private readNumberField(
    value: Record<string, unknown>,
    fieldName: string
  ): number | null {
    const fieldValue = value[fieldName];

    return typeof fieldValue === "number" && Number.isFinite(fieldValue)
      ? fieldValue
      : null;
  }

  // 기능 : provider 신뢰도 문자열을 허용 enum 값으로 변환합니다.
  private toConfidence(
    value: string | null
  ): MeetingNoteNextActionConfidenceValue {
    switch (value) {
      case MeetingNoteNextActionConfidenceValue.LOW:
        return MeetingNoteNextActionConfidenceValue.LOW;
      case MeetingNoteNextActionConfidenceValue.HIGH:
        return MeetingNoteNextActionConfidenceValue.HIGH;
      case MeetingNoteNextActionConfidenceValue.MEDIUM:
      default:
        return MeetingNoteNextActionConfidenceValue.MEDIUM;
    }
  }

  // 기능 : 회의록 본문 없이 provider 실패 추적에 필요한 안전한 context만 남깁니다.
  private logProviderFailure(
    operation: string,
    statusCode: number,
    statusText: string
  ): void {
    this.logger.error(
      JSON.stringify({
        event: "provider.openai.meetingNoteAiAction.failed",
        provider: OPENAI_PROVIDER,
        operation,
        statusCode,
        retryable: statusCode >= 500 || statusCode === 429,
      }),
      statusText,
      "OpenAiMeetingNoteAiActionDraftProvider"
    );
  }
}
