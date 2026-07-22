import {
  type CanActivate,
  type ExecutionContext,
  type INestApplication,
  ValidationPipe,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { Request } from "express";
import * as request from "supertest";
import { NotificationApplicationService } from "@/modules/notification/application/services/notification-application.service";
import {
  BrowserPushNotConfiguredError,
  BrowserPushSubscriptionEncryptFailedError,
  NotificationNotFoundError,
  PushSubscriptionNotFoundError,
} from "@/modules/notification/domain/notification.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { HttpExceptionFilter } from "@/shared/presentation/filters/http-exception.filter";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { NotificationController } from "./notification.controller";

const CURRENT_USER: CurrentUserContext = {
  id: "00000000-0000-4000-8000-000000000101",
  sessionId: "00000000-0000-4000-8000-000000000201",
  email: "user@example.com",
  displayName: "User",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

const NOTIFICATION_ID = "00000000-0000-4000-8000-000000000001";
const SUBSCRIPTION_ID = "00000000-0000-4000-8000-000000000002";

type RequestWithCurrentUser = Request & {
  currentUser?: CurrentUserContext;
};

type NotificationServiceFake = Pick<
  NotificationApplicationService,
  | "listNotifications"
  | "getUnreadCount"
  | "markNotificationRead"
  | "getSettings"
  | "updateSettings"
  | "getBrowserPushPublicKey"
  | "createBrowserPushSubscription"
  | "revokeBrowserPushSubscription"
>;

class FakeAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const httpRequest =
      context.switchToHttp().getRequest<RequestWithCurrentUser>();
    httpRequest.currentUser = CURRENT_USER;

    return true;
  }
}

describe("NotificationController", () => {
  let app: INestApplication;
  let service: jest.Mocked<NotificationServiceFake>;

  beforeEach(async () => {
    service = createNotificationServiceFake();

    const moduleRef = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [{ provide: NotificationApplicationService, useValue: service }],
    })
      .overrideGuard(AuthGuard)
      .useClass(FakeAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("routes notification list and unread count requests", async () => {
    await request(app.getHttpServer())
      .get("/api/notifications?page=2&pageSize=50&read=UNREAD&includeUpcoming=true")
      .expect(200);
    await request(app.getHttpServer())
      .get("/api/notifications/unread-count")
      .expect(200);

    expect(service.listNotifications).toHaveBeenCalledWith(
      CURRENT_USER,
      expect.objectContaining({
        page: 2,
        pageSize: 50,
        read: "UNREAD",
        includeUpcoming: true,
      })
    );
    expect(service.getUnreadCount).toHaveBeenCalledWith(CURRENT_USER);
  });

  it("routes read, settings, public key, and subscription requests", async () => {
    const subscriptionBody = {
      endpoint: "https://push.example.test/endpoint",
      keys: {
        p256dh: "p256dh",
        auth: "auth",
      },
      userAgent: "Test Browser",
      deviceLabel: "Chrome",
    };

    await request(app.getHttpServer())
      .patch(`/api/notifications/${NOTIFICATION_ID}/read`)
      .expect(200);
    await request(app.getHttpServer())
      .get("/api/notifications/settings")
      .expect(200);
    await request(app.getHttpServer())
      .patch("/api/notifications/settings")
      .send({ emailNotificationEnabled: false })
      .expect(200);
    await request(app.getHttpServer())
      .get("/api/notifications/browser-push/public-key")
      .expect(200);
    await request(app.getHttpServer())
      .post("/api/notifications/browser-subscriptions")
      .send(subscriptionBody)
      .expect(201);
    await request(app.getHttpServer())
      .delete(`/api/notifications/browser-subscriptions/${SUBSCRIPTION_ID}`)
      .expect(200);

    expect(service.markNotificationRead).toHaveBeenCalledWith(
      CURRENT_USER,
      NOTIFICATION_ID
    );
    expect(service.getSettings).toHaveBeenCalledWith(CURRENT_USER);
    expect(service.updateSettings).toHaveBeenCalledWith(CURRENT_USER, {
      emailNotificationEnabled: false,
    });
    expect(service.getBrowserPushPublicKey).toHaveBeenCalledWith(CURRENT_USER);
    expect(service.createBrowserPushSubscription).toHaveBeenCalledWith(
      CURRENT_USER,
      subscriptionBody
    );
    expect(service.revokeBrowserPushSubscription).toHaveBeenCalledWith(
      CURRENT_USER,
      SUBSCRIPTION_ID
    );
  });

  it("rejects invalid query and subscription bodies", async () => {
    await request(app.getHttpServer())
      .get("/api/notifications?pageSize=51")
      .expect(400);

    await request(app.getHttpServer())
      .post("/api/notifications/browser-subscriptions")
      .send({
        endpoint: "https://push.example.test/endpoint",
        keys: {
          p256dh: "p256dh",
        },
      })
      .expect(400);

    await request(app.getHttpServer())
      .post("/api/notifications/browser-subscriptions")
      .send({
        endpoint: "https://push.example.test/endpoint",
        keys: "not-an-object",
      })
      .expect(400);
  });

  it("maps missing browser push VAPID configuration to 503", async () => {
    service.getBrowserPushPublicKey.mockImplementationOnce(() => {
      throw new BrowserPushNotConfiguredError();
    });

    const response = await request(app.getHttpServer())
      .get("/api/notifications/browser-push/public-key")
      .expect(503);

    expect(response.body).toMatchObject({
      statusCode: 503,
      error: "BrowserPushNotConfigured",
    });
  });

  it("maps cross-user notification and subscription access to 404", async () => {
    service.markNotificationRead.mockRejectedValueOnce(
      new NotificationNotFoundError()
    );
    service.revokeBrowserPushSubscription.mockRejectedValueOnce(
      new PushSubscriptionNotFoundError()
    );

    await request(app.getHttpServer())
      .patch(`/api/notifications/${NOTIFICATION_ID}/read`)
      .expect(404);
    await request(app.getHttpServer())
      .delete(`/api/notifications/browser-subscriptions/${SUBSCRIPTION_ID}`)
      .expect(404);
  });

  it("maps browser push encryption failure to the API contract error code", async () => {
    service.createBrowserPushSubscription.mockRejectedValueOnce(
      new BrowserPushSubscriptionEncryptFailedError()
    );

    const response = await request(app.getHttpServer())
      .post("/api/notifications/browser-subscriptions")
      .send({
        endpoint: "https://push.example.test/endpoint",
        keys: {
          p256dh: "p256dh",
          auth: "auth",
        },
      })
      .expect(500);

    expect(response.body).toMatchObject({
      statusCode: 500,
      error: "PushSubscriptionEncryptFailed",
    });
  });
});

function createNotificationServiceFake(): jest.Mocked<NotificationServiceFake> {
  return {
    listNotifications: jest.fn().mockResolvedValue({
      items: [],
      unreadCount: 0,
      page: 1,
      pageSize: 15,
      totalCount: 0,
    }),
    getUnreadCount: jest.fn().mockResolvedValue({ unreadCount: 0 }),
    markNotificationRead: jest.fn().mockResolvedValue({ id: NOTIFICATION_ID }),
    getSettings: jest.fn().mockResolvedValue({
      scheduleReminderEnabled: true,
      dealDueReminderEnabled: true,
      emailNotificationEnabled: true,
      browserPushEnabled: false,
      scheduleReminderMinutes: 30,
      dealDueReminderDaysBefore: 1,
      dealDueReminderLocalTime: "09:00",
    }),
    updateSettings: jest.fn().mockResolvedValue({
      scheduleReminderEnabled: true,
      dealDueReminderEnabled: true,
      emailNotificationEnabled: false,
      browserPushEnabled: false,
      scheduleReminderMinutes: 30,
      dealDueReminderDaysBefore: 1,
      dealDueReminderLocalTime: "09:00",
    }),
    getBrowserPushPublicKey: jest.fn().mockReturnValue({
      publicKey: "public-vapid-key",
    }),
    createBrowserPushSubscription: jest.fn().mockResolvedValue({
      id: SUBSCRIPTION_ID,
      status: "ACTIVE",
      deviceLabel: "Chrome",
      createdAt: "2026-07-22T01:02:03.000Z",
      revokedAt: null,
    }),
    revokeBrowserPushSubscription: jest.fn().mockResolvedValue({
      id: SUBSCRIPTION_ID,
      status: "REVOKED",
      deviceLabel: "Chrome",
      createdAt: "2026-07-22T01:02:03.000Z",
      revokedAt: "2026-07-22T01:03:03.000Z",
    }),
  };
}
