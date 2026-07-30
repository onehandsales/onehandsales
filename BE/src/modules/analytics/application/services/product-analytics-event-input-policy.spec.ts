import type { CreateProductAnalyticsEventInput } from "@/modules/analytics/application/ports/product-analytics.repository";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import { assertProductAnalyticsEventInputPolicy } from "./product-analytics-event-input-policy";

// 기능 : 제품 분석 이벤트 입력 정책 테스트의 기본 입력값을 생성합니다.
function createBaseProductAnalyticsEventInput(
  input?: Partial<CreateProductAnalyticsEventInput>
): CreateProductAnalyticsEventInput {
  return {
    authDeviceId: null,
    authSessionId: null,
    eventDate: "2026-07-30",
    eventName: "app_route_viewed",
    eventVersion: 1,
    idempotencyKey: null,
    occurredAt: new Date("2026-07-30T00:00:00.000Z"),
    payloadJson: {},
    source: "CLIENT",
    targetId: null,
    targetType: null,
    timeZone: "Asia/Seoul",
    userId: "00000000-0000-0000-0000-000000000001",
    ...input,
  };
}

describe("product analytics event input policy", () => {
  it("requires a non-empty idempotencyKey before saving server events", () => {
    const input = createBaseProductAnalyticsEventInput({
      eventName: "deal_created",
      idempotencyKey: "   ",
      source: "SERVER",
    });

    expect(() => assertProductAnalyticsEventInputPolicy(input)).toThrow(
      ValidationDomainError
    );
  });

  it("allows server events with a non-empty idempotencyKey", () => {
    const input = createBaseProductAnalyticsEventInput({
      eventName: "deal_created",
      idempotencyKey: "deal-created:00000000-0000-0000-0000-000000000010",
      source: "SERVER",
    });

    expect(() => assertProductAnalyticsEventInputPolicy(input)).not.toThrow();
  });

  it("allows client and system events without idempotencyKey", () => {
    const clientInput = createBaseProductAnalyticsEventInput({
      idempotencyKey: null,
      source: "CLIENT",
    });
    const systemInput = createBaseProductAnalyticsEventInput({
      eventName: "retention_snapshot_processed",
      idempotencyKey: null,
      source: "SYSTEM",
    });

    expect(() =>
      assertProductAnalyticsEventInputPolicy(clientInput)
    ).not.toThrow();
    expect(() =>
      assertProductAnalyticsEventInputPolicy(systemInput)
    ).not.toThrow();
  });
});
