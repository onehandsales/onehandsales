import { Inject, Injectable } from "@nestjs/common";
import {
  PRODUCT_ANALYTICS_REPOSITORY,
  type AiUsageProviderCallLogSummarySource,
  type ProductAnalyticsRepository,
} from "@/modules/analytics/application/ports/product-analytics.repository";
import { resolveProductAnalyticsEventDate } from "@/modules/analytics/application/services/product-analytics-date";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const DEFAULT_AI_USAGE_GROUP_BY = "USER";
const AI_USAGE_GROUP_BY_VALUES = ["USER", "DAY", "OPERATION"] as const;
const DECIMAL_SCALE = 6;
const DECIMAL_MICRO_UNITS = 1_000_000n;

// 역할 : AiUsageGroupBy AI usage summary가 지원하는 집계 단위를 정의합니다.
export type AiUsageGroupBy = (typeof AI_USAGE_GROUP_BY_VALUES)[number];

// 역할 : SummarizeAiUsageCommand AI provider 호출 로그 요약 조건을 정의합니다.
export interface SummarizeAiUsageCommand {
  readonly userId?: string;
  readonly from?: Date;
  readonly to?: Date;
  readonly groupBy?: AiUsageGroupBy;
}

// 역할 : AiUsageSummaryItem AI provider 호출 로그 집계 결과 row를 정의합니다.
export interface AiUsageSummaryItem {
  readonly userId: string;
  readonly dateKey: string | null;
  readonly operation: string | null;
  readonly userTimeZone: string | null;
  readonly requestCount: number;
  readonly succeededCount: number;
  readonly failedCount: number;
  readonly pendingCount: number;
  readonly canceledCount: number;
  readonly totalTokenCount: number;
  readonly estimatedCostAmount: string;
  readonly costCurrency: string;
}

// 역할 : AiUsageSummaryResponse AI provider 호출 로그 집계 응답을 정의합니다.
export interface AiUsageSummaryResponse {
  readonly items: AiUsageSummaryItem[];
}

// 역할 : NormalizedAiUsageCommand 검증을 마친 AI usage summary 입력을 정의합니다.
interface NormalizedAiUsageCommand {
  readonly userId: string | undefined;
  readonly from: Date | undefined;
  readonly to: Date | undefined;
  readonly groupBy: AiUsageGroupBy;
}

// 역할 : AiUsageSummaryAccumulator AI usage 집계 중간 값을 누적합니다.
interface AiUsageSummaryAccumulator {
  readonly userId: string;
  readonly dateKey: string | null;
  readonly operation: string | null;
  readonly userTimeZone: string | null;
  requestCount: number;
  succeededCount: number;
  failedCount: number;
  pendingCount: number;
  canceledCount: number;
  totalTokenCount: number;
  estimatedCostMicros: bigint;
  costCurrency: string;
}

@Injectable()
// 역할 : AI provider 호출 로그를 사용자별 사용량 요약으로 계산합니다.
export class SummarizeAiUsageUseCase {
  constructor(
    @Inject(PRODUCT_ANALYTICS_REPOSITORY)
    private readonly productAnalyticsRepository: ProductAnalyticsRepository,
    private readonly logger: AppLogger
  ) {}

  // 기능 : provider 호출 로그를 읽어 요청/상태/token/cost를 지정한 groupBy로 집계합니다.
  async execute(
    command: SummarizeAiUsageCommand = {}
  ): Promise<AiUsageSummaryResponse> {
    try {
      const normalized = this.normalizeCommand(command);
      const rows =
        await this.productAnalyticsRepository.listAiUsageProviderCallLogsForSummary(
          this.toRepositoryInput(normalized)
        );

      return {
        items: this.summarizeRows(rows, normalized.groupBy),
      };
    } catch (error) {
      this.logSummaryFailed(command, error);
      throw error;
    }
  }

  // 기능 : optional command를 안전한 집계 조건으로 정규화합니다.
  private normalizeCommand(
    command: SummarizeAiUsageCommand
  ): NormalizedAiUsageCommand {
    const groupBy = command.groupBy ?? DEFAULT_AI_USAGE_GROUP_BY;
    const userId = command.userId?.trim();
    const from = this.normalizeDate(command.from, "from");
    const to = this.normalizeDate(command.to, "to");

    if (!this.isAiUsageGroupBy(groupBy)) {
      throw new Error("groupBy must be USER, DAY, or OPERATION");
    }

    if (command.userId !== undefined && !userId) {
      throw new Error("userId must not be blank");
    }

    if (from && to && from.getTime() > to.getTime()) {
      throw new Error("from must be earlier than or equal to to");
    }

    return {
      from,
      groupBy,
      to,
      userId,
    };
  }

  // 기능 : repository optional 입력에서 undefined field를 제거합니다.
  private toRepositoryInput(command: NormalizedAiUsageCommand) {
    return {
      ...(command.userId ? { userId: command.userId } : {}),
      ...(command.from ? { from: command.from } : {}),
      ...(command.to ? { to: command.to } : {}),
    };
  }

  // 기능 : provider 호출 source row 목록을 사용자 기준 summary item 목록으로 집계합니다.
  private summarizeRows(
    rows: readonly AiUsageProviderCallLogSummarySource[],
    groupBy: AiUsageGroupBy
  ): AiUsageSummaryItem[] {
    const accumulators = new Map<string, AiUsageSummaryAccumulator>();

    for (const row of rows) {
      const group = this.resolveGroup(row, groupBy);
      const key = this.createAccumulatorKey(group);
      const accumulator =
        accumulators.get(key) ?? this.createAccumulator(row, group);

      this.applyRowToAccumulator(accumulator, row);
      accumulators.set(key, accumulator);
    }

    return [...accumulators.values()]
      .sort((left, right) => this.compareAccumulator(left, right))
      .map((accumulator) => this.toSummaryItem(accumulator));
  }

  // 기능 : row와 groupBy 조건으로 summary group 식별 field를 계산합니다.
  private resolveGroup(
    row: AiUsageProviderCallLogSummarySource,
    groupBy: AiUsageGroupBy
  ): Pick<
    AiUsageSummaryAccumulator,
    "userId" | "dateKey" | "operation" | "userTimeZone"
  > {
    if (groupBy === "DAY") {
      return {
        dateKey: resolveProductAnalyticsEventDate(
          row.startedAt,
          row.userTimeZone
        ),
        operation: null,
        userId: row.userId,
        userTimeZone: row.userTimeZone,
      };
    }

    if (groupBy === "OPERATION") {
      return {
        dateKey: null,
        operation: row.operation,
        userId: row.userId,
        userTimeZone: null,
      };
    }

    return {
      dateKey: null,
      operation: null,
      userId: row.userId,
      userTimeZone: null,
    };
  }

  // 기능 : summary group field를 Map key로 변환합니다.
  private createAccumulatorKey(
    group: Pick<
      AiUsageSummaryAccumulator,
      "userId" | "dateKey" | "operation"
    >
  ): string {
    return [group.userId, group.dateKey ?? "", group.operation ?? ""].join(
      "::"
    );
  }

  // 기능 : 첫 row 기준으로 summary accumulator 기본값을 생성합니다.
  private createAccumulator(
    row: AiUsageProviderCallLogSummarySource,
    group: Pick<
      AiUsageSummaryAccumulator,
      "userId" | "dateKey" | "operation" | "userTimeZone"
    >
  ): AiUsageSummaryAccumulator {
    return {
      ...group,
      canceledCount: 0,
      costCurrency: row.costCurrency || "USD",
      estimatedCostMicros: 0n,
      failedCount: 0,
      pendingCount: 0,
      requestCount: 0,
      succeededCount: 0,
      totalTokenCount: 0,
    };
  }

  // 기능 : 호출 로그 row 하나를 상태 count, token, 비용 누적값에 반영합니다.
  private applyRowToAccumulator(
    accumulator: AiUsageSummaryAccumulator,
    row: AiUsageProviderCallLogSummarySource
  ): void {
    accumulator.requestCount += 1;
    accumulator.totalTokenCount += row.totalTokenCount ?? 0;
    accumulator.estimatedCostMicros += this.parseDecimalToMicros(
      row.estimatedCostAmount
    );

    if (row.status === "SUCCEEDED") {
      accumulator.succeededCount += 1;
      return;
    }

    if (row.status === "FAILED") {
      accumulator.failedCount += 1;
      return;
    }

    if (row.status === "CANCELED") {
      accumulator.canceledCount += 1;
      return;
    }

    accumulator.pendingCount += 1;
  }

  // 기능 : accumulator를 외부 응답 item으로 변환합니다.
  private toSummaryItem(
    accumulator: AiUsageSummaryAccumulator
  ): AiUsageSummaryItem {
    return {
      canceledCount: accumulator.canceledCount,
      costCurrency: accumulator.costCurrency,
      dateKey: accumulator.dateKey,
      estimatedCostAmount: this.formatMicros(accumulator.estimatedCostMicros),
      failedCount: accumulator.failedCount,
      operation: accumulator.operation,
      pendingCount: accumulator.pendingCount,
      requestCount: accumulator.requestCount,
      succeededCount: accumulator.succeededCount,
      totalTokenCount: accumulator.totalTokenCount,
      userId: accumulator.userId,
      userTimeZone: accumulator.userTimeZone,
    };
  }

  // 기능 : user/date/operation 순서로 deterministic response 정렬을 적용합니다.
  private compareAccumulator(
    left: AiUsageSummaryAccumulator,
    right: AiUsageSummaryAccumulator
  ): number {
    return (
      left.userId.localeCompare(right.userId) ||
      (left.dateKey ?? "").localeCompare(right.dateKey ?? "") ||
      (left.operation ?? "").localeCompare(right.operation ?? "")
    );
  }

  // 기능 : decimal string 비용을 6자리 scale integer로 변환해 부동소수점 오차를 피합니다.
  private parseDecimalToMicros(value: string | null): bigint {
    if (!value) {
      return 0n;
    }

    const normalized = value.trim();

    if (!/^[+-]?\d+(\.\d+)?$/.test(normalized)) {
      throw new Error("estimatedCostAmount must be a decimal string");
    }

    const sign = normalized.startsWith("-") ? -1n : 1n;
    const unsigned = normalized.replace(/^[+-]/, "");
    const [integerPart = "0", fractionPart = ""] = unsigned.split(".");
    const fractionMicros = fractionPart
      .slice(0, DECIMAL_SCALE)
      .padEnd(DECIMAL_SCALE, "0");

    return (
      sign *
      (BigInt(integerPart) * DECIMAL_MICRO_UNITS + BigInt(fractionMicros))
    );
  }

  // 기능 : 6자리 scale integer 비용을 decimal string 응답으로 변환합니다.
  private formatMicros(value: bigint): string {
    const sign = value < 0n ? "-" : "";
    const absoluteText = (value < 0n ? -value : value)
      .toString()
      .padStart(DECIMAL_SCALE + 1, "0");
    const integerPart = absoluteText.slice(0, -DECIMAL_SCALE);
    const fractionPart = absoluteText.slice(-DECIMAL_SCALE);

    return `${sign}${integerPart}.${fractionPart}`;
  }

  // 기능 : optional Date 입력이 유효한 UTC instant인지 확인합니다.
  private normalizeDate(value: Date | undefined, fieldName: string): Date | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
      throw new Error(`${fieldName} must be a valid Date`);
    }

    return value;
  }

  // 기능 : 문자열이 지원하는 AI usage groupBy 값인지 확인합니다.
  private isAiUsageGroupBy(value: string): value is AiUsageGroupBy {
    return AI_USAGE_GROUP_BY_VALUES.some((item) => item === value);
  }

  // 기능 : AI usage summary 실패를 개인정보 없이 구조화 warning log로 남깁니다.
  private logSummaryFailed(
    command: SummarizeAiUsageCommand,
    error: unknown
  ): void {
    this.logger.warn(
      JSON.stringify({
        event: "analytics.aiUsage.summaryFailed",
        errorName: this.toErrorName(error),
        from: this.toSafeIsoString(command.from),
        groupBy: command.groupBy ?? DEFAULT_AI_USAGE_GROUP_BY,
        hasUserFilter: Boolean(command.userId),
        to: this.toSafeIsoString(command.to),
      }),
      this.constructor.name
    );
  }

  // 기능 : 로그에 남길 수 있는 날짜만 ISO string으로 변환합니다.
  private toSafeIsoString(value: Date | undefined): string | null {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
      return null;
    }

    return value.toISOString();
  }

  // 기능 : unknown 오류에서 안전한 오류 이름만 추출합니다.
  private toErrorName(error: unknown): string {
    if (error instanceof Error) {
      return error.name;
    }

    return "UnknownError";
  }
}
