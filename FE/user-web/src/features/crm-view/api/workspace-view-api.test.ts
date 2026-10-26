import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getWorkspaceViewHeader, listWorkspaceListViews, listWorkspaceObjectViews,
} from "./workspace-view-api";
import { workspaceViewQueryKeys } from "./workspace-view-query-keys";
import { apiClient } from "@/lib/api-client";

vi.mock("@/lib/api-client", () => ({ apiClient: vi.fn() }));
const client = vi.mocked(apiClient);

// 기능 : 세 조회의 대상·선택 ID·취소 신호와 캐시 격리를 검증합니다.
describe("workspace view API contracts", () => {
  beforeEach(() => { client.mockReset(); client.mockResolvedValue({ items: [] }); });

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
      "/api/users/me/workspaces/space%2Fone/" + slug + "-definitions/target%2Fone/view-definitions?viewId=view%2Fone",
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
