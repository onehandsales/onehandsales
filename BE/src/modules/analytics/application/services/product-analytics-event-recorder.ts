import { Inject, Injectable } from "@nestjs/common";
import {
  PRODUCT_ANALYTICS_REPOSITORY,
  type ProductAnalyticsRepository,
} from "@/modules/analytics/application/ports/product-analytics.repository";
import { resolveProductAnalyticsEventDate } from "@/modules/analytics/application/services/product-analytics-date";
import {
  PRODUCT_ANALYTICS_EVENT_VERSION,
  type ProductAnalyticsServerEventName,
  type ProductAnalyticsTargetTypeCode,
  isProductAnalyticsServerEventName,
} from "@/modules/analytics/domain/product-analytics-event-taxonomy";
import {
  ProductAnalyticsEventUnsupportedError,
  ProductAnalyticsEventVersionUnsupportedError,
  ProductAnalyticsPayloadInvalidError,
  ProductAnalyticsPayloadPiiRejectedError,
} from "@/modules/analytics/domain/product-analytics.errors";
import { isValidIanaTimeZone } from "@/shared/application/time-zone/time-zone";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

export const PRODUCT_ANALYTICS_EVENT_RECORDER = Symbol(
  "PRODUCT_ANALYTICS_EVENT_RECORDER"
);

type ProductAnalyticsEventTargetMap = Readonly<
  Record<ProductAnalyticsServerEventName, ProductAnalyticsTargetTypeCode>
>;

type ProductAnalyticsLinkCountBucket = "1" | "2_3" | "4_plus";
type ProductAnalyticsImportRowCountBucket =
  | "1"
  | "2_10"
  | "11_50"
  | "51_200"
  | "201_plus";
type ProductAnalyticsExportRowCountBucket =
  | "0"
  | ProductAnalyticsImportRowCountBucket;
type ProductAnalyticsBusinessCardOcrFailureCode =
  | "IMAGE_QUALITY_LOW"
  | "OCR_PARSE_FAILED"
  | "OCR_PROVIDER_UNAVAILABLE"
  | "OCR_RATE_LIMITED"
  | "OCR_UNKNOWN_FAILED";
type ProductAnalyticsBusinessCardFileSizeBucket =
  | "0_1mb"
  | "1_5mb"
  | "5_10mb"
  | "over_10mb"
  | "unknown";

const BUSINESS_CARD_OCR_FAILURE_CODES: readonly ProductAnalyticsBusinessCardOcrFailureCode[] =
  [
    "IMAGE_QUALITY_LOW",
    "OCR_PARSE_FAILED",
    "OCR_PROVIDER_UNAVAILABLE",
    "OCR_RATE_LIMITED",
    "OCR_UNKNOWN_FAILED",
  ];
const BUSINESS_CARD_FILE_SIZE_BUCKETS: readonly ProductAnalyticsBusinessCardFileSizeBucket[] =
  ["0_1mb", "1_5mb", "5_10mb", "over_10mb", "unknown"];

// 역할 : RecordProductAnalyticsServerEventCommand server 분석 이벤트 저장 요청을 application 계층에 전달합니다.
export interface RecordProductAnalyticsServerEventCommand {
  readonly userId: string;
  readonly authSessionId: string | null;
  readonly requestId: string | null;
  readonly eventName: ProductAnalyticsServerEventName;
  readonly eventVersion?: number;
  readonly occurredAt?: Date;
  readonly timeZone: string;
  readonly idempotencyKey: string;
  readonly targetType: ProductAnalyticsTargetTypeCode;
  readonly targetId?: string | null;
  readonly payload?: Record<string, unknown>;
}

// 역할 : ProductAnalyticsServerEventRecorder 제품 기능 성공 후 server 분석 이벤트를 기록하는 계약입니다.
export interface ProductAnalyticsServerEventRecorder {
  // 기능 : server 분석 이벤트를 allowlist 기준으로 저장합니다.
  recordServerEvent(
    command: RecordProductAnalyticsServerEventCommand
  ): Promise<void>;
}

// 기능 : 테스트와 수동 생성에서 분석 기록 의존성이 없을 때 제품 흐름만 유지합니다.
export const NOOP_PRODUCT_ANALYTICS_EVENT_RECORDER: ProductAnalyticsServerEventRecorder =
  {
    recordServerEvent: () => Promise.resolve(),
  };

const SERVER_EVENT_TARGET_TYPES: ProductAnalyticsEventTargetMap = {
  auth_signup_completed: "USER",
  deal_created: "DEAL",
  deal_next_action_created: "DEAL",
  schedule_created: "SCHEDULE",
  schedule_deal_linked: "SCHEDULE",
  meeting_note_created: "MEETING_NOTE",
  meeting_note_deal_linked: "MEETING_NOTE",
  business_card_scan_confirmed: "BUSINESS_CARD_SCAN",
  business_card_ocr_failed: "BUSINESS_CARD_SCAN",
  import_confirmed: "IMPORT_JOB",
  export_downloaded: "EXPORT",
};

const FORBIDDEN_PAYLOAD_KEY_CODES = new Set([
  "authorization",
  "auth",
  "audio",
  "audiofilename",
  "body",
  "companyname",
  "contactmobile",
  "contactname",
  "dealname",
  "details",
  "email",
  "endpoint",
  "image",
  "imagefilename",
  "meetingbody",
  "memo",
  "mobile",
  "name",
  "ocrtext",
  "password",
  "path",
  "phone",
  "phonenumber",
  "p256dh",
  "privatememo",
  "productname",
  "prompt",
  "providerresponse",
  "providerrawresponse",
  "query",
  "rawresponse",
  "rawtext",
  "transcript",
  "token",
  "url",
  "uuid",
]);

// 역할 : ProductAnalyticsEventRecorder server 분석 이벤트를 검증하고 raw event table에 저장합니다.
@Injectable()
export class ProductAnalyticsEventRecorder
  implements ProductAnalyticsServerEventRecorder
{
  // 기능 : 제품 분석 저장소와 구조화 logger를 주입받습니다.
  constructor(
    @Inject(PRODUCT_ANALYTICS_REPOSITORY)
    private readonly productAnalyticsRepository: ProductAnalyticsRepository,
    private readonly logger: AppLogger
  ) {}

  // 기능 : server 분석 이벤트를 allowlist 기준으로 저장합니다.
  async recordServerEvent(
    command: RecordProductAnalyticsServerEventCommand
  ): Promise<void> {
    try {
      await this.recordServerEventStrict(command);
    } catch (error) {
      // 기능 : 분석 저장 실패는 제품 API 성공 응답을 막지 않기 위해 warning log만 남깁니다.
      this.logRecordFailed(command, error);
    }
  }

  // 기능 : server event 공통 context와 payload를 검증한 뒤 저장소에 위임합니다.
  private async recordServerEventStrict(
    command: RecordProductAnalyticsServerEventCommand
  ): Promise<void> {
    // 1. event 이름, version, target, idempotency key가 09 server 계약에 맞는지 검증한다.
    const eventName = this.normalizeServerEventName(command.eventName);
    const eventVersion = this.normalizeEventVersion(command.eventVersion);
    const idempotencyKey = this.normalizeIdempotencyKey(
      command.idempotencyKey
    );
    const targetType = this.normalizeTargetType(
      eventName,
      command.targetType
    );
    const targetId = this.normalizeTargetId(eventName, command.targetId);

    // 2. event별 payload allowlist와 PII 의심 key를 검증한다.
    const payloadJson = this.normalizeServerPayload(
      eventName,
      command.payload ?? {}
    );

    // 3. session이 있는 server event는 기존 AuthSession에서 authDeviceId를 보강한다.
    const authDeviceId = command.authSessionId
      ? await this.productAnalyticsRepository.findAuthDeviceIdBySessionId(
          command.authSessionId
        )
      : null;

    // 4. 발생 시각과 사용자 timezone 기준 eventDate를 계산한다.
    const occurredAt = command.occurredAt ?? new Date();
    const timeZone = this.normalizeTimeZone(command.timeZone);
    const eventDate = resolveProductAnalyticsEventDate(occurredAt, timeZone);

    // 5. 제품 mutation transaction과 분리된 단일 analytics insert로 저장한다.
    await this.productAnalyticsRepository.createEvent({
      authDeviceId,
      authSessionId: command.authSessionId,
      eventDate,
      eventName,
      eventVersion,
      idempotencyKey,
      occurredAt,
      payloadJson,
      source: "SERVER",
      targetId,
      targetType,
      timeZone,
      userId: command.userId,
    });
  }

  // 기능 : server event 이름이 09 runtime allowlist에 있는지 확인합니다.
  private normalizeServerEventName(
    value: string
  ): ProductAnalyticsServerEventName {
    if (!isProductAnalyticsServerEventName(value)) {
      throw new ProductAnalyticsEventUnsupportedError();
    }

    return value;
  }

  // 기능 : server event payload schema 버전을 09 기본 버전으로 고정합니다.
  private normalizeEventVersion(value: number | undefined): number {
    const version = value ?? PRODUCT_ANALYTICS_EVENT_VERSION;

    if (version !== PRODUCT_ANALYTICS_EVENT_VERSION) {
      throw new ProductAnalyticsEventVersionUnsupportedError();
    }

    return version;
  }

  // 기능 : server event 중복 방지 key가 비어 있지 않은지 확인합니다.
  private normalizeIdempotencyKey(value: string): string {
    const normalized = value.trim();

    if (!normalized) {
      throw new ProductAnalyticsPayloadInvalidError(
        "idempotencyKey is required"
      );
    }

    return normalized;
  }

  // 기능 : event별 target type이 taxonomy 계약과 일치하는지 확인합니다.
  private normalizeTargetType(
    eventName: ProductAnalyticsServerEventName,
    targetType: ProductAnalyticsTargetTypeCode
  ): ProductAnalyticsTargetTypeCode {
    const expectedTargetType = SERVER_EVENT_TARGET_TYPES[eventName];

    if (targetType !== expectedTargetType) {
      throw new ProductAnalyticsPayloadInvalidError("targetType is invalid");
    }

    return targetType;
  }

  // 기능 : export event는 targetId를 비우고 그 외 server event는 대상 UUID 값을 요구합니다.
  private normalizeTargetId(
    eventName: ProductAnalyticsServerEventName,
    targetId: string | null | undefined
  ): string | null {
    if (eventName === "export_downloaded") {
      return null;
    }

    const normalized = targetId?.trim();

    if (!normalized) {
      throw new ProductAnalyticsPayloadInvalidError("targetId is required");
    }

    return normalized;
  }

  // 기능 : event 당시 사용자 timezone이 IANA timezone인지 확인합니다.
  private normalizeTimeZone(timeZone: string): string {
    const normalized = timeZone.trim();

    if (!isValidIanaTimeZone(normalized)) {
      throw new ProductAnalyticsPayloadInvalidError("timeZone is invalid");
    }

    return normalized;
  }

  // 기능 : event 이름에 맞는 server payload allowlist를 적용합니다.
  private normalizeServerPayload(
    eventName: ProductAnalyticsServerEventName,
    payload: Record<string, unknown>
  ): Record<string, unknown> {
    this.assertNoPiiPayloadKey(payload);

    switch (eventName) {
      case "auth_signup_completed":
        return this.normalizeAuthSignupCompletedPayload(payload);
      case "deal_created":
        return this.normalizeDealCreatedPayload(payload);
      case "deal_next_action_created":
        return this.normalizeDealNextActionCreatedPayload(payload);
      case "schedule_created":
        return this.normalizeScheduleCreatedPayload(payload);
      case "schedule_deal_linked":
      case "meeting_note_deal_linked":
        return this.normalizeLinkCreatedPayload(payload);
      case "meeting_note_created":
        return this.normalizeMeetingNoteCreatedPayload(payload);
      case "business_card_scan_confirmed":
        return this.normalizeBusinessCardScanConfirmedPayload(payload);
      case "business_card_ocr_failed":
        return this.normalizeBusinessCardOcrFailedPayload(payload);
      case "import_confirmed":
        return this.normalizeImportConfirmedPayload(payload);
      case "export_downloaded":
        return this.normalizeExportDownloadedPayload(payload);
    }
  }

  // 기능 : 신규 가입 완료 event payload를 안전한 가입 메타데이터로 축소합니다.
  private normalizeAuthSignupCompletedPayload(
    payload: Record<string, unknown>
  ): Record<string, unknown> {
    this.assertOnlyKeys(payload, [
      "provider",
      "locale",
      "countryCode",
      "timeZone",
    ]);

    return {
      provider: this.readString(payload, "provider", ["google", "line", "apple"]),
      locale: this.readString(payload, "locale", ["ko-KR", "en"]),
      countryCode: this.readNullableString(payload, "countryCode", [
        "KR",
        "US",
      ]),
      timeZone: this.readString(payload, "timeZone"),
    };
  }

  // 기능 : 딜 생성 event payload를 단계, 통화, 연결 여부만 남기도록 정규화합니다.
  private normalizeDealCreatedPayload(
    payload: Record<string, unknown>
  ): Record<string, unknown> {
    this.assertOnlyKeys(payload, [
      "dealStatus",
      "currencyCode",
      "hasCompany",
      "hasContact",
      "hasProduct",
    ]);

    return {
      dealStatus: this.readString(payload, "dealStatus", [
        "INITIAL_CONTACT",
        "NEEDS_CHECK",
        "PROPOSAL_QUOTE",
        "NEGOTIATION",
        "WON",
        "LOST",
      ]),
      currencyCode: this.readString(payload, "currencyCode", ["KRW", "USD"]),
      hasCompany: this.readBoolean(payload, "hasCompany"),
      hasContact: this.readBoolean(payload, "hasContact"),
      hasProduct: this.readBoolean(payload, "hasProduct"),
    };
  }

  // 기능 : 다음 행동 생성 event payload를 생성 출처 코드만 남기도록 정규화합니다.
  private normalizeDealNextActionCreatedPayload(
    payload: Record<string, unknown>
  ): Record<string, unknown> {
    this.assertOnlyKeys(payload, ["source"]);

    return {
      source: this.readString(payload, "source", ["deal_create", "manual_log"]),
    };
  }

  // 기능 : 일정 생성 event payload를 출처, 종일 여부, 딜 연결 여부만 남기도록 정규화합니다.
  private normalizeScheduleCreatedPayload(
    payload: Record<string, unknown>
  ): Record<string, unknown> {
    this.assertOnlyKeys(payload, ["sourceType", "isAllDay", "hasDealLink"]);

    return {
      sourceType: this.readString(payload, "sourceType", ["INTERNAL", "GOOGLE"]),
      isAllDay: this.readBoolean(payload, "isAllDay"),
      hasDealLink: this.readBoolean(payload, "hasDealLink"),
    };
  }

  // 기능 : 연결 생성 event payload를 연결 개수 bucket만 남기도록 정규화합니다.
  private normalizeLinkCreatedPayload(
    payload: Record<string, unknown>
  ): Record<string, unknown> {
    this.assertOnlyKeys(payload, ["linkCountBucket"]);

    return {
      linkCountBucket: this.readString(payload, "linkCountBucket", [
        "1",
        "2_3",
        "4_plus",
      ]),
    };
  }

  // 기능 : 회의록 생성 event payload를 출처와 연결 여부만 남기도록 정규화합니다.
  private normalizeMeetingNoteCreatedPayload(
    payload: Record<string, unknown>
  ): Record<string, unknown> {
    this.assertOnlyKeys(payload, ["sourceType", "hasDealLink", "hasAiDraft"]);

    return {
      sourceType: this.readString(payload, "sourceType", [
        "MANUAL",
        "TEXT_AI",
        "STT_AI",
      ]),
      hasDealLink: this.readBoolean(payload, "hasDealLink"),
      hasAiDraft: this.readBoolean(payload, "hasAiDraft"),
    };
  }

  // 기능 : 명함 스캔 확정 event payload를 생성/재사용 결과만 남기도록 정규화합니다.
  private normalizeBusinessCardScanConfirmedPayload(
    payload: Record<string, unknown>
  ): Record<string, unknown> {
    this.assertOnlyKeys(payload, [
      "companyResolution",
      "contactResolution",
      "createdCompany",
      "createdContact",
    ]);

    return {
      companyResolution: this.readString(payload, "companyResolution", [
        "EXISTING",
        "CREATED",
      ]),
      contactResolution: this.readString(payload, "contactResolution", [
        "EXISTING",
        "CREATED",
      ]),
      createdCompany: this.readBoolean(payload, "createdCompany"),
      createdContact: this.readBoolean(payload, "createdContact"),
    };
  }

  // 기능 : 명함 OCR 실패 event payload를 safe code와 비식별 provider 메타데이터로 축소합니다.
  private normalizeBusinessCardOcrFailedPayload(
    payload: Record<string, unknown>
  ): Record<string, unknown> {
    this.assertOnlyKeys(payload, [
      "safeErrorCode",
      "retryable",
      "provider",
      "model",
      "fileSizeBucket",
    ]);

    return {
      safeErrorCode: this.readString(
        payload,
        "safeErrorCode",
        BUSINESS_CARD_OCR_FAILURE_CODES
      ),
      retryable: this.readBoolean(payload, "retryable"),
      provider: this.readString(payload, "provider"),
      model: this.readString(payload, "model"),
      fileSizeBucket: this.readString(
        payload,
        "fileSizeBucket",
        BUSINESS_CARD_FILE_SIZE_BUCKETS
      ),
    };
  }

  // 기능 : import 확정 event payload를 대상 타입과 row count summary만 남기도록 정규화합니다.
  private normalizeImportConfirmedPayload(
    payload: Record<string, unknown>
  ): Record<string, unknown> {
    this.assertOnlyKeys(payload, [
      "importType",
      "rowCountBucket",
      "importedRowCount",
    ]);

    return {
      importType: this.readString(payload, "importType", [
        "COMPANY",
        "CONTACT",
        "PRODUCT",
        "DEAL",
      ]),
      rowCountBucket: this.readString(payload, "rowCountBucket", [
        "1",
        "2_10",
        "11_50",
        "51_200",
        "201_plus",
      ]),
      importedRowCount: this.readPositiveInteger(payload, "importedRowCount"),
    };
  }

  // 기능 : export 다운로드 event payload를 export 타입, row count bucket, locale만 남기도록 정규화합니다.
  private normalizeExportDownloadedPayload(
    payload: Record<string, unknown>
  ): Record<string, unknown> {
    this.assertOnlyKeys(payload, ["exportType", "rowCountBucket", "locale"]);

    return {
      exportType: this.readString(payload, "exportType", [
        "COMPANY",
        "CONTACT",
        "PRODUCT",
        "DEAL",
      ]),
      rowCountBucket: this.readString(payload, "rowCountBucket", [
        "0",
        "1",
        "2_10",
        "11_50",
        "51_200",
        "201_plus",
      ]),
      locale: this.readString(payload, "locale", ["ko-KR", "en"]),
    };
  }

  // 기능 : payload에 허용되지 않은 key가 포함되어 있는지 확인합니다.
  private assertOnlyKeys(
    payload: Record<string, unknown>,
    allowedKeys: readonly string[]
  ): void {
    const invalidKey = Object.keys(payload).find(
      (key) => !allowedKeys.some((allowedKey) => allowedKey === key)
    );

    if (invalidKey) {
      throw new ProductAnalyticsPayloadInvalidError(`${invalidKey} is invalid`);
    }
  }

  // 기능 : payload 문자열 field를 읽고 선택 allowlist를 적용합니다.
  private readString(
    payload: Record<string, unknown>,
    key: string,
    allowedValues?: readonly string[]
  ): string {
    const value = payload[key];

    if (typeof value !== "string" || value.trim().length === 0) {
      throw new ProductAnalyticsPayloadInvalidError(`${key} is invalid`);
    }

    if (allowedValues && !allowedValues.some((item) => item === value)) {
      throw new ProductAnalyticsPayloadInvalidError(`${key} is invalid`);
    }

    return value;
  }

  // 기능 : payload nullable 문자열 field를 읽고 값이 있으면 선택 allowlist를 적용합니다.
  private readNullableString(
    payload: Record<string, unknown>,
    key: string,
    allowedValues: readonly string[]
  ): string | null {
    const value = payload[key] ?? null;

    if (value === null) {
      return null;
    }

    if (typeof value !== "string") {
      throw new ProductAnalyticsPayloadInvalidError(`${key} is invalid`);
    }

    if (!allowedValues.some((item) => item === value)) {
      throw new ProductAnalyticsPayloadInvalidError(`${key} is invalid`);
    }

    return value;
  }

  // 기능 : payload boolean field를 읽고 타입을 검증합니다.
  private readBoolean(payload: Record<string, unknown>, key: string): boolean {
    const value = payload[key];

    if (typeof value !== "boolean") {
      throw new ProductAnalyticsPayloadInvalidError(`${key} is invalid`);
    }

    return value;
  }

  // 기능 : payload 양의 정수 field를 읽고 타입과 범위를 검증합니다.
  private readPositiveInteger(
    payload: Record<string, unknown>,
    key: string
  ): number {
    const value = payload[key];

    if (!Number.isInteger(value) || typeof value !== "number" || value < 1) {
      throw new ProductAnalyticsPayloadInvalidError(`${key} is invalid`);
    }

    return value;
  }

  // 기능 : payload 안에 PII 또는 raw text 의심 key가 있는지 재귀적으로 검사합니다.
  private assertNoPiiPayloadKey(payload: Record<string, unknown>): void {
    if (this.hasPiiPayloadKey(payload)) {
      throw new ProductAnalyticsPayloadPiiRejectedError();
    }
  }

  // 기능 : unknown JSON 값에서 민감정보 의심 key를 탐색합니다.
  private hasPiiPayloadKey(value: unknown): boolean {
    if (Array.isArray(value)) {
      return value.some((item) => this.hasPiiPayloadKey(item));
    }

    if (!this.isJsonObject(value)) {
      return false;
    }

    return Object.entries(value).some(
      ([key, childValue]) =>
        FORBIDDEN_PAYLOAD_KEY_CODES.has(this.toPayloadKeyCode(key)) ||
        this.hasPiiPayloadKey(childValue)
    );
  }

  // 기능 : unknown 값이 순회 가능한 JSON object인지 확인합니다.
  private isJsonObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  // 기능 : payload key 비교에서 대소문자와 구분 기호 차이를 제거합니다.
  private toPayloadKeyCode(key: string): string {
    return key.replace(/[-_]/g, "").toLowerCase();
  }

  // 기능 : server event 기록 실패를 payload 없이 구조화 로그로 남깁니다.
  private logRecordFailed(
    command: RecordProductAnalyticsServerEventCommand,
    error: unknown
  ): void {
    this.logger.warn(
      JSON.stringify(createProductAnalyticsRecordFailedLog(command, error)),
      "ProductAnalyticsEventRecorder"
    );
  }
}

// 기능 : analytics recorder 호출 실패가 제품 API 응답을 막지 않도록 보호합니다.
export async function recordProductAnalyticsServerEventBestEffort(input: {
  readonly recorder: ProductAnalyticsServerEventRecorder;
  readonly logger: AppLogger | undefined;
  readonly command: RecordProductAnalyticsServerEventCommand;
  readonly logContext: string;
}): Promise<void> {
  try {
    await input.recorder.recordServerEvent(input.command);
  } catch (error) {
    // 기능 : 분석 저장 실패는 제품 API 성공 응답을 막지 않기 위해 warning log만 남깁니다.
    input.logger?.warn(
      JSON.stringify(createProductAnalyticsRecordFailedLog(input.command, error)),
      input.logContext
    );
  }
}

// 기능 : 일정/회의록 연결 event에서 전체 연결 개수를 안전한 bucket으로 변환합니다.
export function toProductAnalyticsLinkCountBucket(
  linkCount: number
): ProductAnalyticsLinkCountBucket {
  if (linkCount <= 1) {
    return "1";
  }

  if (linkCount <= 3) {
    return "2_3";
  }

  return "4_plus";
}

// 기능 : import 확정 row 수를 안전한 분석 bucket으로 변환합니다.
export function toProductAnalyticsImportRowCountBucket(
  rowCount: number
): ProductAnalyticsImportRowCountBucket {
  if (rowCount <= 1) {
    return "1";
  }

  if (rowCount <= 10) {
    return "2_10";
  }

  if (rowCount <= 50) {
    return "11_50";
  }

  if (rowCount <= 200) {
    return "51_200";
  }

  return "201_plus";
}

// 기능 : export row 수를 안전한 분석 bucket으로 변환합니다.
export function toProductAnalyticsExportRowCountBucket(
  rowCount: number
): ProductAnalyticsExportRowCountBucket {
  if (rowCount <= 0) {
    return "0";
  }

  return toProductAnalyticsImportRowCountBucket(rowCount);
}

// 기능 : server event 실패 로그에서 payload 원문을 제외한 추적 context만 만듭니다.
function createProductAnalyticsRecordFailedLog(
  command: RecordProductAnalyticsServerEventCommand,
  error: unknown
): Record<string, unknown> {
  return {
    event: "analytics.event.recordFailed",
    userId: command.userId,
    authSessionId: command.authSessionId,
    requestId: command.requestId,
    eventName: command.eventName,
    targetType: command.targetType,
    targetId: command.targetId ?? null,
    errorName: toProductAnalyticsErrorName(error),
  };
}

// 기능 : unknown 오류에서 안전한 오류 이름만 추출합니다.
function toProductAnalyticsErrorName(error: unknown): string {
  if (error instanceof Error) {
    return error.name;
  }

  return "UnknownError";
}
