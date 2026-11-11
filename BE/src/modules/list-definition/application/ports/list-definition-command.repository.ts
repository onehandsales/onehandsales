import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";

export const LIST_DEFINITION_COMMAND_REPOSITORY = Symbol("LIST_DEFINITION_COMMAND_REPOSITORY");

// 역할 : 업무 목록 원장 생성에 필요한 감사 정보와 입력을 정의합니다.
export interface CreateListDefinitionInput {
  readonly workspaceId: string;
  readonly createdByActorId: string;
  readonly name: string;
  readonly icon: string | null;
  readonly description: string | null;
  readonly sortOrder: number;
}

// 역할 : 업무 목록 소유 테이블의 쓰기를 transaction 안에서 수행하는 계약입니다.
export interface ListDefinitionCommandRepository {
  // 기능 : 같은 Workspace의 생성·재정렬을 잠근 뒤 현재 마지막 순서를 조회합니다.
  lockAndGetLastSortOrder(workspaceId: string, context: TransactionContext): Promise<number | null>;

  // 기능 : 동일 transaction에서 업무 목록을 생성하고 이름 중복을 domain 오류로 반환합니다.
  create(input: CreateListDefinitionInput, context: TransactionContext): Promise<{ id: string }>;
}
