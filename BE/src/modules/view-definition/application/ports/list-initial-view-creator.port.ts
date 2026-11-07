import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";

export const LIST_INITIAL_VIEW_CREATOR = Symbol("LIST_INITIAL_VIEW_CREATOR");
export type ListInitialViewType = "TABLE" | "LIST" | "KANBAN";

// 역할 : 목록 첫 보기의 검증된 그룹 속성과 조회 시작점을 정의합니다.
export interface ListInitialViewGroup {
  readonly attributeDefinitionId: string;
  readonly sourceScope: "RECORD" | "LIST_ENTRY";
}

// 역할 : 첫 List 보기와 제목·보드 설정 생성 입력입니다.
export interface CreateListInitialViewInput {
  readonly workspaceId: string;
  readonly createdByActorId: string;
  readonly listDefinitionId: string;
  readonly name: string;
  readonly type: ListInitialViewType;
  readonly titleAttributeDefinitionId: string;
  readonly group: ListInitialViewGroup | null;
}

// 역할 : View 소유 테이블의 첫 List 보기 생성을 다른 모듈에 공개합니다.
export interface ListInitialViewCreator {
  // 기능 : 동일 transaction에서 List 보기·표시 설정과 필요한 그룹을 저장합니다.
  create(input: CreateListInitialViewInput, context: TransactionContext): Promise<{ id: string }>;
}
