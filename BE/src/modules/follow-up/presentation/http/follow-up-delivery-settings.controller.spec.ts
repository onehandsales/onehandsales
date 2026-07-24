import {
  type CanActivate,
  type ExecutionContext,
  type INestApplication,
  ValidationPipe,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { Request } from "express";
import * as request from "supertest";
import { FollowUpSettingsApplicationService } from "@/modules/follow-up/application/services/follow-up-settings-application.service";
import { SmsSenderVerificationExpiredError } from "@/modules/follow-up/domain/follow-up-delivery.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { HttpExceptionFilter } from "@/shared/presentation/filters/http-exception.filter";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import {
  FollowUpDeliverySettingsController,
  FollowUpEmailConnectionCallbackController,
} from "./follow-up-delivery-settings.controller";

const CURRENT_USER: CurrentUserContext = {
  id: "00000000-0000-4000-8000-000000000101",
  sessionId: "00000000-0000-4000-8000-000000000201",
  email: "user@example.com",
  displayName: "User",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};
const CONNECTION_ID = "00000000-0000-4000-8000-000000000301";
const SENDER_NUMBER_ID = "00000000-0000-4000-8000-000000000401";

type RequestWithCurrentUser = Request & {
  currentUser?: CurrentUserContext;
};

type FollowUpSettingsServiceFake = Pick<
  FollowUpSettingsApplicationService,
  | "getSettings"
  | "startEmailConnection"
  | "handleEmailConnectionCallback"
  | "disconnectEmailConnection"
  | "requestSmsSenderNumberVerification"
  | "verifySmsSenderNumber"
  | "revokeSmsSenderNumber"
  | "acknowledgeConsentNotice"
>;

class FakeAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const httpRequest =
      context.switchToHttp().getRequest<RequestWithCurrentUser>();
    httpRequest.currentUser = CURRENT_USER;

    return true;
  }
}

describe("FollowUpDeliverySettingsController", () => {
  let app: INestApplication;
  let service: jest.Mocked<FollowUpSettingsServiceFake>;

  beforeEach(async () => {
    service = createServiceFake();

    const moduleRef = await Test.createTestingModule({
      controllers: [
        FollowUpDeliverySettingsController,
        FollowUpEmailConnectionCallbackController,
      ],
      providers: [
        { provide: FollowUpSettingsApplicationService, useValue: service },
      ],
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

  it("routes all authenticated follow-up settings endpoints", async () => {
    await request(app.getHttpServer())
      .get("/api/follow-up-delivery/settings")
      .expect(200);
    await request(app.getHttpServer())
      .post("/api/follow-up-delivery/email-connections/google/connect")
      .send({ redirectUri: "https://api.example.test/callback" })
      .expect(200);
    await request(app.getHttpServer())
      .post(
        `/api/follow-up-delivery/email-connections/${CONNECTION_ID}/disconnect`
      )
      .expect(200);
    await request(app.getHttpServer())
      .post("/api/follow-up-delivery/sms-sender-numbers")
      .send({ phoneE164: "+821012345678" })
      .expect(202);
    await request(app.getHttpServer())
      .post(
        `/api/follow-up-delivery/sms-sender-numbers/${SENDER_NUMBER_ID}/verify`
      )
      .send({ code: "123456" })
      .expect(200);
    await request(app.getHttpServer())
      .post(
        `/api/follow-up-delivery/sms-sender-numbers/${SENDER_NUMBER_ID}/revoke`
      )
      .expect(200);
    await request(app.getHttpServer())
      .post("/api/follow-up-delivery/consent-notices/email/acknowledge")
      .expect(200);

    expect(service.getSettings).toHaveBeenCalledWith(CURRENT_USER);
    expect(service.startEmailConnection).toHaveBeenCalledWith(
      CURRENT_USER,
      "google",
      { redirectUri: "https://api.example.test/callback" }
    );
    expect(service.disconnectEmailConnection).toHaveBeenCalledWith(
      CURRENT_USER,
      CONNECTION_ID
    );
    expect(service.requestSmsSenderNumberVerification).toHaveBeenCalledWith(
      CURRENT_USER,
      { phoneE164: "+821012345678" }
    );
    expect(service.verifySmsSenderNumber).toHaveBeenCalledWith(
      CURRENT_USER,
      SENDER_NUMBER_ID,
      { code: "123456" }
    );
    expect(service.revokeSmsSenderNumber).toHaveBeenCalledWith(
      CURRENT_USER,
      SENDER_NUMBER_ID
    );
    expect(service.acknowledgeConsentNotice).toHaveBeenCalledWith(
      CURRENT_USER,
      "email"
    );
  });

  it("routes OAuth callback without AuthGuard current user", async () => {
    await request(app.getHttpServer())
      .get(
        "/api/follow-up-delivery/email-connections/google/callback?code=code-1&state=state-1"
      )
      .expect(200);

    expect(service.handleEmailConnectionCallback).toHaveBeenCalledWith(
      "google",
      { code: "code-1", state: "state-1" }
    );
  });

  it("rejects invalid UUID path values and maps expired SMS code to 410", async () => {
    await request(app.getHttpServer())
      .post("/api/follow-up-delivery/email-connections/not-a-uuid/disconnect")
      .expect(400);

    service.verifySmsSenderNumber.mockRejectedValueOnce(
      new SmsSenderVerificationExpiredError()
    );

    const response = await request(app.getHttpServer())
      .post(
        `/api/follow-up-delivery/sms-sender-numbers/${SENDER_NUMBER_ID}/verify`
      )
      .send({ code: "123456" })
      .expect(410);

    expect(response.body).toMatchObject({
      statusCode: 410,
      error: "SmsSenderVerificationExpired",
    });
  });
});

function createServiceFake(): jest.Mocked<FollowUpSettingsServiceFake> {
  return {
    getSettings: jest.fn().mockResolvedValue({
      emailConnections: [],
      smsSenderNumbers: [],
      consentNotices: [],
    }),
    startEmailConnection: jest.fn().mockResolvedValue({
      authorizationUrl: "https://oauth.example.test/authorize",
      stateExpiresAt: "2026-07-24T05:10:00.000Z",
    }),
    handleEmailConnectionCallback: jest.fn().mockResolvedValue({
      connection: {
        id: CONNECTION_ID,
        provider: "GOOGLE",
        providerAccountEmail: "user@example.com",
        status: "CONNECTED",
      },
    }),
    disconnectEmailConnection: jest.fn().mockResolvedValue({
      id: CONNECTION_ID,
      provider: "GOOGLE",
      providerAccountEmail: "user@example.com",
      status: "DISCONNECTED",
      disconnectedAt: "2026-07-24T05:10:00.000Z",
    }),
    requestSmsSenderNumberVerification: jest.fn().mockResolvedValue({
      senderNumber: {
        id: SENDER_NUMBER_ID,
        phoneE164Masked: "+82******5678",
        status: "PENDING_VERIFICATION",
        verificationExpiresAt: "2026-07-24T05:10:00.000Z",
      },
    }),
    verifySmsSenderNumber: jest.fn().mockResolvedValue({
      id: SENDER_NUMBER_ID,
      phoneE164Masked: "+82******5678",
      status: "VERIFIED",
      verifiedAt: "2026-07-24T05:05:00.000Z",
      revokedAt: null,
      verificationExpiresAt: null,
    }),
    revokeSmsSenderNumber: jest.fn().mockResolvedValue({
      id: SENDER_NUMBER_ID,
      phoneE164Masked: "+82******5678",
      status: "REVOKED",
      verifiedAt: null,
      revokedAt: "2026-07-24T05:05:00.000Z",
      verificationExpiresAt: null,
    }),
    acknowledgeConsentNotice: jest.fn().mockResolvedValue({
      channel: "EMAIL",
      acknowledgedAt: "2026-07-24T05:05:00.000Z",
    }),
  };
}
