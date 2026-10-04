import type { AttributeDefinitionConfig } from "@/modules/attribute-definition/application/attribute-definition-config";
import type { AttributeDefinitionType } from "@/modules/attribute-definition/application/attribute-definition-type";

export const ATTRIBUTE_DEFINITION_DETAIL_QUERY = Symbol(
  "ATTRIBUTE_DEFINITION_DETAIL_QUERY"
);

// 역할 : AttributeDefinitionDetailValueType이 AttributeDefinition 단건 응답 값 타입 범위를 정의합니다.
export type AttributeDefinitionDetailValueType = AttributeDefinitionType;

// 역할 : WorkspaceObjectAttributeDefinitionDetail이 Object 목록 header popover에 표시할 AttributeDefinition 단건 정보를 정의합니다.
export interface WorkspaceObjectAttributeDefinitionDetail {
  readonly id: string;
  readonly title: string;
  readonly type: AttributeDefinitionDetailValueType;
  readonly isMultiselect: boolean;
  readonly description: string | null;
  readonly icon: string | null;
  readonly config: AttributeDefinitionConfig | null;
  readonly sortOrder: number;
}

// 역할 : WorkspaceObjectAttributeDefinitionDetailInput이 AttributeDefinition 단건 조회 입력을 정의합니다.
export interface WorkspaceObjectAttributeDefinitionDetailInput {
  readonly workspaceId: string;
  readonly objectDefinitionId: string;
  readonly attributeDefinitionId: string;
}

// 역할 : AttributeDefinitionDetailQuery가 ObjectDefinition별 AttributeDefinition 단건 조회 계약을 정의합니다.
export interface AttributeDefinitionDetailQuery {
  // 기능 : 특정 Workspace ObjectDefinition에 속한 AttributeDefinition 단건 정보를 조회합니다.
  findWorkspaceObjectAttributeDefinition(
    input: WorkspaceObjectAttributeDefinitionDetailInput
  ): Promise<WorkspaceObjectAttributeDefinitionDetail | null>;
}
