import type { JsonValue } from "@/shared/application/types/json-value";
import type { ViewDefinitionType } from "./view-definition-type";

export type ViewSourceScope = "RECORD" | "LIST_ENTRY";

// 역할 : 요청한 Workspace와 선택 View의 읽기 경계를 정의합니다.
export interface ViewHeaderScope {
  readonly workspaceId: string;
  readonly viewDefinitionId: string;
}

// 역할 : 설정 조회 전에 검증할 원본 View 정보를 정의합니다.
export interface ViewHeaderDefinition {
  readonly id: string;
  readonly workspaceId: string;
  readonly objectDefinitionId: string | null;
  readonly listDefinitionId: string | null;
  readonly name: string;
  readonly type: ViewDefinitionType;
  readonly configJson: JsonValue;
}

// 역할 : 설정 행의 내부 소속과 안정적인 정렬 기준을 보존합니다.
export interface ViewConfigurationRow extends ViewHeaderScope {
  readonly id: string;
  readonly createdAt: Date;
}

// 역할 : FilterGroup 저장 설정의 조회 필드와 소속을 정의합니다.
export interface ViewFilterGroupRow extends ViewConfigurationRow {
  readonly parentViewFilterGroupDefinitionId: string | null;
  readonly conditionGroupOperator: "AND" | "OR";
  readonly sortOrder: number;
}

// 역할 : FilterCondition 저장 설정의 조회 필드와 소속을 정의합니다.
export interface ViewFilterConditionRow extends ViewConfigurationRow {
  readonly viewFilterGroupDefinitionId: string;
  readonly sourceScope: ViewSourceScope;
  readonly attributeDefinitionId: string;
  readonly referenceAttributeIdPathJson: JsonValue;
  readonly comparisonOperator: string;
  readonly comparisonValueJson: JsonValue;
  readonly multiValueMatchMode: "ANY" | "ALL";
  readonly sortOrder: number;
}

// 역할 : Sort 저장 설정의 조회 필드와 소속을 정의합니다.
export interface ViewSortRow extends ViewConfigurationRow {
  readonly sourceScope: ViewSourceScope;
  readonly attributeDefinitionId: string;
  readonly referenceAttributeIdPathJson: JsonValue;
  readonly sortDirection: "ASC" | "DESC";
  readonly sortOrder: number;
  readonly configJson: JsonValue;
}

// 역할 : AttributeSetting 저장 설정의 조회 필드와 소속을 정의합니다.
export interface ViewAttributeSettingRow extends ViewConfigurationRow {
  readonly sourceScope: ViewSourceScope;
  readonly attributeDefinitionId: string;
  readonly referenceAttributeIdPathJson: JsonValue;
  readonly attributeDisplayRole: "DISPLAY" | "TITLE" | "BODY" | "IMAGE" | "START_DATE" | "END_DATE" | "LOCATION" | "PROGRESS" | "MEASURE";
  readonly sortOrder: number;
  readonly labelOverride: string | null;
  readonly width: number | null;
  readonly isHidden: boolean;
  readonly formatJson: JsonValue;
}

// 역할 : Group 저장 설정의 조회 필드와 소속을 정의합니다.
export interface ViewGroupRow extends ViewConfigurationRow {
  readonly sourceScope: ViewSourceScope;
  readonly attributeDefinitionId: string;
  readonly referenceAttributeIdPathJson: JsonValue;
  readonly groupRole: "GROUP" | "SERIES" | "PIVOT_ROW" | "PIVOT_COLUMN";
  readonly sortDirection: "ASC" | "DESC";
  readonly sortOrder: number;
  readonly configJson: JsonValue;
}

// 역할 : GroupSetting 저장 설정의 조회 필드와 소속을 정의합니다.
export interface ViewGroupSettingRow extends ViewConfigurationRow {
  readonly viewGroupDefinitionId: string;
  readonly attributeDefinitionId: string;
  readonly statusOptionId: string | null;
  readonly selectOptionId: string | null;
  readonly groupKeyJson: JsonValue;
  readonly sortOrder: number;
  readonly labelOverride: string | null;
  readonly isHidden: boolean;
  readonly isFold: boolean;
  readonly configJson: JsonValue;
}

// 역할 : Widget 저장 설정의 조회 필드와 소속을 정의합니다.
export interface ViewWidgetRow extends ViewConfigurationRow {
  readonly contentViewDefinitionId: string;
  readonly titleOverride: string | null;
  readonly sortOrder: number;
  readonly isHidden: boolean;
  readonly layoutJson: JsonValue;
  readonly configJson: JsonValue;
}

// 역할 : 직접 참조한 위젯 원본 View의 요약과 내부 소속을 정의합니다.
export interface ViewContentSummary {
  readonly id: string;
  readonly workspaceId: string;
  readonly name: string;
  readonly type: ViewDefinitionType;
  readonly icon: string | null;
}

// 역할 : 필터 메뉴가 소유한 두 설정 목록을 정의합니다.
export interface ViewFilterRows {
  readonly viewFilterGroupDefinitions: ViewFilterGroupRow[];
  readonly viewFilterConditionDefinitions: ViewFilterConditionRow[];
}

// 역할 : 보기 설정 메뉴가 소유한 네 설정 목록을 정의합니다.
export interface ViewSettingsRows {
  readonly viewAttributeSettingDefinitions: ViewAttributeSettingRow[];
  readonly viewGroupDefinitions: ViewGroupRow[];
  readonly viewGroupSettingDefinitions: ViewGroupSettingRow[];
  readonly viewWidgetDefinitions: ViewWidgetRow[];
}
