import {
  type CanActivate,
  type ExecutionContext,
  type INestApplication,
  ValidationPipe,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { Request } from "express";
import * as request from "supertest";
import { SearchApplicationService } from "@/modules/search/application/services/search-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { SearchController } from "./search.controller";

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

type SearchServiceFake = Pick<SearchApplicationService, "searchAll">;

// 역할 : FakeAuthGuard 테스트 요청에 현재 사용자 컨텍스트를 주입합니다.
class FakeAuthGuard implements CanActivate {
  // 기능 : 테스트 요청을 인증된 요청으로 처리합니다.
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithCurrentUser>();
    request.currentUser = CURRENT_USER;

    return true;
  }
}

// 기능 : SearchController 테스트용 service fake를 생성합니다.
function createSearchServiceFake(): jest.Mocked<SearchServiceFake> {
  return {
    searchAll: jest.fn().mockResolvedValue({ groups: [] }),
  };
}

// 기능 : SearchController의 HTTP route와 DTO 연결을 검증합니다.
describe("SearchController", () => {
  let app: INestApplication;
  let service: jest.Mocked<SearchServiceFake>;

  beforeEach(async () => {
    service = createSearchServiceFake();

    const moduleRef = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [{ provide: SearchApplicationService, useValue: service }],
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
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("routes integrated search request with transformed query", async () => {
    await request(app.getHttpServer())
      .get("/api/search?q=세손&types=COMPANY,DEAL&limit=3")
      .expect(200);

    expect(service.searchAll).toHaveBeenCalledWith(CURRENT_USER, {
      q: "세손",
      types: "COMPANY,DEAL",
      limit: 3,
    });
  });

  it("rejects invalid search query", async () => {
    await request(app.getHttpServer()).get("/api/search?limit=21").expect(400);

    expect(service.searchAll).not.toHaveBeenCalled();
  });
});
