import type { WorkspaceAccessQuery } from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { ObjectDefinitionSummaryQuery } from "@/modules/object-definition/application/ports/object-definition-summary-query.port";
import type { ListDefinitionSummaryQuery } from "@/modules/list-definition/application/ports/list-definition-summary-query.port";
import type { ViewDefinitionHeaderQuery } from "../ports/view-definition-header-query.port";
import { ViewHeaderWorkspaceNotFoundError, ViewHeaderViewDefinitionNotFoundError, ViewHeaderObjectDefinitionNotFoundError, ViewHeaderListDefinitionNotFoundError } from "../../domain/view-definition.errors";
import { fixtureUser, fixtureId } from "../view-data/view-data.fixture";
import { GetWorkspaceViewHeaderByViewIdUseCase } from "./get-workspace-view-header-by-view-id.use-case";

// 기능 : Actor 없는 멤버와 첫 View가 아닌 단건 View의 공개 Port를 준비합니다.
function setup() {
  const workspace: jest.Mocked<WorkspaceAccessQuery> = { hasWorkspaceMembership: jest.fn(), getWorkspaceMemberAccess: jest.fn().mockResolvedValue({ workspaceMemberId: fixtureId(3), actorId: null }) };
  const objects: jest.Mocked<ObjectDefinitionSummaryQuery> = { findObjectDefinitionSummary: jest.fn().mockResolvedValue({ id: fixtureId(5), singularName: "회사", icon: null }) };
  const lists: jest.Mocked<ListDefinitionSummaryQuery> = { findListDefinitionSummary: jest.fn().mockResolvedValue({ id: fixtureId(6), name: "영업", icon: null }) };
  const view = { id: fixtureId(8), name: "선택한 단계별 보기", icon: null, type: "KANBAN" as const, isFavorite: true, objectDefinitionId: null as string | null, listDefinitionId: fixtureId(6) as string | null };
  const views: jest.Mocked<ViewDefinitionHeaderQuery> = { findFirstWorkspaceViewHeader: jest.fn(), findWorkspaceViewHeaderById: jest.fn().mockResolvedValue(view) };
  return { workspace, objects, lists, views, view, query: new GetWorkspaceViewHeaderByViewIdUseCase(workspace, objects, lists, views) };
}

describe("GetWorkspaceViewHeaderByViewIdUseCase", () => {
  it.each(["OBJECT", "LIST", "BOTH", "NONE"])("preserves %s affiliation without selecting the first view", async source => {
    const f = setup();
    f.view.objectDefinitionId = ["OBJECT", "BOTH"].includes(source) ? fixtureId(5) : null;
    f.view.listDefinitionId = ["LIST", "BOTH"].includes(source) ? fixtureId(6) : null;
    const result = await f.query.execute(fixtureUser, fixtureId(2), f.view.id);
    expect(result).toEqual({ viewId: f.view.id, viewName: f.view.name, viewIcon: null, viewType: "KANBAN", isFavorite: true,
      objectDefinition: f.view.objectDefinitionId ? { id: fixtureId(5), name: "회사", icon: null } : null,
      listDefinition: f.view.listDefinitionId ? { id: fixtureId(6), name: "영업", icon: null } : null });
    expect(f.workspace.getWorkspaceMemberAccess).toHaveBeenCalledTimes(1);
    expect(f.views.findWorkspaceViewHeaderById).toHaveBeenCalledWith({ workspaceId: fixtureId(2), viewDefinitionId: f.view.id, workspaceMemberId: fixtureId(3) });
    expect(f.views.findFirstWorkspaceViewHeader).not.toHaveBeenCalled();
    expect(f.objects.findObjectDefinitionSummary).toHaveBeenCalledTimes(f.view.objectDefinitionId ? 1 : 0);
    expect(f.lists.findListDefinitionSummary).toHaveBeenCalledTimes(f.view.listDefinitionId ? 1 : 0);
  });
  it("blocks a nonmember before any View or target read", async () => {
    const f = setup(); f.workspace.getWorkspaceMemberAccess.mockResolvedValue(null);
    await expect(f.query.execute(fixtureUser, fixtureId(2), f.view.id)).rejects.toBeInstanceOf(ViewHeaderWorkspaceNotFoundError);
    expect(f.views.findWorkspaceViewHeaderById).not.toHaveBeenCalled();
    expect(f.objects.findObjectDefinitionSummary).not.toHaveBeenCalled();
    expect(f.lists.findListDefinitionSummary).not.toHaveBeenCalled();
  });
  it("does not fall back to a default View for a missing or foreign View", async () => {
    const f = setup(); f.views.findWorkspaceViewHeaderById.mockResolvedValue(null);
    await expect(f.query.execute(fixtureUser, fixtureId(2), f.view.id)).rejects.toBeInstanceOf(ViewHeaderViewDefinitionNotFoundError);
    expect(f.views.findFirstWorkspaceViewHeader).not.toHaveBeenCalled();
    expect(f.lists.findListDefinitionSummary).not.toHaveBeenCalled();
  });
  it.each(["OBJECT", "LIST"])("rejects an unavailable %s even when the View row exists", async source => {
    const f = setup();
    if (source === "OBJECT") { f.view.objectDefinitionId = fixtureId(5); f.objects.findObjectDefinitionSummary.mockResolvedValue(null); }
    else f.lists.findListDefinitionSummary.mockResolvedValue(null);
    await expect(f.query.execute(fixtureUser, fixtureId(2), f.view.id)).rejects.toBeInstanceOf(source === "OBJECT" ? ViewHeaderObjectDefinitionNotFoundError : ViewHeaderListDefinitionNotFoundError);
  });
  it("returns the current false favorite state and permits readable unstarred Views", async () => {
    const f = setup(); f.views.findWorkspaceViewHeaderById.mockResolvedValue({ ...f.view, isFavorite: false });
    expect((await f.query.execute(fixtureUser, fixtureId(2), f.view.id)).isFavorite).toBe(false);
  });
  it("propagates query failures instead of making an empty header", async () => {
    const f = setup(); const failure = new Error("private query failure");
    f.views.findWorkspaceViewHeaderById.mockRejectedValue(failure);
    await expect(f.query.execute(fixtureUser, fixtureId(2), f.view.id)).rejects.toBe(failure);
  });
});
