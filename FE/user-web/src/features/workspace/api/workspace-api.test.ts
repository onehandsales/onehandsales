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
      workspace: {
        id: "workspace-1",
        name: "부동산's Workspace",
        kind: "PERSONAL",
        createdAt: "2026-09-17T00:00:00.000Z",
        updatedAt: "2026-09-17T00:00:00.000Z",
      },
      workspaceMember: {
        id: "workspace-member-1",
        workspaceId: "workspace-1",
        userId: "user-1",
        role: "OWNER",
        joinedAt: "2026-09-17T00:00:00.000Z",
        createdAt: "2026-09-17T00:00:00.000Z",
        updatedAt: "2026-09-17T00:00:00.000Z",
      },
    });

    await createWorkspace({
      workspaceName: "부동산",
    });

    expect(apiClientMock).toHaveBeenCalledWith("/api/users/me/workspaces", {
      method: "POST",
      body: {
        workspaceName: "부동산",
      },
    });
  });
});
