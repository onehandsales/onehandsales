import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";

export const OBJECT_TABLE_VIEW_CREATOR = Symbol("OBJECT_TABLE_VIEW_CREATOR");

// 역할 : 새 Object의 첫 TABLE과 제목 열에 필요한 검증된 소속 정보를 정의합니다.
export interface CreateObjectTableViewInput {
  readonly workspaceId: string;
  readonly createdByActorId: string;
  readonly objectDefinitionId: string;
  readonly titleAttributeDefinitionId: string;
  readonly name: string;
}

// 역할 : View 소유 모듈이 Object 초기화 orchestration에 공개하는 생성 계약입니다.
// 호출자는 같은 Workspace/Actor 및 같은 transaction에서 생성한 Object/Attribute ID만 전달합니다.
export interface ObjectTableViewCreator {
  // 기능 : 호출자의 transaction에서 첫 TABLE과 RECORD TITLE 표시 설정을 함께 생성합니다.
  create(input: CreateObjectTableViewInput, context: TransactionContext): Promise<{ id: string }>;
}
