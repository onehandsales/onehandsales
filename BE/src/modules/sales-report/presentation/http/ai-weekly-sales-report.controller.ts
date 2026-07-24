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

@UseGuards(AuthGuard)
@Controller("api/sales-reports/weekly")
export class AiWeeklySalesReportController {
  constructor(
    private readonly salesReportApplicationService: AiWeeklySalesReportApplicationService
  ) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  requestGeneration(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: RequestAiWeeklySalesReportGenerationDto,
    @Headers("idempotency-key") idempotencyKey?: string
  ) {
    return this.salesReportApplicationService.requestGeneration(
      currentUser,
      body,
      idempotencyKey
    );
  }

  @Get()
  getWeek(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: GetAiWeeklySalesReportWeekQueryDto
  ) {
    return this.salesReportApplicationService.getWeek(currentUser, query);
  }

  @Get(":reportId")
  getDetail(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("reportId", ParseUUIDPipe) reportId: string
  ) {
    return this.salesReportApplicationService.getDetail(currentUser, reportId);
  }

  @Get(":reportId/snapshot-summary")
  getSnapshotSummary(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("reportId", ParseUUIDPipe) reportId: string
  ) {
    return this.salesReportApplicationService.getSnapshotSummary(
      currentUser,
      reportId
    );
  }
}
