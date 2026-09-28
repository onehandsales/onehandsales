import { describe, expect, it, vi } from "vitest";
import { listWorkspaceObjectAttributeDefinitions } from "@/features/crm-object/api/attribute-definition-api";
import { apiClient } from "@/lib/api-client";

vi.mock("@/lib/api-client", () => ({
  apiClient: vi.fn(),
}));

const apiClientMock = vi.mocked(apiClient);

// 기능 : AttributeDefinition API client의 요청 경로 생성을 검증합니다.
describe("listWorkspaceObjectAttributeDefinitions", () => {
  it("requests attribute definitions for the selected workspace object", async () => {
    apiClientMock.mockResolvedValue([
      {
        id: "attribute-definition-1",
        title: "company",
        type: "Text",
        isMultiselect: false,
      },
    ]);

    const result = await listWorkspaceObjectAttributeDefinitions({
      objectDefinitionId: "object/1",
      workspaceId: "workspace/1",
    });

    expect(result).toEqual([
      {
        id: "attribute-definition-1",
        title: "company",
        type: "Text",
        isMultiselect: false,
      },
    ]);
    expect(apiClientMock).toHaveBeenCalledWith(
      "/api/users/me/workspaces/workspace%2F1/object-definitions/object%2F1/attribute-definitions",
    );
  });
});
