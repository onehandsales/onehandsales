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

type ProductAnalyticsPositiveRowCountBucket =
  | "1"
  | "2_10"
  | "11_50"
  | "51_200"
  | "201_plus";
type ProductAnalyticsExportRowCountBucket =
  | "0"
  | ProductAnalyticsPositiveRowCountBucket;

// ??븷 : RecordProductAnalyticsServerEventCommand server 遺꾩꽍 ?대깽??????붿껌??application 怨꾩링???꾨떖?⑸땲??
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

// ??븷 : ProductAnalyticsServerEventRecorder ?쒗뭹 湲곕뒫 ?깃났 ??server 遺꾩꽍 ?대깽?몃? 湲곕줉?섎뒗 怨꾩빟?낅땲??
export interface ProductAnalyticsServerEventRecorder {
  // 湲곕뒫 : server 遺꾩꽍 ?대깽?몃? allowlist 湲곗??쇰줈 ??ν빀?덈떎.
  recordServerEvent(
    command: RecordProductAnalyticsServerEventCommand
  ): Promise<void>;
}

// 湲곕뒫 : ?뚯뒪?몄? ?섎룞 ?앹꽦?먯꽌 遺꾩꽍 湲곕줉 ?섏〈?깆씠 ?놁쓣 ???쒗뭹 ?먮쫫留??좎??⑸땲??
export const NOOP_PRODUCT_ANALYTICS_EVENT_RECORDER: ProductAnalyticsServerEventRecorder =
  {
    recordServerEvent: () => Promise.resolve(),
  };

const SERVER_EVENT_TARGET_TYPES: ProductAnalyticsEventTargetMap = {
  auth_signup_completed: "USER",
  deal_created: "DEAL",
  deal_next_action_created: "DEAL",
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

// ??븷 : ProductAnalyticsEventRecorder server 遺꾩꽍 ?대깽?몃? 寃利앺븯怨?raw event table????ν빀?덈떎.
@Injectable()
export class ProductAnalyticsEventRecorder
  implements ProductAnalyticsServerEventRecorder
{
  // 湲곕뒫 : ?쒗뭹 遺꾩꽍 ??μ냼? 援ъ“??logger瑜?二쇱엯諛쏆뒿?덈떎.
  constructor(
    @Inject(PRODUCT_ANALYTICS_REPOSITORY)
    private readonly productAnalyticsRepository: ProductAnalyticsRepository,
    private readonly logger: AppLogger
  ) {}

  // 湲곕뒫 : server 遺꾩꽍 ?대깽?몃? allowlist 湲곗??쇰줈 ??ν빀?덈떎.
  async recordServerEvent(
    command: RecordProductAnalyticsServerEventCommand
  ): Promise<void> {
    try {
      await this.recordServerEventStrict(command);
    } catch (error) {
      // 湲곕뒫 : 遺꾩꽍 ????ㅽ뙣???쒗뭹 API ?깃났 ?묐떟??留됱? ?딄린 ?꾪빐 warning log留??④퉩?덈떎.
      this.logRecordFailed(command, error);
    }
  }

  // 湲곕뒫 : server event 怨듯넻 context? payload瑜?寃利앺븳 ????μ냼???꾩엫?⑸땲??
  private async recordServerEventStrict(
    command: RecordProductAnalyticsServerEventCommand
  ): Promise<void> {
    // 1. event ?대쫫, version, target, idempotency key媛 09 server 怨꾩빟??留욌뒗吏 寃利앺븳??
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

    // 2. event蹂?payload allowlist? PII ?섏떖 key瑜?寃利앺븳??
    const payloadJson = this.normalizeServerPayload(
      eventName,
      command.payload ?? {}
    );

    // 3. session???덈뒗 server event??湲곗〈 AuthSession?먯꽌 authDeviceId瑜?蹂닿컯?쒕떎.
    const authDeviceId = command.authSessionId
      ? await this.productAnalyticsRepository.findAuthDeviceIdBySessionId(
          command.authSessionId
        )
      : null;

    // 4. 諛쒖깮 ?쒓컖怨??ъ슜??timezone 湲곗? eventDate瑜?怨꾩궛?쒕떎.
    const occurredAt = command.occurredAt ?? new Date();
    const timeZone = this.normalizeTimeZone(command.timeZone);
    const eventDate = resolveProductAnalyticsEventDate(occurredAt, timeZone);

    // 5. ?쒗뭹 mutation transaction怨?遺꾨━???⑥씪 analytics insert濡???ν븳??
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

  // 湲곕뒫 : server event ?대쫫??09 runtime allowlist???덈뒗吏 ?뺤씤?⑸땲??
  private normalizeServerEventName(
    value: string
  ): ProductAnalyticsServerEventName {
    if (!isProductAnalyticsServerEventName(value)) {
      throw new ProductAnalyticsEventUnsupportedError();
    }

    return value;
  }

  // 湲곕뒫 : server event payload schema 踰꾩쟾??09 湲곕낯 踰꾩쟾?쇰줈 怨좎젙?⑸땲??
  private normalizeEventVersion(value: number | undefined): number {
    const version = value ?? PRODUCT_ANALYTICS_EVENT_VERSION;

    if (version !== PRODUCT_ANALYTICS_EVENT_VERSION) {
      throw new ProductAnalyticsEventVersionUnsupportedError();
    }

    return version;
  }

  // 湲곕뒫 : server event 以묐났 諛⑹? key媛 鍮꾩뼱 ?덉? ?딆?吏 ?뺤씤?⑸땲??
  private normalizeIdempotencyKey(value: string): string {
    const normalized = value.trim();

    if (!normalized) {
      throw new ProductAnalyticsPayloadInvalidError(
        "idempotencyKey is required"
      );
    }

    return normalized;
  }

  // 湲곕뒫 : event蹂?target type??taxonomy 怨꾩빟怨??쇱튂?섎뒗吏 ?뺤씤?⑸땲??
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

  // 湲곕뒫 : export event??targetId瑜?鍮꾩슦怨?洹???server event?????UUID 媛믪쓣 ?붽뎄?⑸땲??
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

  // 湲곕뒫 : event ?뱀떆 ?ъ슜??timezone??IANA timezone?몄? ?뺤씤?⑸땲??
  private normalizeTimeZone(timeZone: string): string {
    const normalized = timeZone.trim();

    if (!isValidIanaTimeZone(normalized)) {
      throw new ProductAnalyticsPayloadInvalidError("timeZone is invalid");
    }

    return normalized;
  }

  // 湲곕뒫 : event ?대쫫??留욌뒗 server payload allowlist瑜??곸슜?⑸땲??
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
      case "export_downloaded":
        return this.normalizeExportDownloadedPayload(payload);
    }
  }

  // 湲곕뒫 : ?좉퇋 媛???꾨즺 event payload瑜??덉쟾??媛??硫뷀??곗씠?곕줈 異뺤냼?⑸땲??
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

  // 湲곕뒫 : ???앹꽦 event payload瑜??④퀎, ?듯솕, ?곌껐 ?щ?留??④린?꾨줉 ?뺢퇋?뷀빀?덈떎.
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

  // 湲곕뒫 : ?ㅼ쓬 ?됰룞 ?앹꽦 event payload瑜??앹꽦 異쒖쿂 肄붾뱶留??④린?꾨줉 ?뺢퇋?뷀빀?덈떎.
  private normalizeDealNextActionCreatedPayload(
    payload: Record<string, unknown>
  ): Record<string, unknown> {
    this.assertOnlyKeys(payload, ["source"]);

    return {
      source: this.readString(payload, "source", ["deal_create", "manual_log"]),
    };
  }

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

  // 湲곕뒫 : payload???덉슜?섏? ?딆? key媛 ?ы븿?섏뼱 ?덈뒗吏 ?뺤씤?⑸땲??
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

  // 湲곕뒫 : payload 臾몄옄??field瑜??쎄퀬 ?좏깮 allowlist瑜??곸슜?⑸땲??
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

  // 湲곕뒫 : payload nullable 臾몄옄??field瑜??쎄퀬 媛믪씠 ?덉쑝硫??좏깮 allowlist瑜??곸슜?⑸땲??
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

  // 湲곕뒫 : payload boolean field瑜??쎄퀬 ??낆쓣 寃利앺빀?덈떎.
  private readBoolean(payload: Record<string, unknown>, key: string): boolean {
    const value = payload[key];

    if (typeof value !== "boolean") {
      throw new ProductAnalyticsPayloadInvalidError(`${key} is invalid`);
    }

    return value;
  }

  // 湲곕뒫 : payload ?묒쓽 ?뺤닔 field瑜??쎄퀬 ??낃낵 踰붿쐞瑜?寃利앺빀?덈떎.
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

  // 湲곕뒫 : payload ?덉뿉 PII ?먮뒗 raw text ?섏떖 key媛 ?덈뒗吏 ?ш??곸쑝濡?寃?ы빀?덈떎.
  private assertNoPiiPayloadKey(payload: Record<string, unknown>): void {
    if (this.hasPiiPayloadKey(payload)) {
      throw new ProductAnalyticsPayloadPiiRejectedError();
    }
  }

  // 湲곕뒫 : unknown JSON 媛믪뿉??誘쇨컧?뺣낫 ?섏떖 key瑜??먯깋?⑸땲??
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

  // 湲곕뒫 : unknown 媛믪씠 ?쒗쉶 媛?ν븳 JSON object?몄? ?뺤씤?⑸땲??
  private isJsonObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  // 湲곕뒫 : payload key 鍮꾧탳?먯꽌 ??뚮Ц?먯? 援щ텇 湲고샇 李⑥씠瑜??쒓굅?⑸땲??
  private toPayloadKeyCode(key: string): string {
    return key.replace(/[-_]/g, "").toLowerCase();
  }

  // 湲곕뒫 : server event 湲곕줉 ?ㅽ뙣瑜?payload ?놁씠 援ъ“??濡쒓렇濡??④퉩?덈떎.
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

// 湲곕뒫 : analytics recorder ?몄텧 ?ㅽ뙣媛 ?쒗뭹 API ?묐떟??留됱? ?딅룄濡?蹂댄샇?⑸땲??
export async function recordProductAnalyticsServerEventBestEffort(input: {
  readonly recorder: ProductAnalyticsServerEventRecorder;
  readonly logger: AppLogger | undefined;
  readonly command: RecordProductAnalyticsServerEventCommand;
  readonly logContext: string;
}): Promise<void> {
  try {
    await input.recorder.recordServerEvent(input.command);
  } catch (error) {
    // 湲곕뒫 : 遺꾩꽍 ????ㅽ뙣???쒗뭹 API ?깃났 ?묐떟??留됱? ?딄린 ?꾪빐 warning log留??④퉩?덈떎.
    input.logger?.warn(
      JSON.stringify(createProductAnalyticsRecordFailedLog(input.command, error)),
      input.logContext
    );
  }
}

function toProductAnalyticsPositiveRowCountBucket(
  rowCount: number
): ProductAnalyticsPositiveRowCountBucket {
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

// 湲곕뒫 : export row ?섎? ?덉쟾??遺꾩꽍 bucket?쇰줈 蹂?섑빀?덈떎.
export function toProductAnalyticsExportRowCountBucket(
  rowCount: number
): ProductAnalyticsExportRowCountBucket {
  if (rowCount <= 0) {
    return "0";
  }

  return toProductAnalyticsPositiveRowCountBucket(rowCount);
}

// 湲곕뒫 : server event ?ㅽ뙣 濡쒓렇?먯꽌 payload ?먮Ц???쒖쇅??異붿쟻 context留?留뚮벊?덈떎.
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

// 湲곕뒫 : unknown ?ㅻ쪟?먯꽌 ?덉쟾???ㅻ쪟 ?대쫫留?異붿텧?⑸땲??
function toProductAnalyticsErrorName(error: unknown): string {
  if (error instanceof Error) {
    return error.name;
  }

  return "UnknownError";
}
