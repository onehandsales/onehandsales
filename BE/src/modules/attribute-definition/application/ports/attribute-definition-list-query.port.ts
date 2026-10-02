import type { AttributeDefinitionType } from "@/modules/attribute-definition/application/attribute-definition-type";
import type { AttributeDefinitionConfig } from "@/modules/attribute-definition/application/attribute-definition-config";

export const ATTRIBUTE_DEFINITION_LIST_QUERY = Symbol(
  "ATTRIBUTE_DEFINITION_LIST_QUERY"
);

// 역할 : AttributeDefinitionValueType이 AttributeDefinition 값 타입 응답 범위를 정의합니다.
export type AttributeDefinitionValueType = AttributeDefinitionType;

// 역할 : WorkspaceObjectAttributeDefinitionListItem이 Object 목록 header row에 표시할 AttributeDefinition 요약을 정의합니다.
export interface WorkspaceObjectAttributeDefinitionListItem {
  readonly id: string;
  readonly icon: string | null;
  readonly title: string;
  readonly sortOrder: number;
  readonly type: AttributeDefinitionValueType;
  readonly isMultiselect: boolean;
  readonly config: AttributeDefinitionConfig | null;
}

// 역할 : WorkspaceObjectAttributeDefinitionListInput이 AttributeDefinition 목록 조회 입력을 정의합니다.
export interface WorkspaceObjectAttributeDefinitionListInput {
  readonly workspaceId: string;
  readonly objectDefinitionId: string;
}

// 역할 : AttributeDefinitionListQuery가 ObjectDefinition별 AttributeDefinition 조회 계약을 정의합니다.
export interface AttributeDefinitionListQuery {
  // 기능 : 특정 Workspace ObjectDefinition에 속한 AttributeDefinition 요약 목록을 조회합니다.
  listWorkspaceObjectAttributeDefinitions(
    input: WorkspaceObjectAttributeDefinitionListInput
  ): Promise<WorkspaceObjectAttributeDefinitionListItem[]>;
}
