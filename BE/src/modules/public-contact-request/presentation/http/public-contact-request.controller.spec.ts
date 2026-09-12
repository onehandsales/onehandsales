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
  // 1. 이후 처리에 사용할 app을 계산한다.
  let app: INestApplication;
  // 2. 이후 처리에 사용할 service을 계산한다.
  let service: jest.Mocked<PublicContactRequestApplicationServiceFake>;

  // 3. 필요한 비동기 작업을 실행한다.
  beforeEach(async () => {
    // 1. 현재 단계에서 필요한 side effect를 실행한다.
    service = createServiceFake();

    // 2. 비동기 결과를 받아 moduleRef에 저장한다.
    const moduleRef = await Test.createTestingModule({
      controllers: [PublicContactRequestController],
      providers: [
        {
          provide: PublicContactRequestApplicationService,
          useValue: service,
        },
      ],
    }).compile();

    // 3. 현재 단계에서 필요한 side effect를 실행한다.
    app = moduleRef.createNestApplication();
    // 4. 현재 단계에서 필요한 side effect를 실행한다.
    app.use(attachRequestId);
    // 5. 현재 단계에서 필요한 side effect를 실행한다.
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    // 6. 필요한 비동기 작업을 실행한다.
    await app.init();
  });

  // 4. 필요한 비동기 작업을 실행한다.
  afterEach(async () => {
    await app.close();
  });

  // 5. 현재 단계에서 필요한 side effect를 실행한다.
  it("does not use AuthGuard for public contact request endpoints", () => {
    const guards =
      Reflect.getMetadata(GUARDS_METADATA, PublicContactRequestController) ?? [];

    expect(guards).not.toContain(AuthGuard);
  });

  // 6. 필요한 비동기 작업을 실행한다.
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
