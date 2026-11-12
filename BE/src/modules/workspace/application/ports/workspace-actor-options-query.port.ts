import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
export const WORKSPACE_ACTOR_OPTIONS_QUERY = Symbol("WORKSPACE_ACTOR_OPTIONS_QUERY");
// 역할 : 개인정보 원문 없이 Actor 선택 후보를 제공합니다.
export interface WorkspaceActorOptionsQuery {
  // 기능 : Workspace 안에서 이름 검색과 UUID cursor 페이지를 읽습니다.
  actorOptions(workspaceId: string, q: string, cursor: string | null, take: number, context: TransactionContext): Promise<{ id: string; label: string | null }[]>;
}
