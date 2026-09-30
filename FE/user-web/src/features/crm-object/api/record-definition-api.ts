import { apiClient } from "@/lib/api-client";
import type { AttributeDefinitionValueType } from "./attribute-definition-api";

export type WorkspaceObjectRecordAttributeValueListItem = {
  readonly id: string;
  readonly attributeDefinitionId: string;
  readonly attributeType: AttributeDefinitionValueType;
  readonly textValue: string | null;
  readonly numberValue: string | null;
  readonly booleanValue: boolean | null;
  readonly dateValue: string | null;
  readonly timestampValue: string | null;
  readonly jsonValue: unknown | null;
  readonly selectOptionId: string | null;
  readonly statusOptionId: string | null;
  readonly targetRecordDefinitionId: string | null;
  readonly targetObjectDefinitionId: string | null;
  readonly targetActorId: string | null;
};

export type WorkspaceObjectRecordAttributeValuePatchValue =
  | boolean
  | null
  | number
  | string
  | Record<string, unknown>;

export type WorkspaceObjectRecordDefinitionListItem = {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly recordAttributeValues: WorkspaceObjectRecordAttributeValueListItem[];
};

export type WorkspaceObjectRecordDefinitionListPageInfo = {
  readonly hasNextPage: boolean;
  readonly nextCursor: string | null;
};

export type WorkspaceObjectRecordDefinitionListResponse = {
  readonly items: WorkspaceObjectRecordDefinitionListItem[];
  readonly pageInfo: WorkspaceObjectRecordDefinitionListPageInfo;
};

// 역할 : 빈 RecordDefinition 생성 API 요청에 필요한 Workspace/ObjectDefinition 경계 값을 정의합니다.
export type CreateWorkspaceObjectRecordDefinitionInput = {
  readonly objectDefinitionId: string;
  readonly workspaceId: string;
};

// 역할 : 빈 RecordDefinition 생성 API가 반환하는 생성된 RecordDefinition ID를 정의합니다.
export type CreateWorkspaceObjectRecordDefinitionResponse = {
  readonly recordDefinitionId: string;
};

export type ListWorkspaceObjectRecordDefinitionsInput = {
  readonly cursor?: string | null;
  readonly objectDefinitionId: string;
  readonly workspaceId: string;
};

// 역할 : RecordAttributeValueDefinition 수정 API 요청에 필요한 경계 값과 새 cell 값을 정의합니다.
export type UpdateWorkspaceObjectRecordAttributeValueDefinitionInput = {
  readonly objectDefinitionId: string;
  readonly recordAttributeValueDefinitionId: string;
  readonly recordDefinitionId: string;
  readonly value: WorkspaceObjectRecordAttributeValuePatchValue;
  readonly workspaceId: string;
};

// 역할 : RecordAttributeValueDefinition 수정 API가 반환하는 수정된 cell ID를 정의합니다.
export type UpdateWorkspaceObjectRecordAttributeValueDefinitionResponse = {
  readonly recordAttributeValueDefinitionId: string;
};

// 기능 : 현재 Workspace ObjectDefinition에 빈 RecordDefinition 생성 API를 호출합니다.
export function createWorkspaceObjectRecordDefinition(
  input: CreateWorkspaceObjectRecordDefinitionInput,
) {
  // 1. 현재 Workspace ObjectDefinition 기준으로 새 RecordDefinition 생성 요청을 전달한다.
  return apiClient<CreateWorkspaceObjectRecordDefinitionResponse>(
    `/api/users/me/workspaces/${encodeURIComponent(input.workspaceId)}/object-definitions/${encodeURIComponent(input.objectDefinitionId)}/record-definitions`,
    {
      method: "POST",
    },
  );
}

// 기능 : 현재 Workspace ObjectDefinition의 body row RecordDefinition 목록 API를 호출합니다.
export function listWorkspaceObjectRecordDefinitions(
  input: ListWorkspaceObjectRecordDefinitionsInput,
) {
  // 1. 다음 페이지 cursor가 있으면 query string으로 안전하게 변환한다.
  const queryString = input.cursor
    ? `?cursor=${encodeURIComponent(input.cursor)}`
    : "";

  // 2. 현재 Workspace ObjectDefinition 기준 RecordDefinition 목록 API를 호출한다.
  return apiClient<WorkspaceObjectRecordDefinitionListResponse>(
    `/api/users/me/workspaces/${encodeURIComponent(input.workspaceId)}/object-definitions/${encodeURIComponent(input.objectDefinitionId)}/record-definitions${queryString}`,
  );
}

// 기능 : 현재 Workspace ObjectDefinition의 RecordAttributeValueDefinition 값을 수정합니다.
export function updateWorkspaceObjectRecordAttributeValueDefinition(
  input: UpdateWorkspaceObjectRecordAttributeValueDefinitionInput,
) {
  // 1. cell value 값만 Backend 공통 request body 형태로 감싸 전달한다.
  return apiClient<UpdateWorkspaceObjectRecordAttributeValueDefinitionResponse>(
    `/api/users/me/workspaces/${encodeURIComponent(input.workspaceId)}/object-definitions/${encodeURIComponent(input.objectDefinitionId)}/record-definitions/${encodeURIComponent(input.recordDefinitionId)}/record-attribute-values-definitions/${encodeURIComponent(input.recordAttributeValueDefinitionId)}`,
    {
      method: "PATCH",
      body: {
        value: input.value,
      },
    },
  );
}
