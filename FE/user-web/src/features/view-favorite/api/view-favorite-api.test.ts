import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import { createWorkspaceViewFavorite, deleteWorkspaceViewFavorite } from "./view-favorite-api";

vi.mock("@/lib/api-client", () => ({ apiClient: vi.fn() }));
const client = vi.mocked(apiClient);

// 기능 : 즐겨찾기 쓰기가 기존 인증 client와 무입력 계약을 유지하는지 검증합니다.
describe("view favorite API", () => {
  beforeEach(() => { client.mockReset(); });

  // 기능 : 서버 응답을 그대로 반환하고 소유자·순서·추가 query/body를 보내지 않습니다.
  it.each([
    [createWorkspaceViewFavorite, "POST", true],
    [deleteWorkspaceViewFavorite, "DELETE", false],
  ] as const)("uses %s with method %s", async (request, method, isFavorite) => {
    const response = { viewDefinitionId: "view/one", isFavorite };
    client.mockResolvedValue(response);
    expect(await request("space/one", "view/one")).toBe(response);
    expect(client).toHaveBeenCalledWith(
      "/api/users/me/workspaces/space%2Fone/view-header/view-definitions/view%2Fone/favorite",
      { method },
    );
  });

  // 기능 : 인증·DB 실패를 성공 상태로 바꾸지 않고 호출자에게 전파합니다.
  it.each([createWorkspaceViewFavorite, deleteWorkspaceViewFavorite])("propagates errors for %s", async request => {
    const failure = new Error("unavailable");
    client.mockRejectedValue(failure);
    await expect(request("space", "view")).rejects.toBe(failure);
  });
});
