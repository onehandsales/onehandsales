import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";

export const OBJECT_ATTRIBUTE_CREATOR = Symbol("OBJECT_ATTRIBUTE_CREATOR");

// 역할 : 기존 Object의 속성과 빈 셀 생성을 같은 트랜잭션에 참여시키는 공개 계약입니다.
export interface ObjectAttributeCreator {
  // 기능 : 소속·이름·유형을 검증하고 호출자의 트랜잭션에서 새 속성과 빈 셀을 생성합니다.
  create(input: {
    readonly currentUser: CurrentUserContext;
    readonly workspaceId: string;
    readonly objectDefinitionId: string;
    readonly attributeDefinitionName: string;
    readonly attributeType: string;
  }, context: TransactionContext): Promise<{ attributeDefinitionId: string }>;
}
