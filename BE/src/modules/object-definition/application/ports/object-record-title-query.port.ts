import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";

export const OBJECT_RECORD_TITLE_QUERY = Symbol("OBJECT_RECORD_TITLE_QUERY");
// 역할 : 보기와 독립된 관리 항목의 대표 이름 속성을 정의합니다.
export interface ObjectRecordTitle { readonly objectDefinitionId: string; readonly attributeDefinitionId: string }
// 역할 : 같은 Workspace의 검증된 대표 이름만 다른 모듈에 공개합니다.
export interface ObjectRecordTitleQuery {
  // 기능 : 이름의 원본 속성을 읽고 View 설정 변경과 독립된 결과를 제공합니다.
  titles(workspaceId: string, context: TransactionContext): Promise<ObjectRecordTitle[]>;
}
