import type { ListDefinitionSummaryQuery } from "@/modules/list-definition/application/ports/list-definition-summary-query.port";
import type { ListDefinitionViewsQuery } from "@/modules/view-definition/application/ports/list-definition-views-query.port";
import {
  ListViewsWorkspaceNotFoundError,
  ListViewsListDefinitionNotFoundError,
} from "@/modules/view-definition/domain/view-definition.errors";
import type { WorkspaceAccessQuery } from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ListWorkspaceListViewsUseCase } from "./list-workspace-list-views.use-case";

const WORKSPACE_ID = "00000000-0000-4000-8000-000000000c01";
const TARGET_ID = "00000000-0000-4000-8000-000000000b01";
const VIEWS = [
  { id: "00000000-0000-4000-8000-000000000a01", name: "첫 보기", icon: null, type: "TABLE" as const },
  { id: "00000000-0000-4000-8000-000000000a02", name: "선택한 보기", icon: "kanban", type: "KANBAN" as const },
  { id: "00000000-0000-4000-8000-000000000a03", name: "마지막 보기", icon: null, type: "GALLERY" as const },
];
const CURRENT_USER: CurrentUserContext = {
  id: "00000000-0000-4000-8000-000000000101",
  sessionId: "00000000-0000-4000-8000-000000000201",
  email: "user@example.com", displayName: "User",
  platformRole: "USER", status: "ACTIVE", timeZone: "Asia/Seoul",
};

// 기능 : 읽기 전용 멤버십과 소유 모듈별 공개 조회 Port를 준비합니다.
function createFixture() {
  const workspace: jest.Mocked<WorkspaceAccessQuery> = {
    hasWorkspaceMembership: jest.fn().mockResolvedValue(true),
    getWorkspaceMemberAccess: jest.fn(),
  };
  const target: jest.Mocked<ListDefinitionSummaryQuery> = {
    findListDefinitionSummary: jest.fn().mockResolvedValue({ id: TARGET_ID, name: "영업", icon: null }),
  };
  const views: jest.Mocked<ListDefinitionViewsQuery> = {
    findWorkspaceListViews: jest.fn().mockResolvedValue(VIEWS),
  };
  return {
    workspace, target, views,
    useCase: new ListWorkspaceListViewsUseCase(workspace, target, views),
  };
}

// 기능 : List 소속 목록의 접근 순서와 선택 ID가 조회 범위를 바꾸지 않는지 검증합니다.
describe("ListWorkspaceListViewsUseCase", () => {
  // 기능 : 선택한 중간 항목도 저장 순서를 유지하고 서버 사용자로 접근을 확인합니다.
  it("returns all scoped views and marks the selected item without reordering", async () => {
    const fixture = createFixture();
    const result = await fixture.useCase.execute(CURRENT_USER, WORKSPACE_ID, TARGET_ID, VIEWS[1]!.id);
    expect(result).toEqual({ items: [
      { viewId: VIEWS[0]!.id, viewName: "첫 보기", viewIcon: null, viewType: "TABLE", isSelected: false },
      { viewId: VIEWS[1]!.id, viewName: "선택한 보기", viewIcon: "kanban", viewType: "KANBAN", isSelected: true },
      { viewId: VIEWS[2]!.id, viewName: "마지막 보기", viewIcon: null, viewType: "GALLERY", isSelected: false },
    ] });
    expect(fixture.workspace.hasWorkspaceMembership).toHaveBeenCalledTimes(1);
    expect(fixture.workspace.hasWorkspaceMembership).toHaveBeenCalledWith(CURRENT_USER.id, WORKSPACE_ID);
    expect(fixture.workspace.getWorkspaceMemberAccess).not.toHaveBeenCalled();
    expect(fixture.target.findListDefinitionSummary).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID, listDefinitionId: TARGET_ID,
    });
    expect(fixture.views.findWorkspaceListViews).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID, listDefinitionId: TARGET_ID,
    });
    expect(fixture.workspace.hasWorkspaceMembership.mock.invocationCallOrder[0])
      .toBeLessThan(fixture.target.findListDefinitionSummary.mock.invocationCallOrder[0]!);
    expect(fixture.target.findListDefinitionSummary.mock.invocationCallOrder[0])
      .toBeLessThan(fixture.views.findWorkspaceListViews.mock.invocationCallOrder[0]!);
  });

  // 기능 : 생략되거나 삭제·다른 범위에 있는 선택 ID는 전체 미선택으로 표현합니다.
  it.each([undefined, "00000000-0000-4000-8000-000000000fff"])(
    "keeps all views unselected for missing or unmatched selection %s", async (viewId) => {
      const fixture = createFixture();
      const response = await fixture.useCase.execute(CURRENT_USER, WORKSPACE_ID, TARGET_ID, viewId);
      expect(response.items).toHaveLength(3);
      expect(response.items.every(item => !item.isSelected)).toBe(true);
    }
  );

  // 기능 : UUID 표기 대소문자에 관계없이 같은 View를 선택합니다.
  it("matches selected UUIDs case-insensitively", async () => {
    const fixture = createFixture();
    const response = await fixture.useCase.execute(CURRENT_USER, WORKSPACE_ID, TARGET_ID, VIEWS[1]!.id.toUpperCase());
    expect(response.items.map(item => item.isSelected)).toEqual([false, true, false]);
  });

  // 기능 : 대상은 존재하지만 View가 없으면 생성 없이 정상 빈 목록을 반환합니다.
  it("returns an empty list when the target exists without views", async () => {
    const fixture = createFixture();
    fixture.views.findWorkspaceListViews.mockResolvedValue([]);
    await expect(fixture.useCase.execute(CURRENT_USER, WORKSPACE_ID, TARGET_ID))
      .resolves.toEqual({ items: [] });
  });

  // 기능 : 비멤버에게는 대상과 View 조회를 실행하지 않습니다.
  it("stops before target queries for nonmembers", async () => {
    const fixture = createFixture();
    fixture.workspace.hasWorkspaceMembership.mockResolvedValue(false);
    await expect(fixture.useCase.execute(CURRENT_USER, WORKSPACE_ID, TARGET_ID))
      .rejects.toBeInstanceOf(ListViewsWorkspaceNotFoundError);
    expect(fixture.target.findListDefinitionSummary).not.toHaveBeenCalled();
    expect(fixture.views.findWorkspaceListViews).not.toHaveBeenCalled();
  });

  // 기능 : 대상 부재·다른 Workspace의 대상은 View 조회 전에 거부합니다.
  it("stops before listing views for a missing scoped target", async () => {
    const fixture = createFixture();
    fixture.target.findListDefinitionSummary.mockResolvedValue(null);
    await expect(fixture.useCase.execute(CURRENT_USER, WORKSPACE_ID, TARGET_ID))
      .rejects.toBeInstanceOf(ListViewsListDefinitionNotFoundError);
    expect(fixture.views.findWorkspaceListViews).not.toHaveBeenCalled();
  });

  // 기능 : 각 조회 실패를 정상 빈 상태로 바꾸지 않고 공통 오류 처리로 전달합니다.
  it.each(["membership", "target", "views"] as const)("propagates %s query failures", async (stage) => {
    const fixture = createFixture();
    const failure = new Error("query unavailable");
    if (stage === "membership") fixture.workspace.hasWorkspaceMembership.mockRejectedValue(failure);
    if (stage === "target") fixture.target.findListDefinitionSummary.mockRejectedValue(failure);
    if (stage === "views") fixture.views.findWorkspaceListViews.mockRejectedValue(failure);
    await expect(fixture.useCase.execute(CURRENT_USER, WORKSPACE_ID, TARGET_ID)).rejects.toBe(failure);
    if (stage !== "views") expect(fixture.views.findWorkspaceListViews).not.toHaveBeenCalled();
    if (stage === "membership") expect(fixture.target.findListDefinitionSummary).not.toHaveBeenCalled();
  });
});
