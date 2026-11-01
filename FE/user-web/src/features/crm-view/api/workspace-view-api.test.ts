import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getWorkspaceViewHeader, listWorkspaceListViews, listWorkspaceObjectViews,
  getWorkspaceViewHeaderByViewId,
} from "./workspace-view-api";
import { workspaceViewQueryKeys } from "./workspace-view-query-keys";
import { apiClient } from "@/lib/api-client";

vi.mock("@/lib/api-client", () => ({ apiClient: vi.fn() }));
const client = vi.mocked(apiClient);

// 기능 : 세 조회의 대상·선택 ID·취소 신호와 캐시 격리를 검증합니다.
describe("workspace view API contracts", () => {
  beforeEach(() => { client.mockReset(); client.mockResolvedValue({ items: [] }); });

  const exactHeader = { viewId: "view/one", viewName: "Selected", viewIcon: null, viewType: "KANBAN", isFavorite: false,
    objectDefinition: null, listDefinition: { id: "list", name: "Work", icon: null } };
  // 기능 : 단건 진입에는 경로 ID와 취소 신호만 보내고 대상 기준 GET을 호출하지 않습니다.
  it("requests an exact View with encoded IDs and cancellation", async () => {
    const signal = new AbortController().signal; client.mockResolvedValue(exactHeader);
    expect(await getWorkspaceViewHeaderByViewId("space/one", "VIEW/ONE", signal)).toEqual(exactHeader);
    expect(client).toHaveBeenCalledWith("/api/users/me/workspaces/space%2Fone/view-header/view-definitions/VIEW%2FONE", { signal });
    expect(client).toHaveBeenCalledTimes(1);
  });
  // 기능 : 두 소속과 무소속도 서버 응답 그대로 보존합니다.
  it.each([null, { id: "object", name: "Company", icon: null }])("preserves optional affiliations %j", async objectDefinition => {
    client.mockResolvedValue({ ...exactHeader, objectDefinition, listDefinition: null });
    expect((await getWorkspaceViewHeaderByViewId("space", "view/one")).objectDefinition).toEqual(objectDefinition);
    client.mockResolvedValue({ ...exactHeader, objectDefinition });
    expect((await getWorkspaceViewHeaderByViewId("space", "view/one")).listDefinition).toEqual(exactHeader.listDefinition);
  });
  // 기능 : 잘못된 View·필수 필드·소속 요약은 정상 화면으로 소비하지 않습니다.
  it.each([{ viewId: "another" }, { viewId: null }, { viewId: 1 }, { viewName: null }, { viewType: "UNKNOWN" }, { isFavorite: null }, { objectDefinition: {} }])("rejects mismatched exact header %j", async change => {
    client.mockResolvedValue({ ...exactHeader, ...change });
    await expect(getWorkspaceViewHeaderByViewId("space", "view/one")).rejects.toThrow("mismatch");
  });
  // 기능 : 단건 캐시도 기존 하트 갱신 prefix에 포함하면서 다른 사용자를 격리합니다.
  it("keeps exact headers within the favorite update prefix and isolates identity", () => {
    const key = workspaceViewQueryKeys.headerByView("USER", "SPACE", "VIEW");
    expect(key.slice(0, 4)).toEqual(workspaceViewQueryKeys.headers("user", "space"));
    expect(key).toEqual(workspaceViewQueryKeys.headerByView("user", "space", "view"));
    expect(key).not.toEqual(workspaceViewQueryKeys.headerByView("other", "space", "view"));
    expect(key).not.toEqual(workspaceViewQueryKeys.headerByView("user", "other", "view"));
    expect(key).not.toEqual(workspaceViewQueryKeys.headerByView("user", "space", "other"));
    expect(key).not.toEqual(workspaceViewQueryKeys.header("user", "space", "LIST", "view"));
  });

  // 기능 : 초기 헤더에는 View ID 없이 종류와 대상 ID만 전달합니다.
  it.each(["OBJECT", "LIST"] as const)("requests the %s header by target", async (type) => {
    const signal = new AbortController().signal;
    await getWorkspaceViewHeader("space/one", type, "target/one", signal);
    expect(client).toHaveBeenCalledWith(
      "/api/users/me/workspaces/space%2Fone/view-header?targetType=" + type + "&targetId=target%2Fone",
      { signal },
    );
  });

  // 기능 : 종류별 별도 경로에서 현재 선택 ID를 query로 전달합니다.
  it.each([
    [listWorkspaceObjectViews, "object"], [listWorkspaceListViews, "list"],
  ] as const)("uses the scoped %s endpoint", async (request, slug) => {
    const signal = new AbortController().signal;
    await request("space/one", "target/one", "view/one", signal);
    expect(client).toHaveBeenCalledWith(
      "/api/users/me/workspaces/space%2Fone/view-header/" + slug + "-definitions/target%2Fone/view-definitions?viewDefinitionId=view%2Fone",
      { signal },
    );
  });

  // 기능 : View가 없으면 null 문자열이나 빈 query를 전송하지 않습니다.
  it.each([listWorkspaceObjectViews, listWorkspaceListViews])("omits absent selection for %s", async (request) => {
    await request("space", "target", null);
    const path = client.mock.calls[0]![0];
    expect(path).not.toContain("?");
    expect(path).not.toContain("null");
  });

  // 기능 : 실패를 빈 목록으로 바꾸지 않고 Query 오류 상태로 전달합니다.
  it("propagates failures", async () => {
    const failure = new Error("unavailable");
    client.mockRejectedValue(failure);
    await expect(listWorkspaceObjectViews("space", "target", null)).rejects.toBe(failure);
    await expect(listWorkspaceListViews("space", "target", null)).rejects.toBe(failure);
    await expect(getWorkspaceViewHeader("space", "OBJECT", "target")).rejects.toBe(failure);
  });

  // 기능 : 사용자·Workspace·대상 종류·ID와 현재 선택을 캐시에 포함합니다.
  it("isolates header and selection caches across all scopes", () => {
    const base = workspaceViewQueryKeys.header("user", "space", "OBJECT", "target");
    expect(base).not.toEqual(workspaceViewQueryKeys.header("other", "space", "OBJECT", "target"));
    expect(base).not.toEqual(workspaceViewQueryKeys.header("user", "other", "OBJECT", "target"));
    expect(base).not.toEqual(workspaceViewQueryKeys.header("user", "space", "LIST", "target"));
    expect(base).not.toEqual(workspaceViewQueryKeys.header("user", "space", "OBJECT", "other"));
    expect(workspaceViewQueryKeys.views("user", "space", "OBJECT", "target", "a"))
      .not.toEqual(workspaceViewQueryKeys.views("user", "space", "OBJECT", "target", "b"));
    expect(base).not.toEqual(workspaceViewQueryKeys.views("user", "space", "OBJECT", "target", null));
  });
});
