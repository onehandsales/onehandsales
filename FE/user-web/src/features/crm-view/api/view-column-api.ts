import { apiClient } from "@/lib/api-client";
import type { AttributeDefinitionValueType } from "@/features/crm-object";
import type { ViewDataScope } from "../types/view-data";

export type CreateViewColumnInput = { readonly creationId: string; readonly attributeDefinitionName: string; readonly attributeType: AttributeDefinitionValueType };
export type CreatedViewColumn = { readonly viewDefinitionId: string; readonly objectDefinitionId: string; readonly attributeDefinitionId: string; readonly viewAttributeSettingDefinitionId: string };

// 기능 : 인증 client로 임시 컬럼을 저장하고 요청한 보기·관리항목·생성 ID를 확인합니다.
export async function createViewColumn(scope: ViewDataScope, input: CreateViewColumnInput): Promise<CreatedViewColumn> {
  // 1. UI에서 결정할 수 있는 이름·유형·재시도 ID만 보낸다.
  const result = await apiClient<CreatedViewColumn>(`/api/users/me/workspaces/${encodeURIComponent(scope.workspaceId)}/view-definitions/${encodeURIComponent(scope.viewDefinitionId)}/columns`, {
    method: "POST", body: JSON.stringify(input),
  });
  // 2. 잘못된 응답을 현재 임시 컬럼에 연결하지 않는다.
  if (result.viewDefinitionId?.toLowerCase() !== scope.viewDefinitionId.toLowerCase() || result.objectDefinitionId?.toLowerCase() !== scope.targetId.toLowerCase() ||
      result.viewAttributeSettingDefinitionId?.toLowerCase() !== input.creationId.toLowerCase() || !result.attributeDefinitionId) throw new Error("View column response mismatch");
  return result;
}
