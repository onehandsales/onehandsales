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

// 역할 : 사용자 알림 조회, 설정, 브라우저 푸시 구독 API를 제공합니다.
@UseGuards(AuthGuard)
@Controller("api/notifications")
export class NotificationController {
  constructor(
    private readonly notificationApplicationService: NotificationApplicationService
  ) {}

  // API : 알림, 내 알림 목록 조회
  @Get()
  listNotifications(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListNotificationsQueryDto
  ) {
    // 1. 현재 사용자와 조회 조건을 application 계층에 전달한다.
    return this.notificationApplicationService.listNotifications(
      currentUser,
      query
    );
  }

  // API : 알림, 읽지 않은 알림 수 조회
  @Get("unread-count")
  getUnreadCount(@CurrentUser() currentUser: CurrentUserContext) {
    // 1. 현재 사용자의 미확인 알림 집계를 application 계층에 위임한다.
    return this.notificationApplicationService.getUnreadCount(currentUser);
  }

  // API : 알림, 내 알림 설정 조회
  @Get("settings")
  getSettings(@CurrentUser() currentUser: CurrentUserContext) {
    // 1. 현재 사용자의 알림 설정 조회를 application 계층에 위임한다.
    return this.notificationApplicationService.getSettings(currentUser);
  }

  // API : 알림, 내 알림 설정 변경
  @Patch("settings")
  updateSettings(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: UpdateNotificationSettingsDto
  ) {
    // 1. 현재 사용자와 설정 변경 요청을 application 계층에 전달한다.
    return this.notificationApplicationService.updateSettings(currentUser, body);
  }

  // API : 알림, 브라우저 푸시 공개키 조회
  @Get("browser-push/public-key")
  getBrowserPushPublicKey(@CurrentUser() currentUser: CurrentUserContext) {
    // 1. 현재 사용자에게 제공할 브라우저 푸시 공개키 조회를 위임한다.
    return this.notificationApplicationService.getBrowserPushPublicKey(
      currentUser
    );
  }

  // API : 알림, 브라우저 푸시 구독 등록
  @Post("browser-subscriptions")
  @HttpCode(HttpStatus.CREATED)
  createBrowserPushSubscription(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateBrowserPushSubscriptionDto
  ) {
    // 1. 현재 사용자와 구독 등록 요청을 application 계층에 전달한다.
    return this.notificationApplicationService.createBrowserPushSubscription(
      currentUser,
      body
    );
  }

  // API : 알림, 브라우저 푸시 구독 해지
  @Delete("browser-subscriptions/:subscriptionId")
  revokeBrowserPushSubscription(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("subscriptionId", ParseUUIDPipe) subscriptionId: string
  ) {
    // 1. 현재 사용자와 구독 식별자를 application 계층에 전달한다.
    return this.notificationApplicationService.revokeBrowserPushSubscription(
      currentUser,
      subscriptionId
    );
  }

  // API : 알림, 알림 읽음 처리
  @Patch(":notificationId/read")
  markNotificationRead(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("notificationId", ParseUUIDPipe) notificationId: string
  ) {
    // 1. 현재 사용자와 알림 식별자를 application 계층에 전달한다.
    return this.notificationApplicationService.markNotificationRead(
      currentUser,
      notificationId
    );
  }
}
