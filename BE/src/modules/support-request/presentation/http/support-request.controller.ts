import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { SupportRequestApplicationService } from "@/modules/support-request/application/services/support-request-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import type { RequestWithRequestId } from "@/shared/presentation/middleware/request-id.middleware";
import { CreateSupportRequestDto } from "./dto/create-support-request.dto";

// 역할 : SupportRequestController 지원 요청 HTTP API 요청을 application 계층으로 위임합니다.
@UseGuards(AuthGuard)
@Controller("api/support-requests")
export class SupportRequestController {
  // 기능 : 지원 요청 application service를 주입받습니다.
  constructor(
    private readonly supportRequestApplicationService: SupportRequestApplicationService
  ) {}

  // API : User Web 도움말 모달 지원 요청 접수
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createSupportRequest(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateSupportRequestDto,
    @Req() request: RequestWithRequestId
  ) {
    // 1. HTTP JSON 입력과 인증 context를 application 계층 계약으로 변환한다.
    return this.supportRequestApplicationService.createSupportRequest({
      currentUser,
      type: body.type,
      description: body.description,
      pageUrl: body.pageUrl,
      requestId: request.requestId,
      userAgent: request.header("user-agent") ?? null,
    });
  }
}
