import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from "@nestjs/common";
import { PublicContactRequestApplicationService } from "@/modules/public-contact-request/application/services/public-contact-request-application.service";
import type { RequestWithRequestId } from "@/shared/presentation/middleware/request-id.middleware";
import { CreatePublicContactRequestDto } from "./dto/create-public-contact-request.dto";

// 역할 : PublicContactRequestController 공개 문의 HTTP API 요청을 application 계층으로 위임합니다.
@Controller("api/public/contact-requests")
export class PublicContactRequestController {
  // 기능 : 공개 문의 application service를 주입받습니다.
  constructor(
    private readonly publicContactRequestApplicationService: PublicContactRequestApplicationService
  ) {}

  // API : 공개 사이트 문의 접수
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createPublicContactRequest(
    @Body() body: CreatePublicContactRequestDto,
    @Req() request: RequestWithRequestId
  ) {
    // 1. HTTP JSON 입력과 request metadata를 application 계층 계약으로 변환한다.
    return this.publicContactRequestApplicationService.createPublicContactRequest({
      email: body.email,
      companySize: body.companySize,
      firstName: body.firstName,
      lastName: body.lastName,
      company: body.company,
      title: body.title,
      region: body.region,
      phone: body.phone,
      plan: body.plan,
      source: body.source,
      marketingAgreement: body.marketingAgreement,
      pageUrl: body.pageUrl,
      locale: body.locale,
      requestId: request.requestId,
      userAgent: request.header("user-agent") ?? null,
    });
  }
}
