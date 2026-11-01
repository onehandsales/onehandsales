import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
export const WORKSPACE_SNAPSHOT_QUERY = Symbol("WORKSPACE_SNAPSHOT_QUERY");
// 역할 : 읽기 snapshot 안의 멤버십과 Actor 표시 정보를 공개합니다.
export interface WorkspaceSnapshotQuery {
  // 기능 : 데이터 조회와 동일한 시점의 멤버십을 검사합니다.
  hasMembership(
    userId: string,
    workspaceId: string,
    context: TransactionContext,
  ): Promise<boolean>;
  // 기능 : 같은 Workspace Actor의 안전한 표시 snapshot만 조회합니다.
  actors(
    workspaceId: string,
    ids: string[],
    context: TransactionContext,
  ): Promise<{ id: string; label: string | null }[]>;
}
