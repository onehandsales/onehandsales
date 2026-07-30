// 기능 : 09 제품 분석 이벤트 payload schema의 기본 버전을 정의합니다.
export const PRODUCT_ANALYTICS_EVENT_VERSION = 1;

// 기능 : 제품 분석 이벤트 기록 출처 allowlist를 정의합니다.
export const PRODUCT_ANALYTICS_EVENT_SOURCE_CODES = [
  "CLIENT",
  "SERVER",
  "SYSTEM",
] as const;

// 역할 : ProductAnalyticsEventSourceCode 제품 분석 이벤트 기록 출처 코드를 정의합니다.
export type ProductAnalyticsEventSourceCode =
  (typeof PRODUCT_ANALYTICS_EVENT_SOURCE_CODES)[number];

// 기능 : 09에서 User Web client가 직접 보낼 수 있는 이벤트 이름을 정의합니다.
export const PRODUCT_ANALYTICS_CLIENT_EVENT_NAMES = [
  "app_route_viewed",
] as const;

// 역할 : ProductAnalyticsClientEventName User Web client 이벤트 이름을 정의합니다.
export type ProductAnalyticsClientEventName =
  (typeof PRODUCT_ANALYTICS_CLIENT_EVENT_NAMES)[number];

// 기능 : 09에서 Backend mutation 성공 결과로 기록할 server 이벤트 이름을 정의합니다.
export const PRODUCT_ANALYTICS_SERVER_EVENT_NAMES = [
  "auth_signup_completed",
  "deal_created",
  "deal_next_action_created",
  "schedule_created",
  "schedule_deal_linked",
  "meeting_note_created",
  "meeting_note_deal_linked",
  "business_card_scan_confirmed",
  "import_confirmed",
  "export_downloaded",
] as const;

// 역할 : ProductAnalyticsServerEventName Backend server 이벤트 이름을 정의합니다.
export type ProductAnalyticsServerEventName =
  (typeof PRODUCT_ANALYTICS_SERVER_EVENT_NAMES)[number];

// 기능 : 09 runtime에서 실제 저장할 전체 이벤트 이름 allowlist를 정의합니다.
export const PRODUCT_ANALYTICS_RUNTIME_EVENT_NAMES = [
  ...PRODUCT_ANALYTICS_CLIENT_EVENT_NAMES,
  ...PRODUCT_ANALYTICS_SERVER_EVENT_NAMES,
] as const;

// 역할 : ProductAnalyticsRuntimeEventName 09 runtime 저장 이벤트 이름을 정의합니다.
export type ProductAnalyticsRuntimeEventName =
  (typeof PRODUCT_ANALYTICS_RUNTIME_EVENT_NAMES)[number];

// 기능 : 12 Billing에서 최종 확정할 reserved 분석 이벤트 이름을 정의합니다.
export const PRODUCT_ANALYTICS_RESERVED_BILLING_EVENT_NAMES = [
  "paywall_viewed",
  "upgrade_clicked",
  "trial_started",
  "coupon_applied",
  "referral_invited",
  "subscription_started",
  "subscription_canceled",
  "churn_survey_submitted",
] as const;

// 역할 : ProductAnalyticsReservedBillingEventName 12 Billing reserved 이벤트 이름을 정의합니다.
export type ProductAnalyticsReservedBillingEventName =
  (typeof PRODUCT_ANALYTICS_RESERVED_BILLING_EVENT_NAMES)[number];

// 기능 : 제품 분석 이벤트가 연결할 수 있는 안전한 대상 타입 allowlist를 정의합니다.
export const PRODUCT_ANALYTICS_TARGET_TYPE_CODES = [
  "USER",
  "DEAL",
  "SCHEDULE",
  "MEETING_NOTE",
  "BUSINESS_CARD_SCAN",
  "IMPORT_JOB",
  "EXPORT",
] as const;

// 역할 : ProductAnalyticsTargetTypeCode 제품 분석 이벤트 대상 타입을 정의합니다.
export type ProductAnalyticsTargetTypeCode =
  (typeof PRODUCT_ANALYTICS_TARGET_TYPE_CODES)[number];

// 기능 : 문자열 값이 주어진 allowlist에 포함되는지 확인합니다.
function isOneOf<TValue extends string>(
  values: readonly TValue[],
  value: string
): value is TValue {
  return values.some((item) => item === value);
}

// 기능 : 문자열 값이 제품 분석 이벤트 기록 출처 코드인지 확인합니다.
export function isProductAnalyticsEventSourceCode(
  value: string
): value is ProductAnalyticsEventSourceCode {
  return isOneOf(PRODUCT_ANALYTICS_EVENT_SOURCE_CODES, value);
}

// 기능 : 문자열 값이 09 client 이벤트 이름인지 확인합니다.
export function isProductAnalyticsClientEventName(
  value: string
): value is ProductAnalyticsClientEventName {
  return isOneOf(PRODUCT_ANALYTICS_CLIENT_EVENT_NAMES, value);
}

// 기능 : 문자열 값이 09 server 이벤트 이름인지 확인합니다.
export function isProductAnalyticsServerEventName(
  value: string
): value is ProductAnalyticsServerEventName {
  return isOneOf(PRODUCT_ANALYTICS_SERVER_EVENT_NAMES, value);
}

// 기능 : 문자열 값이 09 runtime 저장 이벤트 이름인지 확인합니다.
export function isProductAnalyticsRuntimeEventName(
  value: string
): value is ProductAnalyticsRuntimeEventName {
  return isOneOf(PRODUCT_ANALYTICS_RUNTIME_EVENT_NAMES, value);
}

// 기능 : 문자열 값이 12 Billing reserved 이벤트 이름인지 확인합니다.
export function isProductAnalyticsReservedBillingEventName(
  value: string
): value is ProductAnalyticsReservedBillingEventName {
  return isOneOf(PRODUCT_ANALYTICS_RESERVED_BILLING_EVENT_NAMES, value);
}

// 기능 : 문자열 값이 제품 분석 이벤트 대상 타입 코드인지 확인합니다.
export function isProductAnalyticsTargetTypeCode(
  value: string
): value is ProductAnalyticsTargetTypeCode {
  return isOneOf(PRODUCT_ANALYTICS_TARGET_TYPE_CODES, value);
}

// 기능 : 이벤트 기록 출처가 idempotencyKey를 필수로 요구하는지 확인합니다.
export function requiresProductAnalyticsIdempotencyKey(
  source: ProductAnalyticsEventSourceCode
): boolean {
  return source === "SERVER";
}
