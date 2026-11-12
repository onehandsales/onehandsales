import { apiClient } from "@/lib/api-client";
import type { AttributeDefinitionValueType } from "@/features/crm-object";
import type { ViewDataScope } from "../types/view-data";

export type CreateViewColumnInput = { readonly creationId: string; readonly attributeDefinitionName: string; readonly attributeType: AttributeDefinitionValueType };
export type CreatedViewColumn = { readonly viewDefinitionId: string; readonly objectDefinitionId: string; readonly attributeDefinitionId: string; readonly viewAttributeSettingDefinitionId: string };
export type UpdatedViewColumnLabel = { readonly viewDefinitionId: string; readonly viewAttributeSettingDefinitionId: string; readonly labelOverride: string | null };

// 기능 : 선택한 보기의 표시 설정 ID로 표시명을 저장하거나 원본 이름으로 되돌립니다.
export async function updateViewColumnLabel(scope: ViewDataScope, columnId: string, labelOverride: string | null): Promise<UpdatedViewColumnLabel> {
  // 1. 원본 속성이나 레이아웃 정보를 보내지 않고 표시명만 수정한다.
  const result = await apiClient<UpdatedViewColumnLabel>(`/api/users/me/workspaces/${encodeURIComponent(scope.workspaceId)}/view-definitions/${encodeURIComponent(scope.viewDefinitionId)}/columns/${encodeURIComponent(columnId)}`, {
    method: "PATCH", body: JSON.stringify({ labelOverride }),
  });
  // 2. 다른 표시 설정의 응답이 현재 편집에 적용되지 않도록 확인한다.
  if (result.viewDefinitionId?.toLowerCase() !== scope.viewDefinitionId.toLowerCase() ||
      result.viewAttributeSettingDefinitionId?.toLowerCase() !== columnId.toLowerCase() ||
      result.labelOverride !== (labelOverride === null ? null : labelOverride.trim())) throw new Error("View column label response mismatch");
  return result;
}

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
