import { IsOptional } from "class-validator";

// 역할 : CollectProductAnalyticsEventDto client 분석 이벤트 수집 request body를 표현합니다.
export class CollectProductAnalyticsEventDto {
  @IsOptional()
  eventName?: unknown;

  @IsOptional()
  eventVersion?: unknown;

  @IsOptional()
  payload?: unknown;

  @IsOptional()
  userId?: unknown;

  @IsOptional()
  authSessionId?: unknown;

  @IsOptional()
  authDeviceId?: unknown;

  @IsOptional()
  deviceId?: unknown;

  @IsOptional()
  occurredAt?: unknown;

  @IsOptional()
  eventDate?: unknown;

  @IsOptional()
  timeZone?: unknown;

  @IsOptional()
  source?: unknown;

  @IsOptional()
  idempotencyKey?: unknown;

  @IsOptional()
  targetType?: unknown;

  @IsOptional()
  targetId?: unknown;
}
