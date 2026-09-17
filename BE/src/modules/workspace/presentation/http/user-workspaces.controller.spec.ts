import {
  type CanActivate,
  type ExecutionContext,
  type INestApplication,
} from "@nestjs/common";
import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Test } from "@nestjs/testing";
import type { Request } from "express";
import * as request from "supertest";
import { CreateMyWorkspaceUseCase } from "@/modules/workspace/application/use-cases/create-my-workspace.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { UserWorkspacesController } from "./user-workspaces.controller";

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

// 역할 : CreateMyWorkspaceUseCaseFake controller 테스트용 Workspace 생성 유스케이스 계약을 정의합니다.
type CreateMyWorkspaceUseCaseFake = Pick<CreateMyWorkspaceUseCase, "execute">;

// 역할 : FakeAuthGuard Workspace controller 테스트 요청에 현재 사용자 컨텍스트를 주입합니다.
class FakeAuthGuard implements CanActivate {
  // 기능 : 테스트 요청을 인증된 사용자 요청으로 처리합니다.
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithCurrentUser>();
    request.currentUser = CURRENT_USER;

    return true;
  }
}

// 기능 : 생성 유스케이스 fake를 생성합니다.
function createWorkspaceUseCaseFake(): jest.Mocked<CreateMyWorkspaceUseCaseFake> {
  const now = new Date("2026-09-17T00:00:00.000Z");

  return {
    execute: jest.fn().mockResolvedValue({
      workspace: {
        id: "00000000-0000-4000-8000-000000000301",
        name: "부동산's Workspace",
        kind: "PERSONAL",
        createdAt: now,
        updatedAt: now,
      },
      workspaceMember: {
        id: "00000000-0000-4000-8000-000000000401",
        workspaceId: "00000000-0000-4000-8000-000000000301",
        userId: CURRENT_USER.id,
        role: "OWNER",
        joinedAt: now,
        createdAt: now,
        updatedAt: now,
      },
    }),
  };
}

// 기능 : UserWorkspacesController의 HTTP 계약을 검증합니다.
describe("UserWorkspacesController", () => {
  // 1. 이후 단계에서 사용할 app 값을 준비한다.
  let app: INestApplication;
  // 2. 이후 단계에서 사용할 createUseCase 값을 준비한다.
  let createUseCase: jest.Mocked<CreateMyWorkspaceUseCaseFake>;

  // 3. 필요한 비동기 작업을 실행한다.
  beforeEach(async () => {
    // 1. 현재 단계에서 필요한 fake 유스케이스를 생성한다.
    createUseCase = createWorkspaceUseCaseFake();

    // 2. 비동기 결과를 받아 moduleRef에 저장한다.
    const moduleRef = await Test.createTestingModule({
      controllers: [UserWorkspacesController],
      providers: [
        {
          provide: CreateMyWorkspaceUseCase,
          useValue: createUseCase,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useClass(FakeAuthGuard)
      .compile();

    // 3. 테스트 Nest application을 초기화한다.
    app = moduleRef.createNestApplication();
    await app.init();
  });

  // 4. 필요한 비동기 작업을 실행한다.
  afterEach(async () => {
    await app.close();
  });

  // 5. 테스트 기대 조건을 검증한다.
  it("uses AuthGuard for workspace endpoints", () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, UserWorkspacesController)).toContain(
      AuthGuard
    );
  });

  // 6. 필요한 비동기 작업을 실행한다.
  it("creates a workspace for the current user", async () => {
    await request(app.getHttpServer())
      .post("/api/users/me/workspaces")
      .send({
        workspaceName: "부동산",
      })
      .expect(201)
      .expect({
        workspace: {
          id: "00000000-0000-4000-8000-000000000301",
          name: "부동산's Workspace",
          kind: "PERSONAL",
          createdAt: "2026-09-17T00:00:00.000Z",
          updatedAt: "2026-09-17T00:00:00.000Z",
        },
        workspaceMember: {
          id: "00000000-0000-4000-8000-000000000401",
          workspaceId: "00000000-0000-4000-8000-000000000301",
          userId: CURRENT_USER.id,
          role: "OWNER",
          joinedAt: "2026-09-17T00:00:00.000Z",
          createdAt: "2026-09-17T00:00:00.000Z",
          updatedAt: "2026-09-17T00:00:00.000Z",
        },
      });

    expect(createUseCase.execute).toHaveBeenCalledWith(CURRENT_USER, {
      workspaceName: "부동산",
    });
  });
});
