import {
  type CanActivate,
  type ExecutionContext,
  type INestApplication,
  ValidationPipe,
} from "@nestjs/common";
import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Test } from "@nestjs/testing";
import type { NextFunction, Request, Response } from "express";
import * as request from "supertest";
import { SupportRequestApplicationService } from "@/modules/support-request/application/services/support-request-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { SupportRequestController } from "./support-request.controller";

const CURRENT_USER: CurrentUserContext = {
  id: "00000000-0000-4000-8000-000000000101",
  sessionId: "00000000-0000-4000-8000-000000000201",
  email: "user@example.com",
  displayName: "User",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

type RequestWithCurrentUser = Request & {
  currentUser?: CurrentUserContext;
};

// 역할 : SupportRequestApplicationServiceFake controller 테스트용 service 계약을 정의합니다.
type SupportRequestApplicationServiceFake = Pick<
  SupportRequestApplicationService,
  "createSupportRequest"
>;

// 역할 : FakeAuthGuard support request controller 테스트 요청에 현재 사용자 컨텍스트를 주입합니다.
class FakeAuthGuard implements CanActivate {
  // 기능 : 테스트 요청을 인증된 사용자 요청으로 처리합니다.
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithCurrentUser>();
    request.currentUser = CURRENT_USER;

    return true;
  }
}

// 기능 : request id middleware 결과를 controller 테스트 요청에 추가합니다.
function attachRequestId(
  request: Request,
  _response: Response,
  next: NextFunction
): void {
  Object.assign(request, { requestId: "request-support-request-1" });
  next();
}

// 기능 : SupportRequestController 테스트용 service fake를 생성합니다.
function createServiceFake(): jest.Mocked<SupportRequestApplicationServiceFake> {
  return {
    createSupportRequest: jest.fn().mockResolvedValue({
      id: "00000000-0000-4000-8000-000000000301",
      message: "지원 요청을 보냈어요.",
    }),
  };
}

// 기능 : SupportRequestController의 HTTP 계약과 JSON body 연결을 검증합니다.
describe("SupportRequestController", () => {
  let app: INestApplication;
  let service: jest.Mocked<SupportRequestApplicationServiceFake>;

  beforeEach(async () => {
    service = createServiceFake();

    const moduleRef = await Test.createTestingModule({
      controllers: [SupportRequestController],
      providers: [
        {
          provide: SupportRequestApplicationService,
          useValue: service,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useClass(FakeAuthGuard)
      .compile();

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

  it("uses AuthGuard for support request endpoints", () => {
    expect(
      Reflect.getMetadata(GUARDS_METADATA, SupportRequestController)
    ).toContain(AuthGuard);
  });

  it("accepts JSON support request requests", async () => {
    await request(app.getHttpServer())
      .post("/api/support-requests")
      .set("user-agent", "playwright")
      .send({
        type: "FEATURE_QUESTION",
        description: "문의하고 싶은 기능:\n궁금한 점: 기능 동작을 알고 싶어요.",
        pageUrl: "http://localhost:5173/app",
      })
      .expect(201)
      .expect({
        id: "00000000-0000-4000-8000-000000000301",
        message: "지원 요청을 보냈어요.",
      });

    expect(service.createSupportRequest).toHaveBeenCalledWith({
      currentUser: CURRENT_USER,
      type: "FEATURE_QUESTION",
      description: "문의하고 싶은 기능:\n궁금한 점: 기능 동작을 알고 싶어요.",
      pageUrl: "http://localhost:5173/app",
      requestId: "request-support-request-1",
      userAgent: "playwright",
    });
  });
});
