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
    apiClientMock.mockResolvedValue({ ok: true });

    const result = await createObjectDefinition({
      attributeNames: ["회사명", "주소"],
      objectDefinitionName: "회사",
      workspaceId: "workspace/1",
    });

    expect(result).toEqual({ ok: true });
    expect(apiClientMock).toHaveBeenCalledWith(
      "/api/users/me/workspaces/workspace%2F1/object-definitions",
      {
        method: "POST",
        body: {
          attributeNames: ["회사명", "주소"],
          objectDefinitionName: "회사",
        },
      },
    );
  });
});
