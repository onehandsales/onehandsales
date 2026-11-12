import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";

export const VIEW_COLUMN_COMMAND_REPOSITORY = Symbol("VIEW_COLUMN_COMMAND_REPOSITORY");

// 역할 : 트랜잭션에서 잠근 View의 소속과 타입을 표현합니다.
export interface ColumnTargetView {
  readonly type: string;
  readonly objectDefinitionId: string | null;
  readonly listDefinitionId: string | null;
}
// 역할 : 동일 생성 요청의 소속과 원본 속성을 검증할 표시 설정을 표현합니다.
export interface CreatedViewColumn {
  readonly id: string;
  readonly workspaceId: string;
  readonly viewDefinitionId: string;
  readonly createdByActorId: string;
  readonly attributeDefinitionId: string;
  readonly sourceScope: string;
  readonly attributeDisplayRole: string;
  readonly referenceAttributeIdPathJson: unknown;
}
// 역할 : Workspace와 View 안에서 표시 설정 하나를 식별합니다.
export interface ViewColumnScope {
  readonly workspaceId: string;
  readonly viewDefinitionId: string;
  readonly viewAttributeSettingDefinitionId: string;
}

// 역할 : View 소유 테이블만 사용하는 컬럼 쓰기 계약입니다.
export interface ViewColumnCommandRepository {
  // 기능 : 같은 View의 컬럼 생성·표시명 수정을 직렬화하고 소속 변경을 막습니다.
  lockView(workspaceId: string, viewId: string, context: TransactionContext): Promise<ColumnTargetView | null>;
  // 기능 : 생성 ID의 기존 설정을 조회하고 application에서 범위를 비교하도록 반환합니다.
  findCreation(id: string, context: TransactionContext): Promise<CreatedViewColumn | null>;
  // 기능 : 조회 상한과 새 컬럼 순서를 결정할 현재 설정 수와 최대 순서를 읽습니다.
  placement(workspaceId: string, viewId: string, context: TransactionContext): Promise<{ count: number; lastSortOrder: number | null }>;
  // 기능 : 검증된 직접 Record 속성을 일반 표시 컬럼으로 연결합니다.
  create(input: { id: string; workspaceId: string; viewDefinitionId: string; attributeDefinitionId: string; createdByActorId: string; sortOrder: number }, context: TransactionContext): Promise<void>;
  // 기능 : 잠근 View 안의 표시 설정을 읽고 다른 소속의 ID는 제외합니다.
  findColumnLabel(scope: ViewColumnScope, context: TransactionContext): Promise<{ labelOverride: string | null } | null>;
  // 기능 : 검증된 표시 설정의 이름과 감사 Actor만 저장합니다.
  updateColumnLabel(scope: ViewColumnScope, labelOverride: string | null, actorId: string, context: TransactionContext): Promise<void>;
}
