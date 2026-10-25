import type { ListDefinitionSummaryQuery } from "@/modules/list-definition/application/ports/list-definition-summary-query.port";
import type { ObjectDefinitionSummaryQuery } from "@/modules/object-definition/application/ports/object-definition-summary-query.port";
import type { ViewDefinitionHeaderQuery } from "@/modules/view-definition/application/ports/view-definition-header-query.port";
import type { ViewHeaderTargetType } from "@/modules/view-definition/application/view-header-target";
import {
  ViewHeaderListDefinitionNotFoundError,
  ViewHeaderObjectDefinitionNotFoundError,
  ViewHeaderWorkspaceNotFoundError,
} from "@/modules/view-definition/domain/view-definition.errors";
import type { WorkspaceAccessQuery } from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { GetWorkspaceViewHeaderUseCase } from "./get-workspace-view-header.use-case";

const WORKSPACE_ID = "00000000-0000-4000-8000-000000000301";
const TARGET_ID = "00000000-0000-4000-8000-000000000501";
const MEMBER_ID = "00000000-0000-4000-8000-000000000401";
const VIEW_ID = "00000000-0000-4000-8000-000000000801";
const CURRENT_USER: CurrentUserContext = {
  id: "00000000-0000-4000-8000-000000000101",
  sessionId: "00000000-0000-4000-8000-000000000201",
  email: "user@example.com",
  displayName: "User",
  platformRole: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

// 기능 : Actor 없는 멤버와 소유 모듈별 공개 조회 응답을 준비합니다.
function createFixture() {
  const workspace: jest.Mocked<WorkspaceAccessQuery> = {
    hasWorkspaceMembership: jest.fn(),
    getWorkspaceMemberAccess: jest.fn().mockResolvedValue({
      workspaceMemberId: MEMBER_ID,
      actorId: null,
    }),
  };
  const objects: jest.Mocked<ObjectDefinitionSummaryQuery> = {
    findObjectDefinitionSummary: jest.fn().mockResolvedValue({
      id: TARGET_ID,
      singularName: "회사",
      icon: null,
    }),
  };
  const lists: jest.Mocked<ListDefinitionSummaryQuery> = {
    findListDefinitionSummary: jest.fn().mockResolvedValue({
      id: TARGET_ID,
      name: "영업 파이프라인",
      icon: "kanban",
    }),
  };
  const views: jest.Mocked<ViewDefinitionHeaderQuery> = {
    findFirstWorkspaceViewHeader: jest.fn().mockResolvedValue({
      id: VIEW_ID,
      name: "전체 보기",
      icon: null,
      type: "TABLE",
      isFavorite: true,
    }),
  };
  return {
    workspace,
    objects,
    lists,
    views,
    useCase: new GetWorkspaceViewHeaderUseCase(workspace, objects, lists, views),
  };
}

// 기능 : 인증된 멤버·클릭 대상·초기 View의 응답 조합과 실패 경계를 검증합니다.
describe("GetWorkspaceViewHeaderUseCase", () => {
  // 기능 : Object 요약을 매핑하고 서버에서 얻은 멤버 ID로만 개인 상태를 조회합니다.
  it("returns an object header without requiring an actor or an input view ID", async () => {
    const fixture = createFixture();
    await expect(fixture.useCase.execute(CURRENT_USER, WORKSPACE_ID, {
      targetType: "OBJECT",
      targetId: TARGET_ID,
    })).resolves.toEqual({
      viewId: VIEW_ID,
      viewName: "전체 보기",
      viewIcon: null,
      viewType: "TABLE",
      isFavorite: true,
      objectDefinition: { id: TARGET_ID, name: "회사", icon: null },
      listDefinition: null,
    });
    expect(fixture.workspace.getWorkspaceMemberAccess).toHaveBeenCalledTimes(1);
    expect(fixture.workspace.getWorkspaceMemberAccess).toHaveBeenCalledWith(CURRENT_USER.id, WORKSPACE_ID);
    expect(fixture.workspace.hasWorkspaceMembership).not.toHaveBeenCalled();
    expect(fixture.objects.findObjectDefinitionSummary).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID, objectDefinitionId: TARGET_ID,
    });
    expect(fixture.lists.findListDefinitionSummary).not.toHaveBeenCalled();
    expect(fixture.views.findFirstWorkspaceViewHeader).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID, workspaceMemberId: MEMBER_ID,
      targetType: "OBJECT", targetId: TARGET_ID,
    });
  });

  // 기능 : List 클릭은 Object를 조회하지 않고 List 요약을 반환합니다.
  it("returns a list header from the list owner's public port", async () => {
    const fixture = createFixture();
    const result = await fixture.useCase.execute(CURRENT_USER, WORKSPACE_ID, {
      targetType: "LIST", targetId: TARGET_ID,
    });
    expect(result.objectDefinition).toBeNull();
    expect(result.listDefinition).toEqual({ id: TARGET_ID, name: "영업 파이프라인", icon: "kanban" });
    expect(fixture.objects.findObjectDefinitionSummary).not.toHaveBeenCalled();
    expect(fixture.lists.findListDefinitionSummary).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID, listDefinitionId: TARGET_ID,
    });
    expect(fixture.views.findFirstWorkspaceViewHeader).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID, workspaceMemberId: MEMBER_ID,
      targetType: "LIST", targetId: TARGET_ID,
    });
  });

  // 기능 : 비멤버 요청은 대상과 View 조회 전에 차단합니다.
  it("stops before reading targets or views for a nonmember", async () => {
    const fixture = createFixture();
    fixture.workspace.getWorkspaceMemberAccess.mockResolvedValue(null);
    await expect(fixture.useCase.execute(CURRENT_USER, WORKSPACE_ID, {
      targetType: "OBJECT", targetId: TARGET_ID,
    })).rejects.toBeInstanceOf(ViewHeaderWorkspaceNotFoundError);
    expect(fixture.objects.findObjectDefinitionSummary).not.toHaveBeenCalled();
    expect(fixture.lists.findListDefinitionSummary).not.toHaveBeenCalled();
    expect(fixture.views.findFirstWorkspaceViewHeader).not.toHaveBeenCalled();
  });

  // 기능 : 요청 Workspace에 없는 Object를 View 없음 상태로 오인하지 않습니다.
  it("returns object not found before querying a view for an invalid target", async () => {
    const fixture = createFixture();
    fixture.objects.findObjectDefinitionSummary.mockResolvedValue(null);
    await expect(fixture.useCase.execute(CURRENT_USER, WORKSPACE_ID, {
      targetType: "OBJECT", targetId: TARGET_ID,
    })).rejects.toBeInstanceOf(ViewHeaderObjectDefinitionNotFoundError);
    expect(fixture.views.findFirstWorkspaceViewHeader).not.toHaveBeenCalled();
  });

  // 기능 : 요청 Workspace에 없는 List를 별도 대상 오류로 전달합니다.
  it("returns list not found before querying a view for an invalid target", async () => {
    const fixture = createFixture();
    fixture.lists.findListDefinitionSummary.mockResolvedValue(null);
    await expect(fixture.useCase.execute(CURRENT_USER, WORKSPACE_ID, {
      targetType: "LIST", targetId: TARGET_ID,
    })).rejects.toBeInstanceOf(ViewHeaderListDefinitionNotFoundError);
    expect(fixture.views.findFirstWorkspaceViewHeader).not.toHaveBeenCalled();
  });

  // 기능 : View가 없는 Object/List도 대상 요약을 보존해 빈 헤더로 표시할 수 있습니다.
  it.each(["OBJECT", "LIST"] as const)("preserves the %s target when no view exists", async (targetType: ViewHeaderTargetType) => {
    const fixture = createFixture();
    fixture.views.findFirstWorkspaceViewHeader.mockResolvedValue(null);
    const result = await fixture.useCase.execute(CURRENT_USER, WORKSPACE_ID, {
      targetType, targetId: TARGET_ID,
    });
    expect(result).toEqual({
      viewId: null, viewName: null, viewIcon: null, viewType: null, isFavorite: false,
      objectDefinition: targetType === "OBJECT" ? { id: TARGET_ID, name: "회사", icon: null } : null,
      listDefinition: targetType === "LIST" ? { id: TARGET_ID, name: "영업 파이프라인", icon: "kanban" } : null,
    });
  });

  // 기능 : 즐겨찾기가 없는 정상 View를 정상 헤더로 반환합니다.
  it("preserves false favorite state for an existing view", async () => {
    const fixture = createFixture();
    fixture.views.findFirstWorkspaceViewHeader.mockResolvedValue({
      id: VIEW_ID, name: "미등록 보기", icon: null, type: "KANBAN", isFavorite: false,
    });
    const result = await fixture.useCase.execute(CURRENT_USER, WORKSPACE_ID, {
      targetType: "OBJECT", targetId: TARGET_ID,
    });
    expect(result.viewId).toBe(VIEW_ID);
    expect(result.viewType).toBe("KANBAN");
    expect(result.isFavorite).toBe(false);
  });

  // 기능 : 저장소 실패를 정상적인 View 없음 응답으로 바꾸지 않습니다.
  it("propagates query failures instead of returning an empty header", async () => {
    const fixture = createFixture();
    const failure = new Error("query failed");
    fixture.views.findFirstWorkspaceViewHeader.mockRejectedValue(failure);
    await expect(fixture.useCase.execute(CURRENT_USER, WORKSPACE_ID, {
      targetType: "OBJECT", targetId: TARGET_ID,
    })).rejects.toBe(failure);
  });
});
