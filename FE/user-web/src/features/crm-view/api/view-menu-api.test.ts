import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import { getViewMenu } from "./view-menu-api";
import { workspaceViewQueryKeys } from "./workspace-view-query-keys";

vi.mock("@/lib/api-client", () => ({ apiClient: vi.fn() }));
const client = vi.mocked(apiClient);

// 기능 : 메뉴 GET의 경로·취소·응답 격리 계약을 확인합니다.
describe("view menu API", () => {
  // 기능 : 조회별 독립적인 응답을 준비합니다.
  beforeEach(() => { client.mockReset().mockResolvedValue({ viewDefinitionId: "view/one" }); });
  // 기능 : 세 메뉴에 query나 body 없이 요청한 ID와 취소 신호를 전달합니다.
  it.each(["filters", "sorts", "settings"] as const)("reads %s only by scoped path", async menu => {
    const signal = new AbortController().signal;
    await getViewMenu("space/one", "view/one", menu, signal);
    expect(client).toHaveBeenCalledWith(`/api/users/me/workspaces/space%2Fone/view-header/view-definitions/view%2Fone/${menu}`, { signal });
  });
  // 기능 : 다른 보기의 응답과 요청 실패를 정상 설정으로 사용하지 않습니다.
  it("rejects mismatched views and propagates failures", async () => {
    const signal = new AbortController().signal;
    client.mockResolvedValue({ viewDefinitionId: "other" });
    await expect(getViewMenu("space", "view", "settings", signal)).rejects.toThrow("mismatch");
    const failure = new Error("unavailable");
    client.mockRejectedValue(failure);
    await expect(getViewMenu("space", "view", "filters", signal)).rejects.toBe(failure);
  });
  // 기능 : 인증 사용자·Workspace·보기·메뉴가 캐시를 공유하지 않게 합니다.
  it("isolates every menu cache scope", () => {
    const key = workspaceViewQueryKeys.menu("user", "space", "view", "settings");
    expect(key).not.toEqual(workspaceViewQueryKeys.menu("other", "space", "view", "settings"));
    expect(key).not.toEqual(workspaceViewQueryKeys.menu("user", "other", "view", "settings"));
    expect(key).not.toEqual(workspaceViewQueryKeys.menu("user", "space", "other", "settings"));
    expect(key).not.toEqual(workspaceViewQueryKeys.menu("user", "space", "view", "filters"));
    expect(key).toEqual(workspaceViewQueryKeys.menu("USER", "SPACE", "VIEW", "settings"));
  });
});
