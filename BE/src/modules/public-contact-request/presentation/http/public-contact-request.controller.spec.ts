import {
  type INestApplication,
  ValidationPipe,
} from "@nestjs/common";
import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Test } from "@nestjs/testing";
import type { NextFunction, Request, Response } from "express";
import * as request from "supertest";
import { PublicContactRequestApplicationService } from "@/modules/public-contact-request/application/services/public-contact-request-application.service";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { PublicContactRequestController } from "./public-contact-request.controller";

// 역할 : PublicContactRequestApplicationServiceFake controller 테스트용 service 계약을 정의합니다.
type PublicContactRequestApplicationServiceFake = Pick<
  PublicContactRequestApplicationService,
  "createPublicContactRequest"
>;

// 기능 : request id middleware 결과를 controller 테스트 요청에 추가합니다.
function attachRequestId(
  request: Request,
  _response: Response,
  next: NextFunction
): void {
  Object.assign(request, { requestId: "request-public-contact-1" });
  next();
}

// 기능 : PublicContactRequestController 테스트용 service fake를 생성합니다.
function createServiceFake(): jest.Mocked<PublicContactRequestApplicationServiceFake> {
  return {
    createPublicContactRequest: jest.fn().mockResolvedValue({
      id: "00000000-0000-4000-8000-000000000401",
      message: "문의가 접수되었습니다.",
    }),
  };
}

// 기능 : PublicContactRequestController의 공개 HTTP 계약을 검증합니다.
describe("PublicContactRequestController", () => {
  let app: INestApplication;
  let service: jest.Mocked<PublicContactRequestApplicationServiceFake>;

  beforeEach(async () => {
    service = createServiceFake();

    const moduleRef = await Test.createTestingModule({
      controllers: [PublicContactRequestController],
      providers: [
        {
          provide: PublicContactRequestApplicationService,
          useValue: service,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(attachRequestId);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("does not use AuthGuard for public contact request endpoints", () => {
    const guards =
      Reflect.getMetadata(GUARDS_METADATA, PublicContactRequestController) ?? [];

    expect(guards).not.toContain(AuthGuard);
  });

  it("accepts JSON public contact requests without authentication", async () => {
    await request(app.getHttpServer())
      .post("/api/public/contact-requests")
      .set("user-agent", "playwright")
      .send({
        email: "sales@example.com",
        companySize: "10-49",
        firstName: "Jane",
        lastName: "Kim",
        company: "Example Inc.",
        title: "Sales Lead",
        region: "US",
        phone: "010-0000-0000",
        plan: "Field sales follow-up in one workspace.",
        source: "search",
        marketingAgreement: true,
        pageUrl: "https://onehand.app/en-us/contact",
        locale: "en-US",
      })
      .expect(201)
      .expect({
        id: "00000000-0000-4000-8000-000000000401",
        message: "문의가 접수되었습니다.",
      });

    expect(service.createPublicContactRequest).toHaveBeenCalledWith({
      email: "sales@example.com",
      companySize: "10-49",
      firstName: "Jane",
      lastName: "Kim",
      company: "Example Inc.",
      title: "Sales Lead",
      region: "US",
      phone: "010-0000-0000",
      plan: "Field sales follow-up in one workspace.",
      source: "search",
      marketingAgreement: true,
      pageUrl: "https://onehand.app/en-us/contact",
      locale: "en-US",
      requestId: "request-public-contact-1",
      userAgent: "playwright",
    });
  });
});
