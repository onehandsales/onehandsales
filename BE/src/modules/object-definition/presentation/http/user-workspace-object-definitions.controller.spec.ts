import {
  type CanActivate,
  type ExecutionContext,
  type INestApplication,
} from "@nestjs/common";
import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Test } from "@nestjs/testing";
import type { Request } from "express";
import * as request from "supertest";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { UserWorkspaceObjectDefinitionsController } from "./user-workspace-object-definitions.controller";

const CURRENT_USER: CurrentUserContext = {
  id: "00000000-0000-4000-8000-000000000101",
  sessionId: "00000000-0000-4000-8000-000000000201",
  email: "user@example.com",
  displayName: "User",
  platformRole: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

type RequestWithCurrentUser = Request & {
  currentUser?: CurrentUserContext;
};

// 역할 : FakeAuthGuard Workspace ObjectDefinition controller 테스트 요청에 현재 사용자 컨텍스트를 주입합니다.
class FakeAuthGuard implements CanActivate {
  // 기능 : 테스트 요청을 인증된 사용자 요청으로 처리합니다.
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithCurrentUser>();
    request.currentUser = CURRENT_USER;

    return true;
  }
}

// 기능 : UserWorkspaceObjectDefinitionsController의 HTTP 계약을 검증합니다.
describe("UserWorkspaceObjectDefinitionsController", () => {
  // 1. 이후 단계에서 사용할 app 값을 준비한다.
  let app: INestApplication;

  // 2. 필요한 비동기 작업을 실행한다.
  beforeEach(async () => {
    // 1. 비동기 결과를 받아 moduleRef에 저장한다.
    const moduleRef = await Test.createTestingModule({
      controllers: [UserWorkspaceObjectDefinitionsController],
    })
      .overrideGuard(AuthGuard)
      .useClass(FakeAuthGuard)
      .compile();

    // 2. 테스트 Nest application을 초기화한다.
    app = moduleRef.createNestApplication();
    await app.init();
  });

  // 3. 필요한 비동기 작업을 실행한다.
  afterEach(async () => {
    await app.close();
  });

  // 4. 테스트 기대 조건을 검증한다.
  it("uses AuthGuard for workspace object definition endpoints", () => {
    expect(
      Reflect.getMetadata(
        GUARDS_METADATA,
        UserWorkspaceObjectDefinitionsController
      )
    ).toContain(AuthGuard);
  });

  // 5. 필요한 비동기 작업을 실행한다.
  it("returns ok for workspace object definition creation route", async () => {
    await request(app.getHttpServer())
      .post(
        "/api/users/me/workspaces/00000000-0000-4000-8000-000000000301/object-definitions"
      )
      .expect(200)
      .expect({
        ok: true,
      });
  });
});
