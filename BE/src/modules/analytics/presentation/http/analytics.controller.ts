import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  CollectClientAnalyticsEventUseCase,
  type CollectProductAnalyticsEventResponse,
} from "@/modules/analytics/application/use-cases/collect-client-analytics-event.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import type { RequestWithRequestId } from "@/shared/presentation/middleware/request-id.middleware";
import { CollectProductAnalyticsEventDto } from "./dto/collect-product-analytics-event.dto";

// 역할 : AnalyticsController는 제품 분석 API 요청을 application 계층으로 위임합니다.
@UseGuards(AuthGuard)
@Controller("api/analytics")
export class AnalyticsController {
  // 기능 : client 분석 이벤트 수집 use case를 주입받습니다.
  constructor(
    private readonly collectClientAnalyticsEventUseCase: CollectClientAnalyticsEventUseCase
  ) {}

  // API : 제품 분석, client event 수집
  @Post("events")
  @HttpCode(HttpStatus.ACCEPTED)
  collectClientEvent(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CollectProductAnalyticsEventDto,
    @Req() request: RequestWithRequestId
  ): Promise<CollectProductAnalyticsEventResponse> {
    // 1. 현재 사용자와 request id, request body field 목록을 application 계층으로 전달한다.
    return this.collectClientAnalyticsEventUseCase.execute({
      currentUser,
      eventName: body.eventName,
      eventVersion: body.eventVersion,
      payload: body.payload,
      requestFieldNames: this.getPresentRequestFieldNames(body),
      requestId: request.requestId,
    });
  }

  // 기능 : DTO 변환으로 생긴 undefined field를 제외하고 실제 request field만 추출합니다.
  private getPresentRequestFieldNames(
    body: CollectProductAnalyticsEventDto
  ): string[] {
    return Object.entries(body)
      .filter(([, value]) => value !== undefined)
      .map(([fieldName]) => fieldName);
  }
}
