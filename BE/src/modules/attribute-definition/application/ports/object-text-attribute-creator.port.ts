import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";

export const OBJECT_TEXT_ATTRIBUTE_CREATOR = Symbol("OBJECT_TEXT_ATTRIBUTE_CREATOR");

// 역할 : 새 Object의 초기 텍스트 속성을 생성할 때 필요한 검증된 소속과 표시 값을 정의합니다.
export interface CreateObjectTextAttributeInput {
  readonly workspaceId: string;
  readonly createdByActorId: string;
  readonly objectDefinitionId: string;
  readonly apiSlug: string;
  readonly title: string;
}

// 역할 : Object 초기화가 Attribute 소유 모듈에 요청하는 내부 공개 생성 계약입니다.
// 호출자는 멤버/Actor를 검증하고 같은 transaction에서 방금 생성한 Object ID만 전달합니다.
export interface ObjectTextAttributeCreator {
  // 기능 : 호출자의 transaction에 참여해 단일 Text 속성을 생성합니다.
  create(input: CreateObjectTextAttributeInput, context: TransactionContext): Promise<{ id: string }>;
}
