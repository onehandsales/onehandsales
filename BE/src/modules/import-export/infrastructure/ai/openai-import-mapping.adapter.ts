import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  GenerateImportMappingInput,
  ImportMapping,
  ImportMappingPort,
  ImportMappingSuggestion,
} from "@/modules/import-export/application/ports/import-mapping.port";
import { AiProviderUnavailableError } from "@/modules/import-export/domain/import-export.errors";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_OPENAI_IMPORT_MAPPING_MODEL = "gpt-4.1-mini";

@Injectable()
export class OpenAiImportMappingAdapter implements ImportMappingPort {
  constructor(private readonly configService: ConfigService) {}

  async generateMapping(
    input: GenerateImportMappingInput
  ): Promise<ImportMappingSuggestion> {
    const apiKey = this.configService.get<string>("OPENAI_API_KEY");

    if (!apiKey) {
      throw new AiProviderUnavailableError("OPENAI_API_KEY is not configured");
    }

    const model =
      this.configService.get<string>("OPENAI_MODEL_IMPORT_MAPPING") ||
      this.configService.get<string>("OPENAI_MODEL") ||
      DEFAULT_OPENAI_IMPORT_MAPPING_MODEL;
    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content:
              "You map uploaded CSV or spreadsheet columns to Korean B2C sales CRM import target fields. Return JSON only.",
          },
          {
            role: "user",
            content: createPrompt(input),
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "import_column_mapping",
            strict: true,
            schema: createMappingSchema(input),
          },
        },
      }),
    });

    if (!response.ok) {
      throw new AiProviderUnavailableError(
        `OpenAI import mapping request failed with status ${response.status}`
      );
    }

    const payload: unknown = await response.json();
    return parseMappingSuggestion(extractOutputText(payload), input.sourceColumns);
  }
}

function createPrompt(input: GenerateImportMappingInput): string {
  return [
    `Target type: ${input.targetType}`,
    `Source columns: ${input.sourceColumns.join(", ")}`,
    "Target fields:",
    input.targetFields
      .map((field) => {
        const required = field.required ? "required" : "optional";
        const enumValues = field.enumValues
          ? ` enum=${field.enumValues.join("|")}`
          : "";

        return `- ${field.field} (${field.label}, ${field.kind}, ${required}${enumValues})`;
      })
      .join("\n"),
    "Sample rows:",
    JSON.stringify(input.sampleRows),
    "Map each target field to the best source column name. Use null if no source column matches.",
    "Put source columns that are not used in unmappedColumns.",
  ].join("\n\n");
}

function createMappingSchema(input: GenerateImportMappingInput) {
  return {
    type: "object",
    additionalProperties: false,
    required: ["suggestedMapping", "confidence", "unmappedColumns"],
    properties: {
      suggestedMapping: {
        type: "object",
        additionalProperties: false,
        required: input.targetFields.map((field) => field.field),
        properties: Object.fromEntries(
          input.targetFields.map((field) => [
            field.field,
            { type: ["string", "null"] },
          ])
        ),
      },
      confidence: {
        type: "number",
        minimum: 0,
        maximum: 1,
      },
      unmappedColumns: {
        type: "array",
        items: { type: "string" },
      },
    },
  };
}

function parseMappingSuggestion(
  text: string,
  sourceColumns: readonly string[]
): ImportMappingSuggestion {
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new AiProviderUnavailableError("AI mapping response was not valid JSON");
  }

  const object = readObject(parsed);
  const suggestedMapping = readMapping(
    object.suggestedMapping,
    sourceColumns
  );

  return {
    suggestedMapping,
    confidence: readConfidence(object.confidence),
    unmappedColumns: readStringArray(object.unmappedColumns).filter((column) =>
      sourceColumns.includes(column)
    ),
  };
}

function readMapping(value: unknown, sourceColumns: readonly string[]): ImportMapping {
  const object = readObject(value);
  const mapping: ImportMapping = {};

  for (const [field, sourceColumn] of Object.entries(object)) {
    if (sourceColumn === null || sourceColumn === undefined) {
      mapping[field] = null;
      continue;
    }

    if (typeof sourceColumn !== "string") {
      throw new AiProviderUnavailableError(
        "AI mapping values must be strings or null"
      );
    }

    const trimmed = sourceColumn.trim();
    mapping[field] = sourceColumns.includes(trimmed) ? trimmed : null;
  }

  return mapping;
}

function extractOutputText(payload: unknown): string {
  const outputText = readStringProperty(payload, "output_text");

  if (outputText) {
    return outputText;
  }

  const output = readArrayProperty(payload, "output");
  const texts = output.flatMap((item) => {
    const content = readArrayProperty(item, "content");

    return content
      .map((contentItem) => readStringProperty(contentItem, "text"))
      .filter((value): value is string => Boolean(value));
  });
  const text = texts.join("\n").trim();

  if (!text) {
    throw new AiProviderUnavailableError("AI mapping response was empty");
  }

  return text;
}

function readObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AiProviderUnavailableError("AI mapping response was not an object");
  }

  return value as Record<string, unknown>;
}

function readConfidence(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new AiProviderUnavailableError("AI mapping confidence must be a number");
  }

  return Math.min(1, Math.max(0, value));
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    throw new AiProviderUnavailableError("AI mapping unmappedColumns must be an array");
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function readStringProperty(value: unknown, key: string): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const property = record[key];

  return typeof property === "string" ? property.trim() : null;
}

function readArrayProperty(value: unknown, key: string): unknown[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }

  const record = value as Record<string, unknown>;
  const property = record[key];

  return Array.isArray(property) ? property : [];
}
