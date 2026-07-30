import type { CreateProductAnalyticsEventInput } from "@/modules/analytics/application/ports/product-analytics.repository";
import { requiresProductAnalyticsIdempotencyKey } from "@/modules/analytics/domain/product-analytics-event-taxonomy";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";

// 기능 : 제품 분석 이벤트가 repository 저장 전에 지켜야 하는 공통 입력 정책을 검증합니다.
export function assertProductAnalyticsEventInputPolicy(
  input: CreateProductAnalyticsEventInput
): void {
  if (
    requiresProductAnalyticsIdempotencyKey(input.source) &&
    !input.idempotencyKey?.trim()
  ) {
    throw new ValidationDomainError(
      "server analytics event requires idempotencyKey"
    );
  }
}
