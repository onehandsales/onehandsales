import { describe, expect, it, vi } from "vitest";
import { createWorkspace } from "@/features/workspace/api/workspace-api";
import { apiClient } from "@/lib/api-client";

vi.mock("@/lib/api-client", () => ({
  apiClient: vi.fn(),
}));

const apiClientMock = vi.mocked(apiClient);

// 기능 : Workspace 생성 API client의 JSON 요청 생성을 검증합니다.
describe("createWorkspace", () => {
  it("sends workspaceName as JSON body", async () => {
    apiClientMock.mockResolvedValue({
      workspaceId: "workspace-1",
    });

    const result = await createWorkspace({
      workspaceName: "부동산",
    });

    expect(result).toEqual({
      workspaceId: "workspace-1",
    });
    expect(apiClientMock).toHaveBeenCalledWith("/api/users/me/workspaces", {
      method: "POST",
      body: {
        workspaceName: "부동산",
      },
    });
  });
});
