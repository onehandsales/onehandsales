import { Inject, Injectable } from "@nestjs/common";
import {
  PRODUCT_ANALYTICS_REPOSITORY,
  type CreateProductAnalyticsEventInput,
  type ProductAnalyticsRepository,
} from "@/modules/analytics/application/ports/product-analytics.repository";
import { resolveProductAnalyticsEventDate } from "@/modules/analytics/application/services/product-analytics-date";
import {
  PRODUCT_ANALYTICS_EVENT_VERSION,
  type ProductAnalyticsAppRouteKey,
  type ProductAnalyticsClientEventName,
  type ProductAnalyticsRouteViewSurface,
  isProductAnalyticsAppRouteKey,
  isProductAnalyticsClientEventName,
  isProductAnalyticsRouteViewSurface,
} from "@/modules/analytics/domain/product-analytics-event-taxonomy";
import {
  ProductAnalyticsEventUnsupportedError,
  ProductAnalyticsEventVersionUnsupportedError,
  ProductAnalyticsPayloadInvalidError,
  ProductAnalyticsPayloadPiiRejectedError,
  ProductAnalyticsRouteKeyUnsupportedError,
} from "@/modules/analytics/domain/product-analytics.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const FORBIDDEN_CLIENT_REQUEST_FIELDS = [
  "userId",
  "organizationId",
  "authSessionId",
  "authDeviceId",
  "deviceId",
  "eventDate",
  "timeZone",
  "source",
  "idempotencyKey",
] as const;

const APP_ROUTE_VIEWED_PAYLOAD_KEYS = ["routeKey", "surface"] as const;

const FORBIDDEN_PAYLOAD_KEY_CODES = new Set([
  "authorization",
  "auth",
  "audio",
  "audiofilename",
  "body",
  "companyname",
  "contactmobile",
  "contactname",
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
  "prompt",
  "providerresponse",
  "providerrawresponse",
  "query",
  "rawresponse",
  "rawtext",
  "transcript",
  "rawurl",
  "token",
  "url",
  "uuid",
]);

// ??븷 : CollectClientAnalyticsEventCommand client 遺꾩꽍 ?대깽???섏쭛 ?붿껌??application 怨꾩링???꾨떖?⑸땲??
export interface CollectClientAnalyticsEventCommand {
  readonly currentUser: CurrentUserContext;
  readonly eventName: unknown;
  readonly eventVersion: unknown;
  readonly occurredAt?: unknown;
  readonly payload: unknown;
  readonly requestFieldNames: readonly string[];
  readonly requestId: string;
  readonly targetId?: unknown;
  readonly targetType?: unknown;
}

// ??븷 : CollectProductAnalyticsEventResponse client event ?섏쭛 ?깃났 ?묐떟???뺤쓽?⑸땲??
export interface CollectProductAnalyticsEventResponse {
  readonly accepted: true;
}

// ??븷 : AppRouteViewedPayload app route view event?????媛?ν븳 payload瑜??뺤쓽?⑸땲??
interface AppRouteViewedPayload extends Record<string, unknown> {
  readonly routeKey: ProductAnalyticsAppRouteKey;
  readonly surface?: ProductAnalyticsRouteViewSurface;
}

interface ProductAnalyticsClientTarget {
  readonly targetId: null;
  readonly targetType: null;
}

// ??븷 : CollectClientAnalyticsEventUseCase client 遺꾩꽍 ?대깽?몃? 寃利앺븯怨???ν븯??application use case?낅땲??
@Injectable()
export class CollectClientAnalyticsEventUseCase {
  // 湲곕뒫 : ?쒗뭹 遺꾩꽍 ??μ냼? 援ъ“??logger瑜?二쇱엯諛쏆뒿?덈떎.
  constructor(
    @Inject(PRODUCT_ANALYTICS_REPOSITORY)
    private readonly productAnalyticsRepository: ProductAnalyticsRepository,
    private readonly logger: AppLogger
  ) {}

  // 湲곕뒫 : User Web client event瑜?allowlist 湲곗??쇰줈 寃利앺븯怨???ν빀?덈떎.
  async execute(
    command: CollectClientAnalyticsEventCommand
  ): Promise<CollectProductAnalyticsEventResponse> {
    // 1. client媛 蹂대궪 ???녿뒗 ?몄쬆/異쒖쿂/?쒕쾭 ?곗텧 field瑜?癒쇱? 李⑤떒?쒕떎.
    this.assertNoForbiddenRequestField(command.requestFieldNames);

    // 2. event ?대쫫怨?payload schema 踰꾩쟾??09 client allowlist?몄? 寃利앺븳??
    const eventName = this.normalizeClientEventName(command.eventName);
    const eventVersion = this.normalizeEventVersion(command.eventVersion);

    // 3. event蹂?payload allowlist? PII ?섏떖 key瑜?寃利앺븳??
    const payloadJson = this.normalizePayload(eventName, command.payload);
    const occurredAt = this.normalizeOccurredAt(command.occurredAt);
    const target = this.normalizeClientTarget(
      eventName,
      command.targetType,
      command.targetId
    );

    // 4. ?꾩옱 app session?먯꽌 authDeviceId瑜?蹂닿컯?섍퀬, ?몄뀡 row媛 ?놁쑝硫?null濡?怨꾩냽 ??ν븳??
    const authDeviceId =
      await this.productAnalyticsRepository.findAuthDeviceIdBySessionId(
        command.currentUser.sessionId
      );

    // 5. event 諛쒖깮 ?쒓컖怨??ъ슜??timezone 湲곗? date-only 媛믪쓣 留뚮뱺??
    const eventDate = resolveProductAnalyticsEventDate(
      occurredAt,
      command.currentUser.timeZone
    );

    // 6. Backend媛 梨꾩슫 ?덉쟾??context? allowlist payload留?raw event table????ν븳??
    await this.createEvent({
      authDeviceId,
      authSessionId: command.currentUser.sessionId,
      eventDate,
      eventName,
      eventVersion,
      idempotencyKey: null,
      occurredAt,
      payloadJson,
      source: "CLIENT",
      targetId: target.targetId,
      targetType: target.targetType,
      timeZone: command.currentUser.timeZone,
      userId: command.currentUser.id,
    }, command.requestId);

    return { accepted: true };
  }

  // 湲곕뒫 : client request body??湲덉? field媛 ?ы븿?먮뒗吏 ?뺤씤?⑸땲??
  private assertNoForbiddenRequestField(fieldNames: readonly string[]): void {
    const forbiddenField = fieldNames.find((fieldName) =>
      FORBIDDEN_CLIENT_REQUEST_FIELDS.some((item) => item === fieldName)
    );

    if (forbiddenField) {
      throw new ProductAnalyticsPayloadInvalidError(
        `${forbiddenField} is not allowed`
      );
    }
  }

  // 湲곕뒫 : client event ?대쫫??09 allowlist ?덉뿉 ?덈뒗吏 ?뺤씤?⑸땲??
  private normalizeClientEventName(
    value: unknown
  ): ProductAnalyticsClientEventName {
    if (typeof value !== "string" || !isProductAnalyticsClientEventName(value)) {
      throw new ProductAnalyticsEventUnsupportedError();
    }

    return value;
  }

  // 湲곕뒫 : client event payload schema 踰꾩쟾??09 湲곕낯 踰꾩쟾?몄? ?뺤씤?⑸땲??
  private normalizeEventVersion(value: unknown): number {
    if (value !== PRODUCT_ANALYTICS_EVENT_VERSION) {
      throw new ProductAnalyticsEventVersionUnsupportedError();
    }

    return value;
  }

  // 湲곕뒫 : client媛 ?좏깮?곸쑝濡?蹂대궦 諛쒖깮 ?쒓컖???좏슚??Date濡?蹂?섑븯怨? ?놁쑝硫??쒕쾭 ?쒓컖???ъ슜?⑸땲??
  private normalizeOccurredAt(value: unknown): Date {
    if (value === undefined) {
      return new Date();
    }

    if (typeof value !== "string") {
      throw new ProductAnalyticsPayloadInvalidError("occurredAt is invalid");
    }

    const occurredAt = new Date(value);

    if (Number.isNaN(occurredAt.getTime())) {
      throw new ProductAnalyticsPayloadInvalidError("occurredAt is invalid");
    }

    return occurredAt;
  }

  // Feature: route analytics does not accept client-provided target data.
  private normalizeClientTarget(
    _eventName: ProductAnalyticsClientEventName,
    targetType: unknown,
    targetId: unknown
  ): ProductAnalyticsClientTarget {
    if (targetType === undefined && targetId === undefined) {
      return { targetId: null, targetType: null };
    }

    throw new ProductAnalyticsPayloadInvalidError("targetType is invalid");
  }

  // 湲곕뒫 : event ?대쫫??留욌뒗 payload schema allowlist瑜??곸슜?⑸땲??
  private normalizePayload(
    eventName: ProductAnalyticsClientEventName,
    payload: unknown
  ): Record<string, unknown> {
    const payloadRecord = this.toPayloadRecord(payload);
    this.assertNoPiiPayloadKey(payloadRecord);

    switch (eventName) {
      case "app_route_viewed":
        return this.normalizeAppRouteViewedPayload(payloadRecord);
    }
  }

  // 湲곕뒫 : unknown payload 媛믪쓣 JSON object ?뺥깭濡?寃利앺빀?덈떎.
  private toPayloadRecord(payload: unknown): Record<string, unknown> {
    if (
      typeof payload !== "object" ||
      payload === null ||
      Array.isArray(payload)
    ) {
      throw new ProductAnalyticsPayloadInvalidError();
    }

    return payload as Record<string, unknown>;
  }

  // 湲곕뒫 : app_route_viewed payload??routeKey? surface瑜?allowlist濡??뺢퇋?뷀빀?덈떎.
  private normalizeAppRouteViewedPayload(
    payload: Record<string, unknown>
  ): AppRouteViewedPayload {
    this.assertOnlyAppRouteViewedPayloadKeys(payload);

    const routeKey = payload["routeKey"];
    const surface = payload["surface"];

    if (typeof routeKey !== "string") {
      throw new ProductAnalyticsPayloadInvalidError("routeKey is required");
    }

    if (!isProductAnalyticsAppRouteKey(routeKey)) {
      throw new ProductAnalyticsRouteKeyUnsupportedError();
    }

    if (surface === undefined) {
      return { routeKey };
    }

    if (
      typeof surface !== "string" ||
      !isProductAnalyticsRouteViewSurface(surface)
    ) {
      throw new ProductAnalyticsPayloadInvalidError("surface is invalid");
    }

    return { routeKey, surface };
  }
  private assertOnlyAppRouteViewedPayloadKeys(
    payload: Record<string, unknown>
  ): void {
    const invalidKey = Object.keys(payload).find(
      (key) => !APP_ROUTE_VIEWED_PAYLOAD_KEYS.some((item) => item === key)
    );

    if (invalidKey) {
      throw new ProductAnalyticsPayloadInvalidError(`${invalidKey} is invalid`);
    }
  }

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

  // 湲곕뒫 : repository ????ㅽ뙣瑜?payload ?놁씠 湲곕줉?섍퀬 湲곗〈 ?덉쇅瑜??좎??⑸땲??
  private async createEvent(
    input: CreateProductAnalyticsEventInput,
    requestId: string
  ): Promise<void> {
    try {
      await this.productAnalyticsRepository.createEvent(input);
    } catch (error) {
      this.logCollectFailed(input, requestId, error);
      throw error;
    }
  }

  // 湲곕뒫 : client event ?섏쭛 ?ㅽ뙣瑜?PII ?녿뒗 援ъ“??濡쒓렇濡?湲곕줉?⑸땲??
  private logCollectFailed(
    input: CreateProductAnalyticsEventInput,
    requestId: string,
    error: unknown
  ): void {
    this.logger.warn(
      JSON.stringify({
        event: "analytics.event.collectFailed",
        userId: input.userId,
        authSessionId: input.authSessionId,
        authDeviceId: input.authDeviceId,
        eventName: input.eventName,
        requestId,
        errorName: this.toErrorName(error),
      }),
      "CollectClientAnalyticsEventUseCase"
    );
  }

  // 湲곕뒫 : unknown ?ㅻ쪟?먯꽌 ?덉쟾???ㅻ쪟 ?대쫫留?異붿텧?⑸땲??
  private toErrorName(error: unknown): string {
    if (error instanceof Error) {
      return error.name;
    }

    return "UnknownError";
  }
}
