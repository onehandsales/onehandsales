import {
  Body,
  Controller,
  Delete,
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
import { NotificationApplicationService } from "@/modules/notification/application/services/notification-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import {
  CreateBrowserPushSubscriptionDto,
  ListNotificationsQueryDto,
  UpdateNotificationSettingsDto,
} from "./dto/notification-request.dto";

@UseGuards(AuthGuard)
@Controller("api/notifications")
export class NotificationController {
  constructor(
    private readonly notificationApplicationService: NotificationApplicationService
  ) {}

  @Get()
  listNotifications(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListNotificationsQueryDto
  ) {
    return this.notificationApplicationService.listNotifications(
      currentUser,
      query
    );
  }

  @Get("unread-count")
  getUnreadCount(@CurrentUser() currentUser: CurrentUserContext) {
    return this.notificationApplicationService.getUnreadCount(currentUser);
  }

  @Get("settings")
  getSettings(@CurrentUser() currentUser: CurrentUserContext) {
    return this.notificationApplicationService.getSettings(currentUser);
  }

  @Patch("settings")
  updateSettings(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: UpdateNotificationSettingsDto
  ) {
    return this.notificationApplicationService.updateSettings(currentUser, body);
  }

  @Get("browser-push/public-key")
  getBrowserPushPublicKey(@CurrentUser() currentUser: CurrentUserContext) {
    return this.notificationApplicationService.getBrowserPushPublicKey(
      currentUser
    );
  }

  @Post("browser-subscriptions")
  @HttpCode(HttpStatus.CREATED)
  createBrowserPushSubscription(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateBrowserPushSubscriptionDto
  ) {
    return this.notificationApplicationService.createBrowserPushSubscription(
      currentUser,
      body
    );
  }

  @Delete("browser-subscriptions/:subscriptionId")
  revokeBrowserPushSubscription(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("subscriptionId", ParseUUIDPipe) subscriptionId: string
  ) {
    return this.notificationApplicationService.revokeBrowserPushSubscription(
      currentUser,
      subscriptionId
    );
  }

  @Patch(":notificationId/read")
  markNotificationRead(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("notificationId", ParseUUIDPipe) notificationId: string
  ) {
    return this.notificationApplicationService.markNotificationRead(
      currentUser,
      notificationId
    );
  }
}
