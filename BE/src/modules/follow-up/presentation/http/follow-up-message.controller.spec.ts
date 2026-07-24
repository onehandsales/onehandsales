import {
  type CanActivate,
  type ExecutionContext,
  type INestApplication,
  ValidationPipe,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { Request } from "express";
import * as request from "supertest";
import { FollowUpMessageApplicationService } from "@/modules/follow-up/application/services/follow-up-message-application.service";
import { FollowUpConsentNoticeRequiredError } from "@/modules/follow-up/domain/follow-up-delivery.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { HttpExceptionFilter } from "@/shared/presentation/filters/http-exception.filter";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { FollowUpMessageController } from "./follow-up-message.controller";

const CURRENT_USER: CurrentUserContext = {
  id: "00000000-0000-4000-8000-000000000101",
  sessionId: "00000000-0000-4000-8000-000000000201",
  email: "user@example.com",
  displayName: "User",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};
const REPORT_ID = "00000000-0000-4000-8000-000000000301";
const SUGGESTION_ID = "00000000-0000-4000-8000-000000000302";
const CONTACT_ID = "00000000-0000-4000-8000-000000000401";
const MESSAGE_ID = "00000000-0000-4000-8000-000000000501";

type RequestWithCurrentUser = Request & {
  currentUser?: CurrentUserContext;
};

type FollowUpMessageServiceFake = Pick<
  FollowUpMessageApplicationService,
  | "createDraft"
  | "updateDraft"
  | "getDetail"
  | "sendMessage"
  | "retryMessage"
  | "listMessages"
>;

class FakeAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const httpRequest =
      context.switchToHttp().getRequest<RequestWithCurrentUser>();
    httpRequest.currentUser = CURRENT_USER;

    return true;
  }
}

describe("FollowUpMessageController", () => {
  let app: INestApplication;
  let service: jest.Mocked<FollowUpMessageServiceFake>;

  beforeEach(async () => {
    service = createServiceFake();

    const moduleRef = await Test.createTestingModule({
      controllers: [FollowUpMessageController],
      providers: [{ provide: FollowUpMessageApplicationService, useValue: service }],
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

  it("routes all authenticated follow-up message endpoints", async () => {
    await request(app.getHttpServer())
      .post("/api/follow-up-messages/drafts")
      .send({
        sourceReportId: REPORT_ID,
        sourceSuggestionId: SUGGESTION_ID,
        channel: "EMAIL",
        languageTag: "en-US",
        recipientContactId: CONTACT_ID,
      })
      .expect(201);
    await request(app.getHttpServer())
      .get(`/api/follow-up-messages/${MESSAGE_ID}`)
      .expect(200);
    await request(app.getHttpServer())
      .patch(`/api/follow-up-messages/${MESSAGE_ID}`)
      .send({ subject: "Updated subject", body: "Updated body" })
      .expect(200);
    await request(app.getHttpServer())
      .post(`/api/follow-up-messages/${MESSAGE_ID}/send`)
      .expect(202);
    await request(app.getHttpServer())
      .post(`/api/follow-up-messages/${MESSAGE_ID}/retry`)
      .expect(202);
    await request(app.getHttpServer())
      .get(`/api/follow-up-messages?sourceReportId=${REPORT_ID}&page=1`)
      .expect(200);

    expect(service.createDraft).toHaveBeenCalledWith(CURRENT_USER, {
      sourceReportId: REPORT_ID,
      sourceSuggestionId: SUGGESTION_ID,
      channel: "EMAIL",
      languageTag: "en-US",
      recipientContactId: CONTACT_ID,
    });
    expect(service.getDetail).toHaveBeenCalledWith(CURRENT_USER, MESSAGE_ID);
    expect(service.updateDraft).toHaveBeenCalledWith(CURRENT_USER, MESSAGE_ID, {
      subject: "Updated subject",
      body: "Updated body",
    });
    expect(service.sendMessage).toHaveBeenCalledWith(CURRENT_USER, MESSAGE_ID);
    expect(service.retryMessage).toHaveBeenCalledWith(CURRENT_USER, MESSAGE_ID);
    expect(service.listMessages).toHaveBeenCalledWith(CURRENT_USER, {
      sourceReportId: REPORT_ID,
      page: "1",
    });
  });

  it("rejects invalid UUID path values and maps consent-required sends to 409", async () => {
    await request(app.getHttpServer())
      .post("/api/follow-up-messages/not-a-uuid/send")
      .expect(400);

    service.sendMessage.mockRejectedValueOnce(
      new FollowUpConsentNoticeRequiredError()
    );

    const response = await request(app.getHttpServer())
      .post(`/api/follow-up-messages/${MESSAGE_ID}/send`)
      .expect(409);

    expect(response.body).toMatchObject({
      statusCode: 409,
      error: "FollowUpConsentNoticeRequired",
    });
  });
});

function createServiceFake(): jest.Mocked<FollowUpMessageServiceFake> {
  const message = {
    id: MESSAGE_ID,
    status: "DRAFT",
    channel: "EMAIL",
    languageTag: "en-US",
    sender: {
      displayName: "User",
      email: "user@example.com",
      phoneE164Masked: null,
    },
    recipient: {
      contactId: CONTACT_ID,
      name: "Buyer",
      email: "buyer@example.com",
      phoneE164Masked: null,
    },
    subject: "Follow-up subject",
    body: "Follow-up body",
    bodyPreview: "Follow-up body",
    provider: null,
    providerMessageId: null,
    safeErrorCode: null,
    safeErrorMessage: null,
    retryable: false,
    retryCount: 0,
    sentAt: null,
    failedAt: null,
    createdAt: "2026-07-24T05:00:00.000Z",
    updatedAt: "2026-07-24T05:00:00.000Z",
    sourceReportId: REPORT_ID,
    sourceSuggestionId: SUGGESTION_ID,
    targets: [],
    deliveryAttempts: [],
  };

  return {
    createDraft: jest.fn().mockResolvedValue(message),
    updateDraft: jest.fn().mockResolvedValue(message),
    getDetail: jest.fn().mockResolvedValue(message),
    sendMessage: jest.fn().mockResolvedValue({
      ...message,
      status: "SENT",
      sentAt: "2026-07-24T05:01:00.000Z",
    }),
    retryMessage: jest.fn().mockResolvedValue({
      ...message,
      status: "SENT",
      sentAt: "2026-07-24T05:02:00.000Z",
    }),
    listMessages: jest.fn().mockResolvedValue({
      items: [
        {
          ...message,
          body: undefined,
          deliveryAttempts: undefined,
        },
      ],
      page: 1,
      pageSize: 15,
      totalCount: 1,
      totalPages: 1,
    }),
  };
}
