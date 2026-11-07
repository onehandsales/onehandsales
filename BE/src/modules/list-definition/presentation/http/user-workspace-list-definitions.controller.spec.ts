import { type CanActivate, type ExecutionContext, type INestApplication, UnauthorizedException, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { CreateWorkspaceListDefinitionUseCase } from "../../application/use-cases/create-workspace-list-definition.use-case";
import { ListDefinitionApiSlugAlreadyExistsError, ListDefinitionSourceNotFoundError } from "../../domain/list-definition.errors";
import { DomainError } from "@/shared/domain/errors/domain-error";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { HttpExceptionFilter } from "@/shared/presentation/filters/http-exception.filter";
import { UserWorkspaceListDefinitionsController } from "./user-workspace-list-definitions.controller";

const W = "00000000-0000-4000-8000-000000000001";
const O = "00000000-0000-4000-8000-000000000002";
const A = "00000000-0000-4000-8000-000000000003";
const input = { listDefinitionName: "상담", objectDefinitionId: O, titleAttributeDefinitionId: A, viewType: "TABLE" };
const response = { listDefinitionId: O, viewDefinitionId: A };
let authenticated = true;

// 역할 : 실제 AuthGuard 등록 경계에서 인증 성공·실패를 재현합니다.
class TestAuthGuard implements CanActivate {
  // 기능 : 외부 인증 없이 현재 사용자와 request ID를 테스트 요청에 주입합니다.
  canActivate(context: ExecutionContext): boolean {
    if (!authenticated) throw new UnauthorizedException();
    const req = context.switchToHttp().getRequest();
    req.currentUser = { id: "user-1" }; req.requestId = "request-1";
    return true;
  }
}

// 기능 : 실제 Nest 검증·DTO 변환·오류 filter와 생성 route의 계약을 검증합니다.
describe("UserWorkspaceListDefinitionsController", () => {
  let app: INestApplication;
  const execute = jest.fn();

  // 기능 : controller와 공통 HTTP 경계를 구성합니다.
  beforeEach(async () => {
    authenticated = true; execute.mockReset().mockResolvedValue(response);
    const module = await Test.createTestingModule({ controllers: [UserWorkspaceListDefinitionsController],
      providers: [{ provide: CreateWorkspaceListDefinitionUseCase, useValue: { execute } }],
    }).overrideGuard(AuthGuard).useClass(TestAuthGuard).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  // 기능 : 테스트 HTTP 자원을 정리합니다.
  afterEach(async () => { await app.close(); });

  // 기능 : 첫 보기 종류와 optional 입력이 command와 응답에 그대로 연결됩니다.
  it.each([
    input, { ...input, viewType: "LIST", icon: null, description: null },
    { ...input, viewType: "KANBAN", kanban: { attributeDefinitionId: A } },
    { ...input, viewType: "KANBAN", kanban: { newStatus: { title: "단계", options: ["상담", "계약"] } } },
  ])("accepts a valid request %j and forwards requestId", async body => {
    await request(app.getHttpServer()).post(`/api/users/me/workspaces/${W}/list-definitions`).send(body).expect(201).expect(response);
    expect(execute).toHaveBeenCalledWith({ id: "user-1" }, W, body, "request-1");
  });

  // 기능 : nested DTO의 null·원시값·알 수 없는 필드도 use case 전에 차단합니다.
  it.each([
    {}, { ...input, objectDefinitionId: "invalid" }, { ...input, titleAttributeDefinitionId: null },
    { ...input, viewType: "GALLERY" }, { ...input, createdByActorId: O }, { ...input, kanban: null },
    { ...input, kanban: [] }, { ...input, kanban: { attributeDefinitionId: null } },
    { ...input, kanban: { newStatus: null } }, { ...input, kanban: { newStatus: { title: 123, options: ["a"] } } },
    { ...input, kanban: { newStatus: { title: "단계", options: [123] } } },
    { ...input, kanban: { newStatus: { title: "단계", options: [] } } },
    { ...input, kanban: { newStatus: { title: "단계", options: ["a"], workspaceId: W } } },
    { ...input, kanban: { extra: true } },
  ])("rejects malformed HTTP input %j", async body => {
    await request(app.getHttpServer()).post(`/api/users/me/workspaces/${W}/list-definitions`).send(body).expect(400);
    expect(execute).not.toHaveBeenCalled();
  });

  // 기능 : 최상위와 중첩 객체의 예약 키도 DTO 변환 전에 거부합니다.
  it.each(["constructor", "__proto__"])("rejects reserved undeclared field %s before transformation", async key => {
    for (const body of [
      { ...input, [key]: "unexpected" },
      { ...input, viewType: "KANBAN", kanban: { attributeDefinitionId: A, [key]: "unexpected" } },
      { ...input, viewType: "KANBAN", kanban: { newStatus: { title: "단계", options: ["접수"], [key]: "unexpected" } } },
    ]) {
      await request(app.getHttpServer()).post(`/api/users/me/workspaces/${W}/list-definitions`)
        .set("Content-Type", "application/json").send(JSON.stringify(body)).expect(400);
      expect(execute).not.toHaveBeenCalled();
    }
  });

  // 기능 : 객체형 DTO에 배열·null·원시값이 도달해도 업무 실행을 차단합니다.
  it.each(["[]", "null", '"text"', "123", "true"])("rejects a non-object JSON body %s", async body => {
    await request(app.getHttpServer()).post(`/api/users/me/workspaces/${W}/list-definitions`)
      .set("Content-Type", "application/json").send(body).expect(400);
    expect(execute).not.toHaveBeenCalled();
  });

  // 기능 : 권한 실패와 비정상 path에서 생성 유스케이스를 실행하지 않습니다.
  it("rejects unauthenticated requests and invalid workspace IDs", async () => {
    await request(app.getHttpServer()).post("/api/users/me/workspaces/invalid/list-definitions").send(input).expect(400);
    authenticated = false;
    await request(app.getHttpServer()).post(`/api/users/me/workspaces/${W}/list-definitions`).send(input).expect(401);
    expect(execute).not.toHaveBeenCalled();
  });

  // 기능 : 새 domain 오류의 실제 HTTP 상태와 안전한 envelope를 확인합니다.
  it.each([
    [new ListDefinitionApiSlugAlreadyExistsError(), 409], [new ListDefinitionSourceNotFoundError(), 404],
    [new DomainError("ValidationError", "Invalid input", { field: "kanban" }), 400],
    [new Error("secret error"), 500],
  ] as const)("maps application error %j to %i", async (error, status) => {
    execute.mockRejectedValueOnce(error);
    const result = await request(app.getHttpServer()).post(`/api/users/me/workspaces/${W}/list-definitions`).send(input).expect(status);
    expect(JSON.stringify(result.body)).not.toContain("secret error");
  });
});
