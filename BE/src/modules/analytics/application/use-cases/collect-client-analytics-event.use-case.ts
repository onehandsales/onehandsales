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
  type ProductAnalyticsTargetTypeCode,
  isProductAnalyticsAppRouteKey,
  isProductAnalyticsClientEventName,
  isProductAnalyticsRouteViewSurface,
  isProductAnalyticsTargetTypeCode,
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
const MEETING_NOTE_RECORDING_STARTED_PAYLOAD_KEYS = ["entryPoint"] as const;
const MEETING_NOTE_RECORDING_COMPLETED_PAYLOAD_KEYS = [
  "durationBucket",
] as const;
const MEETING_NOTE_RECORDING_FAILED_PAYLOAD_KEYS = ["reason"] as const;
const LOCAL_DRAFT_SAVED_PAYLOAD_KEYS = ["draftType"] as const;
const LOCAL_DRAFT_RESTORED_PAYLOAD_KEYS = ["draftType"] as const;
const LOCAL_DRAFT_DISCARDED_PAYLOAD_KEYS = ["draftType", "reason"] as const;

const CLIENT_TARGET_TYPE_CODES = [
  "USER",
  "MEETING_NOTE",
] as const satisfies readonly ProductAnalyticsTargetTypeCode[];
const CLIENT_EVENT_TARGET_TYPE_CODES: Partial<
  Record<ProductAnalyticsClientEventName, readonly ProductAnalyticsTargetTypeCode[]>
> = {
  local_draft_discarded: ["USER"],
  local_draft_restored: ["USER"],
  local_draft_saved: ["USER"],
  meeting_note_recording_completed: ["MEETING_NOTE"],
  meeting_note_recording_failed: ["MEETING_NOTE"],
  meeting_note_recording_started: ["MEETING_NOTE"],
};
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

// 역할 : CollectClientAnalyticsEventCommand client 분석 이벤트 수집 요청을 application 계층에 전달합니다.
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

// 역할 : CollectProductAnalyticsEventResponse client event 수집 성공 응답을 정의합니다.
export interface CollectProductAnalyticsEventResponse {
  readonly accepted: true;
}

// 역할 : AppRouteViewedPayload app route view event의 저장 가능한 payload를 정의합니다.
interface AppRouteViewedPayload extends Record<string, unknown> {
  readonly routeKey: ProductAnalyticsAppRouteKey;
  readonly surface?: ProductAnalyticsRouteViewSurface;
}

interface MeetingNoteRecordingStartedPayload extends Record<string, unknown> {
  readonly entryPoint: "meeting_note_create";
}

// 역할 : MeetingNoteRecordingCompletedPayload 회의록 녹음 완료 payload를 정의합니다.
interface MeetingNoteRecordingCompletedPayload extends Record<string, unknown> {
  readonly durationBucket: "under_1m" | "1m_5m" | "5m_15m" | "over_15m";
}

// 역할 : MeetingNoteRecordingFailedPayload 회의록 녹음 실패 payload를 정의합니다.
interface MeetingNoteRecordingFailedPayload extends Record<string, unknown> {
  readonly reason: "permission_denied" | "unsupported" | "interrupted" | "unknown";
}

// 역할 : LocalDraftBasePayload local draft 공통 payload를 정의합니다.
interface LocalDraftBasePayload extends Record<string, unknown> {
  readonly draftType: "meeting_note_create";
}

// 역할 : LocalDraftDiscardedPayload local draft 폐기 payload를 정의합니다.
interface LocalDraftDiscardedPayload extends LocalDraftBasePayload {
  readonly reason: "user_discarded" | "expired" | "saved";
}

interface ProductAnalyticsClientTarget {
  readonly targetId: string | null;
  readonly targetType: ProductAnalyticsTargetTypeCode | null;
}

// 역할 : CollectClientAnalyticsEventUseCase client 분석 이벤트를 검증하고 저장하는 application use case입니다.
@Injectable()
export class CollectClientAnalyticsEventUseCase {
  // 기능 : 제품 분석 저장소와 구조화 logger를 주입받습니다.
  constructor(
    @Inject(PRODUCT_ANALYTICS_REPOSITORY)
    private readonly productAnalyticsRepository: ProductAnalyticsRepository,
    private readonly logger: AppLogger
  ) {}

  // 기능 : User Web client event를 allowlist 기준으로 검증하고 저장합니다.
  async execute(
    command: CollectClientAnalyticsEventCommand
  ): Promise<CollectProductAnalyticsEventResponse> {
    // 1. client가 보낼 수 없는 인증/출처/서버 산출 field를 먼저 차단한다.
    this.assertNoForbiddenRequestField(command.requestFieldNames);

    // 2. event 이름과 payload schema 버전이 09 client allowlist인지 검증한다.
    const eventName = this.normalizeClientEventName(command.eventName);
    const eventVersion = this.normalizeEventVersion(command.eventVersion);

    // 3. event별 payload allowlist와 PII 의심 key를 검증한다.
    const payloadJson = this.normalizePayload(eventName, command.payload);
    const occurredAt = this.normalizeOccurredAt(command.occurredAt);
    const target = this.normalizeClientTarget(
      eventName,
      command.targetType,
      command.targetId
    );

    // 4. 현재 app session에서 authDeviceId를 보강하고, 세션 row가 없으면 null로 계속 저장한다.
    const authDeviceId =
      await this.productAnalyticsRepository.findAuthDeviceIdBySessionId(
        command.currentUser.sessionId
      );

    // 5. event 발생 시각과 사용자 timezone 기준 date-only 값을 만든다.
    const eventDate = resolveProductAnalyticsEventDate(
      occurredAt,
      command.currentUser.timeZone
    );

    // 6. Backend가 채운 안전한 context와 allowlist payload만 raw event table에 저장한다.
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

  // 기능 : client request body에 금지 field가 포함됐는지 확인합니다.
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

  // 기능 : client event 이름이 09 allowlist 안에 있는지 확인합니다.
  private normalizeClientEventName(
    value: unknown
  ): ProductAnalyticsClientEventName {
    if (typeof value !== "string" || !isProductAnalyticsClientEventName(value)) {
      throw new ProductAnalyticsEventUnsupportedError();
    }

    return value;
  }

  // 기능 : client event payload schema 버전이 09 기본 버전인지 확인합니다.
  private normalizeEventVersion(value: unknown): number {
    if (value !== PRODUCT_ANALYTICS_EVENT_VERSION) {
      throw new ProductAnalyticsEventVersionUnsupportedError();
    }

    return value;
  }

  // 기능 : client가 선택적으로 보낸 발생 시각을 유효한 Date로 변환하고, 없으면 서버 시각을 사용합니다.
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

  // Feature: client targets are limited to USER and MEETING_NOTE.
  private normalizeClientTarget(
    eventName: ProductAnalyticsClientEventName,
    targetType: unknown,
    targetId: unknown
  ): ProductAnalyticsClientTarget {
    if (targetType === undefined && targetId === undefined) {
      return { targetId: null, targetType: null };
    }

    if (targetType === undefined) {
      throw new ProductAnalyticsPayloadInvalidError("targetType is required");
    }

    if (
      typeof targetType !== "string" ||
      !isProductAnalyticsTargetTypeCode(targetType) ||
      !CLIENT_TARGET_TYPE_CODES.some((item) => item === targetType)
    ) {
      throw new ProductAnalyticsPayloadInvalidError("targetType is invalid");
    }

    const expectedTargetTypes = CLIENT_EVENT_TARGET_TYPE_CODES[eventName] ?? [];

    if (!expectedTargetTypes.some((item) => item === targetType)) {
      throw new ProductAnalyticsPayloadInvalidError("targetType is invalid");
    }

    if (targetId === undefined || targetId === null) {
      return { targetId: null, targetType };
    }

    if (typeof targetId !== "string" || targetId.trim().length === 0) {
      throw new ProductAnalyticsPayloadInvalidError("targetId is invalid");
    }

    const normalizedTargetId = targetId.trim();

    if (!this.isUuid(normalizedTargetId)) {
      throw new ProductAnalyticsPayloadInvalidError("targetId is invalid");
    }

    return { targetId: normalizedTargetId, targetType };
  }

  // 기능 : client targetId가 DB UUID column에 저장 가능한 형식인지 확인합니다.
  private isUuid(value: string): boolean {
    return UUID_PATTERN.test(value);
  }

  // 기능 : event 이름에 맞는 payload schema allowlist를 적용합니다.
  private normalizePayload(
    eventName: ProductAnalyticsClientEventName,
    payload: unknown
  ): Record<string, unknown> {
    const payloadRecord = this.toPayloadRecord(payload);
    this.assertNoPiiPayloadKey(payloadRecord);

    switch (eventName) {
      case "app_route_viewed":
        return this.normalizeAppRouteViewedPayload(payloadRecord);
      case "meeting_note_recording_started":
        return this.normalizeMeetingNoteRecordingStartedPayload(payloadRecord);
      case "meeting_note_recording_completed":
        return this.normalizeMeetingNoteRecordingCompletedPayload(payloadRecord);
      case "meeting_note_recording_failed":
        return this.normalizeMeetingNoteRecordingFailedPayload(payloadRecord);
      case "local_draft_saved":
        return this.normalizeLocalDraftSavedPayload(payloadRecord);
      case "local_draft_restored":
        return this.normalizeLocalDraftRestoredPayload(payloadRecord);
      case "local_draft_discarded":
        return this.normalizeLocalDraftDiscardedPayload(payloadRecord);
    }
  }

  // 기능 : unknown payload 값을 JSON object 형태로 검증합니다.
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

  // 기능 : app_route_viewed payload의 routeKey와 surface를 allowlist로 정규화합니다.
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
  private normalizeMeetingNoteRecordingStartedPayload(
    payload: Record<string, unknown>
  ): MeetingNoteRecordingStartedPayload {
    this.assertOnlyKeys(payload, MEETING_NOTE_RECORDING_STARTED_PAYLOAD_KEYS);

    return {
      entryPoint: this.readString(payload, "entryPoint", [
        "meeting_note_create",
      ]),
    };
  }

  // 기능 : 회의록 녹음 완료 payload를 duration bucket만 남기도록 정규화합니다.
  private normalizeMeetingNoteRecordingCompletedPayload(
    payload: Record<string, unknown>
  ): MeetingNoteRecordingCompletedPayload {
    this.assertOnlyKeys(payload, MEETING_NOTE_RECORDING_COMPLETED_PAYLOAD_KEYS);

    return {
      durationBucket: this.readString(payload, "durationBucket", [
        "under_1m",
        "1m_5m",
        "5m_15m",
        "over_15m",
      ]),
    };
  }

  // 기능 : 회의록 녹음 실패 payload를 안전한 reason 값으로 정규화합니다.
  private normalizeMeetingNoteRecordingFailedPayload(
    payload: Record<string, unknown>
  ): MeetingNoteRecordingFailedPayload {
    this.assertOnlyKeys(payload, MEETING_NOTE_RECORDING_FAILED_PAYLOAD_KEYS);

    return {
      reason: this.readString(payload, "reason", [
        "permission_denied",
        "unsupported",
        "interrupted",
        "unknown",
      ]),
    };
  }

  // 기능 : local draft 저장 payload를 draft 종류만 남기도록 정규화합니다.
  private normalizeLocalDraftSavedPayload(
    payload: Record<string, unknown>
  ): LocalDraftBasePayload {
    this.assertOnlyKeys(payload, LOCAL_DRAFT_SAVED_PAYLOAD_KEYS);

    return this.normalizeLocalDraftBasePayload(payload);
  }

  // 기능 : local draft 복구 payload를 draft 종류만 남기도록 정규화합니다.
  private normalizeLocalDraftRestoredPayload(
    payload: Record<string, unknown>
  ): LocalDraftBasePayload {
    this.assertOnlyKeys(payload, LOCAL_DRAFT_RESTORED_PAYLOAD_KEYS);

    return this.normalizeLocalDraftBasePayload(payload);
  }

  // 기능 : local draft 폐기 payload를 draft 종류와 폐기 사유로 정규화합니다.
  private normalizeLocalDraftDiscardedPayload(
    payload: Record<string, unknown>
  ): LocalDraftDiscardedPayload {
    this.assertOnlyKeys(payload, LOCAL_DRAFT_DISCARDED_PAYLOAD_KEYS);

    return {
      ...this.normalizeLocalDraftBasePayload(payload),
      reason: this.readString(payload, "reason", [
        "user_discarded",
        "expired",
        "saved",
      ]),
    };
  }
  private normalizeLocalDraftBasePayload(
    payload: Record<string, unknown>
  ): LocalDraftBasePayload {
    return {
      draftType: this.readString(payload, "draftType", [
        "meeting_note_create",
      ]),
    };
  }

  // 기능 : app_route_viewed payload가 routeKey와 surface 외 field를 갖지 않는지 확인합니다.
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

  // 기능 : payload가 이벤트별 허용 key 외 field를 갖지 않는지 확인합니다.
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
  private readString<TValue extends string>(
    payload: Record<string, unknown>,
    key: string,
    allowedValues: readonly TValue[]
  ): TValue {
    const value = payload[key];

    if (typeof value !== "string") {
      throw new ProductAnalyticsPayloadInvalidError(`${key} is invalid`);
    }

    if (!allowedValues.some((item) => item === value)) {
      throw new ProductAnalyticsPayloadInvalidError(`${key} is invalid`);
    }

    return value as TValue;
  }

  // 기능 : payload boolean field를 읽고 타입을 검증합니다.
  private readBoolean(payload: Record<string, unknown>, key: string): boolean {
    const value = payload[key];

    if (typeof value !== "boolean") {
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

  // 기능 : repository 저장 실패를 payload 없이 기록하고 기존 예외를 유지합니다.
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

  // 기능 : client event 수집 실패를 PII 없는 구조화 로그로 기록합니다.
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

  // 기능 : unknown 오류에서 안전한 오류 이름만 추출합니다.
  private toErrorName(error: unknown): string {
    if (error instanceof Error) {
      return error.name;
    }

    return "UnknownError";
  }
}
