import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { FollowUpSettingsApplicationService } from "@/modules/follow-up/application/services/follow-up-settings-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import {
  EmailConnectionCallbackQueryDto,
  RequestSmsSenderNumberVerificationDto,
  StartEmailConnectionDto,
  VerifySmsSenderNumberDto,
} from "./dto/follow-up-delivery-settings-request.dto";

@UseGuards(AuthGuard)
@Controller("api/follow-up-delivery")
export class FollowUpDeliverySettingsController {
  constructor(
    private readonly followUpSettingsApplicationService: FollowUpSettingsApplicationService
  ) {}

  @Get("settings")
  getSettings(@CurrentUser() currentUser: CurrentUserContext) {
    return this.followUpSettingsApplicationService.getSettings(currentUser);
  }

  @Post("email-connections/:provider/connect")
  @HttpCode(HttpStatus.OK)
  startEmailConnection(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("provider") provider: string,
    @Body() body: StartEmailConnectionDto
  ) {
    return this.followUpSettingsApplicationService.startEmailConnection(
      currentUser,
      provider,
      body
    );
  }

  @Post("email-connections/:connectionId/disconnect")
  @HttpCode(HttpStatus.OK)
  disconnectEmailConnection(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("connectionId", ParseUUIDPipe) connectionId: string
  ) {
    return this.followUpSettingsApplicationService.disconnectEmailConnection(
      currentUser,
      connectionId
    );
  }

  @Post("sms-sender-numbers")
  @HttpCode(HttpStatus.ACCEPTED)
  requestSmsSenderNumberVerification(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: RequestSmsSenderNumberVerificationDto
  ) {
    return this.followUpSettingsApplicationService.requestSmsSenderNumberVerification(
      currentUser,
      body
    );
  }

  @Post("sms-sender-numbers/:senderNumberId/verify")
  @HttpCode(HttpStatus.OK)
  verifySmsSenderNumber(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("senderNumberId", ParseUUIDPipe) senderNumberId: string,
    @Body() body: VerifySmsSenderNumberDto
  ) {
    return this.followUpSettingsApplicationService.verifySmsSenderNumber(
      currentUser,
      senderNumberId,
      body
    );
  }

  @Post("sms-sender-numbers/:senderNumberId/revoke")
  @HttpCode(HttpStatus.OK)
  revokeSmsSenderNumber(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("senderNumberId", ParseUUIDPipe) senderNumberId: string
  ) {
    return this.followUpSettingsApplicationService.revokeSmsSenderNumber(
      currentUser,
      senderNumberId
    );
  }

  @Post("consent-notices/:channel/acknowledge")
  @HttpCode(HttpStatus.OK)
  acknowledgeConsentNotice(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("channel") channel: string
  ) {
    return this.followUpSettingsApplicationService.acknowledgeConsentNotice(
      currentUser,
      channel
    );
  }
}

@Controller("api/follow-up-delivery")
export class FollowUpEmailConnectionCallbackController {
  constructor(
    private readonly followUpSettingsApplicationService: FollowUpSettingsApplicationService
  ) {}

  @Get("email-connections/:provider/callback")
  handleEmailConnectionCallback(
    @Param("provider") provider: string,
    @Query() query: EmailConnectionCallbackQueryDto
  ) {
    return this.followUpSettingsApplicationService.handleEmailConnectionCallback(
      provider,
      query
    );
  }
}
