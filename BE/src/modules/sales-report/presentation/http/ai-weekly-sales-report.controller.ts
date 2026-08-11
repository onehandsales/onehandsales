import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AiWeeklySalesReportApplicationService } from "@/modules/sales-report/application/services/ai-weekly-sales-report-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import {
  GetAiWeeklySalesReportWeekQueryDto,
  RequestAiWeeklySalesReportGenerationDto,
} from "./dto/ai-weekly-sales-report-request.dto";

// 역할 : AI 주간 영업 리포트 생성 요청과 조회 API를 제공합니다.
@UseGuards(AuthGuard)
@Controller("api/sales-reports/weekly")
export class AiWeeklySalesReportController {
  constructor(
    private readonly salesReportApplicationService: AiWeeklySalesReportApplicationService
  ) {}

  // API : AI 주간 영업 리포트, 생성 요청
  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  requestGeneration(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: RequestAiWeeklySalesReportGenerationDto,
    @Headers("idempotency-key") idempotencyKey?: string
  ) {
    // 1. 현재 사용자, 생성 요청, 멱등성 키를 application 계층에 전달한다.
    return this.salesReportApplicationService.requestGeneration(
      currentUser,
      body,
      idempotencyKey
    );
  }

  // API : AI 주간 영업 리포트, 주차별 조회
  @Get()
  getWeek(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: GetAiWeeklySalesReportWeekQueryDto
  ) {
    // 1. 현재 사용자와 주차 조회 조건을 application 계층에 전달한다.
    return this.salesReportApplicationService.getWeek(currentUser, query);
  }

  // API : AI 주간 영업 리포트, 상세 조회
  @Get(":reportId")
  getDetail(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("reportId", ParseUUIDPipe) reportId: string
  ) {
    // 1. 현재 사용자와 리포트 식별자를 application 계층에 전달한다.
    return this.salesReportApplicationService.getDetail(currentUser, reportId);
  }

  // API : AI 주간 영업 리포트, 스냅샷 요약 조회
  @Get(":reportId/snapshot-summary")
  getSnapshotSummary(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("reportId", ParseUUIDPipe) reportId: string
  ) {
    // 1. 현재 사용자와 리포트 식별자를 application 계층에 전달한다.
    return this.salesReportApplicationService.getSnapshotSummary(
      currentUser,
      reportId
    );
  }
}
