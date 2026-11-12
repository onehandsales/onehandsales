import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
export const RECORD_OPTIONS_QUERY = Symbol("RECORD_OPTIONS_QUERY");
// 역할 : 제목 속성에 근거한 Record 선택 후보 조회입니다.
export interface RecordOptionsQuery {
  // 기능 : 허용된 Object와 제목 속성 안에서 검색·UUID cursor 페이지를 읽습니다.
  find(input: { workspaceId: string; objectId: string | null; titleAttributeIds: string[]; q: string; cursor: string | null; take: number }, context: TransactionContext): Promise<{ id: string; label: string }[]>;
}
