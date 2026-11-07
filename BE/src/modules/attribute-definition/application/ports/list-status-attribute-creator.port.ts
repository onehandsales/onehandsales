import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";

export const LIST_STATUS_ATTRIBUTE_CREATOR = Symbol("LIST_STATUS_ATTRIBUTE_CREATOR");

// 역할 : 목록 전용 상태와 사용자가 정한 단계의 원자적 생성 입력입니다.
export interface CreateListStatusAttributeInput {
  readonly workspaceId: string;
  readonly createdByActorId: string;
  readonly listDefinitionId: string;
  readonly title: string;
  readonly options: readonly string[];
}

// 역할 : Attribute 소유 모듈이 공개하는 List 초기 상태 생성 계약입니다.
export interface ListStatusAttributeCreator {
  // 기능 : 동일 transaction에서 목록 상태 속성과 옵션을 생성합니다.
  create(input: CreateListStatusAttributeInput, context: TransactionContext): Promise<{ id: string }>;
}
