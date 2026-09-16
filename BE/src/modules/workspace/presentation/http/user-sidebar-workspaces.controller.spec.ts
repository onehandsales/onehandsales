import {
  type CanActivate,
  type ExecutionContext,
  type INestApplication,
} from "@nestjs/common";
import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Test } from "@nestjs/testing";
import type { Request } from "express";
import * as request from "supertest";
import { GetMyDefaultSidebarWorkspaceUseCase } from "@/modules/workspace/application/use-cases/get-my-default-sidebar-workspace.use-case";
import { GetMySidebarWorkspaceUseCase } from "@/modules/workspace/application/use-cases/get-my-sidebar-workspace.use-case";
import { ListMySidebarWorkspacesUseCase } from "@/modules/workspace/application/use-cases/list-my-sidebar-workspaces.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { UserSidebarWorkspacesController } from "./user-sidebar-workspaces.controller";

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

// 역할 : ListMySidebarWorkspacesUseCaseFake controller 테스트용 목록 유스케이스 계약을 정의합니다.
type ListMySidebarWorkspacesUseCaseFake = Pick<
  ListMySidebarWorkspacesUseCase,
  "execute"
>;

// 역할 : GetMyDefaultSidebarWorkspaceUseCaseFake controller 테스트용 기본 Workspace 유스케이스 계약을 정의합니다.
type GetMyDefaultSidebarWorkspaceUseCaseFake = Pick<
  GetMyDefaultSidebarWorkspaceUseCase,
  "execute"
>;

// 역할 : GetMySidebarWorkspaceUseCaseFake controller 테스트용 단건 유스케이스 계약을 정의합니다.
type GetMySidebarWorkspaceUseCaseFake = Pick<
  GetMySidebarWorkspaceUseCase,
  "execute"
>;

// 역할 : FakeAuthGuard 사이드바 Workspace controller 테스트 요청에 현재 사용자 컨텍스트를 주입합니다.
class FakeAuthGuard implements CanActivate {
  // 기능 : 테스트 요청을 인증된 사용자 요청으로 처리합니다.
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithCurrentUser>();
    request.currentUser = CURRENT_USER;

    return true;
  }
}

// 기능 : 목록 유스케이스 fake를 생성합니다.
function createListUseCaseFake(): jest.Mocked<ListMySidebarWorkspacesUseCaseFake> {
  return {
    execute: jest.fn().mockResolvedValue([
      {
        id: "00000000-0000-4000-8000-000000000301",
        name: "User Workspace",
      },
    ]),
  };
}

// 기능 : 기본 Workspace 유스케이스 fake를 생성합니다.
function createDefaultUseCaseFake(): jest.Mocked<GetMyDefaultSidebarWorkspaceUseCaseFake> {
  return {
    execute: jest.fn().mockResolvedValue({
      id: "00000000-0000-4000-8000-000000000302",
      name: "Recent Workspace",
      kind: "ORGANIZATION",
    }),
  };
}

// 기능 : 단건 유스케이스 fake를 생성합니다.
function createGetUseCaseFake(): jest.Mocked<GetMySidebarWorkspaceUseCaseFake> {
  return {
    execute: jest.fn().mockResolvedValue({
      id: "00000000-0000-4000-8000-000000000301",
      name: "User Workspace",
      kind: "PERSONAL",
    }),
  };
}

// 기능 : UserSidebarWorkspacesController의 HTTP 계약을 검증합니다.
describe("UserSidebarWorkspacesController", () => {
  // 1. 이후 단계에서 사용할 app 값을 준비한다.
  let app: INestApplication;
  // 2. 이후 단계에서 사용할 listUseCase 값을 준비한다.
  let listUseCase: jest.Mocked<ListMySidebarWorkspacesUseCaseFake>;
  // 3. 이후 단계에서 사용할 defaultUseCase 값을 준비한다.
  let defaultUseCase: jest.Mocked<GetMyDefaultSidebarWorkspaceUseCaseFake>;
  // 4. 이후 단계에서 사용할 getUseCase 값을 준비한다.
  let getUseCase: jest.Mocked<GetMySidebarWorkspaceUseCaseFake>;

  // 5. 필요한 비동기 작업을 실행한다.
  beforeEach(async () => {
    // 1. 현재 단계에서 필요한 fake 유스케이스를 생성한다.
    listUseCase = createListUseCaseFake();
    defaultUseCase = createDefaultUseCaseFake();
    getUseCase = createGetUseCaseFake();

    // 2. 비동기 결과를 받아 moduleRef에 저장한다.
    const moduleRef = await Test.createTestingModule({
      controllers: [UserSidebarWorkspacesController],
      providers: [
        {
          provide: ListMySidebarWorkspacesUseCase,
          useValue: listUseCase,
        },
        {
          provide: GetMyDefaultSidebarWorkspaceUseCase,
          useValue: defaultUseCase,
        },
        {
          provide: GetMySidebarWorkspaceUseCase,
          useValue: getUseCase,
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

  // 5. 필요한 비동기 작업을 실행한다.
  afterEach(async () => {
    await app.close();
  });

  // 6. 테스트 기대 조건을 검증한다.
  it("uses AuthGuard for sidebar workspace endpoints", () => {
    expect(
      Reflect.getMetadata(GUARDS_METADATA, UserSidebarWorkspacesController)
    ).toContain(AuthGuard);
  });

  // 7. 필요한 비동기 작업을 실행한다.
  it("returns sidebar workspace list", async () => {
    await request(app.getHttpServer())
      .get("/api/users/me/sidebar/workspaces")
      .expect(200)
      .expect([
        {
          id: "00000000-0000-4000-8000-000000000301",
          name: "User Workspace",
        },
      ]);

    expect(listUseCase.execute).toHaveBeenCalledWith(CURRENT_USER);
  });

  // 8. 필요한 비동기 작업을 실행한다.
  it("returns the default sidebar workspace", async () => {
    await request(app.getHttpServer())
      .get("/api/users/me/sidebar/workspaces/default")
      .expect(200)
      .expect({
        id: "00000000-0000-4000-8000-000000000302",
        name: "Recent Workspace",
        kind: "ORGANIZATION",
      });

    expect(defaultUseCase.execute).toHaveBeenCalledWith(CURRENT_USER);
  });

  // 9. 필요한 비동기 작업을 실행한다.
  it("returns a sidebar workspace detail", async () => {
    await request(app.getHttpServer())
      .get(
        "/api/users/me/sidebar/workspaces/00000000-0000-4000-8000-000000000301"
      )
      .expect(200)
      .expect({
        id: "00000000-0000-4000-8000-000000000301",
        name: "User Workspace",
        kind: "PERSONAL",
      });

    expect(getUseCase.execute).toHaveBeenCalledWith(
      CURRENT_USER,
      "00000000-0000-4000-8000-000000000301"
    );
  });
});
