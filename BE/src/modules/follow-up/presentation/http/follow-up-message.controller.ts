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

@UseGuards(AuthGuard)
@Controller("api/follow-up-messages")
export class FollowUpMessageController {
  constructor(
    private readonly followUpMessageApplicationService: FollowUpMessageApplicationService
  ) {}

  @Post("drafts")
  @HttpCode(HttpStatus.CREATED)
  createDraft(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateFollowUpDraftDto
  ) {
    return this.followUpMessageApplicationService.createDraft(currentUser, body);
  }

  @Get()
  listMessages(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListFollowUpMessagesQueryDto
  ) {
    return this.followUpMessageApplicationService.listMessages(
      currentUser,
      query
    );
  }

  @Get(":messageId")
  getDetail(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("messageId", ParseUUIDPipe) messageId: string
  ) {
    return this.followUpMessageApplicationService.getDetail(
      currentUser,
      messageId
    );
  }

  @Patch(":messageId")
  updateDraft(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("messageId", ParseUUIDPipe) messageId: string,
    @Body() body: UpdateFollowUpMessageDto
  ) {
    return this.followUpMessageApplicationService.updateDraft(
      currentUser,
      messageId,
      body
    );
  }

  @Post(":messageId/send")
  @HttpCode(HttpStatus.ACCEPTED)
  sendMessage(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("messageId", ParseUUIDPipe) messageId: string
  ) {
    return this.followUpMessageApplicationService.sendMessage(
      currentUser,
      messageId
    );
  }

  @Post(":messageId/retry")
  @HttpCode(HttpStatus.ACCEPTED)
  retryMessage(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("messageId", ParseUUIDPipe) messageId: string
  ) {
    return this.followUpMessageApplicationService.retryMessage(
      currentUser,
      messageId
    );
  }
}
