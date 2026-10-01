import { describe, expect, it, vi } from "vitest";
import {
  createWorkspaceObjectAttributeDefinition,
  listWorkspaceObjectAttributeDefinitions,
} from "@/features/crm-object/api/attribute-definition-api";
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
        config: null,
        icon: "type",
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
        config: null,
        icon: "type",
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

// 기능 : AttributeDefinition 생성 API client의 JSON 요청 생성을 검증합니다.
describe("createWorkspaceObjectAttributeDefinition", () => {
  it("posts attribute definition values for the selected workspace object", async () => {
    apiClientMock.mockResolvedValue({
      attributeDefinitionId: "00000000-0000-4000-8000-000000000601",
    });

    const result = await createWorkspaceObjectAttributeDefinition({
      attributeDefinitionName: "company email",
      attributeType: "EmailAddress",
      description: "Primary email address.",
      icon: "lucide:mail",
      objectDefinitionId: "object/1",
      workspaceId: "workspace/1",
    });

    expect(result).toEqual({
      attributeDefinitionId: "00000000-0000-4000-8000-000000000601",
    });
    expect(apiClientMock).toHaveBeenCalledWith(
      "/api/users/me/workspaces/workspace%2F1/object-definitions/object%2F1/attribute-definitions",
      {
        method: "POST",
        body: {
          attributeDefinitionName: "company email",
          attributeType: "EmailAddress",
          description: "Primary email address.",
          icon: "lucide:mail",
        },
      },
    );
  });

  it("omits empty optional values from the request body", async () => {
    apiClientMock.mockResolvedValue({
      attributeDefinitionId: "00000000-0000-4000-8000-000000000602",
    });

    await createWorkspaceObjectAttributeDefinition({
      attributeDefinitionName: "company email",
      attributeType: "EmailAddress",
      description: "",
      icon: "",
      objectDefinitionId: "object-1",
      workspaceId: "workspace-1",
    });

    expect(apiClientMock).toHaveBeenCalledWith(
      "/api/users/me/workspaces/workspace-1/object-definitions/object-1/attribute-definitions",
      {
        method: "POST",
        body: {
          attributeDefinitionName: "company email",
          attributeType: "EmailAddress",
        },
      },
    );
  });
});
