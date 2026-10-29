import type * as Rows from "./view-header-configuration";
import type { AttributeDefinitionMetadata, AttributeOptionMetadata } from "@/modules/attribute-definition/application/ports/attribute-definition-metadata-query.port";
import type { JsonValue } from "@/shared/application/types/json-value";
import { ViewHeaderConfigurationInvalidError } from "../domain/view-definition.errors";

// 기능 : 저장 경로가 UUID 배열인지 확인하고 원본 순서를 보존합니다.
export function readReferencePath(value: JsonValue): string[] {
  if (!Array.isArray(value) || !value.every(item => typeof item === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item))) {
    throw new ViewHeaderConfigurationInvalidError("reference_path_invalid");
  }
  return value as string[];
}

// 기능 : 속성의 내부 Workspace 필드를 제외하고 공개 표시 정보만 반환합니다.
export function mapAttribute(row: AttributeDefinitionMetadata) {
  return { id: row.id, title: row.title, type: row.type, objectDefinitionId: row.objectDefinitionId, listDefinitionId: row.listDefinitionId, icon: row.icon, isMultiselect: row.isMultiselect, configJson: row.configJson };
}

// 기능 : 옵션의 내부 소속·시각을 제외하고 공개 표시 정보만 반환합니다.
export function mapOption(row: AttributeOptionMetadata) {
  return { id: row.id, attributeDefinitionId: row.attributeDefinitionId, title: row.title, color: row.color, sortOrder: row.sortOrder };
}

// 기능 : 위젯 원본의 직접 요약만 공개합니다.
export function mapContentView(row: Rows.ViewContentSummary) {
  return { id: row.id, name: row.name, type: row.type, icon: row.icon };
}

// 기능 : FilterGroup 설정의 공개 필드만 응답에 포함합니다.
export function mapFilterGroup(row: Rows.ViewFilterGroupRow) {
  return { id: row.id, parentViewFilterGroupDefinitionId: row.parentViewFilterGroupDefinitionId, conditionGroupOperator: row.conditionGroupOperator, sortOrder: row.sortOrder };
}

// 기능 : FilterCondition 설정의 공개 필드만 응답에 포함합니다.
export function mapFilterCondition(row: Rows.ViewFilterConditionRow) {
  return { id: row.id, viewFilterGroupDefinitionId: row.viewFilterGroupDefinitionId, sourceScope: row.sourceScope, attributeDefinitionId: row.attributeDefinitionId, referenceAttributeIdPathJson: readReferencePath(row.referenceAttributeIdPathJson), comparisonOperator: row.comparisonOperator, comparisonValueJson: row.comparisonValueJson, multiValueMatchMode: row.multiValueMatchMode, sortOrder: row.sortOrder };
}

// 기능 : Sort 설정의 공개 필드만 응답에 포함합니다.
export function mapSort(row: Rows.ViewSortRow) {
  return { id: row.id, sourceScope: row.sourceScope, attributeDefinitionId: row.attributeDefinitionId, referenceAttributeIdPathJson: readReferencePath(row.referenceAttributeIdPathJson), sortDirection: row.sortDirection, sortOrder: row.sortOrder, configJson: row.configJson };
}

// 기능 : AttributeSetting 설정의 공개 필드만 응답에 포함합니다.
export function mapAttributeSetting(row: Rows.ViewAttributeSettingRow) {
  return { id: row.id, sourceScope: row.sourceScope, attributeDefinitionId: row.attributeDefinitionId, referenceAttributeIdPathJson: readReferencePath(row.referenceAttributeIdPathJson), attributeDisplayRole: row.attributeDisplayRole, sortOrder: row.sortOrder, labelOverride: row.labelOverride, width: row.width, isHidden: row.isHidden, formatJson: row.formatJson };
}

// 기능 : Group 설정의 공개 필드만 응답에 포함합니다.
export function mapGroup(row: Rows.ViewGroupRow) {
  return { id: row.id, sourceScope: row.sourceScope, attributeDefinitionId: row.attributeDefinitionId, referenceAttributeIdPathJson: readReferencePath(row.referenceAttributeIdPathJson), groupRole: row.groupRole, sortDirection: row.sortDirection, sortOrder: row.sortOrder, configJson: row.configJson };
}

// 기능 : GroupSetting 설정의 공개 필드만 응답에 포함합니다.
export function mapGroupSetting(row: Rows.ViewGroupSettingRow) {
  return { id: row.id, viewGroupDefinitionId: row.viewGroupDefinitionId, attributeDefinitionId: row.attributeDefinitionId, statusOptionId: row.statusOptionId, selectOptionId: row.selectOptionId, groupKeyJson: row.groupKeyJson, sortOrder: row.sortOrder, labelOverride: row.labelOverride, isHidden: row.isHidden, isFold: row.isFold, configJson: row.configJson };
}

// 기능 : Widget 설정의 공개 필드만 응답에 포함합니다.
export function mapWidget(row: Rows.ViewWidgetRow) {
  return { id: row.id, contentViewDefinitionId: row.contentViewDefinitionId, titleOverride: row.titleOverride, sortOrder: row.sortOrder, isHidden: row.isHidden, layoutJson: row.layoutJson, configJson: row.configJson };
}
