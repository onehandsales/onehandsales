export const RECORD_DEFINITION_LIST_QUERY = Symbol(
  "RECORD_DEFINITION_LIST_QUERY"
);

export const RECORD_DEFINITION_LIST_PAGE_SIZE = 25;

// 역할 : RecordAttributeValueType이 RecordAttributeValueDefinition 값 타입 응답 범위를 정의합니다.
export type RecordAttributeValueType =
  | "ActorReference"
  | "Checkbox"
  | "Currency"
  | "Date"
  | "Domain"
  | "EmailAddress"
  | "Interaction"
  | "Location"
  | "PersonalName"
  | "Number"
  | "PhoneNumber"
  | "Rating"
  | "RecordReference"
  | "Select"
  | "Status"
  | "Text"
  | "Timestamp";

// 역할 : WorkspaceObjectRecordDefinitionCursor가 RecordDefinition cursor 페이지 기준을 정의합니다.
export interface WorkspaceObjectRecordDefinitionCursor {
  readonly createdAt: Date;
  readonly id: string;
}

// 역할 : WorkspaceObjectRecordAttributeValueListItem이 body row cell 값 응답을 정의합니다.
export interface WorkspaceObjectRecordAttributeValueListItem {
  readonly id: string;
  readonly attributeDefinitionId: string;
  readonly attributeType: RecordAttributeValueType;
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
}

// 역할 : WorkspaceObjectRecordDefinitionListItem이 Object 목록 body row 응답을 정의합니다.
export interface WorkspaceObjectRecordDefinitionListItem {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly recordAttributeValues: WorkspaceObjectRecordAttributeValueListItem[];
}

// 역할 : WorkspaceObjectRecordDefinitionListInput이 RecordDefinition 목록 조회 입력을 정의합니다.
export interface WorkspaceObjectRecordDefinitionListInput {
  readonly workspaceId: string;
  readonly objectDefinitionId: string;
  readonly cursor: WorkspaceObjectRecordDefinitionCursor | null;
  readonly pageSize: number;
}

// 역할 : WorkspaceObjectRecordDefinitionListPage가 RecordDefinition 목록 조회 결과 page를 정의합니다.
export interface WorkspaceObjectRecordDefinitionListPage {
  readonly items: WorkspaceObjectRecordDefinitionListItem[];
  readonly hasNextPage: boolean;
}

// 역할 : WorkspaceObjectRecordDefinitionListPageInfo가 RecordDefinition 목록 응답 page 정보를 정의합니다.
export interface WorkspaceObjectRecordDefinitionListPageInfo {
  readonly hasNextPage: boolean;
  readonly nextCursor: string | null;
}

// 역할 : WorkspaceObjectRecordDefinitionListResponse가 RecordDefinition 목록 HTTP 응답을 정의합니다.
export interface WorkspaceObjectRecordDefinitionListResponse {
  readonly items: WorkspaceObjectRecordDefinitionListItem[];
  readonly pageInfo: WorkspaceObjectRecordDefinitionListPageInfo;
}

// 역할 : RecordDefinitionListQuery가 ObjectDefinition별 RecordDefinition 조회 계약을 정의합니다.
export interface RecordDefinitionListQuery {
  // 기능 : 특정 Workspace ObjectDefinition에 속한 RecordDefinition page와 연결 값을 조회합니다.
  listWorkspaceObjectRecordDefinitions(
    input: WorkspaceObjectRecordDefinitionListInput
  ): Promise<WorkspaceObjectRecordDefinitionListPage>;
}
