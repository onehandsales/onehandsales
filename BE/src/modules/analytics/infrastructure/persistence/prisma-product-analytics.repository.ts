import { Prisma } from "@prisma/client";
import type {
  CreateProductAnalyticsEventInput,
  ProductAnalyticsEventRecord,
  ProductAnalyticsRepository,
} from "@/modules/analytics/application/ports/product-analytics.repository";
import { toProductAnalyticsDateOnlyDate } from "@/modules/analytics/application/services/product-analytics-date";
import { assertProductAnalyticsEventInputPolicy } from "@/modules/analytics/application/services/product-analytics-event-input-policy";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type ProductAnalyticsPrismaClient = PrismaService | Prisma.TransactionClient;

// 역할 : PrismaProductAnalyticsRepository 제품 분석 저장소를 Prisma로 구현합니다.
export class PrismaProductAnalyticsRepository
  implements ProductAnalyticsRepository
{
  // 기능 : 제품 분석 저장소가 사용할 Prisma client를 보관합니다.
  constructor(private readonly client: ProductAnalyticsPrismaClient) {}

  // 기능 : allowlist를 통과한 제품 분석 원본 이벤트를 저장합니다.
  async createEvent(
    input: CreateProductAnalyticsEventInput
  ): Promise<ProductAnalyticsEventRecord> {
    assertProductAnalyticsEventInputPolicy(input);

    const event = await this.client.productAnalyticsEvent.create({
      data: {
        userId: input.userId,
        authSessionId: input.authSessionId,
        authDeviceId: input.authDeviceId,
        eventName: input.eventName,
        eventVersion: input.eventVersion,
        source: input.source,
        occurredAt: input.occurredAt,
        eventDate: toProductAnalyticsDateOnlyDate(input.eventDate),
        timeZone: input.timeZone,
        idempotencyKey: input.idempotencyKey ?? null,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        payloadJson: this.toPrismaPayload(input.payloadJson),
      },
      select: {
        id: true,
      },
    });

    return {
      id: event.id,
    };
  }

  // 기능 : app session ID로 연결된 authDeviceId를 조회합니다.
  async findAuthDeviceIdBySessionId(sessionId: string): Promise<string | null> {
    const session = await this.client.authSession.findUnique({
      where: {
        id: sessionId,
      },
      select: {
        authDeviceId: true,
      },
    });

    return session?.authDeviceId ?? null;
  }

  // 기능 : application allowlist를 통과한 payload를 Prisma JSON 입력 형태로 변환합니다.
  private toPrismaPayload(
    payloadJson: Record<string, unknown>
  ): Prisma.InputJsonObject {
    return payloadJson as Prisma.InputJsonObject;
  }
}
