import type { Buffer } from "node:buffer";
import { ConfigService } from "@nestjs/config";
import type {
  BusinessCardExtractedFields,
  BusinessCardOcrProvider,
  BusinessCardOcrProviderMetadata,
  BusinessCardOcrProviderResult,
  BusinessCardOcrUsage,
} from "@/modules/business-card/application/ports/business-card-ocr.provider";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_BUSINESS_CARD_OCR_MODEL = "gpt-4o-mini";
const OPENAI_PROVIDER = "OPENAI";
const COST_CURRENCY = "USD";

const BUSINESS_CARD_OCR_PROMPT = [
  "Extract business card data for a Korean B2B CRM.",
  "Return only the fields in the JSON schema.",
  "Use null when a value is missing or uncertain.",
  "Do not invent company, contact, department, job title, region, phone, or email.",
  "companyFieldName means industry or business category.",
  "companyRegionName means company location or region.",
  "contactDepartmentName means department/team.",
  "contactJobGradeName means title, role, rank, or position.",
  "Prefer Korean text as printed on the card.",
  "For Korean mobile numbers, keep only 010 mobile numbers and format as 010-0000-0000.",
].join("\n");

interface OpenAiBusinessCardOcrJson {
  readonly companyName: string | null;
  readonly companyFieldName: string | null;
  readonly companyRegionName: string | null;
  readonly contactName: string | null;
  readonly contactMobile: string | null;
  readonly contactEmail: string | null;
  readonly contactDepartmentName: string | null;
  readonly contactJobGradeName: string | null;
}

interface OpenAiConfig {
  readonly apiKey: string;
  readonly baseUrl: string;
  readonly model: string;
}

// 역할 : OpenAiBusinessCardOcrProvider OpenAI vision 모델로 명함 OCR 후보 값을 추출합니다.
export class OpenAiBusinessCardOcrProvider implements BusinessCardOcrProvider {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger
  ) {}

  getMetadata(): BusinessCardOcrProviderMetadata {
    return {
      aiProvider: OPENAI_PROVIDER,
      aiModel: this.getModel(),
      promptSnapshot: BUSINESS_CARD_OCR_PROMPT,
      costCurrency: COST_CURRENCY,
    };
  }

  async extract(input: {
    readonly imageFile: {
      readonly buffer: Buffer;
      readonly fileName: string;
      readonly mimeType: string;
      readonly size: number;
    };
  }): Promise<BusinessCardOcrProviderResult> {
    const config = this.getConfig();
    const responseBody = await this.postJson(config, "/responses", {
      model: config.model,
      instructions: BUSINESS_CARD_OCR_PROMPT,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Extract the business card fields from this image.",
            },
            {
              type: "input_image",
              image_url: this.createImageDataUrl(
                input.imageFile.buffer,
                input.imageFile.mimeType
              ),
            },
          ],
        },
      ],
      store: false,
      text: {
        format: {
          type: "json_schema",
          name: "business_card_ocr",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              companyName: { type: ["string", "null"] },
              companyFieldName: { type: ["string", "null"] },
              companyRegionName: { type: ["string", "null"] },
              contactName: { type: ["string", "null"] },
              contactMobile: { type: ["string", "null"] },
              contactEmail: { type: ["string", "null"] },
              contactDepartmentName: { type: ["string", "null"] },
              contactJobGradeName: { type: ["string", "null"] },
            },
            required: [
              "companyName",
              "companyFieldName",
              "companyRegionName",
              "contactName",
              "contactMobile",
              "contactEmail",
              "contactDepartmentName",
              "contactJobGradeName",
            ],
          },
        },
      },
    });

    return {
      extracted: this.parseExtractedFields(responseBody),
      usage: this.parseUsage(responseBody),
    };
  }

  private getConfig(): OpenAiConfig {
    const apiKey = this.getRequiredConfig("OPENAI_API_KEY");
    const baseUrl =
      this.configService.get<string>("OPENAI_BASE_URL")?.trim() ||
      DEFAULT_OPENAI_BASE_URL;

    return {
      apiKey,
      baseUrl: baseUrl.replace(/\/+$/, ""),
      model: this.getModel(),
    };
  }

  private getModel(): string {
    return (
      this.configService.get<string>("OPENAI_BUSINESS_CARD_OCR_MODEL")?.trim() ||
      this.configService.get<string>("OPENAI_MEETING_NOTE_DRAFT_MODEL")?.trim() ||
      DEFAULT_BUSINESS_CARD_OCR_MODEL
    );
  }

  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key)?.trim();

    if (!value) {
      throw new Error(`${key} is required`);
    }

    return value;
  }

  private createImageDataUrl(buffer: Buffer, mimeType: string): string {
    return `data:${mimeType};base64,${buffer.toString("base64")}`;
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
      this.logProviderFailure("responses", response.status, response.statusText);
      throw new Error("OpenAI business card OCR request failed");
    }

    try {
      return await response.json();
    } catch {
      throw new Error("OpenAI business card OCR response was not JSON");
    }
  }

  private parseExtractedFields(responseBody: unknown): BusinessCardExtractedFields {
    const outputText = this.extractOutputText(responseBody);

    if (!outputText) {
      throw new Error("OpenAI business card OCR response was empty");
    }

    const parsed = this.parseJson(outputText);

    if (!this.isBusinessCardOcrJson(parsed)) {
      throw new Error("OpenAI business card OCR response did not match schema");
    }

    return parsed;
  }

  private parseUsage(responseBody: unknown): BusinessCardOcrUsage {
    if (!this.isRecord(responseBody) || !this.isRecord(responseBody["usage"])) {
      return this.emptyUsage();
    }

    const usage = responseBody["usage"];
    const requestToken =
      this.readNumberField(usage, "input_tokens") ??
      this.readNumberField(usage, "prompt_tokens");
    const responseToken =
      this.readNumberField(usage, "output_tokens") ??
      this.readNumberField(usage, "completion_tokens");

    return {
      requestToken,
      responseToken,
      totalToken: this.readNumberField(usage, "total_tokens"),
      requestCost: null,
      responseCost: null,
      totalCost: null,
    };
  }

  private emptyUsage(): BusinessCardOcrUsage {
    return {
      requestToken: null,
      responseToken: null,
      totalToken: null,
      requestCost: null,
      responseCost: null,
      totalCost: null,
    };
  }

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

  private collectOutputTextParts(item: unknown, textParts: string[]): void {
    if (!this.isRecord(item) || !Array.isArray(item["content"])) {
      return;
    }

    for (const contentItem of item["content"]) {
      if (!this.isRecord(contentItem)) {
        continue;
      }

      const text = this.readStringField(contentItem, "text");

      if (text) {
        textParts.push(text);
      }
    }
  }

  private parseJson(value: string): unknown {
    try {
      return JSON.parse(value);
    } catch {
      throw new Error("OpenAI business card OCR response was not valid JSON");
    }
  }

  private isBusinessCardOcrJson(
    value: unknown
  ): value is OpenAiBusinessCardOcrJson {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      this.isNullableString(value["companyName"]) &&
      this.isNullableString(value["companyFieldName"]) &&
      this.isNullableString(value["companyRegionName"]) &&
      this.isNullableString(value["contactName"]) &&
      this.isNullableString(value["contactMobile"]) &&
      this.isNullableString(value["contactEmail"]) &&
      this.isNullableString(value["contactDepartmentName"]) &&
      this.isNullableString(value["contactJobGradeName"])
    );
  }

  private isNullableString(value: unknown): value is string | null {
    return value === null || typeof value === "string";
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  private readStringField(
    value: Record<string, unknown>,
    fieldName: string
  ): string | null {
    const fieldValue = value[fieldName];

    return typeof fieldValue === "string" ? fieldValue : null;
  }

  private readNumberField(
    value: Record<string, unknown>,
    fieldName: string
  ): number | null {
    const fieldValue = value[fieldName];

    return typeof fieldValue === "number" && Number.isFinite(fieldValue)
      ? fieldValue
      : null;
  }

  private logProviderFailure(
    operation: string,
    statusCode: number,
    statusText: string
  ): void {
    this.logger.error(
      JSON.stringify({
        event: "provider.openai.businessCardOcr.failed",
        provider: OPENAI_PROVIDER,
        operation,
        statusCode,
        retryable: statusCode >= 500 || statusCode === 429,
      }),
      statusText,
      "OpenAiBusinessCardOcrProvider"
    );
  }
}
