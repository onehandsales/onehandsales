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
import { CollectClientAnalyticsEventUseCase } from "@/modules/analytics/application/use-cases/collect-client-analytics-event.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { AnalyticsController } from "./analytics.controller";

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

type CollectClientAnalyticsEventUseCaseFake = Pick<
  CollectClientAnalyticsEventUseCase,
  "execute"
>;

// 역할 : FakeAuthGuard analytics controller 테스트 요청에 현재 사용자 컨텍스트를 주입합니다.
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
  Object.assign(request, { requestId: "request-analytics-1" });
  next();
}

// 기능 : AnalyticsController 테스트용 use case fake를 생성합니다.
function createUseCaseFake(): jest.Mocked<CollectClientAnalyticsEventUseCaseFake> {
  return {
    execute: jest.fn().mockResolvedValue({ accepted: true }),
  };
}

// 기능 : AnalyticsController의 HTTP 계약과 DTO 연결을 검증합니다.
describe("AnalyticsController", () => {
  let app: INestApplication;
  let useCase: jest.Mocked<CollectClientAnalyticsEventUseCaseFake>;

  beforeEach(async () => {
    useCase = createUseCaseFake();

    const moduleRef = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: CollectClientAnalyticsEventUseCase,
          useValue: useCase,
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

  it("uses AuthGuard for analytics endpoints", () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, AnalyticsController)).toContain(
      AuthGuard
    );
  });

  it("accepts client analytics event requests with 202 response", async () => {
    await request(app.getHttpServer())
      .post("/api/analytics/events")
      .send({
        eventName: "app_route_viewed",
        eventVersion: 1,
        payload: {
          routeKey: "deals",
        },
      })
      .expect(202)
      .expect({
        accepted: true,
      });

    expect(useCase.execute).toHaveBeenCalledWith({
      currentUser: CURRENT_USER,
      eventName: "app_route_viewed",
      eventVersion: 1,
      payload: {
        routeKey: "deals",
      },
      requestFieldNames: ["eventName", "eventVersion", "payload"],
      requestId: "request-analytics-1",
    });
  });

  it("passes forbidden request field names to the use case", async () => {
    await request(app.getHttpServer())
      .post("/api/analytics/events")
      .send({
        eventName: "app_route_viewed",
        eventVersion: 1,
        payload: {
          routeKey: "deals",
        },
        userId: CURRENT_USER.id,
      })
      .expect(202);

    expect(useCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        requestFieldNames: ["eventName", "eventVersion", "payload", "userId"],
      })
    );
  });

  it("rejects unknown request body fields before use case execution", async () => {
    await request(app.getHttpServer())
      .post("/api/analytics/events")
      .send({
        eventName: "app_route_viewed",
        eventVersion: 1,
        payload: {
          routeKey: "deals",
        },
        arbitraryField: true,
      })
      .expect(400);

    expect(useCase.execute).not.toHaveBeenCalled();
  });
});
