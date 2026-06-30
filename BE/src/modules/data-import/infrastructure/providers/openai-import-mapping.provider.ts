import { ConfigService } from "@nestjs/config";
import type {
  GenerateImportMappingInput,
  ImportMappingProvider,
} from "@/modules/data-import/application/ports/import-mapping.provider";
import type { ImportMappingSuggestion } from "@/modules/data-import/application/ports/import-job.store";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_IMPORT_MAPPING_MODEL = "gpt-4o-mini";

interface OpenAiConfig {
  readonly apiKey: string;
  readonly baseUrl: string;
  readonly model: string;
}

interface OpenAiImportMappingJson {
  readonly suggestedMapping: Readonly<Record<string, string | null>>;
  readonly confidence: number;
  readonly unmappedColumns: readonly string[];
}

// 역할 : OpenAiImportMappingProvider OpenAI structured output으로 불러오기 컬럼 매핑을 제안합니다.
export class OpenAiImportMappingProvider implements ImportMappingProvider {
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
    const targetFieldSet = new Set(input.targetFields.map((field) => field.key));
    const suggestedMapping: Record<string, string | null> = {};

    for (const field of input.targetFields) {
      const mappedColumn = parsed.suggestedMapping[field.key] ?? null;
      suggestedMapping[field.key] =
        mappedColumn && sourceColumnSet.has(mappedColumn) ? mappedColumn : null;
    }

    const unmappedColumns = parsed.unmappedColumns.filter((column) =>
      sourceColumnSet.has(column)
    );

    for (const key of Object.keys(parsed.suggestedMapping)) {
      if (!targetFieldSet.has(key)) {
        continue;
      }
    }

    return {
      suggestedMapping,
      confidence: Math.max(0, Math.min(1, parsed.confidence)),
      unmappedColumns,
    };
  }

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

  private parseJson(value: string): unknown {
    try {
      return JSON.parse(value);
    } catch {
      throw new Error("OpenAI import mapping response was not valid JSON");
    }
  }

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

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  private readStringField(
    value: Record<string, unknown>,
    fieldName: string
  ): string | null {
    const fieldValue = value[fieldName];
    return typeof fieldValue === "string" ? fieldValue : null;
  }
}
