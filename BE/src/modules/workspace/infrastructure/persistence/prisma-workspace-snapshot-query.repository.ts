import type { WorkspaceSnapshotQuery } from "../../application/ports/workspace-snapshot-query.port";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import { resolvePrismaReadContext } from "@/shared/infrastructure/prisma/prisma-transaction-manager";

// 역할 : Workspace 소유 데이터의 snapshot 조회만 제공합니다.
export class PrismaWorkspaceSnapshotQueryRepository
  implements WorkspaceSnapshotQuery
{
  // 기능 : 읽기 권한 확인을 같은 transaction에서 재검증합니다.
  async hasMembership(
    userId: string,
    workspaceId: string,
    context: TransactionContext,
  ) {
    return (
      (await resolvePrismaReadContext(context).workspaceMember.findFirst({
        where: { userId, workspaceId },
        select: { id: true },
      })) !== null
    );
  }
  // 기능 : 개인 이메일 없이 Actor 이름 snapshot만 반환합니다.
  async actors(
    workspaceId: string,
    ids: string[],
    context: TransactionContext,
  ) {
    if (!ids.length) return [];
    const rows = await resolvePrismaReadContext(context).actor.findMany({
      where: { workspaceId, id: { in: ids } },
      select: { id: true, displayNameSnapshot: true },
    });
    return rows.map((row) => ({ id: row.id, label: row.displayNameSnapshot }));
  }
}
