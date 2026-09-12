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
import { ErrorReportApplicationService } from "@/modules/error-report/application/services/error-report-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { ErrorReportController } from "./error-report.controller";

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

// 역할 : ErrorReportApplicationServiceFake controller 테스트용 service 계약을 정의합니다.
type ErrorReportApplicationServiceFake = Pick<
  ErrorReportApplicationService,
  "createErrorReport"
>;

// 역할 : FakeAuthGuard error report controller 테스트 요청에 현재 사용자 컨텍스트를 주입합니다.
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
  Object.assign(request, { requestId: "request-error-report-1" });
  next();
}

// 기능 : ErrorReportController 테스트용 service fake를 생성합니다.
function createServiceFake(): jest.Mocked<ErrorReportApplicationServiceFake> {
  return {
    createErrorReport: jest.fn().mockResolvedValue({
      id: "00000000-0000-4000-8000-000000000301",
      message: "문제를 빠르게 해결할게요.",
    }),
  };
}

// 기능 : ErrorReportController의 HTTP 계약과 multipart 연결을 검증합니다.
describe("ErrorReportController", () => {
  // 1. 이후 처리에 사용할 app을 계산한다.
  let app: INestApplication;
  // 2. 이후 처리에 사용할 service을 계산한다.
  let service: jest.Mocked<ErrorReportApplicationServiceFake>;

  // 3. 필요한 비동기 작업을 실행한다.
  beforeEach(async () => {
    // 1. 현재 단계에서 필요한 side effect를 실행한다.
    service = createServiceFake();

    // 2. 비동기 결과를 받아 moduleRef에 저장한다.
    const moduleRef = await Test.createTestingModule({
      controllers: [ErrorReportController],
      providers: [
        {
          provide: ErrorReportApplicationService,
          useValue: service,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useClass(FakeAuthGuard)
      .compile();

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

  // 5. 테스트 기대 조건을 검증한다.
  it("uses AuthGuard for error report endpoints", () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, ErrorReportController)).toContain(
      AuthGuard
    );
  });

  // 6. 필요한 비동기 작업을 실행한다.
  it("accepts multipart error report requests with optional screenshot", async () => {
    await request(app.getHttpServer())
      .post("/api/error-reports")
      .set("user-agent", "playwright")
      .field("description", "홈 화면에서 카드가 겹쳐 보이고 버튼이 눌리지 않아요.")
      .field("pageUrl", "http://localhost:5173/app")
      .attach("screenshot", Buffer.from("png"), {
        contentType: "image/png",
        filename: "screen.png",
      })
      .expect(201)
      .expect({
        id: "00000000-0000-4000-8000-000000000301",
        message: "문제를 빠르게 해결할게요.",
      });

    expect(service.createErrorReport).toHaveBeenCalledWith({
      currentUser: CURRENT_USER,
      description: "홈 화면에서 카드가 겹쳐 보이고 버튼이 눌리지 않아요.",
      pageUrl: "http://localhost:5173/app",
      requestId: "request-error-report-1",
      screenshotFile: expect.objectContaining({
        buffer: Buffer.from("png"),
        mimetype: "image/png",
        originalname: "screen.png",
        size: 3,
      }),
      userAgent: "playwright",
    });
  });
});
