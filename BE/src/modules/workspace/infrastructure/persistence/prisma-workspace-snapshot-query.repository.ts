import type { WorkspaceSnapshotQuery } from "../../application/ports/workspace-snapshot-query.port";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import { resolvePrismaReadContext } from "@/shared/infrastructure/prisma/prisma-transaction-manager";

// 역할 : Workspace 소유 데이터의 snapshot 조회만 제공합니다.
export class PrismaWorkspaceSnapshotQueryRepository
  implements WorkspaceSnapshotQuery
{
  // 기능 : 입력 폼의 담당자 후보를 같은 Workspace에서 제한하여 조회합니다.
  async actorOptions(workspaceId: string, q: string, cursor: string | null, take: number, context: TransactionContext) {
    const rows = await resolvePrismaReadContext(context).actor.findMany({ where: { workspaceId,
      ...(q ? { displayNameSnapshot: { contains: q, mode: "insensitive" as const } } : {}), ...(cursor ? { id: { gt: cursor } } : {}) },
      select: { id: true, displayNameSnapshot: true }, orderBy: { id: "asc" }, take });
    return rows.map(row => ({ id: row.id, label: row.displayNameSnapshot }));
  }
  // 기능 : 읽기 권한 확인을 같은 transaction에서 재검증합니다.
  async hasMembership(
    userId: string,
    workspaceId: string,
    context: TransactionContext,
  ) {
    // 1. 업무 데이터와 같은 snapshot에서 현재 사용자의 Workspace 멤버십을 확인한다.
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
    // 1. 빈 조회를 생략하고 같은 Workspace의 요청 Actor만 읽는다.
    if (!ids.length) return [];
    const rows = await resolvePrismaReadContext(context).actor.findMany({
      where: { workspaceId, id: { in: ids } },
      select: { id: true, displayNameSnapshot: true },
    });
    // 2. User 테이블에 접근하지 않고 Workspace가 소유한 이름 snapshot만 공개한다.
    return rows.map((row) => ({ id: row.id, label: row.displayNameSnapshot }));
  }
}
