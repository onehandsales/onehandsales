import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { FollowUpMessageApplicationService } from "@/modules/follow-up/application/services/follow-up-message-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import {
  CreateFollowUpDraftDto,
  ListFollowUpMessagesQueryDto,
  UpdateFollowUpMessageDto,
} from "./dto/follow-up-message-request.dto";

// 역할 : 후속 연락 메시지 초안, 조회, 발송, 재시도 API를 제공합니다.
@UseGuards(AuthGuard)
@Controller("api/follow-up-messages")
export class FollowUpMessageController {
  constructor(
    private readonly followUpMessageApplicationService: FollowUpMessageApplicationService
  ) {}

  // API : 후속 연락 메시지, 초안 생성
  @Post("drafts")
  @HttpCode(HttpStatus.CREATED)
  createDraft(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateFollowUpDraftDto
  ) {
    // 1. 현재 사용자와 초안 생성 요청을 application 계층에 전달한다.
    return this.followUpMessageApplicationService.createDraft(currentUser, body);
  }

  // API : 후속 연락 메시지, 목록 조회
  @Get()
  listMessages(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListFollowUpMessagesQueryDto
  ) {
    // 1. 현재 사용자와 조회 조건을 application 계층에 전달한다.
    return this.followUpMessageApplicationService.listMessages(
      currentUser,
      query
    );
  }

  // API : 후속 연락 메시지, 상세 조회
  @Get(":messageId")
  getDetail(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("messageId", ParseUUIDPipe) messageId: string
  ) {
    // 1. 현재 사용자와 메시지 식별자를 application 계층에 전달한다.
    return this.followUpMessageApplicationService.getDetail(
      currentUser,
      messageId
    );
  }

  // API : 후속 연락 메시지, 초안 수정
  @Patch(":messageId")
  updateDraft(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("messageId", ParseUUIDPipe) messageId: string,
    @Body() body: UpdateFollowUpMessageDto
  ) {
    // 1. 현재 사용자, 메시지 식별자, 수정 요청을 application 계층에 전달한다.
    return this.followUpMessageApplicationService.updateDraft(
      currentUser,
      messageId,
      body
    );
  }

  // API : 후속 연락 메시지, 메시지 발송
  @Post(":messageId/send")
  @HttpCode(HttpStatus.ACCEPTED)
  sendMessage(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("messageId", ParseUUIDPipe) messageId: string
  ) {
    // 1. 현재 사용자와 메시지 식별자를 application 계층에 전달한다.
    return this.followUpMessageApplicationService.sendMessage(
      currentUser,
      messageId
    );
  }

  // API : 후속 연락 메시지, 발송 재시도
  @Post(":messageId/retry")
  @HttpCode(HttpStatus.ACCEPTED)
  retryMessage(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("messageId", ParseUUIDPipe) messageId: string
  ) {
    // 1. 현재 사용자와 메시지 식별자를 application 계층에 전달한다.
    return this.followUpMessageApplicationService.retryMessage(
      currentUser,
      messageId
    );
  }
}
