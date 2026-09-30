import { describe, expect, it, vi } from "vitest";
import {
  createWorkspaceObjectRecordDefinition,
  listWorkspaceObjectRecordDefinitions,
  updateWorkspaceObjectRecordAttributeValueDefinition,
} from "@/features/crm-object/api/record-definition-api";
import { apiClient } from "@/lib/api-client";

vi.mock("@/lib/api-client", () => ({
  apiClient: vi.fn(),
}));

const apiClientMock = vi.mocked(apiClient);

// 기능 : RecordDefinition 생성 API client의 POST 요청 생성을 검증합니다.
describe("createWorkspaceObjectRecordDefinition", () => {
  it("posts a blank record definition for the selected workspace object", async () => {
    apiClientMock.mockResolvedValue({
      recordDefinitionId: "00000000-0000-4000-8000-000000000701",
    });

    const result = await createWorkspaceObjectRecordDefinition({
      objectDefinitionId: "object/1",
      workspaceId: "workspace/1",
    });

    expect(result).toEqual({
      recordDefinitionId: "00000000-0000-4000-8000-000000000701",
    });
    expect(apiClientMock).toHaveBeenCalledWith(
      "/api/users/me/workspaces/workspace%2F1/object-definitions/object%2F1/record-definitions",
      {
        method: "POST",
      },
    );
  });
});

// 기능 : RecordDefinition API client의 요청 경로 생성을 검증합니다.
describe("listWorkspaceObjectRecordDefinitions", () => {
  it("requests record definitions for the selected workspace object", async () => {
    apiClientMock.mockResolvedValue({
      items: [],
      pageInfo: {
        hasNextPage: false,
        nextCursor: null,
      },
    });

    const result = await listWorkspaceObjectRecordDefinitions({
      objectDefinitionId: "object/1",
      workspaceId: "workspace/1",
    });

    expect(result).toEqual({
      items: [],
      pageInfo: {
        hasNextPage: false,
        nextCursor: null,
      },
    });
    expect(apiClientMock).toHaveBeenCalledWith(
      "/api/users/me/workspaces/workspace%2F1/object-definitions/object%2F1/record-definitions",
    );
  });

  it("adds an encoded cursor when requesting the next page", async () => {
    apiClientMock.mockResolvedValue({
      items: [],
      pageInfo: {
        hasNextPage: false,
        nextCursor: null,
      },
    });

    await listWorkspaceObjectRecordDefinitions({
      cursor: "cursor/1+2",
      objectDefinitionId: "object/1",
      workspaceId: "workspace/1",
    });

    expect(apiClientMock).toHaveBeenCalledWith(
      "/api/users/me/workspaces/workspace%2F1/object-definitions/object%2F1/record-definitions?cursor=cursor%2F1%2B2",
    );
  });
});

// 기능 : RecordAttributeValueDefinition 수정 API client의 PATCH 요청 생성을 검증합니다.
describe("updateWorkspaceObjectRecordAttributeValueDefinition", () => {
  it("patches a single record attribute value definition with a value wrapper", async () => {
    apiClientMock.mockResolvedValue({
      recordAttributeValueDefinitionId:
        "00000000-0000-4000-8000-000000000901",
    });

    const result = await updateWorkspaceObjectRecordAttributeValueDefinition({
      objectDefinitionId: "object/1",
      recordAttributeValueDefinitionId: "value/1",
      recordDefinitionId: "record/1",
      value: {
        selectOptionId: "00000000-0000-4000-8000-000000000777",
      },
      workspaceId: "workspace/1",
    });

    expect(result).toEqual({
      recordAttributeValueDefinitionId:
        "00000000-0000-4000-8000-000000000901",
    });
    expect(apiClientMock).toHaveBeenCalledWith(
      "/api/users/me/workspaces/workspace%2F1/object-definitions/object%2F1/record-definitions/record%2F1/record-attribute-values-definitions/value%2F1",
      {
        method: "PATCH",
        body: {
          value: {
            selectOptionId: "00000000-0000-4000-8000-000000000777",
          },
        },
      },
    );
  });

  it("keeps null as an explicit clear value", async () => {
    apiClientMock.mockResolvedValue({
      recordAttributeValueDefinitionId:
        "00000000-0000-4000-8000-000000000901",
    });

    await updateWorkspaceObjectRecordAttributeValueDefinition({
      objectDefinitionId: "object-1",
      recordAttributeValueDefinitionId: "value-1",
      recordDefinitionId: "record-1",
      value: null,
      workspaceId: "workspace-1",
    });

    expect(apiClientMock).toHaveBeenCalledWith(
      "/api/users/me/workspaces/workspace-1/object-definitions/object-1/record-definitions/record-1/record-attribute-values-definitions/value-1",
      {
        method: "PATCH",
        body: {
          value: null,
        },
      },
    );
  });
});
