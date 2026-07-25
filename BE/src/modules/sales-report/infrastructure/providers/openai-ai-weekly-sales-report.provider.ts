import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  AiWeeklySalesReportProviderFailure,
  type AiSuggestionPriorityValue,
  type AiWeeklySalesReportDataCoverage,
  type AiWeeklySalesReportOutput,
  type AiWeeklySalesReportProvider,
  type AiWeeklySalesReportProviderMetadata,
  type AiWeeklySalesReportProviderResult,
  type AiWeeklySalesReportSuggestionItem,
  type GenerateAiWeeklySalesReportInput,
} from "@/modules/sales-report/application/ports/ai-weekly-sales-report.provider";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_WEEKLY_SALES_REPORT_MODEL = "gpt-4o-mini";
const OPENAI_PROVIDER = "openai";
const COST_CURRENCY = "USD";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TARGET_TYPES = [
  "COMPANY",
  "CONTACT",
  "DEAL",
  "MEETING_NOTE",
  "PRODUCT",
  "SCHEDULE",
] as const;

type AiWeeklyTargetType = (typeof TARGET_TYPES)[number];

interface OpenAiConfig {
  readonly apiKey: string;
  readonly baseUrl: string;
  readonly model: string;
}

interface AllowedTarget {
  readonly type: AiWeeklyTargetType;
  readonly id: string;
  readonly label: string | null;
  readonly path: string;
}

interface OpenAiSuggestionPayloadJson {
  readonly emailDraft: string | null;
  readonly smsDraft: string | null;
}

interface OpenAiSuggestionJson {
  readonly key: string;
  readonly priority: AiSuggestionPriorityValue;
  readonly title: string;
  readonly body: string;
  readonly reason: string | null;
  readonly targetType: AiWeeklyTargetType | null;
  readonly targetId: string | null;
  readonly targetPath: string | null;
  readonly targetLabel: string | null;
  readonly payload: OpenAiSuggestionPayloadJson;
}

interface OpenAiWeeklySalesReportJson {
  readonly executiveSummary: {
    readonly headline: string;
    readonly narrative: string;
    readonly wins: readonly string[];
    readonly concerns: readonly string[];
  };
  readonly pipelineSummary: {
    readonly narrative: string;
    readonly totalDealCost: number;
    readonly statusCounts: readonly {
      readonly status: string;
      readonly count: number;
    }[];
  };
  readonly riskSignals: readonly OpenAiSuggestionJson[];
  readonly nextWeekActions: readonly OpenAiSuggestionJson[];
  readonly followUpDrafts: readonly OpenAiSuggestionJson[];
  readonly dataCleanupSuggestions: readonly OpenAiSuggestionJson[];
  readonly dataCoverage: AiWeeklySalesReportDataCoverage;
}

@Injectable()
export class OpenAiWeeklySalesReportProvider
  implements AiWeeklySalesReportProvider
{
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger
  ) {}

  getMetadata(): AiWeeklySalesReportProviderMetadata {
    return {
      provider: OPENAI_PROVIDER,
      model: this.getModel(),
    };
  }

  async generateReport(
    input: GenerateAiWeeklySalesReportInput
  ): Promise<AiWeeklySalesReportProviderResult> {
    const config = this.getConfig();
    const responseBody = await this.postJson(config, "/responses", {
      model: config.model,
      instructions: this.createInstructions(input),
      input: this.createInput(input),
      store: true,
      text: {
        format: {
          type: "json_schema",
          name: "ai_weekly_sales_report",
          strict: true,
          schema: this.createResponseSchema(),
        },
      },
    });
    const output = this.parseReportResponse(responseBody, input);

    return {
      provider: OPENAI_PROVIDER,
      model: config.model,
      requestId: this.extractRequestId(responseBody),
      output,
      usage: this.parseUsage(responseBody),
    };
  }

  private getConfig(): OpenAiConfig {
    const apiKey = this.configService.get<string>("OPENAI_API_KEY")?.trim();

    if (!apiKey) {
      throw new AiWeeklySalesReportProviderFailure(
        "AI_PROVIDER_UNAVAILABLE",
        "OPENAI_API_KEY is required",
        false
      );
    }

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
      this.configService
        .get<string>("OPENAI_AI_WEEKLY_SALES_REPORT_MODEL")
        ?.trim() ||
      this.configService.get<string>("OPENAI_WEEKLY_SALES_REPORT_MODEL")?.trim() ||
      this.configService.get<string>("OPENAI_MEETING_NOTE_DRAFT_MODEL")?.trim() ||
      DEFAULT_WEEKLY_SALES_REPORT_MODEL
    );
  }

  private createInstructions(input: GenerateAiWeeklySalesReportInput): string {
    const isKorean = input.locale.trim().toLowerCase().startsWith("ko");

    return [
      "You create weekly B2B sales reports for a CRM.",
      isKorean
        ? "Write all user-facing strings in Korean."
        : "Write user-facing strings in the requested locale when possible.",
      "Return only JSON matching the schema.",
      "Use only records and IDs from the supplied inputSnapshot.",
      "Do not invent companies, contacts, products, deals, schedules, meeting notes, amounts, or dates.",
      "Do not suggest automatic CRM mutations; suggestions are advisory only.",
      "Create concise executive summary, pipeline narrative, risk signals, next-week actions, follow-up drafts, and data-cleanup suggestions.",
      "For follow-up drafts, use only meeting notes that contain follow-up context.",
      "Use targetType and targetId only when the target exists in inputSnapshot; otherwise return null target fields.",
      "Use priority values LOW, MEDIUM, or HIGH.",
    ].join("\n");
  }

  private createInput(input: GenerateAiWeeklySalesReportInput) {
    return [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: JSON.stringify({
              reportContext: {
                reportId: input.reportId,
                weekStart: input.weekStart,
                weekEnd: input.weekEnd,
                timeZone: input.timeZone,
                locale: input.locale,
              },
              inputSnapshot: input.inputSnapshot,
            }),
          },
        ],
      },
    ];
  }

  private createResponseSchema(): Record<string, unknown> {
    return {
      type: "object",
      additionalProperties: false,
      properties: {
        executiveSummary: {
          type: "object",
          additionalProperties: false,
          properties: {
            headline: { type: "string" },
            narrative: { type: "string" },
            wins: {
              type: "array",
              maxItems: 5,
              items: { type: "string" },
            },
            concerns: {
              type: "array",
              maxItems: 5,
              items: { type: "string" },
            },
          },
          required: ["headline", "narrative", "wins", "concerns"],
        },
        pipelineSummary: {
          type: "object",
          additionalProperties: false,
          properties: {
            narrative: { type: "string" },
            totalDealCost: { type: "number" },
            statusCounts: {
              type: "array",
              maxItems: 20,
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  status: { type: "string" },
                  count: { type: "number" },
                },
                required: ["status", "count"],
              },
            },
          },
          required: ["narrative", "totalDealCost", "statusCounts"],
        },
        riskSignals: this.createSuggestionArraySchema(8),
        nextWeekActions: this.createSuggestionArraySchema(8),
        followUpDrafts: this.createSuggestionArraySchema(5),
        dataCleanupSuggestions: this.createSuggestionArraySchema(8),
        dataCoverage: {
          type: "object",
          additionalProperties: false,
          properties: {
            scheduleCount: { type: "number" },
            dealCount: { type: "number" },
            meetingNoteCount: { type: "number" },
            linkedDealCount: { type: "number" },
            missingSignals: {
              type: "array",
              maxItems: 20,
              items: { type: "string" },
            },
          },
          required: [
            "scheduleCount",
            "dealCount",
            "meetingNoteCount",
            "linkedDealCount",
            "missingSignals",
          ],
        },
      },
      required: [
        "executiveSummary",
        "pipelineSummary",
        "riskSignals",
        "nextWeekActions",
        "followUpDrafts",
        "dataCleanupSuggestions",
        "dataCoverage",
      ],
    };
  }

  private createSuggestionArraySchema(maxItems: number): Record<string, unknown> {
    return {
      type: "array",
      maxItems,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          key: { type: "string" },
          priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
          title: { type: "string" },
          body: { type: "string" },
          reason: { type: ["string", "null"] },
          targetType: {
            type: ["string", "null"],
            enum: [...TARGET_TYPES, null],
          },
          targetId: { type: ["string", "null"] },
          targetPath: { type: ["string", "null"] },
          targetLabel: { type: ["string", "null"] },
          payload: {
            type: "object",
            additionalProperties: false,
            properties: {
              emailDraft: { type: ["string", "null"] },
              smsDraft: { type: ["string", "null"] },
            },
            required: ["emailDraft", "smsDraft"],
          },
        },
        required: [
          "key",
          "priority",
          "title",
          "body",
          "reason",
          "targetType",
          "targetId",
          "targetPath",
          "targetLabel",
          "payload",
        ],
      },
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
      this.logProviderFailure("responses", response.status, response.statusText);
      throw this.createHttpFailure(response.status);
    }

    try {
      return await response.json();
    } catch {
      throw new AiWeeklySalesReportProviderFailure(
        "AI_PROVIDER_SCHEMA_INVALID",
        "OpenAI weekly sales report response was not JSON",
        false
      );
    }
  }

  private parseReportResponse(
    responseBody: unknown,
    input: GenerateAiWeeklySalesReportInput
  ): AiWeeklySalesReportOutput {
    const outputText = this.extractOutputText(responseBody);

    if (!outputText) {
      throw new AiWeeklySalesReportProviderFailure(
        "AI_PROVIDER_SCHEMA_INVALID",
        "OpenAI weekly sales report response was empty",
        false
      );
    }

    const parsed = this.parseJson(outputText);

    if (!this.isReportJson(parsed)) {
      throw new AiWeeklySalesReportProviderFailure(
        "AI_PROVIDER_SCHEMA_INVALID",
        "OpenAI weekly sales report response did not match schema",
        false
      );
    }

    return this.normalizeReportJson(parsed, input.inputSnapshot);
  }

  private normalizeReportJson(
    report: OpenAiWeeklySalesReportJson,
    inputSnapshot: Record<string, unknown>
  ): AiWeeklySalesReportOutput {
    const allowedTargets = this.collectAllowedTargets(inputSnapshot);

    return {
      executiveSummary: {
        headline: this.normalizeRequiredText(
          report.executiveSummary.headline,
          "executiveSummary.headline"
        ),
        narrative: this.normalizeRequiredText(
          report.executiveSummary.narrative,
          "executiveSummary.narrative"
        ),
        wins: this.normalizeStringList(report.executiveSummary.wins),
        concerns: this.normalizeStringList(report.executiveSummary.concerns),
      },
      pipelineSummary: {
        narrative: this.normalizeRequiredText(
          report.pipelineSummary.narrative,
          "pipelineSummary.narrative"
        ),
        totalDealCost: this.calculateTotalDealCost(inputSnapshot),
        statusCounts: this.calculateStatusCounts(inputSnapshot),
      },
      riskSignals: this.normalizeSuggestionItems(
        "risk",
        report.riskSignals,
        allowedTargets
      ),
      nextWeekActions: this.normalizeSuggestionItems(
        "next-action",
        report.nextWeekActions,
        allowedTargets
      ),
      followUpDrafts: this.normalizeSuggestionItems(
        "follow-up",
        report.followUpDrafts,
        allowedTargets
      ),
      dataCleanupSuggestions: this.normalizeSuggestionItems(
        "data-cleanup",
        report.dataCleanupSuggestions,
        allowedTargets
      ),
      dataCoverage: this.createDataCoverage(inputSnapshot),
    };
  }

  private normalizeSuggestionItems(
    keyPrefix: string,
    items: readonly OpenAiSuggestionJson[],
    allowedTargets: ReadonlyMap<string, AllowedTarget>
  ): AiWeeklySalesReportSuggestionItem[] {
    return items.map((item, index) => {
      const target = this.normalizeSuggestionTarget(item, allowedTargets);

      return {
        key:
          this.normalizeOptionalText(item.key) ??
          `${keyPrefix}-${String(index + 1)}`,
        priority: item.priority,
        title: this.normalizeRequiredText(item.title, "suggestion.title"),
        body: this.normalizeRequiredText(item.body, "suggestion.body"),
        reason: this.normalizeOptionalText(item.reason),
        targetType: target?.type ?? null,
        targetId: target?.id ?? null,
        targetPath: target?.path ?? null,
        targetLabel:
          target?.label ?? this.normalizeOptionalText(item.targetLabel),
        payload: this.normalizePayload(item.payload),
      };
    });
  }

  private normalizeSuggestionTarget(
    item: OpenAiSuggestionJson,
    allowedTargets: ReadonlyMap<string, AllowedTarget>
  ): AllowedTarget | null {
    if (!item.targetType || !item.targetId) {
      return null;
    }

    const targetId = item.targetId.trim();

    if (!UUID_PATTERN.test(targetId)) {
      return null;
    }

    return allowedTargets.get(`${item.targetType}:${targetId}`) ?? null;
  }

  private normalizePayload(
    payload: OpenAiSuggestionPayloadJson
  ): Record<string, unknown> {
    const normalizedPayload: Record<string, unknown> = {};
    const emailDraft = this.normalizeOptionalText(payload.emailDraft);
    const smsDraft = this.normalizeOptionalText(payload.smsDraft);

    if (emailDraft) {
      normalizedPayload.emailDraft = emailDraft;
    }

    if (smsDraft) {
      normalizedPayload.smsDraft = smsDraft;
    }

    return normalizedPayload;
  }

  private collectAllowedTargets(
    inputSnapshot: Record<string, unknown>
  ): ReadonlyMap<string, AllowedTarget> {
    const targets = new Map<string, AllowedTarget>();
    const addTarget = (
      type: AiWeeklyTargetType,
      id: string | null,
      label: string | null,
      pathPrefix: string
    ) => {
      if (!id || !UUID_PATTERN.test(id)) {
        return;
      }

      targets.set(`${type}:${id}`, {
        type,
        id,
        label,
        path: `${pathPrefix}/${id}`,
      });
    };

    for (const schedule of this.getObjectArray(inputSnapshot, "schedules")) {
      addTarget(
        "SCHEDULE",
        this.readStringField(schedule, "id"),
        this.readStringField(schedule, "scheduleTitle"),
        "/schedules"
      );
      this.collectNestedTargets(schedule, addTarget);
    }

    for (const deal of this.getObjectArray(inputSnapshot, "deals")) {
      addTarget(
        "DEAL",
        this.readStringField(deal, "id"),
        this.readStringField(deal, "dealName"),
        "/deals"
      );
      this.collectNestedTargets(deal, addTarget);
    }

    for (const meetingNote of this.getObjectArray(inputSnapshot, "meetingNotes")) {
      addTarget(
        "MEETING_NOTE",
        this.readStringField(meetingNote, "id"),
        this.readStringField(meetingNote, "title"),
        "/meeting-notes"
      );
      this.collectNestedTargets(meetingNote, addTarget);

      for (const deal of this.getObjectArray(meetingNote, "deals")) {
        addTarget(
          "DEAL",
          this.readStringField(deal, "dealId"),
          this.readStringField(deal, "dealName"),
          "/deals"
        );
      }
    }

    return targets;
  }

  private collectNestedTargets(
    value: Record<string, unknown>,
    addTarget: (
      type: AiWeeklyTargetType,
      id: string | null,
      label: string | null,
      pathPrefix: string
    ) => void
  ): void {
    for (const company of this.getObjectArray(value, "companies")) {
      addTarget(
        "COMPANY",
        this.readStringField(company, "id"),
        this.readStringField(company, "companyName"),
        "/companies"
      );
    }

    for (const contact of this.getObjectArray(value, "contacts")) {
      addTarget(
        "CONTACT",
        this.readStringField(contact, "id"),
        this.readStringField(contact, "username"),
        "/contacts"
      );
    }

    for (const product of this.getObjectArray(value, "products")) {
      addTarget(
        "PRODUCT",
        this.readStringField(product, "id"),
        this.readStringField(product, "productName"),
        "/products"
      );
    }
  }

  private calculateTotalDealCost(inputSnapshot: Record<string, unknown>): number {
    return this.getObjectArray(inputSnapshot, "deals").reduce(
      (total, deal) => total + (this.readNumberField(deal, "dealCost") ?? 0),
      0
    );
  }

  private calculateStatusCounts(
    inputSnapshot: Record<string, unknown>
  ): { readonly status: string; readonly count: number }[] {
    const counts = new Map<string, number>();

    for (const deal of this.getObjectArray(inputSnapshot, "deals")) {
      const status = this.readStringField(deal, "dealStatus") ?? "UNKNOWN";
      counts.set(status, (counts.get(status) ?? 0) + 1);
    }

    return [...counts.entries()].map(([status, count]) => ({ status, count }));
  }

  private createDataCoverage(
    inputSnapshot: Record<string, unknown>
  ): AiWeeklySalesReportDataCoverage {
    const counts = this.readRecordField(inputSnapshot, "counts");
    const dataQuality = this.readRecordField(inputSnapshot, "dataQuality");

    return {
      scheduleCount:
        this.readNumberField(counts, "schedules") ??
        this.getObjectArray(inputSnapshot, "schedules").length,
      dealCount:
        this.readNumberField(counts, "deals") ??
        this.getObjectArray(inputSnapshot, "deals").length,
      meetingNoteCount:
        this.readNumberField(counts, "meetingNotes") ??
        this.getObjectArray(inputSnapshot, "meetingNotes").length,
      linkedDealCount: this.readNumberField(counts, "linkedDeals") ?? 0,
      missingSignals: this.readStringArrayField(dataQuality, "missingSignals"),
    };
  }

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

  private extractRequestId(responseBody: unknown): string | null {
    return this.isRecord(responseBody) ? this.readStringField(responseBody, "id") : null;
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
      throw new AiWeeklySalesReportProviderFailure(
        "AI_PROVIDER_SCHEMA_INVALID",
        "OpenAI weekly sales report response was not valid JSON",
        false
      );
    }
  }

  private isReportJson(value: unknown): value is OpenAiWeeklySalesReportJson {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      this.isExecutiveSummaryJson(value["executiveSummary"]) &&
      this.isPipelineSummaryJson(value["pipelineSummary"]) &&
      this.isSuggestionArrayJson(value["riskSignals"]) &&
      this.isSuggestionArrayJson(value["nextWeekActions"]) &&
      this.isSuggestionArrayJson(value["followUpDrafts"]) &&
      this.isSuggestionArrayJson(value["dataCleanupSuggestions"]) &&
      this.isDataCoverageJson(value["dataCoverage"])
    );
  }

  private isExecutiveSummaryJson(value: unknown): value is {
    readonly headline: string;
    readonly narrative: string;
    readonly wins: readonly string[];
    readonly concerns: readonly string[];
  } {
    return (
      this.isRecord(value) &&
      typeof value["headline"] === "string" &&
      typeof value["narrative"] === "string" &&
      this.isStringArray(value["wins"]) &&
      this.isStringArray(value["concerns"])
    );
  }

  private isPipelineSummaryJson(value: unknown): value is {
    readonly narrative: string;
    readonly totalDealCost: number;
    readonly statusCounts: readonly { readonly status: string; readonly count: number }[];
  } {
    return (
      this.isRecord(value) &&
      typeof value["narrative"] === "string" &&
      typeof value["totalDealCost"] === "number" &&
      Array.isArray(value["statusCounts"]) &&
      value["statusCounts"].every(
        (item) =>
          this.isRecord(item) &&
          typeof item["status"] === "string" &&
          typeof item["count"] === "number"
      )
    );
  }

  private isSuggestionArrayJson(
    value: unknown
  ): value is readonly OpenAiSuggestionJson[] {
    return Array.isArray(value) && value.every((item) => this.isSuggestionJson(item));
  }

  private isSuggestionJson(value: unknown): value is OpenAiSuggestionJson {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      typeof value["key"] === "string" &&
      this.isPriority(value["priority"]) &&
      typeof value["title"] === "string" &&
      typeof value["body"] === "string" &&
      this.isNullableString(value["reason"]) &&
      this.isNullableTargetType(value["targetType"]) &&
      this.isNullableString(value["targetId"]) &&
      this.isNullableString(value["targetPath"]) &&
      this.isNullableString(value["targetLabel"]) &&
      this.isPayloadJson(value["payload"])
    );
  }

  private isPayloadJson(value: unknown): value is OpenAiSuggestionPayloadJson {
    return (
      this.isRecord(value) &&
      this.isNullableString(value["emailDraft"]) &&
      this.isNullableString(value["smsDraft"])
    );
  }

  private isDataCoverageJson(
    value: unknown
  ): value is AiWeeklySalesReportDataCoverage {
    return (
      this.isRecord(value) &&
      typeof value["scheduleCount"] === "number" &&
      typeof value["dealCount"] === "number" &&
      typeof value["meetingNoteCount"] === "number" &&
      typeof value["linkedDealCount"] === "number" &&
      this.isStringArray(value["missingSignals"])
    );
  }

  private isPriority(value: unknown): value is AiSuggestionPriorityValue {
    return value === "LOW" || value === "MEDIUM" || value === "HIGH";
  }

  private isNullableTargetType(value: unknown): value is AiWeeklyTargetType | null {
    return value === null || TARGET_TYPES.includes(value as AiWeeklyTargetType);
  }

  private isStringArray(value: unknown): value is readonly string[] {
    return Array.isArray(value) && value.every((item) => typeof item === "string");
  }

  private isNullableString(value: unknown): value is string | null {
    return value === null || typeof value === "string";
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  private readRecordField(
    value: Record<string, unknown>,
    fieldName: string
  ): Record<string, unknown> {
    const fieldValue = value[fieldName];

    return this.isRecord(fieldValue) && !Array.isArray(fieldValue) ? fieldValue : {};
  }

  private readStringField(
    value: Record<string, unknown>,
    fieldName: string
  ): string | null {
    const fieldValue = value[fieldName];

    return typeof fieldValue === "string" && fieldValue.trim().length > 0
      ? fieldValue.trim()
      : null;
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

  private readStringArrayField(
    value: Record<string, unknown>,
    fieldName: string
  ): string[] {
    const fieldValue = value[fieldName];

    return this.isStringArray(fieldValue)
      ? fieldValue.filter((item) => item.trim().length > 0)
      : [];
  }

  private getObjectArray(
    value: Record<string, unknown>,
    key: string
  ): Record<string, unknown>[] {
    const item = value[key];

    if (!Array.isArray(item)) {
      return [];
    }

    return item.filter(
      (entry): entry is Record<string, unknown> =>
        Boolean(entry) && typeof entry === "object" && !Array.isArray(entry)
    );
  }

  private normalizeRequiredText(value: string, fieldName: string): string {
    const normalized = value.trim();

    if (!normalized) {
      throw new AiWeeklySalesReportProviderFailure(
        "AI_PROVIDER_SCHEMA_INVALID",
        `${fieldName} was not generated`,
        false
      );
    }

    return normalized;
  }

  private normalizeOptionalText(value: string | null): string | null {
    if (value === null) {
      return null;
    }

    const normalized = value.trim();

    return normalized.length > 0 ? normalized : null;
  }

  private normalizeStringList(values: readonly string[]): string[] {
    return values
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
      .slice(0, 20);
  }

  private createHttpFailure(statusCode: number): AiWeeklySalesReportProviderFailure {
    if (statusCode === 401 || statusCode === 403) {
      return new AiWeeklySalesReportProviderFailure(
        "AI_PROVIDER_AUTH_FAILED",
        "OpenAI weekly sales report authorization failed",
        false
      );
    }

    if (statusCode === 429) {
      return new AiWeeklySalesReportProviderFailure(
        "AI_PROVIDER_RATE_LIMITED",
        "OpenAI weekly sales report rate limit exceeded",
        true
      );
    }

    if (statusCode >= 500) {
      return new AiWeeklySalesReportProviderFailure(
        "AI_PROVIDER_UNAVAILABLE",
        "OpenAI weekly sales report provider is unavailable",
        true
      );
    }

    return new AiWeeklySalesReportProviderFailure(
      "AI_PROVIDER_FAILED",
      "OpenAI weekly sales report request failed",
      false
    );
  }

  private logProviderFailure(
    operation: string,
    statusCode: number,
    statusText: string
  ): void {
    this.logger.error(
      JSON.stringify({
        event: "provider.openai.aiWeeklySalesReport.failed",
        provider: OPENAI_PROVIDER,
        operation,
        statusCode,
        retryable: statusCode >= 500 || statusCode === 429,
      }),
      statusText,
      "OpenAiWeeklySalesReportProvider"
    );
  }
}
