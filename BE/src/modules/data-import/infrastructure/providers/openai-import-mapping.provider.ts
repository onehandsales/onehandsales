import { ConfigService } from "@nestjs/config";
import type {
  GenerateImportMappingInput,
  ImportMappingProvider,
} from "@/modules/data-import/application/ports/import-mapping.provider";
import type { ImportMappingSuggestion } from "@/modules/data-import/application/ports/import-job.types";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_IMPORT_MAPPING_MODEL = "gpt-4o-mini";

// 역할 : OpenAiConfig import mapping provider 호출에 필요한 OpenAI 설정을 정의합니다.
interface OpenAiConfig {
  readonly apiKey: string;
  readonly baseUrl: string;
  readonly model: string;
}

// 역할 : OpenAiImportMappingJson OpenAI structured output 응답 JSON 구조를 정의합니다.
interface OpenAiImportMappingJson {
  readonly suggestedMapping: Readonly<Record<string, string | null>>;
  readonly confidence: number;
  readonly unmappedColumns: readonly string[];
}

// 역할 : OpenAiImportMappingProvider OpenAI structured output으로 불러오기 컬럼 매핑을 제안합니다.
export class OpenAiImportMappingProvider implements ImportMappingProvider {
  // 기능 : OpenAI 설정 조회 서비스와 구조화 logger를 주입받습니다.
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger
  ) {}

  // 기능 : OpenAI API를 호출해 원본 컬럼명과 대상 필드의 의미를 매칭합니다.
  async generate(input: GenerateImportMappingInput): Promise<ImportMappingSuggestion> {
    const config = this.getConfig();
    const suggestedMappingProperties = Object.fromEntries(
      input.targetFields.map((field) => [
        field.key,
        {
          anyOf:
            input.sourceColumns.length > 0
              ? [{ type: "string", enum: input.sourceColumns }, { type: "null" }]
              : [{ type: "string" }, { type: "null" }],
        },
      ])
    );
    const responseBody = await this.postJson(config, "/responses", {
      model: config.model,
      instructions: [
        "You map uploaded spreadsheet columns to CRM import template fields.",
        "Return only JSON matching the schema.",
        "Use null when no source column clearly matches a target field.",
        "Do not invent source column names. Use only provided sourceColumns.",
        "Prefer exact Korean/English semantic matches.",
      ].join("\n"),
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                targetType: input.targetType,
                targetFields: input.targetFields,
                sourceColumns: input.sourceColumns,
                sampleRows: input.sampleRows,
              }),
            },
          ],
        },
      ],
      store: false,
      text: {
        format: {
          type: "json_schema",
          name: "import_column_mapping",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              suggestedMapping: {
                type: "object",
                additionalProperties: false,
                properties: suggestedMappingProperties,
                required: input.targetFields.map((field) => field.key),
              },
              confidence: { type: "number" },
              unmappedColumns: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["suggestedMapping", "confidence", "unmappedColumns"],
          },
        },
      },
    });

    return this.normalizeResponse(responseBody, input);
  }

  // 기능 : 환경 변수에서 OpenAI import mapping 호출 설정을 읽습니다.
  private getConfig(): OpenAiConfig {
    const apiKey = this.configService.get<string>("OPENAI_API_KEY")?.trim();

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required");
    }

    const baseUrl =
      this.configService.get<string>("OPENAI_BASE_URL")?.trim() ||
      DEFAULT_OPENAI_BASE_URL;
    const model =
      this.configService.get<string>("OPENAI_IMPORT_MAPPING_MODEL")?.trim() ||
      this.configService.get<string>("OPENAI_MEETING_NOTE_DRAFT_MODEL")?.trim() ||
      DEFAULT_IMPORT_MAPPING_MODEL;

    return {
      apiKey,
      baseUrl: baseUrl.replace(/\/+$/, ""),
      model,
    };
  }

  // 기능 : OpenAI API에 JSON 요청을 보내고 실패 시 redacted provider 오류 로그를 남깁니다.
  private async postJson(
    config: OpenAiConfig,
    path: string,
    body: unknown
  ): Promise<unknown> {
    const response = await fetch(`${config.baseUrl}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      this.logger.error(
        JSON.stringify({
          event: "provider.openai.importMapping.failed",
          statusCode: response.status,
          retryable: response.status >= 500 || response.status === 429,
        }),
        response.statusText,
        "OpenAiImportMappingProvider"
      );
      throw new Error("OpenAI import mapping request failed");
    }

    return response.json();
  }

  // 기능 : OpenAI 응답을 import mapping suggestion 계약으로 검증하고 정규화합니다.
  private normalizeResponse(
    responseBody: unknown,
    input: GenerateImportMappingInput
  ): ImportMappingSuggestion {
    const outputText = this.extractOutputText(responseBody);

    if (!outputText) {
      throw new Error("OpenAI import mapping response was empty");
    }

    const parsed = this.parseJson(outputText);

    if (!this.isOpenAiImportMappingJson(parsed)) {
      throw new Error("OpenAI import mapping response did not match schema");
    }

    const sourceColumnSet = new Set(input.sourceColumns);
    const suggestedMapping: Record<string, string | null> = {};

    for (const field of input.targetFields) {
      const mappedColumn = parsed.suggestedMapping[field.key] ?? null;
      suggestedMapping[field.key] =
        mappedColumn && sourceColumnSet.has(mappedColumn) ? mappedColumn : null;
    }

    const unmappedColumns = parsed.unmappedColumns.filter((column) =>
      sourceColumnSet.has(column)
    );

    return {
      suggestedMapping,
      confidence: Math.max(0, Math.min(1, parsed.confidence)),
      unmappedColumns,
    };
  }

  // 기능 : Responses API 응답에서 text output을 추출합니다.
  private extractOutputText(value: unknown): string | null {
    if (!this.isRecord(value)) {
      return null;
    }

    const direct = this.readStringField(value, "output_text");
    if (direct) {
      return direct;
    }

    const output = value["output"];
    if (!Array.isArray(output)) {
      return null;
    }

    const parts: string[] = [];

    for (const item of output) {
      if (!this.isRecord(item) || !Array.isArray(item["content"])) {
        continue;
      }

      for (const content of item["content"]) {
        if (!this.isRecord(content)) {
          continue;
        }

        const text = this.readStringField(content, "text");
        if (text) {
          parts.push(text);
        }
      }
    }

    return parts.length > 0 ? parts.join("\n") : null;
  }

  // 기능 : provider text output을 JSON 값으로 파싱합니다.
  private parseJson(value: string): unknown {
    try {
      return JSON.parse(value);
    } catch {
      throw new Error("OpenAI import mapping response was not valid JSON");
    }
  }

  // 기능 : provider JSON 값이 import mapping schema를 만족하는지 확인합니다.
  private isOpenAiImportMappingJson(
    value: unknown
  ): value is OpenAiImportMappingJson {
    if (!this.isRecord(value) || !this.isRecord(value["suggestedMapping"])) {
      return false;
    }

    return (
      typeof value["confidence"] === "number" &&
      Array.isArray(value["unmappedColumns"]) &&
      value["unmappedColumns"].every((item) => typeof item === "string") &&
      Object.values(value["suggestedMapping"]).every(
        (item) => item === null || typeof item === "string"
      )
    );
  }

  // 기능 : unknown 값이 객체 레코드인지 확인합니다.
  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  // 기능 : 객체 field를 문자열로 읽습니다.
  private readStringField(
    value: Record<string, unknown>,
    fieldName: string
  ): string | null {
    const fieldValue = value[fieldName];
    return typeof fieldValue === "string" ? fieldValue : null;
  }
}
