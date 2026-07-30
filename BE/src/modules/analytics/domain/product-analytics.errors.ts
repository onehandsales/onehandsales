import { DomainError } from "@/shared/domain/errors/domain-error";

// 역할 : ProductAnalyticsEventUnsupportedError 지원하지 않는 분석 이벤트 이름을 표현합니다.
export class ProductAnalyticsEventUnsupportedError extends DomainError {
  // 기능 : 09 client event allowlist 밖의 이벤트 이름 오류를 생성합니다.
  constructor(message = "Unsupported analytics event") {
    super("ANALYTICS_EVENT_UNSUPPORTED", message);
  }
}

// 역할 : ProductAnalyticsEventVersionUnsupportedError 지원하지 않는 이벤트 버전을 표현합니다.
export class ProductAnalyticsEventVersionUnsupportedError extends DomainError {
  // 기능 : 09 payload schema 버전 밖의 이벤트 버전 오류를 생성합니다.
  constructor(message = "Unsupported analytics event version") {
    super("ANALYTICS_EVENT_VERSION_UNSUPPORTED", message);
  }
}

// 역할 : ProductAnalyticsPayloadInvalidError 분석 payload schema 불일치를 표현합니다.
export class ProductAnalyticsPayloadInvalidError extends DomainError {
  // 기능 : allowlist schema를 통과하지 못한 payload 오류를 생성합니다.
  constructor(message = "Invalid analytics payload") {
    super("ANALYTICS_PAYLOAD_INVALID", message);
  }
}

// 역할 : ProductAnalyticsPayloadPiiRejectedError 분석 payload의 민감정보 의심 값을 표현합니다.
export class ProductAnalyticsPayloadPiiRejectedError extends DomainError {
  // 기능 : PII 또는 raw text 의심 key가 포함된 payload 오류를 생성합니다.
  constructor(message = "Analytics payload contains prohibited fields") {
    super("ANALYTICS_PAYLOAD_PII_REJECTED", message);
  }
}

// 역할 : ProductAnalyticsRouteKeyUnsupportedError 지원하지 않는 routeKey를 표현합니다.
export class ProductAnalyticsRouteKeyUnsupportedError extends DomainError {
  // 기능 : User Web core route allowlist 밖의 routeKey 오류를 생성합니다.
  constructor(message = "Unsupported analytics route key") {
    super("ANALYTICS_ROUTE_KEY_UNSUPPORTED", message);
  }
}
