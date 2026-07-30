import type {
  ProductAnalyticsEventSourceCode,
  ProductAnalyticsTargetTypeCode,
} from "@/modules/analytics/domain/product-analytics-event-taxonomy";

// 기능 : 제품 분석 저장소 provider token을 정의합니다.
export const PRODUCT_ANALYTICS_REPOSITORY = Symbol(
  "PRODUCT_ANALYTICS_REPOSITORY"
);

// 역할 : CreateProductAnalyticsEventInput 제품 분석 원본 이벤트 저장 입력을 정의합니다.
export interface CreateProductAnalyticsEventInput {
  readonly userId: string;
  readonly authSessionId: string | null;
  readonly authDeviceId: string | null;
  readonly eventName: string;
  readonly eventVersion: number;
  readonly source: ProductAnalyticsEventSourceCode;
  readonly occurredAt: Date;
  readonly eventDate: string;
  readonly timeZone: string;
  readonly idempotencyKey?: string | null;
  readonly targetType?: ProductAnalyticsTargetTypeCode | null;
  readonly targetId?: string | null;
  readonly payloadJson: Record<string, unknown>;
}

// 역할 : ProductAnalyticsEventRecord 저장된 제품 분석 원본 이벤트의 최소 결과를 정의합니다.
export interface ProductAnalyticsEventRecord {
  readonly id: string;
}

// 역할 : ProductAnalyticsRepository 제품 분석 raw event와 인증 device 보강을 위한 영속성 계약을 정의합니다.
export interface ProductAnalyticsRepository {
  // 기능 : allowlist를 통과한 제품 분석 원본 이벤트를 저장합니다.
  createEvent(
    input: CreateProductAnalyticsEventInput
  ): Promise<ProductAnalyticsEventRecord>;

  // 기능 : app session ID로 연결된 authDeviceId를 조회합니다.
  findAuthDeviceIdBySessionId(sessionId: string): Promise<string | null>;
}
