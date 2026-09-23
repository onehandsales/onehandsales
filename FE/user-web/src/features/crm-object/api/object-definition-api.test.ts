import { describe, expect, it, vi } from "vitest";
import { createObjectDefinition } from "@/features/crm-object/api/object-definition-api";
import { apiClient } from "@/lib/api-client";

vi.mock("@/lib/api-client", () => ({
  apiClient: vi.fn(),
}));

const apiClientMock = vi.mocked(apiClient);

// 기능 : 관리 항목 생성 API client의 JSON 요청 생성을 검증합니다.
describe("createObjectDefinition", () => {
  it("posts object definition values for the selected workspace", async () => {
    apiClientMock.mockResolvedValue({
      id: "00000000-0000-4000-8000-000000000501",
    });

    const result = await createObjectDefinition({
      description: "거래처와 잠재 고객 회사를 관리합니다.",
      icon: "emoji:🏢",
      objectDefinitionName: "회사",
      workspaceId: "workspace/1",
    });

    expect(result).toEqual({
      id: "00000000-0000-4000-8000-000000000501",
    });
    expect(apiClientMock).toHaveBeenCalledWith(
      "/api/users/me/workspaces/workspace%2F1/object-definitions",
      {
        method: "POST",
        body: {
          description: "거래처와 잠재 고객 회사를 관리합니다.",
          icon: "emoji:🏢",
          objectDefinitionName: "회사",
        },
      },
    );
  });

  it("omits empty optional values from the request body", async () => {
    apiClientMock.mockResolvedValue({
      id: "00000000-0000-4000-8000-000000000502",
    });

    await createObjectDefinition({
      description: "",
      icon: "",
      objectDefinitionName: "회사",
      workspaceId: "workspace-1",
    });

    expect(apiClientMock).toHaveBeenCalledWith(
      "/api/users/me/workspaces/workspace-1/object-definitions",
      {
        method: "POST",
        body: {
          objectDefinitionName: "회사",
        },
      },
    );
  });
});
